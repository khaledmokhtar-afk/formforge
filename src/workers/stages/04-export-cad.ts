import DxfWriter from 'dxf-writer'
import { uploadToS3 } from '../../lib/s3'
import type { NormalizedGeometry } from '../../types'

export async function exportCAD(
  jobId: string,
  geo: NormalizedGeometry,
  gltfKey: string
): Promise<Record<string, string>> {

  console.log('[Stage4] Exporting CAD files...')

  const outputs: Record<string, string> = { gltf: gltfKey }

  // =====================
  // DXF EXPORT
  // =====================
  const dxf = new DxfWriter()

  // Create all standard architectural layers
  const layers: [string, number][] = [
    ['A-WALL-FULL',   7],   // white — full height walls
    ['A-WALL-PART',   8],   // gray — partial height
    ['A-WALL-DEMO',   9],   // light gray — demountable
    ['A-GLAZ',       131],  // cyan — glazing
    ['A-DOOR',        7],   // white — doors
    ['A-FURN',        52],  // tan/brown — furniture
    ['A-FURN-SYST',   51],  // dark tan — systems furniture
    ['A-EQPM',        41],  // orange — equipment
    ['A-COLS',         7],  // white — columns
    ['A-GRID',        253], // pale blue — grid
    ['A-ANNO-TEXT',    7],  // white — text
    ['A-ANNO-DIMS',    2],  // yellow — dimensions
    ['A-ROOM-TAG',     3],  // green — room tags
    ['A-FLOR-HATCH', 253],  // pale — hatch
    ['A-ANNO-SYMB',    7],  // white — symbols
    ['DEFPOINTS',      2],  // yellow — dim points
  ]

  for (const [name, color] of layers) {
    dxf.addLayer(name, color, 'CONTINUOUS')
  }

  // --- DRAW WALLS ---
  dxf.setActiveLayer('A-WALL-FULL')
  for (const wall of geo.walls ?? []) {
    if (wall.isStructural) dxf.setActiveLayer('A-COLS')
    else if (!wall.isFitout) dxf.setActiveLayer('A-WALL-FULL')
    else dxf.setActiveLayer('A-WALL-PART')

    const [x1, y1] = wall.start
    const [x2, y2] = wall.end
    const t = (wall.thickness ?? 150) / 2
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const px = Math.sin(angle) * t
    const py = -Math.cos(angle) * t

    // Draw wall as 4-line rectangle representing the wall thickness
    dxf.drawLine(x1 + px, y1 + py, x2 + px, y2 + py)
    dxf.drawLine(x2 + px, y2 + py, x2 - px, y2 - py)
    dxf.drawLine(x2 - px, y2 - py, x1 - px, y1 - py)
    dxf.drawLine(x1 - px, y1 - py, x1 + px, y1 + py)
  }

  // --- DRAW GLAZING ---
  dxf.setActiveLayer('A-GLAZ')
  for (const gl of geo.glazing ?? []) {
    dxf.drawLine(gl.start[0], gl.start[1], gl.end[0], gl.end[1])
  }

  // --- DRAW STRUCTURAL COLUMNS ---
  dxf.setActiveLayer('A-COLS')
  for (const col of geo.columns ?? []) {
    const hw = (col.width ?? 400) / 2
    const hd = (col.depth ?? 400) / 2
    const x = col.position[0]
    const y = col.position[1]
    // Draw column as filled rectangle
    dxf.drawLine(x - hw, y - hd, x + hw, y - hd)
    dxf.drawLine(x + hw, y - hd, x + hw, y + hd)
    dxf.drawLine(x + hw, y + hd, x - hw, y + hd)
    dxf.drawLine(x - hw, y + hd, x - hw, y - hd)
    // Cross-hair inside column
    dxf.drawLine(x - hw, y - hd, x + hw, y + hd)
    dxf.drawLine(x + hw, y - hd, x - hw, y + hd)
  }

  // --- DRAW STRUCTURAL GRID ---
  dxf.setActiveLayer('A-GRID')
  const bounds = geo.bounds ?? { minX: 0, minY: 0, maxX: 60000, maxY: 34500, width: 60000, depth: 34500 }
  for (const hl of geo.structuralGrid?.horizontalLines ?? []) {
    dxf.drawLine(hl.x, bounds.minY - 2000, hl.x, bounds.maxY + 2000)
    // Grid bubble (circle) at top
    dxf.drawCircle(hl.x, bounds.maxY + 2500, 600)
    dxf.drawText(hl.x, bounds.maxY + 2500, 400, 0, hl.id)
  }
  for (const vl of geo.structuralGrid?.verticalLines ?? []) {
    dxf.drawLine(bounds.minX - 2000, vl.y, bounds.maxX + 2000, vl.y)
    dxf.drawCircle(bounds.minX - 2500, vl.y, 600)
    dxf.drawText(bounds.minX - 2500, vl.y, 400, 0, vl.id)
  }

  // --- DRAW FURNITURE ---
  dxf.setActiveLayer('A-FURN')
  for (const f of geo.furniture ?? []) {
    if (!f.width || !f.depth) continue
    const x = f.position[0]
    const y = f.position[1]
    dxf.drawRect(x, y, x + f.width, y + f.depth)
  }

  // --- DRAW PODS (phone booths etc) ---
  dxf.setActiveLayer('A-FURN-SYST')
  for (const pod of geo.pods ?? []) {
    const x = pod.position[0]
    const y = pod.position[1]
    dxf.drawRect(x, y, x + pod.width, y + pod.depth)
    dxf.drawText(x + pod.width / 2, y + pod.depth / 2, 150, 0, pod.type.replace(/_/g, ' ').toUpperCase())
  }

  // --- ROOM TAGS ---
  dxf.setActiveLayer('A-ROOM-TAG')
  for (const room of geo.rooms ?? []) {
    if (!room.centroid) continue
    const [cx, cy] = room.centroid
    // Room name on top line
    dxf.drawText(cx, cy + 150, 200, 0, room.name)
    // Room number on bottom line
    dxf.drawText(cx, cy - 150, 175, 0, room.id ?? room.number ?? '')
  }

  // --- DIMENSION STRINGS ---
  dxf.setActiveLayer('A-ANNO-DIMS')
  const hLines = geo.structuralGrid?.horizontalLines ?? []
  for (let i = 1; i < hLines.length; i++) {
    const prevX = hLines[i - 1].x
    const curX = hLines[i].x
    const bayWidth = curX - prevX
    dxf.drawText(
      (prevX + curX) / 2,
      bounds.maxY + 3500,
      250, 0,
      `${bayWidth}`
    )
  }

  const dxfString = dxf.toDxfString()
  const dxfKey = `outputs/${jobId}/drawing.dxf`
  await uploadToS3(dxfKey, Buffer.from(dxfString, 'utf-8'), 'application/dxf')
  outputs.dxf = dxfKey
  console.log(`[Stage4] DXF written: ${dxfKey}`)

  // =====================
  // OBJ EXPORT
  // =====================
  const objLines = [
    '# FormForge OBJ Export',
    `# Job: ${jobId}`,
    `# Drawing type: interior_fitout`,
    `# Units: millimeters (converted to meters)`,
    `# Generated: ${new Date().toISOString()}`,
    '',
  ]

  let vi = 1
  const faces: string[] = []

  const addBox = (label: string, x: number, y: number, z: number, w: number, h: number, d: number, ry = 0) => {
    const cos = Math.cos(ry), sin = Math.sin(ry)
    const hw = w / 2, hd = d / 2
    const corners: [number, number, number][] = [
      [-hw, 0,  -hd], [hw, 0,  -hd], [hw, 0,  hd], [-hw, 0,  hd],
      [-hw, h,  -hd], [hw, h,  -hd], [hw, h,  hd], [-hw, h, hd],
    ]
    for (const [cx, cy, cz] of corners) {
      const rx = cx * cos - cz * sin + x
      const rz = cx * sin + cz * cos + z
      objLines.push(`v ${(rx / 1000).toFixed(4)} ${((cy + y) / 1000).toFixed(4)} ${(rz / 1000).toFixed(4)}`)
    }
    const b = vi
    faces.push(
      `g ${label}`,
      `f ${b} ${b + 1} ${b + 2} ${b + 3}`,
      `f ${b + 4} ${b + 5} ${b + 6} ${b + 7}`,
      `f ${b} ${b + 4} ${b + 5} ${b + 1}`,
      `f ${b + 1} ${b + 5} ${b + 6} ${b + 2}`,
      `f ${b + 2} ${b + 6} ${b + 7} ${b + 3}`,
      `f ${b + 3} ${b + 7} ${b + 4} ${b}`,
    )
    vi += 8
  }

  // Add walls as boxes
  for (const wall of geo.walls ?? []) {
    const [x1, y1] = wall.start
    const [x2, y2] = wall.end
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const angle = Math.atan2(y2 - y1, x2 - x1)
    addBox(`wall_${wall.id}`, cx, 0, cy, len, wall.height ?? 3000, wall.thickness ?? 150, -angle)
  }

  // Add columns as boxes
  for (const col of geo.columns ?? []) {
    addBox(`col_${col.id}`, col.position[0], 0, col.position[1], col.width ?? 400, col.height ?? 3000, col.depth ?? 400)
  }

  // Add furniture
  for (const f of geo.furniture ?? []) {
    if (!f.width || !f.depth || !f.height) continue
    addBox(`furn_${f.id}`, f.position[0] + f.width / 2, 0, f.position[1] + f.depth / 2, f.width, f.height, f.depth, ((f.rotation ?? 0) * Math.PI) / 180)
  }

  objLines.push('', ...faces)
  const objKey = `outputs/${jobId}/model.obj`
  await uploadToS3(objKey, Buffer.from(objLines.join('\n'), 'utf-8'), 'model/obj')
  outputs.obj = objKey
  console.log(`[Stage4] OBJ written: ${objKey}`)

  return outputs
}
