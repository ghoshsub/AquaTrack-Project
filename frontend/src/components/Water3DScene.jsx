import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, MeshTransmissionMaterial, Sphere, Cylinder, Box, Sparkles } from "@react-three/drei";

function WaterTankMesh() {
  const liquidRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (liquidRef.current) {
      liquidRef.current.rotation.y += delta * 0.4;
      liquidRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.08 - 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8;
      ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Outer Glass Tank Cylinder */}
      <Cylinder args={[1.2, 1.2, 2.8, 32]} position={[0, 0, 0]}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.6}
          chromaticAberration={0.15}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#38BDF8"
          color="#0284C7"
          roughness={0.1}
          transmission={0.92}
          ior={1.33}
        />
      </Cylinder>

      {/* Tank Metallic Caps */}
      <Cylinder args={[1.25, 1.25, 0.15, 32]} position={[0, 1.45, 0]}>
        <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[1.25, 1.25, 0.15, 32]} position={[0, -1.45, 0]}>
        <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} />
      </Cylinder>

      {/* Internal Liquid Mesh */}
      <mesh ref={liquidRef} position={[0, -0.2, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 1.8, 32]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0284C7"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Holographic Water Flow Ring */}
      <group ref={ringRef} position={[0, 0.1, 0]}>
        <torusGeometry args={[1.6, 0.04, 16, 100]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={1.5} wireframe />
      </group>
    </group>
  );
}

function FloatingDroplets() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.2;
    }
  });

  const positions = [
    [-2.2, 1.2, 0.5],
    [2.4, -0.8, 1.1],
    [-1.8, -1.4, -0.8],
    [1.9, 1.6, -1.2],
    [0, 2.2, 1.0],
  ];

  return (
    <group ref={groupRef}>
      {positions.map((pos, idx) => (
        <Float key={idx} speed={2 + idx * 0.5} rotationIntensity={1.5} floatIntensity={2}>
          <Sphere args={[0.22 + (idx % 3) * 0.06, 32, 32]} position={pos}>
            <meshPhysicalMaterial
              color="#38BDF8"
              emissive="#0284C7"
              emissiveIntensity={0.8}
              roughness={0.05}
              metalness={0.1}
              transmission={0.9}
              thickness={0.4}
              ior={1.33}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

function SmartBuildingBlocks() {
  return (
    <group position={[2.6, 0.4, -0.5]} rotation={[0.2, -0.4, 0]}>
      <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
        {/* Main Smart Node Box */}
        <Box args={[1.1, 1.5, 1.1]}>
          <MeshTransmissionMaterial
            thickness={0.5}
            roughness={0.15}
            transmission={0.9}
            color="#0F172A"
            attenuationColor="#38BDF8"
            ior={1.2}
          />
        </Box>

        {/* LED Sensor Node */}
        <Sphere args={[0.12, 16, 16]} position={[0, 0.5, 0.56]}>
          <meshStandardMaterial color="#34D399" emissive="#34D399" emissiveIntensity={2} />
        </Sphere>
        <Sphere args={[0.12, 16, 16]} position={[0.3, 0.5, 0.56]}>
          <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2} />
        </Sphere>
      </Float>
    </group>
  );
}

export default function Water3DScene() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900/40 rounded-3xl border border-sky-500/20 backdrop-blur-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💧</span>
          </div>
          <p className="text-sky-400 font-medium text-sm">Interactive 3D Simulation Ready</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] md:h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        onError={() => setHasError(true)}
      >
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#FFFFFF" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#38BDF8" />
        <pointLight position={[0, 2, 2]} intensity={2} color="#0284C7" />

        {/* Water Particles Sparkles */}
        <Sparkles count={80} scale={8} size={2.5} speed={0.4} color="#38BDF8" opacity={0.6} />

        {/* Main 3D Objects */}
        <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1}>
          <WaterTankMesh />
        </Float>
        <FloatingDroplets />
        <SmartBuildingBlocks />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
