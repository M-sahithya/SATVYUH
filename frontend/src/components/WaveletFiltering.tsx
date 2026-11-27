import React, { useState } from 'react';
import { 
  Radio, 
  Zap, 
  Activity, 
  Sliders, 
  RefreshCcw, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { SignalChartData } from '../types';
import { api } from '../services/api';

interface WaveletFilteringProps {
  data: SignalChartData | null;
  onRefresh: () => void;
}

export const WaveletFiltering: React.FC<WaveletFilteringProps> = ({
  data,
  onRefresh,
}) => {
  const [chartData, setChartData] = useState<SignalChartData | null>(data);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [waveletBasis, setWaveletBasis] = useState<string>('db4');
  const [thresholdMode, setThresholdMode] = useState<string>('soft');

  const handleGenerateNormal = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateSignal();
      setChartData(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInjectNoise = async () => {
    setIsLoading(true);
    try {
      const res = await api.injectNoise(0.48, true);
      setChartData(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = async () => {
    setIsLoading(true);
    try {
      const res = await api.applyWaveletFilter(waveletBasis, 3, thresholdMode);
      setChartData(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const res = await api.resetSignal();
      setChartData(res);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentData = chartData || data;
  const metrics = currentData?.metrics || {
    status: 'CLEAN_SIGNAL_GENERATED',
    samples_count: 200,
    snr_raw_db: null,
    snr_filtered_db: null,
    snr_gain_db: null,
    wavelet_basis: 'db4',
    decomposition_levels: 3,
  };

  const points = currentData?.chart_points || [];

  return (
    <div className="space-y-6">
      {/* Header and Callout */}
      <div className="cyber-panel p-5 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold font-mono text-slate-100">
                LAYER 2: ADAPTIVE WAVELET MULTI-RESOLUTION FILTERING
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              PyWavelets Discrete Wavelet Transform (DWT) + Universal VisuShrink Denoising
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
              ENGINE: PyWavelets 1.10 + SciPy
            </span>
          </div>
        </div>

        {/* Scientific Disclaimer */}
        <div className="p-2.5 rounded bg-space-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-start space-x-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>SCIENTIFIC PRECISION NOTE:</strong> Wavelet thresholding effectively suppresses additive Gaussian noise and localized RF burst interference while preserving transient telemetry wavefronts. However, wavelet filtering alone cannot reliably detect cryptographic spoofing or coordinated adversary replay attacks; it operates as an essential PHY-layer clean-up filter.
          </span>
        </div>
      </div>

      {/* Control Strip & SNR Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Button Controls */}
        <div className="cyber-panel p-4 rounded-xl flex flex-col justify-between space-y-2">
          <span className="text-xs font-mono font-bold text-slate-300 block mb-1">
            SIMULATION CONTROLS
          </span>
          <button
            onClick={handleGenerateNormal}
            disabled={isLoading}
            className="w-full btn-cyber-primary py-2 text-xs flex items-center justify-center space-x-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>GENERATE NORMAL SIGNAL</span>
          </button>
          <button
            onClick={handleInjectNoise}
            disabled={isLoading}
            className="w-full btn-cyber-danger py-2 text-xs flex items-center justify-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>INJECT NOISE & JAMMING</span>
          </button>
          <button
            onClick={handleApplyFilter}
            disabled={isLoading}
            className="w-full btn-cyber-primary py-2 text-xs flex items-center justify-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-violet-600 text-white"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>APPLY WAVELET FILTER</span>
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="w-full py-1.5 text-xs font-mono text-slate-400 hover:text-white bg-space-900 border border-slate-800 rounded flex items-center justify-center space-x-1"
          >
            <RefreshCcw className="w-3 h-3" />
            <span>RESET SIGNAL</span>
          </button>
        </div>

        {/* Metric 1: Raw SNR */}
        <div className="cyber-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400">RAW SIGNAL-TO-NOISE (SNR)</span>
          <div className="my-2">
            <span className={`text-2xl font-mono font-black ${
              metrics.snr_raw_db !== null && metrics.snr_raw_db < 2 ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {metrics.snr_raw_db !== null ? `${metrics.snr_raw_db} dB` : '-- dB'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {metrics.snr_raw_db !== null ? 'Affected by AWGN & RF bursts' : 'Nominal baseline clean'}
          </span>
        </div>

        {/* Metric 2: Filtered SNR */}
        <div className="cyber-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400">FILTERED SNR POST-DWT</span>
          <div className="my-2">
            <span className={`text-2xl font-mono font-black ${
              metrics.snr_filtered_db !== null ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {metrics.snr_filtered_db !== null ? `${metrics.snr_filtered_db} dB` : '-- dB'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {metrics.snr_filtered_db !== null ? 'Wavelet VisuShrink denoised' : 'Filter standby'}
          </span>
        </div>

        {/* Metric 3: Net SNR Gain */}
        <div className="cyber-panel p-4 rounded-xl flex flex-col justify-between border-cyan-500/40">
          <span className="text-[11px] font-mono text-cyan-400 font-bold">NET COMPUTED SNR GAIN</span>
          <div className="my-2 flex items-center space-x-2">
            <span className={`text-3xl font-mono font-black ${
              metrics.snr_gain_db !== null && metrics.snr_gain_db > 0 ? 'text-cyan-300' : 'text-slate-500'
            }`}>
              {metrics.snr_gain_db !== null ? `+${metrics.snr_gain_db} dB` : '--'}
            </span>
            {metrics.snr_gain_db !== null && (
              <ArrowUpRight className="w-5 h-5 text-cyan-400 animate-bounce" />
            )}
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80">
            Basis: {metrics.wavelet_basis || 'db4'} (Level 3)
          </span>
        </div>
      </div>

      {/* 3 Synchronized Waveform Charts */}
      <div className="space-y-4">
        {/* Chart 1: Original Clean Signal */}
        <div className="cyber-panel p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>1. ORIGINAL DOWNLINK TELEMETRY SIGNAL (SYNTHETIC CARRIER)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">200 SAMPLES (TIME DOMAIN)</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="idx" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[-2.5, 2.5]} stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b132b', borderColor: '#00f0ff44', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#00f0ff' }}
                />
                <Line type="monotone" dataKey="clean" stroke="#00f0ff" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Noisy Signal */}
        <div className="cyber-panel p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-rose-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>2. CORRUPTED SIGNAL (AWGN + BURST RF JAMMING INTERFERENCE)</span>
            </span>
            <span className="text-[10px] font-mono text-rose-400/80">
              {metrics.snr_raw_db !== null ? `DEGRADED SNR: ${metrics.snr_raw_db} dB` : 'STANDBY'}
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="idx" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[-2.5, 2.5]} stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b132b', borderColor: '#f43f5e44', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#f43f5e' }}
                />
                <Line type="monotone" dataKey="noisy" stroke="#f43f5e" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Wavelet Filtered Signal */}
        <div className="cyber-panel p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>3. FILTERED RECONSTRUCTED SIGNAL (PyWavelets VisuShrink DWT)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80">
              {metrics.snr_filtered_db !== null ? `RECOVERED SNR: ${metrics.snr_filtered_db} dB` : 'STANDBY'}
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="idx" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[-2.5, 2.5]} stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b132b', borderColor: '#10b98144', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#10b981' }}
                />
                <Line type="monotone" dataKey="filtered" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
