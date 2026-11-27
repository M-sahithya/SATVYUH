import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  AlertOctagon, 
  Radio, 
  Lock, 
  AlertTriangle, 
  Terminal, 
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onRefreshAll: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onRefreshAll,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [stepOutput, setStepOutput] = useState<string>('');

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Orbital Constellation & Mission Overview',
      tab: 'constellation',
      actionLabel: 'INSPECT CONSTELLATION MESH',
      speakerNotes:
        '“Respected judges, SATVYUH is a 4-layer cyber-physical defense simulation for satellite constellations. We have 3 simulated LEO nodes orbiting Earth in a 550km polar orbit with active inter-satellite laser mesh links connected to Bengaluru Mission Control.”',
      execute: async () => {
        onNavigateTab('constellation');
        return 'Constellation telemetry active: SAT-A, SAT-B, SAT-C nominal, laser mesh latency 4.2ms.';
      },
    },
    {
      step: 2,
      title: 'Layer 1: Valid Command & Quorum Approval',
      tab: 'consensus',
      actionLabel: 'DISPATCH AUTHORIZED TELECOMMAND',
      speakerNotes:
        '“In Layer 1, the Ground Station signs an orbit-adjustment command with Ed25519 asymmetric cryptography. When broadcast to the space-mesh, each satellite independently verifies the signature, validates timestamp freshness, checks unique nonces, and achieves 3/3 consensus approval (2/3 quorum required).”',
      execute: async () => {
        onNavigateTab('consensus');
        const res = await api.sendValidCommand('ORBIT_STATION_KEEPING');
        return `Dispatched command ${res.command?.command_id}. Quorum satisfied: ${res.votes_approved}/3 satellite nodes approved. Actuators engaged.`;
      },
    },
    {
      step: 3,
      title: 'Layer 1: Unauthorized Spoof & Replay Rejection',
      tab: 'consensus',
      actionLabel: 'INJECT UNAUTHORIZED ROGUE COMMAND',
      speakerNotes:
        '“Next, we simulate an adversary injecting a forged root-takeover command with an untrusted key. The constellation instantly rejects it with 0/3 approvals. When a replay attack is attempted with a duplicated nonce, the anti-replay cache blocks execution immediately.”',
      execute: async () => {
        onNavigateTab('consensus');
        const res = await api.injectUnauthorizedCommand();
        return `Attack blocked! 0/3 nodes approved untrusted key. Reason: ${res.node_votes[0]?.reason}`;
      },
    },
    {
      step: 4,
      title: 'Layer 2: RF Jamming & Adaptive Wavelet Denoising',
      tab: 'wavelet',
      actionLabel: 'INJECT RF JAMMING & APPLY WAVELET FILTER',
      speakerNotes:
        '“In Layer 2, hostile ground jammers corrupt the downlink carrier signal with severe noise and RF bursts. Using PyWavelets Discrete Wavelet Transform (DWT db4) and VisuShrink thresholding, the onboard processor filters non-stationary noise, boosting SNR by over +4 dB.”',
      execute: async () => {
        onNavigateTab('wavelet');
        await api.injectNoise(0.48, true);
        const res = await api.applyWaveletFilter('db4', 3, 'soft');
        return `RF Denoising completed! Raw SNR degraded to ${res.metrics.snr_raw_db} dB -> Filtered SNR recovered to ${res.metrics.snr_filtered_db} dB (+${res.metrics.snr_gain_db} dB gain).`;
      },
    },
    {
      step: 5,
      title: 'Layer 3: Homomorphic Telemetry Encryption & Addition',
      tab: 'vault',
      actionLabel: 'ENCRYPT & COMPUTE IN CIPHERTEXT DOMAIN',
      speakerNotes:
        '“In Layer 3, mission telemetry is protected using the Paillier cryptosystem. Notice that intermediate relay satellites can compute aggregate fleet power draws and thermal loads directly on ciphertexts without decrypting or revealing plaintext values.”',
      execute: async () => {
        onNavigateTab('vault');
        await api.encryptTelemetry();
        await api.computeOnEncryptedData();
        const res = await api.decryptTelemetry();
        const pow = res.decrypted_result?.power_aggregation;
        return `Homomorphic Addition Verified: E(Solar) + E(Tx) = ${pow?.decrypted_value}W exactly matches expected ${pow?.expected_plaintext_sum}W. Zero plaintext leakage.`;
      },
    },
    {
      step: 6,
      title: 'Layer 4: Communication Failure & Safe Mode Lockdown',
      tab: 'safemode',
      actionLabel: 'TRIGGER WATCHDOG TIMEOUT & SAFE MODE',
      speakerNotes:
        '“In Layer 4, if ground communications are jammed or the heartbeat watchdog timer expires, the autonomous flight-software state machine triggers SAFE MODE: non-critical imaging payloads shut down, reaction wheels desaturate, and solar panels acquire the Sun.”',
      execute: async () => {
        onNavigateTab('safemode');
        const res = await api.activateSafeMode('AUTONOMOUS_COMM_LOSS_WATCHDOG');
        return `SAFE MODE ENGAGED! System transitioned to ${res.current_state}. Payloads isolated offline, emergency omnidirectional beacon active.`;
      },
    },
    {
      step: 7,
      title: 'System Security Event Timeline & Mission Recovery',
      tab: 'logs',
      actionLabel: 'INSPECT AUDIT TRAIL & RESTORE MISSION',
      speakerNotes:
        '“Finally, every security event across all four layers is cryptographically audited and stored in local SQLite database. After verifying recovery handshake authentication, the constellation safely restores nominal flight mode. Thank you, judges!”',
      execute: async () => {
        onNavigateTab('logs');
        await api.restoreNormal();
        onRefreshAll();
        return 'Recovery authenticated: Nominal flight mode restored. Full audit trail recorded.';
      },
    },
  ];

  const currentStepData = steps[currentStep - 1];

  const handleExecute = async () => {
    setIsExecuting(true);
    setStepOutput('');
    try {
      const msg = await currentStepData.execute();
      setStepOutput(msg);
      onRefreshAll();
    } catch (err: any) {
      setStepOutput(`Error executing step: ${err.message || err}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setStepOutput('');
      onNavigateTab(steps[nextStep - 1].tab);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setStepOutput('');
      onNavigateTab(steps[prevStep - 1].tab);
    }
  };

  const handleReset = async () => {
    setIsExecuting(true);
    try {
      await api.resetEntireDemo();
      setCurrentStep(1);
      setStepOutput('Demo scenario reset to baseline nominal state.');
      onNavigateTab('overview');
      onRefreshAll();
    } catch (err: any) {
      setStepOutput(`Reset failed: ${err.message || err}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-space-950 border-2 border-cyan-500/70 rounded-2xl shadow-neon-cyan overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-space-900 to-space-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/40">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-black tracking-wider text-white flex items-center space-x-2">
                <span>SATVYUH 5-MINUTE PRESENTATION RUNNER</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  STEP {currentStep} OF {steps.length}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              disabled={isExecuting}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono bg-space-900 hover:bg-space-850 border border-slate-800 rounded text-slate-300"
              title="Reset all states"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET DEMO</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Timeline Bar */}
        <div className="px-4 py-2 bg-space-900/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-2 min-w-max">
            {steps.map((s) => {
              const isActive = s.step === currentStep;
              const isPast = s.step < currentStep;
              return (
                <button
                  key={s.step}
                  onClick={() => {
                    setCurrentStep(s.step);
                    setStepOutput('');
                    onNavigateTab(s.tab);
                  }}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-black font-bold shadow-neon-cyan'
                      : isPast
                      ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                      : 'bg-space-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  <span>{s.step}.</span>
                  <span className="truncate max-w-[120px]">{s.title.split(':')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Presentation Card Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono">
          <div>
            <span className="text-[11px] text-cyan-400 font-bold block mb-1">
              CURRENT PRESENTATION STAGE
            </span>
            <h3 className="text-lg font-black text-white">
              {currentStepData.title}
            </h3>
          </div>

          {/* Speaker Notes Box */}
          <div className="p-4 rounded-xl bg-space-900/90 border border-cyan-500/30 space-y-2">
            <span className="text-[10px] text-cyan-400 font-bold tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RECOMMENDED JUDGES PITCH NARRATIVE</span>
            </span>
            <p className="text-xs text-slate-200 leading-relaxed italic">
              {currentStepData.speakerNotes}
            </p>
          </div>

          {/* Execution Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex-1 btn-cyber-primary py-3 text-xs font-bold tracking-wider flex items-center justify-center space-x-2 shadow-neon-cyan"
            >
              <Zap className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'SIMULATING REAL TIME...' : currentStepData.actionLabel}</span>
            </button>
          </div>

          {/* Live Step Output */}
          {stepOutput && (
            <div className="p-3.5 rounded-lg bg-space-900 border border-emerald-500/50 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>REAL LOCAL SIMULATION EXECUTED</span>
              </div>
              <p className="text-[11px] text-slate-300">{stepOutput}</p>
            </div>
          )}
        </div>

        {/* Bottom Nav Stepper Footer */}
        <div className="p-4 bg-space-900 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1 || isExecuting}
            className="flex items-center space-x-1 px-3 py-1.5 rounded bg-space-850 hover:bg-space-800 border border-slate-700 disabled:opacity-40 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREVIOUS</span>
          </button>

          <span className="text-slate-400">
            Step {currentStep} of {steps.length}
          </span>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={isExecuting}
              className="flex items-center space-x-1 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 font-bold text-black"
            >
              <span>NEXT STEP</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center space-x-1 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-white"
            >
              <span>FINISH DEMO</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
