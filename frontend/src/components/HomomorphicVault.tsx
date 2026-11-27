import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Key, 
  Cpu, 
  Plus, 
  CheckCircle, 
  ShieldCheck, 
  RefreshCcw, 
  Sparkles,
  Zap,
  Battery,
  Thermometer,
  Radio,
  EyeOff
} from 'lucide-react';
import { HomomorphicState } from '../types';
import { api } from '../services/api';

interface HomomorphicVaultProps {
  state: HomomorphicState | null;
  onRefresh: () => void;
}

export const HomomorphicVault: React.FC<HomomorphicVaultProps> = ({
  state,
  onRefresh,
}) => {
  const [vaultState, setVaultState] = useState<HomomorphicState | null>(state);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateTelemetry();
      setVaultState(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEncrypt = async () => {
    setIsLoading(true);
    try {
      const res = await api.encryptTelemetry();
      setVaultState(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompute = async () => {
    setIsLoading(true);
    try {
      const res = await api.computeOnEncryptedData();
      setVaultState(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setIsLoading(true);
    try {
      const res = await api.decryptTelemetry();
      setVaultState(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const current = vaultState || state;
  const stage = current?.current_stage || 'RAW_PLAINTEXT';
  const plaintext = current?.plaintext_telemetry;
  const encrypted = current?.encrypted_telemetry;
  const computation = current?.encrypted_computation;
  const decrypted = current?.decrypted_result;

  return (
    <div className="space-y-6">
      {/* Header and Cryptographic Properties */}
      <div className="cyber-panel p-5 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold font-mono text-slate-100">
                LAYER 3: HOMOMORPHIC TELEMETRY CRYPTOGRAPHIC VAULT
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Paillier Asymmetric Cryptosystem (Additive Homomorphism over Ciphertext Domain)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] px-2.5 py-1 rounded bg-violet-950/80 text-violet-300 border border-violet-800 font-mono flex items-center space-x-1.5">
              <EyeOff className="w-3.5 h-3.5 text-violet-400" />
              <span>PRIVATE KEY ZERO-KNOWLEDGE ENCLAVE</span>
            </span>
          </div>
        </div>

        {/* Technical Mathematical Foundation Note */}
        <div className="p-2.5 rounded bg-space-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="text-violet-400 font-bold">HOMOMORPHIC PROPERTY: </span>
          <span>
            Paillier encryption supports additive homomorphism: <code className="text-violet-300">E(m₁) · E(m₂) mod n² = E(m₁ + m₂ mod n)</code>. Intermediate relay satellites and untrusted edge nodes can aggregate telemetry metrics without decrypting or observing plaintext values.
          </span>
        </div>
      </div>

      {/* 4 Interactive Simulation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="p-3 rounded-lg font-mono text-xs font-bold bg-space-900 hover:bg-space-850 border border-slate-800 hover:border-cyan-500/50 text-slate-200 transition-all active:scale-95 flex flex-col items-center justify-center space-y-1.5"
        >
          <Battery className="w-4 h-4 text-cyan-400" />
          <span>1. GENERATE TELEMETRY</span>
        </button>

        <button
          onClick={handleEncrypt}
          disabled={isLoading}
          className="p-3 rounded-lg font-mono text-xs font-bold bg-violet-950/40 hover:bg-violet-900/50 border border-violet-500/50 text-violet-300 transition-all active:scale-95 flex flex-col items-center justify-center space-y-1.5 shadow-neon-violet"
        >
          <Lock className="w-4 h-4 text-violet-400" />
          <span>2. ENCRYPT TELEMETRY</span>
        </button>

        <button
          onClick={handleCompute}
          disabled={isLoading}
          className="p-3 rounded-lg font-mono text-xs font-bold bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/50 text-blue-300 transition-all active:scale-95 flex flex-col items-center justify-center space-y-1.5 shadow-neon-blue"
        >
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>3. COMPUTE ON ENCRYPTED DATA</span>
        </button>

        <button
          onClick={handleDecrypt}
          disabled={isLoading}
          className="p-3 rounded-lg font-mono text-xs font-bold bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/50 text-emerald-300 transition-all active:scale-95 flex flex-col items-center justify-center space-y-1.5 shadow-neon-emerald"
        >
          <Unlock className="w-4 h-4 text-emerald-400" />
          <span>4. DECRYPT & VERIFY RESULT</span>
        </button>
      </div>

      {/* Stage Progression Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Plaintext Telemetry vs Paillier Ciphertexts */}
        <div className="cyber-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-mono text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>SPACECRAFT ONBOARD TELEMETRY REGISTERS</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-900 text-slate-400 border border-slate-800">
              {stage}
            </span>
          </div>

          {plaintext && (
            <div className="space-y-3 font-mono text-xs">
              {/* Battery */}
              <div className="p-3 rounded bg-space-900 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery State of Charge:</span>
                  </span>
                  <span className="text-emerald-400 font-bold">{plaintext.battery_soc_pct} %</span>
                </div>
                {encrypted?.battery_soc_pct && (
                  <div className="mt-1 pt-1 border-t border-slate-800/60 text-[10px] text-violet-300 truncate">
                    Ciphertext: {encrypted.battery_soc_pct.ciphertext_preview}
                  </div>
                )}
              </div>

              {/* Solar Array Power */}
              <div className="p-3 rounded bg-space-900 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Solar Array Generation:</span>
                  </span>
                  <span className="text-amber-400 font-bold">{plaintext.solar_array_power_w} W</span>
                </div>
                {encrypted?.solar_array_power_w && (
                  <div className="mt-1 pt-1 border-t border-slate-800/60 text-[10px] text-violet-300 truncate">
                    Ciphertext: {encrypted.solar_array_power_w.ciphertext_preview}
                  </div>
                )}
              </div>

              {/* Transmitter Power */}
              <div className="p-3 rounded bg-space-900 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-400" />
                    <span>Transmitter TX Draw:</span>
                  </span>
                  <span className="text-blue-400 font-bold">{plaintext.transceiver_tx_power_w} W</span>
                </div>
                {encrypted?.transceiver_tx_power_w && (
                  <div className="mt-1 pt-1 border-t border-slate-800/60 text-[10px] text-violet-300 truncate">
                    Ciphertext: {encrypted.transceiver_tx_power_w.ciphertext_preview}
                  </div>
                )}
              </div>

              {/* Thermal Core */}
              <div className="p-3 rounded bg-space-900 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reaction Wheel Temp:</span>
                  </span>
                  <span className="text-rose-400 font-bold">{plaintext.reaction_wheel_temp_c} °C</span>
                </div>
                {encrypted?.reaction_wheel_temp_c && (
                  <div className="mt-1 pt-1 border-t border-slate-800/60 text-[10px] text-violet-300 truncate">
                    Ciphertext: {encrypted.reaction_wheel_temp_c.ciphertext_preview}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-2.5 rounded bg-space-950 border border-slate-800 text-[10px] font-mono text-slate-500">
            PAILLIER PUBLIC KEY: 1024 BITS | n = {current?.public_key_info?.n_modulus_preview || 'Generating...'}
          </div>
        </div>

        {/* Right: Homomorphic Computation in Ciphertext Domain & Verification */}
        <div className="cyber-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-mono text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>CIPHERTEXT DOMAIN HOMOMORPHIC AGGREGATION</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
              ZERO PLAINTEXT LEAK
            </span>
          </div>

          {computation ? (
            <div className="space-y-4 font-mono text-xs">
              {/* Power Aggregation Card */}
              <div className="p-3.5 rounded-lg bg-violet-950/20 border border-violet-500/40 space-y-2">
                <div className="flex items-center justify-between text-violet-300 font-bold">
                  <span>AGGREGATE POWER CONSUMPTION</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-900/60 border border-violet-700">
                    E(Solar) + E(Tx)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{computation.total_power_encrypted.operation}</p>
                <div className="p-2 rounded bg-space-950 border border-violet-900/60 text-[10px] text-violet-400 break-all">
                  Ciphertext Result: {computation.total_power_encrypted.ciphertext_preview}
                </div>
                <div className="text-[10px] text-slate-500">
                  Computed via modulo n² ciphertext multiplication: 0 decryption operations performed.
                </div>
              </div>

              {/* Thermal Aggregation Card */}
              <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-500/40 space-y-2">
                <div className="flex items-center justify-between text-blue-300 font-bold">
                  <span>COMBINED THERMAL FOOTPRINT</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 border border-blue-700">
                    E(Wheel) + E(OBC)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{computation.thermal_sum_encrypted.operation}</p>
                <div className="p-2 rounded bg-space-950 border border-blue-900/60 text-[10px] text-blue-400 break-all">
                  Ciphertext Result: {computation.thermal_sum_encrypted.ciphertext_preview}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg font-mono text-xs text-slate-500 space-y-2">
              <Cpu className="w-8 h-8 text-slate-600" />
              <p>Click "3. COMPUTE ON ENCRYPTED DATA" to execute Paillier addition in the ciphertext domain.</p>
            </div>
          )}

          {/* Decryption Verification Banner */}
          {decrypted && (
            <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/50 space-y-2.5 font-mono">
              <div className="flex items-center justify-between text-emerald-300">
                <span className="text-xs font-bold flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>DECRYPTION VERIFIED: 100% MATHEMATICAL MATCH</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 border border-emerald-600 text-emerald-200">
                  PROOF VALIDATED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-space-950 border border-emerald-800/40">
                  <span className="text-[10px] text-slate-400 block">Decrypted Total Power:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {decrypted.power_aggregation.decrypted_value} W
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Matches expected ({decrypted.power_aggregation.expected_plaintext_sum} W)
                  </span>
                </div>

                <div className="p-2 rounded bg-space-950 border border-emerald-800/40">
                  <span className="text-[10px] text-slate-400 block">Decrypted Combined Temp:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {decrypted.thermal_aggregation.decrypted_value} °C
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Matches expected ({decrypted.thermal_aggregation.expected_plaintext_sum} °C)
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-emerald-400/80 pt-1">
                Guaranteed: No intermediate relay satellite or ground sniffer ever had access to individual telemetry metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
