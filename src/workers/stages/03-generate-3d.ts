import * as THREE from 'three'
import { GLTFExporter } from 'three-stdlib'
import { uploadToS3 } from '../../lib/s3'
import type { NormalizedGeometry } from '../../types'

// Scale factor: mm to meters for Three.js
const MM = 0.001

export async function generate3D(jobId: string, geo: NormalizedGeometry): Promise<string> {
  console.log('[Stage3] Generating 3D model with Three.js...')

  const scene = new THREE.Scene()

  // Materials matching architectural drawing conventions
  const materials = {
    concrete:     new THREE.MeshLambertMaterial({ color: 0x999999 }),
    partition:    new THREE.MeshLambertMaterial({ color: 0xE8E4DC }),
    glazing:      new THREE.MeshLambertMaterial({ color: 0x88CCEE, transparent: true, opacity: 0.35 }),
    floor:        new THREE.MeshLambertMaterial({ color: 0xD4CFC7 }),
    ceiling:      new THREE.MeshLambertMaterial({ color: 0xF0EDE8 }),
    furniture:    new THREE.MeshLambertMaterial({ color: 0x8B6914 }),
    phoneBooth:   new THREE.MeshLambertMaterial({ color: 0x4A4A6A }),
    column:       new THREE.MeshLambertMaterial({ color: 0x888888 }),
    grid:         new THREE.LineBasicMaterial({ color: 0x334455, opacity: 0.3, transparent: true }),
    coreArea:     new THREE.MeshLambertMaterial({ color: 0x777777, transparent: true, opacity: 0.8 }),
  }

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const sun = new THREE.DirectionalLight(0xffffff, 0.6)
  sun.position.set(30, 50, 20)
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0x8899AA, 0.3)
  fill.position.set(-20, 30, -10)
  scene.add(fill)

  const bounds = geo.bounds ?? { minX: 0, minY: 0, maxX: 60000, maxY: 34500, width: 60000, depth: 34500 }
  const centerX = (bounds.maxX - bounds.minX) / 2 * MM
  const centerY = (bounds.maxY - bounds.minY) / 2 * MM

  // --- FLOOR SLAB ---
  const floorGeo = new THREE.PlaneGeometry(
    (bounds.maxX - bounds.minX) * MM,
    (bounds.maxY - bounds.minY) * MM
  )
  const floor = new THREE.Mesh(floorGeo, materials.floor)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(centerX, 0, centerY)
  scene.add(floor)

  // --- STRUCTURAL COLUMNS ---
  for (const col of geo.columns ?? []) {
    const w = (col.width ?? 400) * MM
    const d = (col.depth ?? 400) * MM
    const h = (col.height ?? 3000) * MM
    const colGeo = new THREE.BoxGeometry(w, h, d)
    const mesh = new THREE.Mesh(colGeo, materials.column)
    mesh.position.set(col.position[0] * MM, h / 2, col.position[1] * MM)
    mesh.name = `column_${col.id}`
    scene.add(mesh)
  }

  // --- WALLS ---
  for (const wall of geo.walls ?? []) {
    const [x1, y1] = wall.start
    const [x2, y2] = wall.end
    const h = (wall.height ?? 3000) * MM
    const t = (wall.thickness ?? 150) * MM
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * MM
    if (length < 0.01) continue

    const angle = Math.atan2(y2 - y1, x2 - x1)
    const mat = wall.isStructural ? materials.concrete : materials.partition
    const wallGeo = new THREE.BoxGeometry(length, h, t)
    const mesh = new THREE.Mesh(wallGeo, mat)
    mesh.position.set(
      ((x1 + x2) / 2) * MM,
      h / 2,
      ((y1 + y2) / 2) * MM
    )
    mesh.rotation.y = -angle
    mesh.name = `wall_${wall.id}`
    scene.add(mesh)
  }

  // --- GLAZING ---
  for (const gl of geo.glazing ?? []) {
    const [x1, y1] = gl.start
    const [x2, y2] = gl.end
    const h = (gl.height ?? 3000) * MM
    const t = (gl.thickness ?? 50) * MM
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * MM
    if (length < 0.01) continue

    const angle = Math.atan2(y2 - y1, x2 - x1)
    const glGeo = new THREE.BoxGeometry(length, h, t)
    const mesh = new THREE.Mesh(glGeo, materials.glazing)
    mesh.position.set(((x1 + x2) / 2) * MM, h / 2, ((y1 + y2) / 2) * MM)
    mesh.rotation.y = -angle
    mesh.name = `glazing_${gl.id}`
    scene.add(mesh)
  }

  // --- PHONE BOOTHS / PODS ---
  for (const pod of geo.pods ?? []) {
    const w = (pod.width ?? 1000) * MM
    const d = (pod.depth ?? 1000) * MM
    const h = (pod.height ?? 2400) * MM
    const podGeo = new THREE.BoxGeometry(w, h, d)
    const mesh = new THREE.Mesh(podGeo, materials.phoneBooth)
    mesh.position.set(
      (pod.position[0] + pod.width / 2) * MM,
      h / 2,
      (pod.position[1] + pod.depth / 2) * MM
    )
    mesh.name = `pod_${pod.id}`
    scene.add(mesh)
  }

  // --- FURNITURE (simplified box representation) ---
  for (const f of geo.furniture ?? []) {
    if (!f.width || !f.depth || !f.height) continue
    const w = f.width * MM
    const d = f.depth * MM
    const h = f.height * MM
    const fGeo = new THREE.BoxGeometry(w, h, d)
    const mesh = new THREE.Mesh(fGeo, materials.furniture)
    const rad = ((f.rotation ?? 0) * Math.PI) / 180
    mesh.position.set(
      (f.position[0] + f.width / 2) * MM,
      h / 2,
      (f.position[1] + f.depth / 2) * MM
    )
    mesh.rotation.y = -rad
    mesh.name = `furniture_${f.id}`
    scene.add(mesh)
  }

  // --- CORE AREAS (hatched slabs) ---
  for (const core of geo.coreAreas ?? []) {
    if (!core.boundary?.length) continue
    const shape = new THREE.Shape()
    shape.moveTo(core.boundary[0][0] * MM, core.boundary[0][1] * MM)
    for (let i = 1; i < core.boundary.length; i++) {
      shape.lineTo(core.boundary[i][0] * MM, core.boundary[i][1] * MM)
    }
    shape.closePath()
    const extGeo = new THREE.ExtrudeGeometry(shape, {
      depth: (core.height ?? 3000) * MM,
      bevelEnabled: false,
    })
    const mesh = new THREE.Mesh(extGeo, materials.coreArea)
    mesh.rotation.x = -Math.PI / 2
    mesh.name = `core_${core.id}`
    scene.add(mesh)
  }

  // --- STRUCTURAL GRID LINES (visual reference) ---
  const gridMat = materials.grid
  for (const line of geo.structuralGrid?.horizontalLines ?? []) {
    const points = [
      new THREE.Vector3(line.x * MM, 0.01, (line.yStart ?? 0) * MM),
      new THREE.Vector3(line.x * MM, 0.01, (line.yEnd ?? bounds.maxY) * MM),
    ]
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
    scene.add(new THREE.Line(lineGeo, gridMat))
  }

  for (const line of geo.structuralGrid?.verticalLines ?? []) {
    const points = [
      new THREE.Vector3((line.xStart ?? 0) * MM, 0.01, line.y * MM),
      new THREE.Vector3((line.xEnd ?? bounds.maxX) * MM, 0.01, line.y * MM),
    ]
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
    scene.add(new THREE.Line(lineGeo, gridMat))
  }

  // Export to GLTF binary
  const exporter = new GLTFExporter()
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      async (gltf: ArrayBuffer | object) => {
        try {
          const buf = gltf instanceof ArrayBuffer ? Buffer.from(gltf) : Buffer.from(JSON.stringify(gltf))
          const key = `outputs/${jobId}/model.glb`
          await uploadToS3(key, buf, 'model/gltf-binary')
          console.log(`[Stage3] GLTF written to R2: ${key}`)
          resolve(key)
        } catch (e) { reject(e) }
      },
      (err: ErrorEvent) => reject(new Error(err.message)),
      { binary: true }
    )
  })
}
