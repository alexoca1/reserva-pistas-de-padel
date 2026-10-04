import { useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Group } from "three";

interface BallProps {
  position: [number, number, number];
  radius: number;
  color: string;
  speed: number;
  distort: number;
}

function Ball({ position, radius, color, speed, distort }: BallProps) {
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh position={position}>
        <sphereGeometry args={[radius, 48, 48]} />
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

function SlowSpin(props: ThreeElements["group"]) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.06;
  });

  return <group ref={group} {...props} />;
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 40 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#e8ffb0" />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#a3e635" />

      <SlowSpin>
        <Ball position={[1.1, 0.6, 0]} radius={1} color="#a3e635" speed={1.6} distort={0.35} />
        <Ball position={[-1.3, -0.5, -1]} radius={0.6} color="#eaffa8" speed={2.1} distort={0.4} />
        <Ball position={[0.4, -1.1, -1.6]} radius={0.4} color="#65a30d" speed={1.2} distort={0.3} />
      </SlowSpin>
    </Canvas>
  );
}