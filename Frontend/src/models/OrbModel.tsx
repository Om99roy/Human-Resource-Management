import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export default function OrbModel() {
  const { scene } = useGLTF("/mystic_orb.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((mat) => {
          mat.side = THREE.FrontSide;
	  mat.depthWrite = false;

	  if("emissive" in mat) {
		mat.emmisive = new THREE.Color("#5b21b6");
		mat.emissiveIntensity = 0.15;
	  }
	  if ("metalness" in mat) mat.metalness = 0.2;

	  if ("roughness" in mat) mat.roughness = 0.8;
	  mat.color = new THREE.Color("#f5f5f5");
        });
      }
    });
  }, [scene]);

  return <primitive object={scene} scale={0.9} />;
}
