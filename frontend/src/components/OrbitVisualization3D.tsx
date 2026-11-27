import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Satellite, Eye, RefreshCw, Layers, Shield, Radio } from 'lucide-react';
import { SystemState } from '../types';

interface OrbitVisualization3DProps {
  systemState: SystemState;
  onSelectNode?: (nodeId: string) => void;
}

export const OrbitVisualization3D: React.FC<OrbitVisualization3DProps> = ({
  systemState,
  onSelectNode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [is2DFallback, setIs2DFallback] = useState<boolean>(false);
  const [selectedSatellite, setSelectedSatellite] = useState<string>('SAT-A');

  // Three.js animation and scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (is2DFallback) return;
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x223355, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(20, 10, 15);
    scene.add(sunLight);

    // 3. Stars / Deep Space Particles
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 100;
      starPos[i + 1] = (Math.random() - 0.5) * 100;
      starPos[i + 2] = (Math.random() - 0.5) * 100;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x64748b, size: 0.8, transparent: true, opacity: 0.6 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 4. Procedural Earth
    // Create Earth sphere with canvas texture
    const earthRadius = 3.6;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 32, 32);

    // Draw procedural canvas texture for Earth
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Ocean gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#0a1931');
      oceanGrad.addColorStop(0.5, '#0d254c');
      oceanGrad.addColorStop(1, '#0a1931');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Continent shapes (stylized cyber continents)
      ctx.fillStyle = '#10b98122';
      ctx.strokeStyle = '#00f0ff66';
      ctx.lineWidth = 2;

      // Stylized landmass blobs
      const drawBlob = (x: number, y: number, r: number) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      };
      drawBlob(320, 200, 75); // Eurasia
      drawBlob(360, 270, 50); // India/S.Asia
      drawBlob(200, 220, 60); // Africa
      drawBlob(750, 190, 70); // N. America
      drawBlob(820, 320, 65); // S. America
      drawBlob(450, 360, 45); // Australia

      // Grid lat/long lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let y = 0; y < 512; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
      for (let x = 0; x < 1024; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.8,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // Earth atmosphere glow halo
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.05, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.12,
      wireframe: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // 5. Ground Station Marker
    const gsGeo = new THREE.CylinderGeometry(0.08, 0.18, 0.4, 8);
    const gsMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const groundStation = new THREE.Mesh(gsGeo, gsMat);
    groundStation.position.set(0, earthRadius * 0.98, earthRadius * 0.2);
    scene.add(groundStation);

    // 6. Orbital Rings
    const orbitRadii = [5.6, 6.2, 6.8];
    const orbitColors = [0x00f0ff, 0x8b5cf6, 0x0070f3];

    orbitRadii.forEach((r, idx) => {
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      const tilt = (idx - 1) * 0.35;
      for (let a = 0; a <= Math.PI * 2; a += 0.05) {
        points.push(
          new THREE.Vector3(
            Math.cos(a) * r,
            Math.sin(a) * r * Math.sin(tilt),
            Math.sin(a) * r * Math.cos(tilt)
          )
        );
      }
      ringGeo.setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({
        color: orbitColors[idx],
        transparent: true,
        opacity: 0.35,
      });
      scene.add(new THREE.Line(ringGeo, ringMat));
    });

    // 7. Satellites creation
    const createSatelliteMesh = (name: string, color: number) => {
      const group = new THREE.Group();

      // Bus cube
      const busGeo = new THREE.BoxGeometry(0.35, 0.25, 0.45);
      const busMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.2,
      });
      const bus = new THREE.Mesh(busGeo, busMat);
      group.add(bus);

      // Solar Panels
      const panelGeo = new THREE.BoxGeometry(0.8, 0.03, 0.3);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x0055ff,
        metalness: 0.6,
        roughness: 0.3,
      });
      const leftPanel = new THREE.Mesh(panelGeo, panelMat);
      leftPanel.position.set(-0.65, 0, 0);
      group.add(leftPanel);

      const rightPanel = new THREE.Mesh(panelGeo, panelMat);
      rightPanel.position.set(0.65, 0, 0);
      group.add(rightPanel);

      // Antenna beacon
      const antGeo = new THREE.ConeGeometry(0.1, 0.2, 8);
      const antMat = new THREE.MeshBasicMaterial({ color });
      const ant = new THREE.Mesh(antGeo, antMat);
      ant.position.set(0, -0.2, 0);
      ant.rotation.x = Math.PI;
      group.add(ant);

      group.name = name;
      return group;
    };

    const satA = createSatelliteMesh('SAT-A', 0x00f0ff);
    const satB = createSatelliteMesh('SAT-B', 0x8b5cf6);
    const satC = createSatelliteMesh('SAT-C', 0x0070f3);

    scene.add(satA);
    scene.add(satB);
    scene.add(satC);

    // 8. Communication Laser Links
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3));
    const linkMat = new THREE.LineBasicMaterial({
      color: systemState === 'SAFE MODE' ? 0xf43f5e : 0x00f0ff,
      transparent: true,
      opacity: 0.7,
      linewidth: 2,
    });
    const laserMesh = new THREE.LineSegments(linkGeo, linkMat);
    scene.add(laserMesh);

    // Mouse Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationSpeedX = 0.003;
    let rotationSpeedY = 0.003;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      scene.rotation.y += deltaX * rotationSpeedX;
      scene.rotation.x += deltaY * rotationSpeedY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      camera.position.z = Math.max(9, Math.min(26, camera.position.z + e.deltaY * 0.01));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel);

    // 9. Animation Loop
    let angleA = 0;
    let angleB = 2.1;
    let angleC = 4.2;

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      // Rotate Earth slowly
      earthMesh.rotation.y += 0.002;
      atmosMesh.rotation.y += 0.0015;

      // Rotate orbits
      const speed = systemState === 'SAFE MODE' ? 0.006 : 0.012;
      angleA += speed;
      angleB += speed;
      angleC += speed;

      // Update Sat A
      const rA = orbitRadii[0];
      const tiltA = -0.35;
      satA.position.set(Math.cos(angleA) * rA, Math.sin(angleA) * rA * Math.sin(tiltA), Math.sin(angleA) * rA * Math.cos(tiltA));
      satA.rotation.y = angleA + Math.PI / 2;

      // Update Sat B
      const rB = orbitRadii[1];
      const tiltB = 0;
      satB.position.set(Math.cos(angleB) * rB, 0, Math.sin(angleB) * rB);
      satB.rotation.y = angleB + Math.PI / 2;

      // Update Sat C
      const rC = orbitRadii[2];
      const tiltC = 0.35;
      satC.position.set(Math.cos(angleC) * rC, Math.sin(angleC) * rC * Math.sin(tiltC), Math.sin(angleC) * rC * Math.cos(tiltC));
      satC.rotation.y = angleC + Math.PI / 2;

      // Update dynamic links
      const positions = linkGeo.attributes.position.array as Float32Array;
      // SAT-A to SAT-B
      positions[0] = satA.position.x; positions[1] = satA.position.y; positions[2] = satA.position.z;
      positions[3] = satB.position.x; positions[4] = satB.position.y; positions[5] = satB.position.z;
      // SAT-B to SAT-C
      positions[6] = satB.position.x; positions[7] = satB.position.y; positions[8] = satB.position.z;
      positions[9] = satC.position.x; positions[10] = satC.position.y; positions[11] = satC.position.z;
      // SAT-C to SAT-A
      positions[12] = satC.position.x; positions[13] = satC.position.y; positions[14] = satC.position.z;
      positions[15] = satA.position.x; positions[16] = satA.position.y; positions[17] = satA.position.z;
      linkGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [is2DFallback, systemState]);

  return (
    <div className="space-y-4">
      {/* 3D Viewport Panel */}
      <div className="cyber-panel p-4 rounded-xl relative overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold text-slate-100">
              ORBITAL CONSTELLATION TELEMETRY (3D MESH)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              3 NODES + GROUND STATION
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIs2DFallback(!is2DFallback)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono bg-space-900 hover:bg-space-850 border border-slate-800 hover:border-cyan-500/40 text-slate-300"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{is2DFallback ? 'SWITCH TO 3D VIEW' : '2D SCHEMATIC FALLBACK'}</span>
            </button>
          </div>
        </div>

        {/* Canvas or 2D Schematic */}
        {!is2DFallback ? (
          <div className="relative w-full h-[520px] rounded-lg overflow-hidden bg-space-950 cursor-grab active:cursor-grabbing">
            <div ref={mountRef} className="w-full h-full" />

            {/* Orbit HUD Overlays */}
            <div className="absolute top-3 left-3 pointer-events-none font-mono text-[11px] text-slate-400 space-y-1 bg-space-950/80 p-2.5 rounded border border-slate-800">
              <div className="text-cyan-400 font-bold">ORBITAL METRICS</div>
              <div>Altitude: 550 km Sun-Synchronous LEO</div>
              <div>Inclination: 97.4° Polar Orbit</div>
              <div>Ground Station: Bengaluru MOC (12.97°N, 77.59°E)</div>
              <div>Inter-Satellite Link: Active Laser Mesh (ISL)</div>
            </div>

            <div className="absolute bottom-3 right-3 pointer-events-none font-mono text-[10px] text-slate-500 bg-space-950/80 px-2 py-1 rounded border border-slate-800">
              DRAG: Rotate Camera | SCROLL: Zoom In/Out
            </div>
          </div>
        ) : (
          /* 2D Schematic Fallback for Low-Power Machines */
          <div className="w-full h-[520px] rounded-lg bg-space-950 p-6 flex flex-col justify-center items-center border border-slate-800 relative">
            <div className="relative w-72 h-72 rounded-full border-2 border-dashed border-cyan-500/30 flex items-center justify-center animate-spin-slow">
              <div className="w-48 h-48 rounded-full border border-violet-500/40 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-900 to-cyan-700 flex items-center justify-center shadow-neon-blue">
                  <span className="text-[10px] font-mono font-bold text-white">EARTH</span>
                </div>
              </div>

              {/* Satellites on ring */}
              <div className="absolute -top-3 px-2 py-1 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-mono">
                SAT-A (LEO-1)
              </div>
              <div className="absolute -bottom-3 px-2 py-1 rounded bg-violet-950 border border-violet-400 text-violet-300 text-xs font-mono">
                SAT-B (LEO-2)
              </div>
              <div className="absolute -left-3 px-2 py-1 rounded bg-blue-950 border border-blue-400 text-blue-300 text-xs font-mono">
                SAT-C (LEO-3)
              </div>
            </div>

            <div className="mt-8 text-center font-mono text-xs text-slate-400">
              <p className="text-cyan-400 font-bold mb-1">2D LOW-OVERHEAD TACTICAL SCHEMATIC ACTIVE</p>
              <p>Optimized for low-spec presentation hardware. Full consensus and encryption continue running locally.</p>
            </div>
          </div>
        )}

        {/* Satellite Node Selector Strip */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {['SAT-A', 'SAT-B', 'SAT-C'].map((name, idx) => {
            const isSelected = selectedSatellite === name;
            return (
              <button
                key={name}
                onClick={() => {
                  setSelectedSatellite(name);
                  if (onSelectNode) onSelectNode(name);
                }}
                className={`p-3 rounded-lg font-mono text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border border-cyan-400 shadow-sm'
                    : 'bg-space-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{name}</span>
                  <span className="text-[10px] text-cyan-400">LEO SLOT {idx + 1}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400 flex justify-between">
                  <span>Downlink:</span>
                  <span className="text-slate-300">8.45 GHz</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Mesh Link:</span>
                  <span className="text-emerald-400">4.2 ms ping</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
