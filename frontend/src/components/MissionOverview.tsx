import React from 'react';
import { 
  Satellite, 
  Radio, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Wifi, 
  Crosshair,
  Zap,
  Server
} from 'lucide-react';
import { ConstellationStatus, SecurityEvent } from '../types';

interface MissionOverviewProps {
  constellation: ConstellationStatus | null;
  recentLogs: SecurityEvent[];
  onNavigate: (tabId: string) => void;
}

export const MissionOverview: React.FC<MissionOverviewProps> = ({
  constellation,
  recentLogs,
  onNavigate,
}) => {
  const nodes = constellation?.nodes || [
    { node_id: 'SAT-A', status: 'ONLINE', altitude_km: 550, inclination_deg: 97.4, latency_ms: 18.4, verifications: 1, rejections: 0, orbital_slot: 'Slot-1' },
    { node_id: 'SAT-B', status: 'ONLINE', altitude_km: 550, inclination_deg: 97.4, latency_ms: 22.1, verifications: 1, rejections: 0, orbital_slot: 'Slot-2' },
    { node_id: 'SAT-C', status: 'ONLINE', altitude_km: 550, inclination_deg: 97.4, latency_ms: 19.8, verifications: 1, rejections: 0, orbital_slot: 'Slot-3' },
  ];

  const groundStation = constellation?.ground_station || {
    name: 'Ground Station Cyber HQ',
    location: 'Bengaluru Mission Operations Center',
    status: 'ONLINE',
    carrier_frequency_ghz: 8.45,
  };

  const layers = [
    {
      id: 'consensus',
      layer: 'Layer 1',
      title: 'Space-Mesh Consensus',
      tech: 'Ed25519 Cryptography & 2-of-3 BFT Quorum',
      status: 'ACTIVE & GUARDING',
      icon: ShieldCheck,
      color: 'cyan',
    },
    {
      id: 'wavelet',
      layer: 'Layer 2',
      title: 'Adaptive Wavelet Filtering',
      tech: 'PyWavelets VisuShrink DWT Denoising',
      status: 'AUTONOMOUS RF CLEANING',
      icon: Radio,
      color: 'blue',
    },
    {
      id: 'vault',
      layer: 'Layer 3',
      title: 'Homomorphic Telemetry Vault',
      tech: 'Paillier Additive Homomorphic Encryption',
      status: 'CIPHERTEXT PROTECTED',
      icon: Lock,
      color: 'purple',
    },
    {
      id: 'safemode',
      layer: 'Layer 4',
      title: 'Emergency Safe-Mode Protection',
      tech: 'State Machine & Autonomous Watchdog',
      status: constellation?.system_safemode_state === 'SAFE MODE' ? 'SAFE MODE ENGAGED' : 'WATCHDOG NOMINAL',
      icon: AlertTriangle,
      color: constellation?.system_safemode_state === 'SAFE MODE' ? 'rose' : 'emerald',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs font-mono text-cyan-300">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>
            SIMULATION ENVIRONMENT ACTIVE — REAL LOCAL HARDWARE IN-THE-LOOP CRYPTOGRAPHY & SIGNAL PROCESSING VERIFIED
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200 border border-cyan-700/50">
          LEO CONSTELLATION 550 KM
        </span>
      </div>

      {/* Top 3 Satellite Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node) => {
          const isSafeMode = node.status === 'SAFE_MODE';
          return (
            <div
              key={node.node_id}
              onClick={() => onNavigate('constellation')}
              className={`cyber-panel p-4 rounded-xl cursor-pointer hover:border-cyan-400/60 transition-all group ${
                isSafeMode ? 'border-rose-500/50 shadow-neon-rose' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-lg ${
                    isSafeMode ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    <Satellite className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-slate-100 flex items-center space-x-2">
                      <span>{node.node_id}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                        isSafeMode ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {node.status}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{node.orbital_slot}</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[11px] text-slate-500">LATENCY</span>
                  <p className="text-xs text-cyan-400 font-semibold">{node.latency_ms} ms</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px]">ALTITUDE</span>
                  <p className="text-slate-300">{node.altitude_km} km LEO</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">INCLINATION</span>
                  <p className="text-slate-300">{node.inclination_deg}° Polar</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">CONSENSUS PASS</span>
                  <p className="text-emerald-400 font-semibold">{node.verifications} validated</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">REJECTIONS</span>
                  <p className={node.rejections > 0 ? "text-rose-400 font-semibold" : "text-slate-400"}>
                    {node.rejections} blocked
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ground Station & Defense Matrix Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ground Station Command Center */}
        <div className="cyber-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-mono text-sm font-bold text-slate-200">GROUND STATION CYBER HQ</h4>
                <p className="text-xs text-slate-400 font-mono">{groundStation.location}</p>
              </div>
            </div>
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LINK LOCKED</span>
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1.5 px-2.5 rounded bg-space-900 border border-slate-800/80">
              <span className="text-slate-400">Uplink Encryption:</span>
              <span className="text-cyan-300 font-semibold">Ed25519 (256-bit Edwards)</span>
            </div>
            <div className="flex justify-between py-1.5 px-2.5 rounded bg-space-900 border border-slate-800/80">
              <span className="text-slate-400">Carrier Frequency:</span>
              <span className="text-slate-200">{groundStation.carrier_frequency_ghz} GHz (X-Band)</span>
            </div>
            <div className="flex justify-between py-1.5 px-2.5 rounded bg-space-900 border border-slate-800/80">
              <span className="text-slate-400">Telemetry Modulation:</span>
              <span className="text-slate-200">QPSK DSSS + BCH Coding</span>
            </div>
            <div className="flex justify-between py-1.5 px-2.5 rounded bg-space-900 border border-slate-800/80">
              <span className="text-slate-400">Consensus Policy:</span>
              <span className="text-cyan-300 font-semibold">2-of-3 Node Quorum</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('consensus')}
            className="w-full btn-cyber-primary py-2 text-xs"
          >
            OPEN CONSENSUS CONTROLLER
          </button>
        </div>

        {/* 4 Layers Active Defense Matrix */}
        <div className="lg:col-span-2 cyber-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-mono text-sm font-bold text-slate-200 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>MULTI-LAYER DEFENSE ARCHITECTURE MATRIX</span>
            </h4>
            <span className="text-xs font-mono text-slate-400">4 ACTIVE LAYERS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div
                  key={layer.id}
                  onClick={() => onNavigate(layer.id)}
                  className="p-3.5 rounded-lg bg-space-900/90 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-space-850 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded bg-space-800 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold">{layer.layer}</span>
                        <h5 className="text-xs font-mono font-bold text-slate-200 group-hover:text-white">
                          {layer.title}
                        </h5>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 font-mono">{layer.tech}</p>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">STATUS</span>
                    <span className="text-cyan-300 font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{layer.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Security Audit Log Stream Preview */}
      <div className="cyber-panel p-4 rounded-xl">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h4 className="font-mono text-xs font-bold text-slate-200">LIVE SECURITY AUDIT STREAM (SQLITE PERSISTED)</h4>
          </div>
          <button
            onClick={() => onNavigate('logs')}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            VIEW FULL AUDIT TRAIL →
          </button>
        </div>

        <div className="space-y-1.5">
          {recentLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-2 rounded bg-space-900/60 border border-slate-800/60 text-xs font-mono"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <span className="text-[10px] text-slate-500">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                  log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  log.status === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  log.status === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-blue-950 text-blue-300 border border-blue-800'
                }`}>
                  {log.layer.replace('LAYER_', 'L').replace('_', ' ')}
                </span>
                <span className="text-slate-300 truncate">{log.message}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                log.status === 'SUCCESS' ? 'text-emerald-400' :
                log.status === 'CRITICAL' ? 'text-rose-400' :
                log.status === 'WARNING' ? 'text-amber-400' : 'text-blue-400'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
