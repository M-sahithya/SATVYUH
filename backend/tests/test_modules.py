import os
import sys

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database import init_db, log_event, get_events, clear_events
from app.modules.consensus import SpaceMeshConsensus
from app.modules.signal_filter import WaveletSignalFilter
from app.modules.homomorphic import HomomorphicTelemetryVault
from app.modules.safemode import EmergencySafeModeController

def test_database():
    print("Testing SQLite event logging...")
    init_db()
    clear_events()
    evt = log_event("TEST_LAYER", "UNIT_TEST", "SUCCESS", "Test event message", {"sample": 123})
    assert evt["id"] is not None
    events = get_events(limit=10)
    assert len(events) >= 1
    assert any(e["event_type"] == "UNIT_TEST" for e in events)
    print("✓ Database logging passed.")

def test_consensus_module():
    print("Testing Layer 1: Space-Mesh Consensus...")
    engine = SpaceMeshConsensus()
    
    # 1. Valid command
    res1 = engine.send_valid_command("ORBIT_STATION_KEEPING")
    assert res1["quorum_reached"] is True
    assert res1["votes_approved"] == 3
    assert res1["consensus_status"] == "CONSENSUS_APPROVED"
    print("  ✓ Valid command: 3/3 approvals, quorum reached.")

    # 2. Unauthorized spoofed command
    res2 = engine.inject_unauthorized_command("UNAUTHORIZED_DEORBIT")
    assert res2["quorum_reached"] is False
    assert res2["votes_approved"] == 0
    assert res2["consensus_status"] == "CONSENSUS_REJECTED"
    print("  ✓ Unauthorized command: 0/3 approvals, blocked by consensus.")

    # 3. Replay attack
    res3 = engine.replay_previous_command()
    # The replayed command has old nonce, so nodes reject it
    assert res3["votes_approved"] == 0
    assert "Replay attack detected" in res3["node_votes"][0]["reason"]
    print("  ✓ Replay attack: Detected duplicate nonce and rejected.")

    # 4. Reset nodes
    reset_res = engine.reset_nodes()
    assert reset_res["status"] == "SUCCESS"
    print("✓ Layer 1 Space-Mesh Consensus passed all checks.")

def test_signal_filter_module():
    print("Testing Layer 2: Adaptive Wavelet Filtering...")
    filter_mod = WaveletSignalFilter(sample_points=200)
    
    # 1. Generate normal
    d1 = filter_mod.generate_normal_signal()
    assert len(d1["chart_points"]) == 200
    assert d1["metrics"]["status"] == "CLEAN_SIGNAL_GENERATED"
    print("  ✓ Clean telemetry carrier signal generated.")

    # 2. Inject noise
    d2 = filter_mod.inject_noise(noise_std=0.4, burst_jamming=True)
    raw_snr = d2["metrics"]["snr_raw_db"]
    assert raw_snr is not None
    print(f"  ✓ Noise & RF jamming injected: Raw SNR = {raw_snr} dB")

    # 3. Apply wavelet denoising
    d3 = filter_mod.apply_wavelet_filter(wavelet="db4", level=3, mode="soft")
    filtered_snr = d3["metrics"]["snr_filtered_db"]
    snr_gain = d3["metrics"]["snr_gain_db"]
    assert filtered_snr is not None
    assert snr_gain > 0, f"Expected positive SNR gain, got {snr_gain}"
    print(f"  ✓ PyWavelets VisuShrink applied: Filtered SNR = {filtered_snr} dB (Gain: +{snr_gain} dB)")
    print("✓ Layer 2 Wavelet Filtering passed all checks.")

def test_homomorphic_vault_module():
    print("Testing Layer 3: Homomorphic Telemetry Vault (Paillier)...")
    vault = HomomorphicTelemetryVault()
    
    # 1. Plaintext telemetry
    st1 = vault.generate_telemetry()
    assert "battery_soc_pct" in st1["plaintext_telemetry"]
    solar = st1["plaintext_telemetry"]["solar_array_power_w"]
    tx = st1["plaintext_telemetry"]["transceiver_tx_power_w"]
    expected_sum = round(solar + tx, 2)
    print(f"  ✓ Plaintext generated: Solar={solar}W, Tx={tx}W, Expected Sum={expected_sum}W")

    # 2. Encrypt
    st2 = vault.encrypt_telemetry()
    assert st2["encrypted_telemetry"] is not None
    assert "solar_array_power_w" in st2["encrypted_telemetry"]
    print("  ✓ Telemetry encrypted with 1024-bit Paillier public key.")

    # 3. Compute on encrypted data
    st3 = vault.compute_on_encrypted_data()
    assert st3["encrypted_computation"] is not None
    assert st3["encrypted_computation"]["computed_without_decryption"] is True
    print("  ✓ Additive homomorphic calculation performed in ciphertext domain.")

    # 4. Decrypt and verify
    st4 = vault.decrypt_result()
    decrypted_sum = st4["decrypted_result"]["power_aggregation"]["decrypted_value"]
    assert abs(decrypted_sum - expected_sum) < 0.01
    assert st4["decrypted_result"]["power_aggregation"]["verified_match"] is True
    print(f"  ✓ Decryption verified: Decrypted {decrypted_sum}W == Expected {expected_sum}W.")
    print("✓ Layer 3 Homomorphic Telemetry Vault passed all checks.")

def test_safemode_controller():
    print("Testing Layer 4: Emergency Safe-Mode Protection...")
    sm = EmergencySafeModeController()
    assert sm.current_state == "NORMAL"
    
    # 1. Comm loss
    s1 = sm.simulate_communication_loss()
    assert s1["current_state"] == "COMMUNICATION FAILURE"
    assert s1["subsystems"]["comms"]["status"] == "LINK_DOWN"
    print("  ✓ Communication failure simulated: Carrier down.")

    # 2. Fault
    s2 = sm.simulate_critical_fault("GYROSCOPE_BIAS_DRIFT")
    assert s2["current_state"] == "WARNING"
    print("  ✓ Critical fault simulated: State transitioned to WARNING.")

    # 3. Activate safe mode
    s3 = sm.activate_safe_mode("AUTONOMOUS_WATCHDOG_TRIGGER")
    assert s3["current_state"] == "SAFE MODE"
    assert s3["subsystems"]["payload"]["status"] == "ISOLATED_OFFLINE"
    assert s3["subsystems"]["adcs"]["mode"] == "SAFE_SUN_POINTING_ACQUISITION"
    print("  ✓ Safe mode activated: Payloads isolated, sun acquisition engaged.")

    # 4. Restore normal
    s4 = sm.restore_normal_operation()
    assert s4["current_state"] == "NORMAL"
    assert s4["subsystems"]["payload"]["status"] == "ONLINE"
    print("  ✓ Nominal operation restored.")
    print("✓ Layer 4 Safe-Mode Controller passed all checks.")

if __name__ == "__main__":
    print("\n==========================================")
    print("  RUNNING SATVYUH BACKEND MODULE TESTS")
    print("==========================================\n")
    test_database()
    test_consensus_module()
    test_signal_filter_module()
    test_homomorphic_vault_module()
    test_safemode_controller()
    print("\n==========================================")
    print("  ALL SATVYUH BACKEND MODULES PASSED 100%")
    print("==========================================\n")
