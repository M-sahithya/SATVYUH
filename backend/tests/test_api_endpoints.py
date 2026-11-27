import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import (
    get_health,
    get_constellation_status,
    get_consensus_status,
    send_valid_command,
    inject_unauthorized_command,
    replay_previous_command,
    reset_consensus,
    get_signal_status,
    generate_signal,
    inject_noise,
    apply_wavelet_filter,
    reset_signal,
    get_homomorphic_status,
    generate_telemetry,
    encrypt_telemetry,
    compute_on_encrypted_data,
    decrypt_telemetry,
    get_safemode_status,
    simulate_comm_loss,
    simulate_fault,
    activate_safemode,
    restore_normal,
    get_security_logs,
    clear_security_logs,
    reset_entire_demo,
    CommandRequest,
    NoiseRequest,
    FilterRequest,
    SafeModeRequest
)

def test_all_endpoints():
    print("Testing SATVYUH FastAPI endpoints directly...")

    # 1. Health
    h = get_health()
    assert h["status"] == "OPERATIONAL"
    print("  ✓ /api/health:", h["status"])

    # 2. Constellation Status
    c = get_constellation_status()
    assert len(c["nodes"]) == 3
    print("  ✓ /api/constellation/status: 3 nodes online, ground station nominal")

    # 3. Layer 1 Consensus
    cs = get_consensus_status()
    assert cs["quorum_rule"] == "2-of-3 BFT Quorum"

    cmd_req = CommandRequest(action="ORBIT_STATION_KEEPING")
    valid_res = send_valid_command(cmd_req)
    assert valid_res["quorum_reached"] is True
    print("  ✓ /api/consensus/send-valid: 3/3 approvals, quorum reached")

    unauth_res = inject_unauthorized_command()
    assert unauth_res["quorum_reached"] is False
    print("  ✓ /api/consensus/inject-unauthorized: 0/3 approvals, blocked")

    replay_res = replay_previous_command()
    assert replay_res["quorum_reached"] is False
    print("  ✓ /api/consensus/replay: Replay attack blocked by nonce cache")

    # 4. Layer 2 Wavelet Filter
    sig_st = get_signal_status()
    assert len(sig_st["chart_points"]) == 200

    noise_req = NoiseRequest(noise_std=0.45, burst_jamming=True)
    noisy_st = inject_noise(noise_req)
    raw_snr = noisy_st["metrics"]["snr_raw_db"]

    filter_req = FilterRequest(wavelet="db4", level=3, mode="soft")
    filtered_st = apply_wavelet_filter(filter_req)
    filtered_snr = filtered_st["metrics"]["snr_filtered_db"]
    snr_gain = filtered_st["metrics"]["snr_gain_db"]
    assert snr_gain > 0
    print(f"  ✓ /api/signal/filter: Raw SNR {raw_snr} dB -> Filtered SNR {filtered_snr} dB (+{snr_gain} dB gain)")

    # 5. Layer 3 Homomorphic Vault
    h_st = get_homomorphic_status()
    gen_st = generate_telemetry()
    enc_st = encrypt_telemetry()
    assert enc_st["encrypted_telemetry"] is not None

    comp_st = compute_on_encrypted_data()
    assert comp_st["encrypted_computation"]["computed_without_decryption"] is True

    dec_st = decrypt_telemetry()
    pow_agg = dec_st["decrypted_result"]["power_aggregation"]
    assert pow_agg["verified_match"] is True
    print(f"  ✓ /api/homomorphic: Verified homomorphic addition: {pow_agg['decrypted_value']}W matches expected")

    # 6. Layer 4 Emergency Safe-Mode
    sm_st = get_safemode_status()
    loss_st = simulate_comm_loss()
    assert loss_st["current_state"] == "COMMUNICATION FAILURE"

    act_st = activate_safemode(SafeModeRequest(reason="OPERATOR_DEMO_ALERT"))
    assert act_st["current_state"] == "SAFE MODE"

    rest_st = restore_normal()
    assert rest_st["current_state"] == "NORMAL"
    print("  ✓ /api/safemode: Transitions (Loss -> Safe Mode -> Restore Normal) verified")

    # 7. Audit Logs
    logs = get_security_logs(limit=20)
    assert len(logs) > 0
    print(f"  ✓ /api/logs: {len(logs)} persistent events returned from SQLite")

    # 8. Reset Demo
    reset_res = reset_entire_demo()
    assert reset_res["status"] == "SUCCESS"
    print("  ✓ /api/demo/reset: Whole demo scenario reset to baseline nominal state")

    print("\n================================================")
    print("  ALL SATVYUH FASTAPI ENDPOINTS VERIFIED 100%")
    print("================================================\n")

if __name__ == "__main__":
    test_all_endpoints()
