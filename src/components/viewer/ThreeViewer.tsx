'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js'

interface Props {
  gltfUrl: string
}

type ViewMode = 'solid' | 'wireframe'
type CameraView = 'perspective' | 'top' | 'front' | 'side'

export function ThreeViewer({ gltfUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef     = useRef<THREE.Scene | null>(null)
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef  = useRef<OrbitControls | null>(null)
  const frameRef     = useRef<number>(0)
  const meshesRef    = useRef<THREE.Mesh[]>([])

  const [viewMode, setViewMode]     = useState<ViewMode>('solid')
  const [cameraView, setCameraView] = useState<CameraView>('perspective')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0B1628, 1)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0B1628)

    // Subtle grid helper
    const grid = new THREE.GridHelper(50, 50, 0x1A3050, 0x0F2040)
    scene.add(grid)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      1000
    )
    camera.position.set(15, 12, 15)
    cameraRef.current = camera

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0x00C8E8, 0.8)
    dirLight.position.set(10, 20, 10)
    scene.add(dirLight)
    const fillLight = new THREE.DirectionalLight(0x8B5CF6, 0.3)
    fillLight.position.set(-10, 5, -10)
    scene.add(fillLight)

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance   = 0.5
    controls.maxDistance   = 100
    controlsRef.current    = controls

    // Load GLTF
    const loader = new GLTFLoader()
    loader.load(
      gltfUrl,
      (gltf) => {
        const model = gltf.scene

        // Center model
        const box    = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size   = box.getSize(new THREE.Vector3())
        model.position.sub(center)
        model.position.y += size.y / 2

        // Store meshes for wireframe toggle
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshesRef.current.push(child)
            child.material = new THREE.MeshPhongMaterial({
              color:     0xE2EEF8,
              specular:  0x00C8E8,
              shininess: 30,
            })
          }
        })

        scene.add(model)

        // Fit camera to model
        const maxDim = Math.max(size.x, size.y, size.z)
        camera.position.set(maxDim * 1.5, maxDim, maxDim * 1.5)
        controls.target.set(0, size.y / 2, 0)
        controls.update()

        setLoading(false)
      },
      undefined,
      (err) => console.error('GLTF load error:', err)
    )

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const onResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [gltfUrl])

  // Wireframe toggle
  useEffect(() => {
    meshesRef.current.forEach(mesh => {
      if (mesh.material instanceof THREE.Material) {
        (mesh.material as THREE.MeshPhongMaterial).wireframe = viewMode === 'wireframe'
      }
    })
  }, [viewMode])

  // Camera preset views
  const setCameraPreset = (view: CameraView) => {
    const camera   = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    const dist = 20
    const presets: Record<CameraView, [number, number, number]> = {
      perspective: [15, 12, 15],
      top:         [0, dist, 0.001],
      front:       [0, 5, dist],
      side:        [dist, 5, 0],
    }
    const [x, y, z] = presets[view]
    camera.position.set(x, y, z)
    controls.update()
    setCameraView(view)
  }

  return (
    <div className="relative w-full h-full">
      {/* 3D canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(16,30,53,0.8)] backdrop-blur-sm">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#00C8E8] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[#6B8FAF] text-sm">Loading 3D model...</p>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {!loading && (
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* View mode toggle */}
          <div className="flex gap-1 bg-[rgba(3,7,15,0.8)] backdrop-blur-md border border-[rgba(0,200,232,0.15)] rounded-lg p-1">
            {(['solid', 'wireframe'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${viewMode === mode
                    ? 'bg-[#00C8E8] text-[#03070F]'
                    : 'text-[#6B8FAF] hover:text-[#E2EEF8]'
                  }
                `}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Camera presets */}
          <div className="flex flex-col gap-1 bg-[rgba(3,7,15,0.8)] backdrop-blur-md border border-[rgba(0,200,232,0.15)] rounded-lg p-1">
            {(['perspective', 'top', 'front', 'side'] as CameraView[]).map(view => (
              <button
                key={view}
                onClick={() => setCameraPreset(view)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all text-left
                  ${cameraView === view
                    ? 'bg-[#101E35] text-[#00C8E8]'
                    : 'text-[#6B8FAF] hover:text-[#E2EEF8]'
                  }
                `}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions hint */}
      {!loading && (
        <div className="absolute bottom-3 left-3 text-[#344B63] text-xs font-mono">
          Drag to rotate &middot; Scroll to zoom &middot; Right-drag to pan
        </div>
      )}
    </div>
  )
}
