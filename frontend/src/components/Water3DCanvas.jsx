import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Water3DCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for mouse parallax
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Water Reservoir Tank (Outer Glass Cylinder)
    const glassGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.8, 32);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.33,
      reflectivity: 0.9,
      thickness: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const tankGlass = new THREE.Mesh(glassGeo, glassMat);
    mainGroup.add(tankGlass);

    // Tank Metallic Caps
    const capGeo = new THREE.CylinderGeometry(1.26, 1.26, 0.15, 32);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = 1.45;
    const botCap = new THREE.Mesh(capGeo, capMat);
    botCap.position.y = -1.45;
    mainGroup.add(topCap);
    mainGroup.add(botCap);

    // 2. Liquid Interior (Animated Wave Mesh)
    const liquidGeo = new THREE.CylinderGeometry(1.08, 1.08, 1.8, 32);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = -0.2;
    mainGroup.add(liquid);

    // 3. Torus Glow Rings
    const ringGeo = new THREE.TorusGeometry(1.6, 0.03, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.8,
      wireframe: true,
    });
    const glowRing = new THREE.Mesh(ringGeo, ringMat);
    mainGroup.add(glowRing);

    // 4. Orbiting Droplets
    const dropletsGroup = new THREE.Group();
    mainGroup.add(dropletsGroup);

    const dropletPositions = [
      [-2.2, 1.2, 0.5, 0.25],
      [2.4, -0.8, 1.1, 0.22],
      [-1.8, -1.4, -0.8, 0.3],
      [1.9, 1.6, -1.2, 0.28],
      [0, 2.2, 1.0, 0.2],
    ];

    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.4,
    });

    dropletPositions.forEach(([x, y, z, r]) => {
      const dropGeo = new THREE.SphereGeometry(r, 24, 24);
      const mesh = new THREE.Mesh(dropGeo, dropMat);
      mesh.position.set(x, y, z);
      dropletsGroup.add(mesh);
    });

    // 5. Floating Smart Building Block
    const blockGeo = new THREE.BoxGeometry(1.0, 1.4, 1.0);
    const blockMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
      transmission: 0.7,
      thickness: 0.5,
    });
    const smartBlock = new THREE.Mesh(blockGeo, blockMat);
    smartBlock.position.set(2.5, 0.3, -0.5);
    smartBlock.rotation.set(0.2, -0.4, 0);
    mainGroup.add(smartBlock);

    // LED Sensor Nodes on Block
    const ledGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const ledMat1 = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 2 });
    const ledMat2 = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 2 });
    const led1 = new THREE.Mesh(ledGeo, ledMat1);
    led1.position.set(2.5, 0.7, 0.02);
    const led2 = new THREE.Mesh(ledGeo, ledMat2);
    led2.position.set(2.8, 0.7, 0.02);
    mainGroup.add(led1);
    mainGroup.add(led2);

    // 6. Background Particles Sparkle
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 120;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 12;
      posArray[i + 1] = (Math.random() - 0.5) * 12;
      posArray[i + 2] = (Math.random() - 0.5) * 12;
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(10, 10, 8);
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0x38bdf8, 3, 10);
    pointLight1.position.set(-4, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0284c7, 3, 10);
    pointLight2.position.set(4, -2, -2);
    scene.add(pointLight2);

    // Mouse Parallax Effect
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = (y / rect.height) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Liquid wave animation
      liquid.position.y = Math.sin(elapsedTime * 1.5) * 0.06 - 0.2;
      liquid.rotation.y = elapsedTime * 0.3;

      // Glow Ring rotation
      glowRing.rotation.z = elapsedTime * 0.6;
      glowRing.rotation.x = Math.sin(elapsedTime) * 0.2;

      // Tank slow rotation
      mainGroup.rotation.y = elapsedTime * 0.15;

      // Droplets float
      dropletsGroup.rotation.y = -elapsedTime * 0.2;
      dropletsGroup.position.y = Math.sin(elapsedTime * 2) * 0.1;

      // Smart block float
      smartBlock.position.y = 0.3 + Math.sin(elapsedTime * 1.8) * 0.08;
      led1.position.y = 0.7 + Math.sin(elapsedTime * 1.8) * 0.08;
      led2.position.y = 0.7 + Math.sin(elapsedTime * 1.8) * 0.08;

      // Particles float
      particlesMesh.rotation.y = elapsedTime * 0.05;

      // Mouse Parallax Lerp
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      mainGroup.rotation.x = targetY * 0.4;
      mainGroup.rotation.z = -targetX * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "540px",
        position: "relative",
        cursor: "grab",
      }}
    />
  );
}
