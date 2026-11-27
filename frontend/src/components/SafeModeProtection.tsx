import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  WifiOff, 
  Flame, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Cpu, 
  Radio, 
  Battery, 
  Compass,
  Zap,
  Info
} from 'lucide-react';
import { SafeModeStatus, SystemState } from '../types';
import { api } from '../services/api';

interface SafeModeProtectionProps {
  status: SafeModeStatus | null;
  onRefresh: () => void;
}

export const SafeModeProtection: React.FC<SafeModeProtectionProps> = ({
  status,
  onRefresh,
}) => {
  const [safeStatus, setSafeStatus] = useState<SafeModeStatus | null>(status);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSimulateCommLoss = async () => {
    setIsLoading(true);
    try {
      const res = await api.simulateCommLoss();
      setSafeStatus(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateFault = async () => {
    setIsLoading(true);
    try {
      const res = await api.simulateFault('GYROSCOPE_REACTION_WHEEL_DESAT_FAULT');
      setSafeStatus(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateSafeMode = async () => {
    setIsLoading(true);
    try {
      const res = await api.activateSafeMode('CRITICAL_CYBER_PHYSICAL_BREACH_DETECTED');
      setSafeStatus(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreNormal = async () => {
    setIsLoading(true);
    try {
      const res = await api.restoreNormal();
      setSafeStatus(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const current = safeStatus || status;
  const currentState: SystemState = current?.current_state || 'NORMAL';
  const subsystems = current?.subsystems || {};
  const history = current?.history || [];

  const stateColors: Record<SystemState, { bg: string; text: string; border: string }> = {
    NORMAL: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/40' },
    'COMMUNICATION FAILURE': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/40' },
    'SAFE MODE': { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/60' },
  };

  return (
    <div className="space-y-6">
      {/* Header & Disclaimer */}
      <div className="cyber-panel p-5 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold font-mono text-slate-100">
                LAYER 4: EMERGENCY SAFE-MODE CONTROLLER & AUTONOMOUS WATCHDOG
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Finite State Machine (FSM) + Hardware Heartbeat Watchdog + Subsystem Survival Isolation
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs px-3 py-1 rounded font-mono font-bold border ${stateColors[currentState].bg} ${stateColors[currentState].text} ${stateColors[currentState].border}`}>
              CURRENT STATE: {currentState}
            </span>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="p-2.5 rounded bg-space-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>PROTOTYPE INTERPRETATION:</strong> This is a software-defined spacecraft autonomous safe-mode contingency controller, representing flight-software failover mechanisms (not a mechanical physical override).
          </span>
        </div>
      </div>

      {/* State Machine Transition Diagram */}
      <div className="cyber-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-200">
            AUTONOMOUS STATE MACHINE TRANSITIONS
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            WATCHDOG WINDOW: 20 SECONDS
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-center">
          {/* Normal */}
          <div className={`p-4 rounded-xl border transition-all ${
            currentState === 'NORMAL'
              ? 'bg-emerald-950/40 border-emerald-500/80 shadow-neon-emerald scale-105'
              : 'bg-space-900/60 border-slate-800 opacity-60'
          }`}>
            <span className="text-xs font-bold text-emerald-400 block mb-1">1. NORMAL</span>
            <span className="text-[10px] text-slate-400 block">Full mission payload active</span>
            <span className="text-[10px] text-emerald-300 font-semibold mt-2 inline-block">Nadir Earth Pointing</span>
          </div>

          {/* Warning */}
          <div className={`p-4 rounded-xl border transition-all ${
            currentState === 'WARNING'
              ? 'bg-amber-950/40 border-amber-500/80 shadow-neon-amber scale-105'
              : 'bg-space-900/60 border-slate-800 opacity-60'
          }`}>
            <span className="text-xs font-bold text-amber-400 block mb-1">2. WARNING</span>
            <span className="text-[10px] text-slate-400 block">Telemetry thresholds breached</span>
            <span className="text-[10px] text-amber-300 font-semibold mt-2 inline-block">Throttled Payloads</span>
          </div>

          {/* Comm Failure */}
          <div className={`p-4 rounded-xl border transition-all ${
            currentState === 'COMMUNICATION FAILURE'
              ? 'bg-orange-950/40 border-orange-500/80 shadow-neon-rose scale-105'
              : 'bg-space-900/60 border-slate-800 opacity-60'
          }`}>
            <span className="text-xs font-bold text-orange-400 block mb-1">3. COMM FAILURE</span>
            <span className="text-[10px] text-slate-400 block">Loss of Signal (LOS) / Jamming</span>
            <span className="text-[10px] text-orange-300 font-semibold mt-2 inline-block">Carrier Lost</span>
          </div>

          {/* Safe Mode */}
          <div className={`p-4 rounded-xl border transition-all ${
            currentState === 'SAFE MODE'
              ? 'bg-rose-950/50 border-rose-500 shadow-neon-rose scale-105 animate-pulse'
              : 'bg-space-900/60 border-slate-800 opacity-60'
          }`}>
            <span className="text-xs font-bold text-rose-400 block mb-1">4. SAFE MODE</span>
            <span className="text-[10px] text-slate-400 block">Complete Survival Lockdown</span>
            <span className="text-[10px] text-rose-300 font-semibold mt-2 inline-block">Sun Acquisition Only</span>
          </div>
        </div>
      </div>

      {/* Interactive Trigger Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={handleSimulateCommLoss}
          disabled={isLoading}
          className="p-3 rounded-lg font-mono text-xs font-bold bg-orange-950/30 hover:bg-orange-900/40 border border-orange-500/50 text-orange-300 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <WifiOff className="w-4 h-4 text-orange-400" />
          <span>SIMULATE COMM LOSS</span>
        </button>

        <button
          onClick={handleSimulateFault}
          disabled={isLoading}
          className="p-3 rounded-lg font-mono text-xs font-bold bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/50 text-amber-300 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>SIMULATE CRITICAL FAULT</span>
        </button>

        <button
          onClick={handleActivateSafeMode}
          disabled={isLoading}
          className="p-3 rounded-lg font-mono text-xs font-bold btn-cyber-danger flex items-center justify-center space-x-2"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>ACTIVATE SAFE MODE</span>
        </button>

        <button
          onClick={handleRestoreNormal}
          disabled={isLoading}
          className="p-3 rounded-lg font-mono text-xs font-bold btn-cyber-primary flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>RESTORE NORMAL OPERATION</span>
        </button>
      </div>

      {/* Subsystem Actuation Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subsystems List */}
        <div className="lg:col-span-2 cyber-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-mono text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>SPACECRAFT SUBSYSTEMS ACTUATION GRID</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">5 CONTROL BUSSES</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {Object.entries(subsystems).map(([key, sub]) => {
              const isLockedDown = currentState === 'SAFE MODE';
              return (
                <div
                  key={key}
                  className="p-3 rounded-lg bg-space-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block">{sub.name}</span>
                    <span className="text-[11px] text-slate-400">Mode: {sub.mode}</span>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sub.status === 'NOMINAL' || sub.status === 'ACTIVE' || sub.status === 'ONLINE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : sub.status === 'ISOLATED_OFFLINE' || sub.status === 'LINK_DOWN'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {sub.status}
                    </span>
                    {sub.power_draw_w !== undefined && (
                      <span className="block text-[10px] text-slate-500 mt-1">
                        Power: {sub.power_draw_w} W
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Timeline & Watchdog Card */}
        <div className="cyber-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-mono text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>WATCHDOG & EVENT TIMELINE</span>
            </h3>
          </div>

          <div className="p-3 rounded bg-space-900 border border-slate-800 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Heartbeat Watchdog:</span>
              <span className={`font-bold ${
                current?.watchdog?.watchdog_status === 'HEALTHY' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {current?.watchdog?.watchdog_status || 'HEALTHY'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Time Since Beat:</span>
              <span className="text-slate-200">{current?.watchdog?.seconds_since_last_beat || 0.0}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Timeout Threshold:</span>
              <span className="text-slate-200">20.0s</span>
            </div>
          </div>

          {/* Event history log list */}
          <div className="space-y-2 font-mono text-xs">
            <span className="text-slate-500 text-[10px] block">RECENT FAILOVER LOGS</span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="p-2 rounded bg-space-950/70 border border-slate-800/60 text-[11px]">
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>{h.timestamp}</span>
                    <span className="text-cyan-400 font-semibold">{h.event_type}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{h.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
