export type SystemState = 'NORMAL' | 'WARNING' | 'COMMUNICATION FAILURE' | 'SAFE MODE';

export interface SatelliteNode {
  node_id: string;
  orbital_slot: string;
  status: string;
  altitude_km: number;
  inclination_deg: number;
  latency_ms: number;
  telemetry_link: string;
  verifications: number;
  rejections: number;
}

export interface GroundStation {
  name: string;
  location: string;
  status: string;
  carrier_frequency_ghz: number;
}

export interface InterSatelliteLink {
  from: string;
  to: string;
  status: string;
  ping_ms: number;
}

export interface ConstellationStatus {
  constellation_name: string;
  ground_station: GroundStation;
  nodes: SatelliteNode[];
  inter_satellite_links: InterSatelliteLink[];
  ground_links: { node: string; status: string }[];
  active_defense_layers: {
    layer_1_consensus: string;
    layer_2_wavelet_filter: string;
    layer_3_homomorphic_vault: string;
    layer_4_safemode_watchdog: string;
  };
  threat_level: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  system_safemode_state: SystemState;
}

export interface NodeVote {
  node_id: string;
  approved: boolean;
  reason: string;
  sig_check: boolean;
  nonce_check: boolean;
  auth_check: boolean;
}

export interface ConsensusResult {
  command: {
    command_id: string;
    target: string;
    action: string;
    params: Record<string, any>;
    timestamp: string;
    nonce: number;
  };
  signature_preview: string;
  category: string;
  node_votes: NodeVote[];
  votes_approved: number;
  votes_rejected: number;
  quorum_required: string;
  quorum_reached: boolean;
  consensus_status: 'CONSENSUS_APPROVED' | 'CONSENSUS_REJECTED';
  execution_outcome: string;
}

export interface ConsensusStatus {
  ground_station: {
    id: string;
    public_key_prefix: string;
    algorithm: string;
    active_nonces_issued: number;
  };
  nodes: {
    node_id: string;
    orbital_slot: string;
    status: string;
    nonces_cached: number;
    verifications_passed: number;
    verifications_rejected: number;
    last_command: string | null;
  }[];
  quorum_rule: string;
  last_consensus: ConsensusResult | null;
}

export interface SignalPoint {
  idx: number;
  t: number;
  clean: number | null;
  noisy: number | null;
  filtered: number | null;
}

export interface SignalMetrics {
  status: string;
  samples_count: number;
  snr_raw_db: number | null;
  snr_filtered_db: number | null;
  snr_gain_db: number | null;
  noise_level?: number;
  jamming_detected?: boolean;
  signal_quality?: string;
  wavelet_basis?: string;
  decomposition_levels?: number;
  threshold_mode?: string;
  estimated_sigma?: number;
  universal_threshold?: number;
  theoretical_note?: string;
}

export interface SignalChartData {
  chart_points: SignalPoint[];
  metrics: SignalMetrics;
}

export interface HomomorphicState {
  public_key_info: {
    algorithm: string;
    key_size_bits: number;
    n_modulus_preview: string;
  };
  plaintext_telemetry: {
    battery_soc_pct: number;
    solar_array_power_w: number;
    transceiver_tx_power_w: number;
    reaction_wheel_temp_c: number;
    obc_processor_temp_c: number;
  } | null;
  encrypted_telemetry: Record<string, {
    ciphertext_preview: string;
    bit_length: number;
  }> | null;
  encrypted_computation: {
    total_power_encrypted: {
      operation: string;
      ciphertext_preview: string;
      bit_length: number;
    };
    thermal_sum_encrypted: {
      operation: string;
      ciphertext_preview: string;
      bit_length: number;
    };
    mathematical_basis: string;
    computed_without_decryption: boolean;
  } | null;
  decrypted_result: {
    power_aggregation: {
      metric: string;
      decrypted_value: number;
      expected_plaintext_sum: number;
      verified_match: boolean;
      components: { solar_w: number; tx_w: number };
    };
    thermal_aggregation: {
      metric: string;
      decrypted_value: number;
      expected_plaintext_sum: number;
      verified_match: boolean;
      components: { wheel_c: number; obc_c: number };
    };
    integrity_status: string;
    security_guarantee: string;
  } | null;
  current_stage: 'RAW_PLAINTEXT' | 'ENCRYPTED' | 'COMPUTATION_COMPLETE' | 'DECRYPTED_AND_VERIFIED';
}

export interface SubsystemInfo {
  name: string;
  mode: string;
  status: string;
  color: 'emerald' | 'amber' | 'orange' | 'rose' | 'cyan';
  [key: string]: any;
}

export interface SafeModeStatus {
  current_state: SystemState;
  watchdog: {
    active: boolean;
    timeout_threshold_sec: number;
    seconds_since_last_beat: number;
    watchdog_status: string;
  };
  active_faults: string[];
  trigger_reason: string;
  subsystems: Record<string, SubsystemInfo>;
  history: {
    timestamp: string;
    state: string;
    event_type: string;
    message: string;
  }[];
  disclaimer: string;
}

export interface SecurityEvent {
  id: number;
  timestamp: string;
  layer: string;
  event_type: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'INFO';
  message: string;
  details: Record<string, any>;
}
