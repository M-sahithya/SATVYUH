import {
  ConstellationStatus,
  ConsensusStatus,
  ConsensusResult,
  SignalChartData,
  HomomorphicState,
  SafeModeStatus,
  SecurityEvent
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Constellation & Mission Overview
  getHealth: () => fetchJson<{ status: string; system: string; version: string }>('/health'),
  getConstellationStatus: () => fetchJson<ConstellationStatus>('/constellation/status'),

  // Layer 1: Space-Mesh Consensus
  getConsensusStatus: () => fetchJson<ConsensusStatus>('/consensus/status'),
  sendValidCommand: (action = 'ORBIT_STATION_KEEPING', params?: Record<string, any>) =>
    fetchJson<ConsensusResult>('/consensus/send-valid', {
      method: 'POST',
      body: JSON.stringify({ action, params }),
    }),
  injectUnauthorizedCommand: () =>
    fetchJson<ConsensusResult>('/consensus/inject-unauthorized', { method: 'POST' }),
  replayPreviousCommand: () =>
    fetchJson<ConsensusResult>('/consensus/replay', { method: 'POST' }),
  resetConsensus: () =>
    fetchJson<{ status: string; message: string }>('/consensus/reset', { method: 'POST' }),

  // Layer 2: Adaptive Wavelet Filtering
  getSignalStatus: () => fetchJson<SignalChartData>('/signal/status'),
  generateSignal: () => fetchJson<SignalChartData>('/signal/generate', { method: 'POST' }),
  injectNoise: (noise_std = 0.45, burst_jamming = true) =>
    fetchJson<SignalChartData>('/signal/inject-noise', {
      method: 'POST',
      body: JSON.stringify({ noise_std, burst_jamming }),
    }),
  applyWaveletFilter: (wavelet = 'db4', level = 3, mode = 'soft') =>
    fetchJson<SignalChartData>('/signal/filter', {
      method: 'POST',
      body: JSON.stringify({ wavelet, level, mode }),
    }),
  resetSignal: () => fetchJson<SignalChartData>('/signal/reset', { method: 'POST' }),

  // Layer 3: Homomorphic Telemetry Vault
  getHomomorphicStatus: () => fetchJson<HomomorphicState>('/homomorphic/status'),
  generateTelemetry: () => fetchJson<HomomorphicState>('/homomorphic/generate', { method: 'POST' }),
  encryptTelemetry: () => fetchJson<HomomorphicState>('/homomorphic/encrypt', { method: 'POST' }),
  computeOnEncryptedData: () => fetchJson<HomomorphicState>('/homomorphic/compute', { method: 'POST' }),
  decryptTelemetry: () => fetchJson<HomomorphicState>('/homomorphic/decrypt', { method: 'POST' }),

  // Layer 4: Emergency Safe-Mode
  getSafeModeStatus: () => fetchJson<SafeModeStatus>('/safemode/status'),
  simulateCommLoss: () => fetchJson<SafeModeStatus>('/safemode/simulate-loss', { method: 'POST' }),
  simulateFault: (fault_type = 'SOLAR_ARRAY_DRIVE_JAMMED') =>
    fetchJson<SafeModeStatus>('/safemode/simulate-fault', {
      method: 'POST',
      body: JSON.stringify({ fault_type }),
    }),
  activateSafeMode: (reason = 'OPERATOR_EMERGENCY_OVERRIDE') =>
    fetchJson<SafeModeStatus>('/safemode/activate', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  restoreNormal: () => fetchJson<SafeModeStatus>('/safemode/restore', { method: 'POST' }),

  // Audit Logs
  getLogs: (limit = 50, layer?: string) => {
    const query = layer ? `?limit=${limit}&layer=${encodeURIComponent(layer)}` : `?limit=${limit}`;
    return fetchJson<SecurityEvent[]>(`/logs${query}`);
  },
  clearLogs: () => fetchJson<{ status: string; message: string }>('/logs/clear', { method: 'POST' }),

  // Presentation Mode Reset
  resetEntireDemo: () => fetchJson<{ status: string; message: string }>('/demo/reset', { method: 'POST' }),
};
