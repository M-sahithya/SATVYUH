import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Satellite, 
  Activity, 
  Cpu, 
  Lock, 
  AlertTriangle, 
  Radio, 
  Terminal, 
  Layers, 
  Play, 
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { SystemState } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemState: SystemState;
  threatLevel: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  onStartPresentation: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemState,
  threatLevel,
  onStartPresentation,
  onResetDemo,
  isResetting,
}) => {
  const [missionTime, setMissionTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setMissionTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const stateColors: Record<SystemState, { bg: string; text: string; border: string }> = {
    NORMAL: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    'COMMUNICATION FAILURE': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    'SAFE MODE': { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50' },
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'constellation', label: '3D Constellation', icon: Satellite },
    { id: 'consensus', label: 'L1: Consensus', icon: Shield },
    { id: 'wavelet', label: 'L2: Wavelet DWT', icon: Radio },
    { id: 'vault', label: 'L3: Crypto Vault', icon: Lock },
    { id: 'safemode', label: 'L4: Safe Mode', icon: AlertTriangle },
    { id: 'threat', label: 'Threat Intel', icon: Cpu },
    { id: 'logs', label: 'Audit Logs', icon: Terminal },
    { id: 'architecture', label: 'Architecture', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 bg-space-950/90 backdrop-blur-md border-b border-cyan-900/40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Callout */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-neon-cyan">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 font-mono">
                SATVYUH
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                DEFENSE SIMULATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Multi-Layer Satellite Cybersecurity Operations</p>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="hidden lg:flex items-center space-x-4 font-mono text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-space-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">MET:</span>
            <span className="text-cyan-300 font-semibold">{missionTime}</span>
          </div>

          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border ${stateColors[systemState].bg} ${stateColors[systemState].border}`}>
            <span className="text-slate-400">STATUS:</span>
            <span className={`font-semibold ${stateColors[systemState].text}`}>
              {systemState}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-space-900 border border-slate-800">
            <span className="text-slate-400">THREAT:</span>
            <span className={`font-semibold ${
              threatLevel === 'CRITICAL' ? 'text-rose-400 animate-pulse' :
              threatLevel === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {threatLevel}
            </span>
          </div>
        </div>

        {/* Actions: Presentation Mode & Reset */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onStartPresentation}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider rounded bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-neon-blue border border-cyan-400/40 transition-all active:scale-95"
            title="Launch 5-Minute Guided Presentation Mode"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PRESENTATION MODE</span>
          </button>

          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-space-900 hover:bg-space-850 border border-slate-800 hover:border-cyan-500/40 rounded transition-all active:scale-95"
            title="Reset simulation to nominal baseline"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">RESET DEMO</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="max-w-7xl mx-auto mt-2 pt-1 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-mono whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
