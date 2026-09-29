import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import './HeroScene.css'

// Brand colours. WebGL can't read CSS variables, so these mirror tokens.css.
const VIOLET = '#7a46cc'
const VIOLET_DEEP = '#451d8d'
const LAVENDER = '#cda8ff'
const MAGENTA = '#b64ffb'
const LIME = '#e4ed73'

// Outline of one lobe in logo units (the SVG mark is 100 x 100).
const LOBE_R = 23.25
const LOBE_C = 25
const LOBE_GAP = 1.75
const MARK_SPAN = 2 * (LOBE_C + LOBE_R)

type SceneProps = {
  ready: boolean
  active: boolean
  reduced: boolean
}

type Viewport = { width: number; height: number }

// Landscape screens put the mark to the right of the copy; portrait screens
// tuck it into the empty band under the nav, above the bottom-anchored copy.
function markLayout({ width, height }: Viewport) {
  const landscape = width / height >= 1.2
  if (landscape) {
    const size = Math.min(height * 0.46, width * 0.3)
    return {
      landscape,
      size,
      x: width / 2 - size / 2 - width * 0.07,
      y: height / 2 - height * 0.42,
    }
  }
  const size = width * 0.37
  return {
    landscape,
    size,
    x: width / 2 - size / 2 - width * 0.06,
    y: height / 2 - height * 0.085 - size / 2,
  }
}

// The logo's lobe: a three-quarter disc with the corner facing the centre
// squared off. The other three are the same solid rotated by 90 degrees.
function buildLobe(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(-LOBE_GAP, LOBE_GAP)
  shape.lineTo(-LOBE_C, LOBE_GAP)
  shape.absarc(-LOBE_C, LOBE_C, LOBE_R, -Math.PI / 2, -2 * Math.PI, true)
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 10,
    bevelEnabled: true,
    bevelThickness: 5,
    bevelSize: 4.2,
    bevelOffset: -4.2,
    bevelSegments: 10,
    curveSegments: 56,
  })
  geometry.translate(0, 0, -5)
  return geometry
}

// Tracked on window because the canvas sits under the copy and takes no input.
function usePointer(enabled: boolean) {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (!enabled) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled])
  return pointer
}

const scrollProgress = () => Math.min(1, window.scrollY / Math.max(1, window.innerHeight))

function Quatrefoil({ ready, reduced }: { ready: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null)
  const lobes = useRef<Array<THREE.Mesh | null>>([])
  const intro = useRef(reduced ? 1 : 0)
  const pointer = usePointer(!reduced)
  const viewport = useThree((s) => s.viewport)
  const geometry = useMemo(buildLobe, [])
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: VIOLET,
        roughness: 0.34,
        metalness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.22,
        sheen: 0.6,
        sheenColor: new THREE.Color(LAVENDER),
        sheenRoughness: 0.5,
      }),
    [],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  const layout = markLayout(viewport)
  const scale = layout.size / MARK_SPAN
  // Portrait screens have less room to swing before the mark clips the edge.
  const swing = layout.landscape ? 1 : 0.6

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)
    intro.current = THREE.MathUtils.damp(intro.current, ready ? 1 : 0, 2.4, dt)
    const k = intro.current
    const scroll = scrollProgress()

    const idleY = reduced ? 0 : Math.sin(t * 0.32) * 0.2
    const idleX = reduced ? 0 : Math.cos(t * 0.27) * 0.07
    const targetY = -0.42 + (idleY + pointer.current.x * 0.38) * swing
    const targetX = 0.2 + (idleX + pointer.current.y * 0.22) * swing
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY - (1 - k) * 1.7, 3.2, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX + (1 - k) * 0.6 - scroll * 0.35, 3.2, dt)
    g.rotation.z = (1 - k) * (-Math.PI / 2) + scroll * 0.5
    g.scale.setScalar(scale * (0.5 + 0.5 * k))
    const bob = reduced ? 0 : Math.sin(t * 0.6) * layout.size * 0.03
    g.position.set(layout.x, layout.y + bob + scroll * layout.size * 0.55, 0)

    // Lobes start pushed outward and close into the mark.
    const spread = (1 - k) * 26
    for (let i = 0; i < 4; i++) {
      const mesh = lobes.current[i]
      if (!mesh) continue
      const a = Math.PI * 0.75 - i * (Math.PI / 2)
      mesh.position.set(Math.cos(a) * spread, Math.sin(a) * spread, Math.sin(t * 0.9 + i) * (reduced ? 0 : 1.2))
    }
  })

  return (
    <group ref={group} scale={scale * (reduced ? 1 : 0.5)} position={[layout.x, layout.y, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            lobes.current[i] = m
          }}
          geometry={geometry}
          material={material}
          rotation={[0, 0, -i * (Math.PI / 2)]}
        />
      ))}
    </group>
  )
}

