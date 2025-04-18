"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise";

export default function AlienWorld() {
  const mountRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<THREE.Mesh>(new THREE.Mesh());
  const terrainRef = useRef<THREE.Mesh | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const perlin = new ImprovedNoise();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x112233);
    scene.fog = new THREE.Fog(0x112233, 50, 200);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 30);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Controls (optional, disabled for flight sim)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040));
    const dirLight = new THREE.DirectionalLight(0x99aaff, 0.5);
    dirLight.position.set(50, 50, 50);
    scene.add(dirLight);

    // Generate dynamic terrain
    const terrainSize = 100;
    const terrainGeometry = new THREE.PlaneGeometry(
      terrainSize,
      terrainSize,
      128,
      128
    );
    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x336655,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    terrainRef.current = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainRef.current.rotation.x = -Math.PI / 2;
    scene.add(terrainRef.current);

    // Alien ship
    const shipGeometry = new THREE.ConeGeometry(3, 7, 10); // Bigger and sharper cone for sleek look
    const shipMaterial = new THREE.MeshStandardMaterial({
      color: 0x4488cc, // A nice futuristic blue
      roughness: 0.2,
      metalness: 0.8, // Making it metallic
      emissive: 0x00aaff, // Glowing edges
      emissiveIntensity: 0.6, // Glow intensity
    });

    // Create the ship body (main cone)
    shipRef.current = new THREE.Mesh(shipGeometry, shipMaterial);

    // Create a glowing ring to wrap around the cone for a futuristic look
    const ringGeometry = new THREE.TorusGeometry(4, 0.5, 16, 100); // Large ring
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x00aaff, // Blueish glow
      emissive: 0x00aaff, // Glowing effect
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Rotating the ring to wrap around the cone
    ring.position.set(0, 0, 0);

    // Combine the cone and ring into a single mesh object for the ship
    const ship = new THREE.Group();
    ship.add(shipRef.current); // Add cone to ship
    ship.add(ring); // Add glowing ring to ship

    ship.position.set(0, 10, 0); // Position the ship
    scene.add(ship); // Add the ship to the scene

    // Alien structures (static decoration)
    const structureGeometry = new THREE.BoxGeometry(2, 10, 2);
    const structureMaterial = new THREE.MeshPhongMaterial({ color: 0x7744aa });
    for (let i = 0; i < 10; i++) {
      const structure = new THREE.Mesh(structureGeometry, structureMaterial);
      structure.position.set(
        Math.random() * 100 - 50,
        5,
        Math.random() * 100 - 50
      );
      scene.add(structure);
    }

    // Controls setup
    const shipSpeed = 0.2;
    const rotationSpeed = 0.02;
    let velocity = new THREE.Vector3();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);

      // Directional movement with arrows
      if (keysPressed.current["ArrowUp"]) velocity.z -= shipSpeed;
      if (keysPressed.current["ArrowDown"]) velocity.z += shipSpeed;
      if (keysPressed.current["ArrowLeft"])
        shipRef.current.rotation.y += rotationSpeed;
      if (keysPressed.current["ArrowRight"])
        shipRef.current.rotation.y -= rotationSpeed;

      // Ascend / Descend with W/S
      if (keysPressed.current["w"] || keysPressed.current["W"])
        velocity.y += shipSpeed;
      if (keysPressed.current["s"] || keysPressed.current["S"])
        velocity.y -= shipSpeed;

      // Apply velocity
      velocity.multiplyScalar(0.95);
      shipRef.current.position.add(velocity);

      // Update ship orientation
      shipRef.current.rotation.z = velocity.x * 0.5;
      shipRef.current.rotation.x = velocity.z * 0.2;

      // Regenerate terrain based on ship position
      const pos = terrainRef.current!.geometry.attributes.position
        .array as Float32Array;
      const size = terrainSize;
      const offsetX = shipRef.current.position.x;
      const offsetZ = shipRef.current.position.z;

      for (let i = 0, j = 0; i < pos.length; i += 3, j++) {
        const x = ((j % 129) / 128) * size - size / 2 + offsetX;
        const z = (Math.floor(j / 129) / 128) * size - size / 2 + offsetZ;
        pos[i + 2] = perlin.noise(x * 0.05, z * 0.05, 0) * 10;
      }

      terrainRef.current!.geometry.attributes.position.needsUpdate = true;
      terrainRef.current!.geometry.computeVertexNormals();
      terrainRef.current!.position.set(offsetX, 0, offsetZ);

      // Camera follow
      const camOffset = new THREE.Vector3(0, 5, 20).applyMatrix4(
        shipRef.current.matrixWorld
      );
      camera.position.lerp(camOffset, 0.1);
      camera.lookAt(shipRef.current.position);

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 text-white font-mono z-10">
        <h1 className="text-2xl mb-2">Alien Ship Simulator</h1>
        <p>Arrow Keys: Move / Rotate</p>
        <p>W: Ascend &nbsp;&nbsp;S: Descend</p>
      </div>
    </div>
  );
}
