import os
import sys
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure app package is importable
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from app.database import init_db, get_events, clear_events, log_event
from app.modules.consensus import consensus_engine
from app.modules.signal_filter import signal_processor
from app.modules.homomorphic import telemetry_vault
from app.modules.safemode import safemode_controller

# Initialize Database
init_db()

app = FastAPI(
    title="SATVYUH Aerospace Cybersecurity API",
    description="Multi-Layer Satellite Cybersecurity Defence Simulation System",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- MISSION & CONSTELLATION OVERVIEW -----------------

@app.get("/api/health")
def get_health():
    return {
        "status": "OPERATIONAL",
        "system": "SATVYUH Mission Defense Simulator",
        "version": "1.0.0",
        "environment": "Local Simulation Mode"
    }

@app.get("/api/constellation/status")
def get_constellation_status():
    consensus_st = consensus_engine.get_status()
    safemode_st = safemode_controller.get_status()
    signal_st = signal_processor.last_metrics
    vault_st = telemetry_vault.get_state()

    nodes_summary = []
    for n in consensus_st["nodes"]:
        is_safe = safemode_st["current_state"] == "SAFE MODE"
        nodes_summary.append({
            "node_id": n["node_id"],
            "orbital_slot": n["orbital_slot"],
            "status": "SAFE_MODE" if is_safe else n["status"],
            "altitude_km": 550,
            "inclination_deg": 97.4,
            "latency_ms": 18.4 if n["node_id"] == "SAT-A" else (22.1 if n["node_id"] == "SAT-B" else 19.8),
            "telemetry_link": "NOMINAL" if not is_safe else "BEACON_ONLY",
            "verifications": n["verifications_passed"],
            "rejections": n["verifications_rejected"]
        })

    return {
        "constellation_name": "SATVYUH-MESH-Alpha",
        "ground_station": {
            "name": "Ground Station Cyber HQ",
            "location": "Bengaluru Mission Operations Center",
            "status": "ONLINE",
            "carrier_frequency_ghz": 8.45
        },
        "nodes": nodes_summary,
        "inter_satellite_links": [
            {"from": "SAT-A", "to": "SAT-B", "status": "ACTIVE_SECURE", "ping_ms": 4.2},
            {"from": "SAT-B", "to": "SAT-C", "status": "ACTIVE_SECURE", "ping_ms": 4.5},
            {"from": "SAT-C", "to": "SAT-A", "status": "ACTIVE_SECURE", "ping_ms": 4.1}
        ],
        "ground_links": [
            {"node": "SAT-A", "status": "UPLINK_DOWNLINK_NOMINAL"},
            {"node": "SAT-B", "status": "INTER_MESH_RELAY"},
            {"node": "SAT-C", "status": "UPLINK_STANDBY"}
        ],
        "active_defense_layers": {
            "layer_1_consensus": "ACTIVE",
            "layer_2_wavelet_filter": "ACTIVE",
            "layer_3_homomorphic_vault": "ACTIVE",
            "layer_4_safemode_watchdog": "ACTIVE"
        },
        "threat_level": "CRITICAL" if safemode_st["current_state"] == "SAFE MODE"
                        else "ELEVATED" if safemode_st["current_state"] in ["WARNING", "COMMUNICATION FAILURE"]
                        else "NOMINAL",
        "system_safemode_state": safemode_st["current_state"]
    }

# ----------------- LAYER 1: SPACE-MESH CONSENSUS -----------------

class CommandRequest(BaseModel):
    action: Optional[str] = "ORBIT_STATION_KEEPING"
    params: Optional[Dict[str, Any]] = None

@app.get("/api/consensus/status")
def get_consensus_status():
    return consensus_engine.get_status()

@app.post("/api/consensus/send-valid")
def send_valid_command(req: Optional[CommandRequest] = None):
    action = req.action if req and req.action else "ORBIT_STATION_KEEPING"
    params = req.params if req and req.params else None
    return consensus_engine.send_valid_command(action=action, params=params)

@app.post("/api/consensus/inject-unauthorized")
def inject_unauthorized_command():
    return consensus_engine.inject_unauthorized_command()

@app.post("/api/consensus/replay")
def replay_previous_command():
    return consensus_engine.replay_previous_command()

@app.post("/api/consensus/reset")
def reset_consensus():
    return consensus_engine.reset_nodes()

# ----------------- LAYER 2: ADAPTIVE WAVELET FILTERING -----------------

class NoiseRequest(BaseModel):
    noise_std: Optional[float] = 0.45
    burst_jamming: Optional[bool] = True

class FilterRequest(BaseModel):
    wavelet: Optional[str] = "db4"
    level: Optional[int] = 3
    mode: Optional[str] = "soft"

@app.get("/api/signal/status")
def get_signal_status():
    return signal_processor.get_chart_data()

@app.post("/api/signal/generate")
def generate_signal():
    return signal_processor.generate_normal_signal()

@app.post("/api/signal/inject-noise")
def inject_noise(req: Optional[NoiseRequest] = None):
    noise_std = req.noise_std if req else 0.45
    burst = req.burst_jamming if req else True
    return signal_processor.inject_noise(noise_std=noise_std, burst_jamming=burst)

@app.post("/api/signal/filter")
def apply_wavelet_filter(req: Optional[FilterRequest] = None):
    wavelet = req.wavelet if req else "db4"
    level = req.level if req else 3
    mode = req.mode if req else "soft"
    return signal_processor.apply_wavelet_filter(wavelet=wavelet, level=level, mode=mode)

@app.post("/api/signal/reset")
def reset_signal():
    return signal_processor.reset_signal()

# ----------------- LAYER 3: HOMOMORPHIC TELEMETRY VAULT -----------------

@app.get("/api/homomorphic/status")
def get_homomorphic_status():
    return telemetry_vault.get_state()

@app.post("/api/homomorphic/generate")
def generate_telemetry():
    return telemetry_vault.generate_telemetry()

@app.post("/api/homomorphic/encrypt")
def encrypt_telemetry():
    return telemetry_vault.encrypt_telemetry()

@app.post("/api/homomorphic/compute")
def compute_on_encrypted_data():
    return telemetry_vault.compute_on_encrypted_data()

@app.post("/api/homomorphic/decrypt")
def decrypt_telemetry():
    return telemetry_vault.decrypt_result()

# ----------------- LAYER 4: EMERGENCY SAFE-MODE -----------------

class FaultRequest(BaseModel):
    fault_type: Optional[str] = "SOLAR_ARRAY_DRIVE_JAMMED"

class SafeModeRequest(BaseModel):
    reason: Optional[str] = "OPERATOR_EMERGENCY_OVERRIDE"

@app.get("/api/safemode/status")
def get_safemode_status():
    return safemode_controller.get_status()

@app.post("/api/safemode/simulate-loss")
def simulate_comm_loss():
    return safemode_controller.simulate_communication_loss()

@app.post("/api/safemode/simulate-fault")
def simulate_fault(req: Optional[FaultRequest] = None):
    fault_type = req.fault_type if req and req.fault_type else "SOLAR_ARRAY_DRIVE_JAMMED"
    return safemode_controller.simulate_critical_fault(fault_type)

@app.post("/api/safemode/activate")
def activate_safemode(req: Optional[SafeModeRequest] = None):
    reason = req.reason if req and req.reason else "OPERATOR_EMERGENCY_OVERRIDE"
    return safemode_controller.activate_safe_mode(reason)

@app.post("/api/safemode/restore")
def restore_normal():
    return safemode_controller.restore_normal_operation()

# ----------------- AUDIT & SECURITY LOGS -----------------

@app.get("/api/logs")
def get_security_logs(limit: int = Query(50, ge=1, le=200), layer: Optional[str] = None):
    return get_events(limit=limit, layer=layer)

@app.post("/api/logs/clear")
def clear_security_logs():
    clear_events()
    return {"status": "SUCCESS", "message": "Audit logs cleared."}

# ----------------- PRESENTATION / DEMO MODE -----------------

@app.post("/api/demo/reset")
def reset_entire_demo():
    consensus_engine.reset_nodes()
    signal_processor.reset_signal()
    telemetry_vault.generate_telemetry()
    safemode_controller.restore_normal_operation()
    clear_events()
    log_event("PRESENTATION_MODE", "DEMO_RESET", "INFO", "Full SATVYUH demonstration scenario reset to baseline nominal state.")
    return {"status": "SUCCESS", "message": "Demo fully reset to initial nominal state."}