type Floater = {
  kind: 'torus' | 'sphere' | 'capsule' | 'gem'
  color: string
  // Offset from the mark's centre, in mark sizes. z is absolute depth.
  at: [number, number, number]
  // Radius in mark sizes.
  size: number
  speed: number
  depth: number
}

// Kept around the mark and away from the copy column on every layout.
const FLOATERS_LANDSCAPE: Floater[] = [
  { kind: 'torus', color: LAVENDER, at: [0.62, 0.48, -1.2], size: 0.1, speed: 0.5, depth: 0.5 },
  { kind: 'sphere', color: LIME, at: [-0.55, -0.6, 0.6], size: 0.06, speed: 0.8, depth: 0.9 },
  { kind: 'capsule', color: MAGENTA, at: [0.66, -0.5, -0.4], size: 0.07, speed: 0.6, depth: 0.7 },
  { kind: 'gem', color: VIOLET_DEEP, at: [-0.62, 0.58, -1.6], size: 0.08, speed: 0.4, depth: 0.35 },
]

const FLOATERS_PORTRAIT: Floater[] = [
  { kind: 'sphere', color: LIME, at: [-0.72, -0.22, 0.6], size: 0.07, speed: 0.8, depth: 0.9 },
  { kind: 'capsule', color: MAGENTA, at: [0.5, -0.36, -0.4], size: 0.07, speed: 0.6, depth: 0.7 },
  { kind: 'gem', color: VIOLET_DEEP, at: [-1.18, 0.34, -1.6], size: 0.1, speed: 0.4, depth: 0.35 },
]

function FloatingShape({ spec, ready, reduced, index }: { spec: Floater; ready: boolean; reduced: boolean; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const intro = useRef(reduced ? 1 : 0)
  const pointer = usePointer(!reduced)
  const viewport = useThree((s) => s.viewport)
  const layout = markLayout(viewport)

  useFrame((state, delta) => {
    const m = ref.current
    if (!m) return
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)
    intro.current = THREE.MathUtils.damp(intro.current, ready ? 1 : 0, 1.8 + index * 0.25, dt)
    const k = intro.current
    const scroll = scrollProgress()
    const s = layout.size
    const x = layout.x + spec.at[0] * s - pointer.current.x * 0.18 * spec.depth
    const y = layout.y + spec.at[1] * s + pointer.current.y * 0.12 * spec.depth + scroll * s * (0.4 + spec.depth * 0.5)
    const bob = reduced ? 0 : Math.sin(t * spec.speed + index * 1.7) * s * 0.04
    m.position.set(x, y + bob - (1 - k) * s * 0.4, spec.at[2])
    m.scale.setScalar(spec.size * s * k)
    if (!reduced) {
      m.rotation.x = t * spec.speed * 0.6 + index
      m.rotation.y = t * spec.speed * 0.4
    }
  })

  return (
    <mesh ref={ref} scale={0}>
      {spec.kind === 'torus' && <torusGeometry args={[1, 0.42, 32, 72]} />}
      {spec.kind === 'sphere' && <sphereGeometry args={[1, 48, 48]} />}
      {spec.kind === 'capsule' && <capsuleGeometry args={[0.62, 1.1, 16, 40]} />}
      {spec.kind === 'gem' && <icosahedronGeometry args={[1, 0]} />}
      <meshPhysicalMaterial
        color={spec.color}
        roughness={spec.kind === 'gem' ? 0.22 : 0.38}
        metalness={0.02}
        clearcoat={1}
        clearcoatRoughness={0.25}
        flatShading={spec.kind === 'gem'}
      />
    </mesh>
  )
}

function Shapes({ ready, reduced }: { ready: boolean; reduced: boolean }) {
  const viewport = useThree((s) => s.viewport)
  const list = markLayout(viewport).landscape ? FLOATERS_LANDSCAPE : FLOATERS_PORTRAIT
  return (
    <>
      {list.map((spec, i) => (
        <FloatingShape key={spec.kind} spec={spec} ready={ready} reduced={reduced} index={i} />
      ))}
    </>
  )
}

function Lights() {
  return (
    <>
      <hemisphereLight args={['#efe6ff', '#1a0b3a', 0.9]} />
      <directionalLight position={[-4, 6, 6]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[5, -2, 3]} intensity={1.1} color={LAVENDER} />
      <pointLight position={[4.5, -3.2, 2.5]} intensity={34} distance={14} color={MAGENTA} />
      <pointLight position={[-5, -1, -2]} intensity={16} distance={14} color={LIME} />
    </>
  )
}

// Decorative. Renders frames only while the hero is on screen.
export default function HeroScene({ ready, active, reduced }: SceneProps) {
  return (
    <Canvas
      className="hero-scene"
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 8], fov: 30, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      aria-hidden="true"
      tabIndex={-1}
    >
      <Lights />
      <Quatrefoil ready={ready} reduced={reduced} />
      <Shapes ready={ready} reduced={reduced} />
    </Canvas>
  )
}
