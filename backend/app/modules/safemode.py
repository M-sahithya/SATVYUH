import time
from typing import Dict, Any, List
from app.database import log_event

class EmergencySafeModeController:
    # State hierarchy
    STATE_NORMAL = "NORMAL"
    STATE_WARNING = "WARNING"
    STATE_COMMUNICATION_FAILURE = "COMMUNICATION FAILURE"
    STATE_SAFE_MODE = "SAFE MODE"

    def __init__(self):
        self.current_state = self.STATE_NORMAL
        self.watchdog_heartbeat_timestamp = time.time()
        self.watchdog_timeout_sec = 20.0
        self.active_faults: List[str] = []
        self.safe_mode_trigger_reason: str = ""
        self.recovery_key_entered: bool = False
        self.history: List[Dict[str, Any]] = []
        
        # Subsystem status profile
        self.subsystems = self._get_subsystems_for_state(self.STATE_NORMAL)
        self._record_history("SYSTEM_INIT", "Subsystems initialized to nominal flight parameters.")

    def _get_subsystems_for_state(self, state: str) -> Dict[str, Dict[str, Any]]:
        if state == self.STATE_NORMAL:
            return {
                "adcs": {
                    "name": "Attitude Determination & Control (ADCS)",
                    "mode": "EARTH_TARGETING_NADIR",
                    "status": "NOMINAL",
                    "reaction_wheels_rpm": 2400,
                    "color": "emerald"
                },
                "comms": {
                    "name": "RF Communications & Transponders",
                    "mode": "HIGH_SPEED_X_BAND_DOWNLINK",
                    "status": "ACTIVE",
                    "data_rate_mbps": 150.0,
                    "color": "emerald"
                },
                "payload": {
                    "name": "Mission Payload & Synthetic Aperture Radar",
                    "mode": "PRIMARY_IMAGING_SURVEY",
                    "status": "ONLINE",
                    "power_draw_w": 280,
                    "color": "emerald"
                },
                "power": {
                    "name": "Electrical Power Distribution (EPS)",
                    "mode": "MAX_POWER_POINT_TRACKING",
                    "status": "NOMINAL",
                    "bus_voltage_v": 28.2,
                    "color": "emerald"
                },
                "thermal": {
                    "name": "Active Thermal Control Heaters",
                    "mode": "AUTOMATIC_DUTY_CYCLE",
                    "status": "NOMINAL",
                    "temp_c": 21.4,
                    "color": "emerald"
                }
            }
        elif state == self.STATE_WARNING:
            return {
                "adcs": {
                    "name": "Attitude Determination & Control (ADCS)",
                    "mode": "ATTITUDE_HOLD_MOMENTUM_DUMP",
                    "status": "DEGRADED",
                    "reaction_wheels_rpm": 3100,
                    "color": "amber"
                },
                "comms": {
                    "name": "RF Communications & Transponders",
                    "mode": "BACKUP_S_BAND_CARRIER",
                    "status": "MARGINAL_LINK",
                    "data_rate_mbps": 12.0,
                    "color": "amber"
                },
                "payload": {
                    "name": "Mission Payload & Synthetic Aperture Radar",
                    "mode": "REDUCED_DUTY_CYCLE",
                    "status": "THROTTLED",
                    "power_draw_w": 140,
                    "color": "amber"
                },
                "power": {
                    "name": "Electrical Power Distribution (EPS)",
                    "mode": "CONSERVATION_PRIORITY",
                    "status": "MONITORED",
                    "bus_voltage_v": 27.6,
                    "color": "amber"
                },
                "thermal": {
                    "name": "Active Thermal Control Heaters",
                    "mode": "CONSERVATIVE_HEATING",
                    "status": "NOMINAL",
                    "temp_c": 19.8,
                    "color": "emerald"
                }
            }
        elif state == self.STATE_COMMUNICATION_FAILURE:
            return {
                "adcs": {
                    "name": "Attitude Determination & Control (ADCS)",
                    "mode": "AUTONOMOUS_SUN_SEARCH",
                    "status": "SEARCHING_REFERENCE",
                    "reaction_wheels_rpm": 1800,
                    "color": "orange"
                },
                "comms": {
                    "name": "RF Communications & Transponders",
                    "mode": "CARRIER_LOST_CARRIER_LOCK_FAIL",
                    "status": "LINK_DOWN",
                    "data_rate_mbps": 0.0,
                    "color": "rose"
                },
                "payload": {
                    "name": "Mission Payload & Synthetic Aperture Radar",
                    "mode": "STANDBY_LOW_POWER",
                    "status": "SUSPENDED",
                    "power_draw_w": 30,
                    "color": "orange"
                },
                "power": {
                    "name": "Electrical Power Distribution (EPS)",
                    "mode": "BATTERY_RECOVERY_MODE",
                    "status": "ELEVATED_DRAW",
                    "bus_voltage_v": 26.8,
                    "color": "orange"
                },
                "thermal": {
                    "name": "Active Thermal Control Heaters",
                    "mode": "SURVIVAL_HEATERS_ONLY",
                    "status": "CRITICAL_CIRCUIT",
                    "temp_c": 16.5,
                    "color": "orange"
                }
            }
        else: # STATE_SAFE_MODE
            return {
                "adcs": {
                    "name": "Attitude Determination & Control (ADCS)",
                    "mode": "SAFE_SUN_POINTING_ACQUISITION",
                    "status": "SURVIVAL_ORIENTATION",
                    "reaction_wheels_rpm": 850,
                    "color": "cyan"
                },
                "comms": {
                    "name": "RF Communications & Transponders",
                    "mode": "OMNIDIRECTIONAL_EMERGENCY_BEACON",
                    "status": "BEACON_CHIRP_ONLY",
                    "data_rate_mbps": 0.064,
                    "color": "cyan"
                },
                "payload": {
                    "name": "Mission Payload & Synthetic Aperture Radar",
                    "mode": "HARDWARE_POWER_SHUTDOWN",
                    "status": "ISOLATED_OFFLINE",
                    "power_draw_w": 0,
                    "color": "rose"
                },
                "power": {
                    "name": "Electrical Power Distribution (EPS)",
                    "mode": "ESSENTIAL_SURVIVAL_BUS_ONLY",
                    "status": "PROTECTED",
                    "bus_voltage_v": 28.5,
                    "color": "cyan"
                },
                "thermal": {
                    "name": "Active Thermal Control Heaters",
                    "mode": "PASSIVE_THERMAL_SURVIVAL",
                    "status": "SAFEGUARD",
                    "temp_c": 14.2,
                    "color": "cyan"
                }
            }

    def _record_history(self, event_type: str, message: str):
        self.history.insert(0, {
            "timestamp": time.strftime("%H:%M:%S UTC", time.gmtime()),
            "state": self.current_state,
            "event_type": event_type,
            "message": message
        })
        if len(self.history) > 30:
            self.history = self.history[:30]

    def simulate_communication_loss(self) -> Dict[str, Any]:
        """
        Simulate loss of uplink/downlink communication carrier lock.
        Triggers watchdog timeout degradation.
        """
        self.current_state = self.STATE_COMMUNICATION_FAILURE
        self.active_faults = ["UPLINK_CARRIER_SYNC_LOST", "WATCHDOG_HEARTBEAT_EXPIRED"]
        self.safe_mode_trigger_reason = "Loss of Signal (LOS) > 120s & Unresponsive Ground Transceiver"
        self.subsystems = self._get_subsystems_for_state(self.current_state)
        
        msg = "Simulated communication blackout: Carrier lost. Watchdog timer armed."
        self._record_history("COMM_LOSS_SIMULATED", msg)
        log_event("LAYER_4_SAFE_MODE", "COMM_BLACKOUT", "WARNING", msg)
        return self.get_status()

    def simulate_critical_fault(self, fault_type: str = "SOLAR_ARRAY_DRIVE_JAMMED") -> Dict[str, Any]:
        """
        Simulate critical spacecraft bus anomaly.
        """
        self.current_state = self.STATE_WARNING
        self.active_faults = [fault_type, "EPS_THERMAL_ANOMALY"]
        self.safe_mode_trigger_reason = f"Critical telemetry breach: {fault_type}"
        self.subsystems = self._get_subsystems_for_state(self.current_state)

        msg = f"Injected critical fault: {fault_type}. Transitioned to WARNING state."
        self._record_history("CRITICAL_FAULT_INJECTED", msg)
        log_event("LAYER_4_SAFE_MODE", "FAULT_INJECTION", "WARNING", msg)
        return self.get_status()

    def activate_safe_mode(self, reason: str = "EMERGENCY_OPERATOR_OVERRIDE") -> Dict[str, Any]:
        """
        Full transition to SAFE MODE:
        - Non-critical payloads powered down
        - Solar arrays oriented directly towards Sun
        - Low-rate omnidirectional telemetry beacon activated
        """
        self.current_state = self.STATE_SAFE_MODE
        self.safe_mode_trigger_reason = reason
        self.active_faults = [f"SAFE_MODE_ACTIVE: {reason}"]
        self.subsystems = self._get_subsystems_for_state(self.current_state)

        msg = f"SAFE MODE ACTIVATED: Subsystems locked down to survival configuration. Reason: {reason}"
        self._record_history("SAFE_MODE_ACTIVATED", msg)
        log_event("LAYER_4_SAFE_MODE", "SAFE_MODE_TRIGGERED", "CRITICAL", msg)
        return self.get_status()

    def restore_normal_operation(self) -> Dict[str, Any]:
        """
        Recovery sequence: Authenticate operator reset, perform subsystem telemetry check,
        and step back into NORMAL nominal flight mode.
        """
        self.current_state = self.STATE_NORMAL
        self.active_faults = []
        self.safe_mode_trigger_reason = ""
        self.watchdog_heartbeat_timestamp = time.time()
        self.subsystems = self._get_subsystems_for_state(self.current_state)

        msg = "Recovery handshake verified. All spacecraft subsystems restored to NORMAL flight mode."
        self._record_history("RECOVERY_NOMINAL", msg)
        log_event("LAYER_4_SAFE_MODE", "NORMAL_RESTORED", "SUCCESS", msg)
        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        return {
            "current_state": self.current_state,
            "watchdog": {
                "active": True,
                "timeout_threshold_sec": self.watchdog_timeout_sec,
                "seconds_since_last_beat": round(time.time() - self.watchdog_heartbeat_timestamp, 1),
                "watchdog_status": "TIMEOUT_EXCEEDED" if self.current_state in [self.STATE_COMMUNICATION_FAILURE, self.STATE_SAFE_MODE] else "HEALTHY"
            },
            "active_faults": self.active_faults,
            "trigger_reason": self.safe_mode_trigger_reason,
            "subsystems": self.subsystems,
            "history": self.history[:15],
            "disclaimer": "Note: Software-defined prototype safe-mode simulation. Represents autonomous onboard contingency logic."
        }

# Global singleton
safemode_controller = EmergencySafeModeController()
