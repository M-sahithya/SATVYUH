import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Send, 
  AlertOctagon, 
  RotateCw, 
  RefreshCcw, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Radio, 
  Server,
  ArrowRight,
  ShieldAlert,
  Hash
} from 'lucide-react';
import { ConsensusStatus, ConsensusResult } from '../types';
import { api } from '../services/api';

interface SpaceMeshConsensusProps {
  status: ConsensusStatus | null;
  lastResult: ConsensusResult | null;
  onRefresh: () => void;
}

export const SpaceMeshConsensus: React.FC<SpaceMeshConsensusProps> = ({
  status,
  lastResult: initialResult,
  onRefresh,
}) => {
  const [result, setResult] = useState<ConsensusResult | null>(initialResult);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [activeAction, setActiveAction] = useState<string>('ORBIT_STATION_KEEPING');

  const triggerAnimation = (newResult: ConsensusResult) => {
    setAnimationStep(1); // Uplink from Ground Station
    setTimeout(() => {
      setAnimationStep(2); // Broadcast to 3 Satellites
      setTimeout(() => {
        setAnimationStep(3); // Quorum Resolution
        setResult(newResult);
        setIsLoading(false);
        onRefresh();
      }, 600);
    }, 600);
  };

  const handleSendValid = async () => {
    setIsLoading(true);
    try {
      const res = await api.sendValidCommand(activeAction, {
        thrust_duration_sec: 4.5,
        delta_v_ms: 0.12,
        attitude_quaternion: [0.0, 0.707, 0.0, 0.707]
      });
      triggerAnimation(res);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleInjectUnauthorized = async () => {
    setIsLoading(true);
    try {
      const res = await api.injectUnauthorizedCommand();
      triggerAnimation(res);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleReplay = async () => {
    setIsLoading(true);
    try {
      const res = await api.replayPreviousCommand();
      triggerAnimation(res);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await api.resetConsensus();
      setResult(null);
      setAnimationStep(0);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const nodes = status?.nodes || [
    { node_id: 'SAT-A', status: 'ONLINE', nonces_cached: 1, verifications_passed: 1, verifications_rejected: 0, last_command: null },
    { node_id: 'SAT-B', status: 'ONLINE', nonces_cached: 1, verifications_passed: 1, verifications_rejected: 0, last_command: null },
    { node_id: 'SAT-C', status: 'ONLINE', nonces_cached: 1, verifications_passed: 1, verifications_rejected: 0, last_command: null },
  ];

  const currentResult = result || status?.last_consensus;

  return (
    <div className="space-y-6">
      {/* Header and Disclaimer */}
      <div className="cyber-panel p-5 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold font-mono text-slate-100">
                LAYER 1: SPACE-MESH CRYPTOGRAPHIC CONSENSUS
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ed25519 High-Speed Signatures + Anti-Replay Nonce Envelope + 2-of-3 Byzantine Quorum Protection
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
              POLICY: 2-OF-3 APPROVAL REQUIRED
            </span>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="p-2.5 rounded bg-space-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center space-x-2">
          <span className="text-amber-400 font-bold">PROTOTYPE NOTE:</span>
          <span>
            This is a local 3-node Byzantine quorum simulation executing real Ed25519 asymmetric cryptography and anti-replay nonce tracking.
          </span>
        </div>
      </div>

      {/* Interactive Controls & Command Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ground Station Command Dispatcher */}
        <div className="cyber-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-sm font-bold text-slate-200">GROUND STATION DISPATCH</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              AUTHORIZED HQ
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">TARGET MISSION ACTION</label>
              <select
                value={activeAction}
                onChange={(e) => setActiveAction(e.target.value)}
                className="w-full bg-space-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="ORBIT_STATION_KEEPING">ORBIT_STATION_KEEPING (Thrust 4.5s)</option>
                <option value="ATTITUDE_REORIENTATION">ATTITUDE_REORIENTATION (Target Earth Nadir)</option>
                <option value="PAYLOAD_TRANSMIT_POWER">PAYLOAD_TRANSMIT_POWER (X-Band 150W)</option>
                <option value="SOLAR_ARRAY_POINTING">SOLAR_ARRAY_POINTING (Sun Track Beta 22°)</option>
              </select>
            </div>

            <div className="p-2.5 rounded bg-space-900 border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Signing Algorithm:</span>
                <span className="text-cyan-300 font-semibold">Ed25519 (RFC 8032)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Public Key:</span>
                <span className="text-slate-300 font-mono">{status?.ground_station?.public_key_prefix || '0x4f82...19a4'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Next Nonce:</span>
                <span className="text-slate-300 font-mono">#{status?.ground_station?.active_nonces_issued ? 1000 + status.ground_station.active_nonces_issued + 1 : 1001}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSendValid}
              disabled={isLoading}
              className="w-full btn-cyber-primary py-2.5 flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND VALID COMMAND</span>
            </button>

            <button
              onClick={handleInjectUnauthorized}
              disabled={isLoading}
              className="w-full btn-cyber-danger py-2.5 flex items-center justify-center space-x-2"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>INJECT UNAUTHORIZED COMMAND</span>
            </button>

            <button
              onClick={handleReplay}
              disabled={isLoading}
              className="w-full btn-cyber-amber py-2.5 flex items-center justify-center space-x-2"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>REPLAY PREVIOUS COMMAND</span>
            </button>

            <button
              onClick={handleReset}
              disabled={isLoading}
              className="w-full py-2 text-xs font-mono text-slate-400 hover:text-slate-200 bg-space-900 hover:bg-space-850 border border-slate-800 rounded transition-all flex items-center justify-center space-x-1.5"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>RESET NODES</span>
            </button>
          </div>
        </div>

        {/* Middle & Right: Propagation Visualizer & Verification Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Animated Command Flight Stage */}
          <div className="cyber-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-mono text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>COMMAND PROPAGATION & INTER-SATELLITE MESH VERIFICATION</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLoading ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {isLoading ? 'PROPAGATING...' : 'IDLE / READY'}
              </span>
            </div>

            {/* Visual 3 Node Topology Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {nodes.map((n) => {
                const vote = currentResult?.node_votes?.find(v => v.node_id === n.node_id);
                const hasVoted = Boolean(vote);
                const isApproved = vote?.approved;

                return (
                  <div
                    key={n.node_id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      hasVoted
                        ? isApproved
                          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-neon-emerald'
                          : 'bg-rose-950/30 border-rose-500/50 shadow-neon-rose'
                        : 'bg-space-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-100">{n.node_id}</span>
                      {hasVoted ? (
                        isApproved ? (
                          <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>APPROVED</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-rose-400">
                            <XCircle className="w-3 h-3" />
                            <span>REJECTED</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">STANDBY</span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Ed25519 Sig:</span>
                        <span className={vote?.sig_check ? 'text-emerald-400 font-bold' : vote ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                          {vote ? (vote.sig_check ? 'VALID' : 'INVALID') : 'PENDING'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Anti-Replay Nonce:</span>
                        <span className={vote?.nonce_check ? 'text-emerald-400 font-bold' : vote ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                          {vote ? (vote.nonce_check ? 'FRESH' : 'DUPLICATE') : 'PENDING'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Authorization:</span>
                        <span className={vote?.auth_check ? 'text-emerald-400 font-bold' : vote ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                          {vote ? (vote.auth_check ? 'AUTHORIZED' : 'UNAUTHORIZED') : 'PENDING'}
                        </span>
                      </div>
                    </div>

                    {vote && (
                      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-300">
                        <span className="text-slate-500 block mb-0.5">VOTE RATIONALE:</span>
                        <span className={isApproved ? 'text-emerald-300' : 'text-rose-300'}>
                          {vote.reason}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quorum Outcome Banner */}
            {currentResult && (
              <div className={`p-4 rounded-lg border transition-all ${
                currentResult.quorum_reached
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    {currentResult.quorum_reached ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    )}
                    <div>
                      <h4 className="font-mono text-sm font-bold">
                        {currentResult.consensus_status} ({currentResult.votes_approved}/{nodes.length} VOTES)
                      </h4>
                      <p className="text-xs font-mono opacity-80">
                        Category: {currentResult.category} | Command ID: {currentResult.command?.command_id}
                      </p>
                    </div>
                  </div>

                  <div className="font-mono text-xs text-right">
                    <span className="opacity-75 block text-[10px]">EXECUTION OUTCOME:</span>
                    <span className="font-bold underline">
                      {currentResult.execution_outcome}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="opacity-60 block">ACTION:</span>
                    <span className="font-semibold">{currentResult.command?.action}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block">NONCE:</span>
                    <span className="font-semibold">#{currentResult.command?.nonce}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block">TIMESTAMP:</span>
                    <span className="font-semibold">{currentResult.command?.timestamp?.split('T')[1]?.replace('Z', '') || 'UTC'}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block">SIGNATURE:</span>
                    <span className="font-semibold truncate">{currentResult.signature_preview}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
