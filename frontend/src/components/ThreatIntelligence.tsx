import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Crosshair, 
  Radio, 
  Cpu, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Zap,
  Activity
} from 'lucide-react';
import { SystemState } from '../types';

interface ThreatIntelligenceProps {
  systemState: SystemState;
}

export const ThreatIntelligence: React.FC<ThreatIntelligenceProps> = ({
  systemState,
}) => {
  const [radarDegree, setRadarDegree] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarDegree((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const threats = [
    {
      id: 'T-01',
      type: 'RF Jamming Interference',
      layer: 'Layer 2 (PHY)',
      severity: 'HIGH',
      status: 'NEUTRALIZED VIA WAVELET DWT',
      impact: 'Carrier SNR degraded to -1.68 dB; restored to +3.13 dB',
    },
    {
      id: 'T-02',
      type: 'Forged Uplink Signature Spoof',
      layer: 'Layer 1 (Consensus)',
      severity: 'CRITICAL',
      status: 'BLOCKED BY ED25519 QUORUM',
      impact: '0/3 satellite nodes approved untrusted rogue key',
    },
    {
      id: 'T-03',
      type: 'Telemetry Replay Attack',
      layer: 'Layer 1 (Consensus)',
      severity: 'MEDIUM',
      status: 'BLOCKED BY NONCE CACHE',
      impact: 'Duplicated nonce #1002 rejected by all 3 nodes',
    },
    {
      id: 'T-04',
      type: 'Intermediate Relay Telemetry Snooping',
      layer: 'Layer 3 (Crypto)',
      severity: 'HIGH',
      status: 'PREVENTED BY PAILLIER ENCRYPTION',
      impact: 'Telemetry added in ciphertext space; zero plaintext exposure',
    },
    {
      id: 'T-05',
      type: 'Uplink Blackout / Jamming Watchdog Trigger',
      layer: 'Layer 4 (Safe Mode)',
      severity: systemState === 'SAFE MODE' ? 'CRITICAL' : 'STANDBY',
      status: systemState === 'SAFE MODE' ? 'SAFE MODE ACTIVE' : 'WATCHDOG ARMED',
      impact: 'Subsystems locked to survival mode, omni-beacon activated',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-panel p-5 rounded-xl space-y-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold font-mono text-slate-100">
            SPACE-CYBER THREAT INTELLIGENCE & TELEMETRY RADAR
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Real-time threat assessment across space-to-ground and inter-satellite mesh links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Animated Cyber Radar Display */}
        <div className="cyber-panel p-5 rounded-xl flex flex-col items-center justify-center space-y-4">
          <span className="text-xs font-mono font-bold text-slate-300">
            CONSTELLATION RF THREAT RADAR
          </span>

          <div className="relative w-64 h-64 rounded-full border-2 border-cyan-500/40 bg-space-950 flex items-center justify-center overflow-hidden shadow-neon-cyan">
            {/* Concentric rings */}
            <div className="absolute w-48 h-48 rounded-full border border-cyan-500/20" />
            <div className="absolute w-32 h-32 rounded-full border border-cyan-500/30" />
            <div className="absolute w-16 h-16 rounded-full border border-cyan-500/40" />

            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-cyan-500/30" />
            <div className="absolute h-full w-[1px] bg-cyan-500/30" />

            {/* Rotating Radar Sweep Line */}
            <div
              className="absolute w-1/2 h-[2px] origin-right right-1/2 top-1/2 bg-gradient-to-l from-cyan-400 to-transparent"
              style={{
                transform: `rotate(${radarDegree}deg)`,
                transformOrigin: 'right center',
              }}
            />

            {/* Center Ground HQ dot */}
            <div className="w-3 h-3 rounded-full bg-cyan-400 z-10 shadow-neon-cyan animate-ping" />

            {/* Blips */}
            <div className="absolute top-14 left-16 w-2.5 h-2.5 rounded-full bg-rose-400 shadow-neon-rose" />
            <div className="absolute bottom-16 right-14 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-neon-amber" />
            <div className="absolute top-24 right-20 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-neon-cyan" />
          </div>

          <div className="text-center font-mono text-xs space-y-1">
            <span className="text-slate-400 text-[11px]">ACTIVE SPECTRUM SWEEP</span>
            <p className="text-cyan-300 font-semibold">8.40 – 8.50 GHz (X-Band Up/Downlink)</p>
          </div>
        </div>

        {/* Threat Incident Registry */}
        <div className="lg:col-span-2 cyber-panel p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-mono text-sm font-bold text-slate-200">
              SIMULATED THREAT VECTORS & ACTIVE MITIGATIONS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">5 DEFENSIVE VECTORS</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {threats.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-lg bg-space-900 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-space-800 text-[10px] text-cyan-400 font-bold">
                      {t.id}
                    </span>
                    <span className="font-bold text-slate-100">{t.type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    t.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {t.severity}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Layer: <span className="text-slate-200">{t.layer}</span></span>
                  <span className="text-emerald-400 font-semibold">{t.status}</span>
                </div>

                <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                  {t.impact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
