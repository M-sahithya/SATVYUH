import React from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Radio, 
  Lock, 
  AlertTriangle, 
  Server, 
  Database, 
  Cpu, 
  ArrowRight,
  Code2,
  Box
} from 'lucide-react';

export const SystemArchitecture: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-panel p-5 rounded-xl space-y-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold font-mono text-slate-100">
            SATVYUH MULTI-LAYER DEFENSE ARCHITECTURAL SPECIFICATION
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          End-to-End Cyber-Physical Defense Framework for Distributed Satellite Constellations
        </p>
      </div>

      {/* Layer Stack Diagram */}
      <div className="cyber-panel p-6 rounded-xl space-y-6">
        <h3 className="font-mono text-sm font-bold text-slate-200">
          HIERARCHICAL 4-LAYER DEFENSE PIPELINE
        </h3>

        <div className="space-y-4 font-mono">
          {/* Layer 1 */}
          <div className="p-4 rounded-xl bg-space-900 border border-cyan-500/40 space-y-2 shadow-neon-cyan">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-cyan-500/20 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold">LAYER 1 — COMMAND AUTHORIZATION</span>
                  <h4 className="text-sm font-bold text-white">Space-Mesh Cryptographic Consensus</h4>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Ed25519 + 2/3 BFT Quorum
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Uplinked telecommands are digitally signed using Ed25519 high-speed asymmetric signatures. Onboard satellite nodes (SAT-A, SAT-B, SAT-C) verify signature integrity, validate timestamp freshness (within 300s envelope), enforce nonce anti-replay caches, and require at least 2-of-3 node approvals before commands are dispatched to spacecraft attitude and propulsion actuators.
            </p>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-xl bg-space-900 border border-blue-500/40 space-y-2 shadow-neon-blue">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-blue-500/20 text-blue-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-blue-400 font-bold">LAYER 2 — PHYSICAL & RF SIGNAL INTEGRITY</span>
                  <h4 className="text-sm font-bold text-white">Adaptive Wavelet Multi-Resolution Denoising</h4>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800">
                PyWavelets DWT VisuShrink
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Downlink and inter-satellite telemetry carrier signals undergo multi-level Discrete Wavelet Transform (DWT) decomposition using Daubechies (db4) wavelets. Median Absolute Deviation (MAD) dynamically calculates the universal noise threshold (σ · √(2 · ln N)) to suppress Additive White Gaussian Noise and localized RF jamming bursts without destroying rapid transient telemetry edges.
            </p>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-xl bg-space-900 border border-violet-500/40 space-y-2 shadow-neon-violet">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-violet-500/20 text-violet-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-violet-400 font-bold">LAYER 3 — CONFIDENTIAL TELEMETRY TELEPRESENCE</span>
                  <h4 className="text-sm font-bold text-white">Homomorphic Telemetry Cryptographic Vault</h4>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-violet-950 text-violet-300 border border-violet-800">
                Paillier Additive Homomorphism
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Sensitive spacecraft health telemetry (battery state of charge, solar array generation, reaction wheel core temperatures) is encrypted using a 1024-bit Paillier public key. The additive homomorphic property enables intermediate mesh relay satellites and untrusted edge nodes to compute cumulative power draws and fleet averages in the ciphertext domain: E(m₁) · E(m₂) mod n² = E(m₁ + m₂ mod n) without exposing plaintext values.
            </p>
          </div>

          {/* Layer 4 */}
          <div className="p-4 rounded-xl bg-space-900 border border-rose-500/40 space-y-2 shadow-neon-rose">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 font-bold">LAYER 4 — SYSTEM SURVIVABILITY & FAILOVER</span>
                  <h4 className="text-sm font-bold text-white">Autonomous Emergency Safe-Mode Controller</h4>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800">
                Finite State Machine + Watchdog
              </span>
            </div>
            <p className="text-xs text-slate-300">
              A flight-software finite state machine continuously monitors carrier synchronization and ground-uplink heartbeats. In the event of sustained communication loss (watchdog timeout) or critical subsystem anomalies, the satellite autonomously transitions to SAFE MODE: isolating non-essential sensor payloads, tumbling damping via magnetorquers, orienting solar arrays toward the Sun, and activating low-power omnidirectional survival beacons.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frontend Stack */}
        <div className="cyber-panel p-5 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800 text-cyan-400 font-bold">
            <Code2 className="w-4 h-4" />
            <span>FRONTEND ARCHITECTURE</span>
          </div>
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Framework:</span>
              <span className="text-cyan-300 font-semibold">React 18 + Vite + TypeScript</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Styling:</span>
              <span className="text-slate-200">Tailwind CSS + Glassmorphism UI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">3D Graphics:</span>
              <span className="text-cyan-300 font-semibold">Three.js Procedural Orbital Engine</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Charting:</span>
              <span className="text-slate-200">Recharts Multi-Waveform Synchronizer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Icons & Motion:</span>
              <span className="text-slate-200">Lucide React & CSS Animations</span>
            </div>
          </div>
        </div>

        {/* Backend Stack */}
        <div className="cyber-panel p-5 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800 text-violet-400 font-bold">
            <Server className="w-4 h-4" />
            <span>BACKEND SIMULATION ENGINE</span>
          </div>
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">API Gateway:</span>
              <span className="text-violet-300 font-semibold">FastAPI + Uvicorn ASGI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Asymmetric Crypto:</span>
              <span className="text-slate-200">Python Cryptography (Ed25519)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Homomorphic Crypto:</span>
              <span className="text-violet-300 font-semibold">phe (Paillier Cryptosystem)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Signal Processing:</span>
              <span className="text-slate-200">PyWavelets + NumPy + SciPy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Audit Storage:</span>
              <span className="text-emerald-300 font-semibold">SQLite Embedded DB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
