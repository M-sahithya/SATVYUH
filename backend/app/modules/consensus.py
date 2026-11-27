import json
import base64
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.exceptions import InvalidSignature
from app.database import log_event

class SatelliteNode:
    def __init__(self, node_id: str, orbital_slot: str):
        self.node_id = node_id
        self.orbital_slot = orbital_slot
        self.status = "ONLINE"  # ONLINE, COMPROMISED, OFFLINE
        self.seen_nonces = set()
        self.last_verified_command: Optional[str] = None
        self.verification_count = 0
        self.rejection_count = 0

    def verify_command(
        self,
        command_payload: Dict[str, Any],
        signature_b64: str,
        ground_public_key: ed25519.Ed25519PublicKey,
        allowed_actions: List[str]
    ) -> Dict[str, Any]:
        """
        Simulate satellite on-board cryptographic verification.
        Verifies:
        1. Node health
        2. Cryptographic signature (Ed25519)
        3. Nonce uniqueness (Anti-Replay)
        4. Timestamp freshness (Anti-Drift / Expiration)
        5. Command authorization & parameter validity
        """
        cmd_id = command_payload.get("command_id", "UNKNOWN")
        nonce = command_payload.get("nonce")
        action = command_payload.get("action", "")
        timestamp_str = command_payload.get("timestamp", "")
        
        # 1. Node status check
        if self.status != "ONLINE":
            return {
                "node_id": self.node_id,
                "approved": False,
                "reason": f"Node {self.node_id} is {self.status} (offline or maintenance)",
                "sig_check": False,
                "nonce_check": False,
                "auth_check": False
            }

        # 2. Cryptographic Signature Verification
        canonical_bytes = json.dumps(command_payload, sort_keys=True).encode("utf-8")
        try:
            raw_sig = base64.b64decode(signature_b64)
            ground_public_key.verify(raw_sig, canonical_bytes)
            sig_ok = True
        except (InvalidSignature, Exception):
            sig_ok = False
            self.rejection_count += 1
            return {
                "node_id": self.node_id,
                "approved": False,
                "reason": "Cryptographic signature mismatch: Untrusted origin or tampered payload",
                "sig_check": False,
                "nonce_check": False,
                "auth_check": False
            }

        # 3. Nonce check (Replay protection)
        if nonce in self.seen_nonces:
            self.rejection_count += 1
            return {
                "node_id": self.node_id,
                "approved": False,
                "reason": f"Replay attack detected: Nonce '{nonce}' has already been processed",
                "sig_check": True,
                "nonce_check": False,
                "auth_check": False
            }

        # 4. Timestamp check (Within 300 seconds window to tolerate inter-satellite network skew)
        try:
            cmd_time = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
            now_time = datetime.now(timezone.utc)
            skew_seconds = abs((now_time - cmd_time).total_seconds())
            if skew_seconds > 300:
                self.rejection_count += 1
                return {
                    "node_id": self.node_id,
                    "approved": False,
                    "reason": f"Timestamp outside valid envelope (skew: {skew_seconds:.1f}s > 300s)",
                    "sig_check": True,
                    "nonce_check": True,
                    "auth_check": False
                }
        except Exception as e:
            self.rejection_count += 1
            return {
                "node_id": self.node_id,
                "approved": False,
                "reason": f"Invalid timestamp format: {str(e)}",
                "sig_check": True,
                "nonce_check": True,
                "auth_check": False
            }

        # 5. Command authorization check
        if action not in allowed_actions:
            self.rejection_count += 1
            return {
                "node_id": self.node_id,
                "approved": False,
                "reason": f"Unauthorized operational command: '{action}' not in satellite safe registry",
                "sig_check": True,
                "nonce_check": True,
                "auth_check": False
            }

        # All checks passed
        self.seen_nonces.add(nonce)
        self.last_verified_command = cmd_id
        self.verification_count += 1
        return {
            "node_id": self.node_id,
            "approved": True,
            "reason": "Ed25519 signature valid | Fresh nonce | Authorized action",
            "sig_check": True,
            "nonce_check": True,
            "auth_check": True
        }


class SpaceMeshConsensus:
    ALLOWED_ACTIONS = [
        "ORBIT_STATION_KEEPING",
        "ATTITUDE_REORIENTATION",
        "PAYLOAD_TRANSMIT_POWER",
        "SOLAR_ARRAY_POINTING",
        "DOWNLINK_TELEMETRY_DUMP",
        "SYSTEM_HEALTH_CHECK"
    ]

    def __init__(self):
        # Generate Ground Station keypair
        self._ground_private_key = ed25519.Ed25519PrivateKey.generate()
        self.ground_public_key = self._ground_private_key.public_key()
        
        # Ground Station public key in hex
        pub_bytes = self.ground_public_key.public_bytes_raw()
        self.ground_public_key_hex = pub_bytes.hex()
        
        # 3 simulated satellite nodes
        self.nodes: Dict[str, SatelliteNode] = {
            "SAT-A": SatelliteNode("SAT-A", "LEO-Orbit-550km-Slot1"),
            "SAT-B": SatelliteNode("SAT-B", "LEO-Orbit-550km-Slot2"),
            "SAT-C": SatelliteNode("SAT-C", "LEO-Orbit-550km-Slot3")
        }
        
        self.nonce_counter = 1000
        self.last_command: Optional[Dict[str, Any]] = None
        self.last_signature_b64: Optional[str] = None
        self.last_valid_command: Optional[Dict[str, Any]] = None
        self.last_valid_signature_b64: Optional[str] = None
        self.last_consensus_result: Optional[Dict[str, Any]] = None

    def get_status(self) -> Dict[str, Any]:
        return {
            "ground_station": {
                "id": "GROUND-STATION-HQ",
                "public_key_prefix": self.ground_public_key_hex[:16] + "...",
                "algorithm": "Ed25519 (RFC 8032)",
                "active_nonces_issued": self.nonce_counter - 1000
            },
            "nodes": [
                {
                    "node_id": n.node_id,
                    "orbital_slot": n.orbital_slot,
                    "status": n.status,
                    "nonces_cached": len(n.seen_nonces),
                    "verifications_passed": n.verification_count,
                    "verifications_rejected": n.rejection_count,
                    "last_command": n.last_verified_command
                }
                for n in self.nodes.values()
            ],
            "quorum_rule": "2-of-3 BFT Quorum",
            "last_consensus": self.last_consensus_result
        }

    def create_command(self, action: str, target: str = "CONSTELLATION", params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        self.nonce_counter += 1
        now_iso = datetime.now(timezone.utc).isoformat()
        payload = {
            "command_id": f"CMD-{int(time.time() * 1000)}",
            "target": target,
            "action": action,
            "params": params or {"thrust_duration_sec": 4.5, "delta_v_ms": 0.12},
            "timestamp": now_iso,
            "nonce": self.nonce_counter
        }
        return payload

    def sign_payload(self, payload: Dict[str, Any], use_valid_key: bool = True) -> str:
        canonical_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
        if use_valid_key:
            sig = self._ground_private_key.sign(canonical_bytes)
        else:
            # Generate a rogue private key to simulate forge/tamper
            rogue_key = ed25519.Ed25519PrivateKey.generate()
            sig = rogue_key.sign(canonical_bytes)
        return base64.b64encode(sig).decode("utf-8")

    def submit_and_evaluate(self, payload: Dict[str, Any], signature_b64: str, command_category: str = "NORMAL") -> Dict[str, Any]:
        node_results = []
        approved_count = 0

        for node_id, node in self.nodes.items():
            result = node.verify_command(payload, signature_b64, self.ground_public_key, self.ALLOWED_ACTIONS)
            node_results.append(result)
            if result["approved"]:
                approved_count += 1

        quorum_reached = (approved_count >= 2)
        consensus_status = "CONSENSUS_APPROVED" if quorum_reached else "CONSENSUS_REJECTED"

        consensus_output = {
            "command": payload,
            "signature_preview": signature_b64[:24] + "...",
            "category": command_category,
            "node_votes": node_results,
            "votes_approved": approved_count,
            "votes_rejected": len(self.nodes) - approved_count,
            "quorum_required": "2/3",
            "quorum_reached": quorum_reached,
            "consensus_status": consensus_status,
            "execution_outcome": "DISPATCHED_TO_SPACECRAFT_ACTUATORS" if quorum_reached else "EXECUTION_ABORTED_BY_SPACE_MESH"
        }

        self.last_command = payload
        self.last_signature_b64 = signature_b64
        self.last_consensus_result = consensus_output

        # Log event to database
        log_event(
            layer="LAYER_1_CONSENSUS",
            event_type="COMMAND_VERIFICATION",
            status="SUCCESS" if quorum_reached else "WARNING",
            message=f"Command '{payload.get('action')}' ({command_category}) evaluated: {approved_count}/3 nodes approved -> {consensus_status}",
            details=consensus_output
        )

        return consensus_output

    def send_valid_command(self, action: str = "ORBIT_STATION_KEEPING", params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        payload = self.create_command(action, "CONSTELLATION", params)
        sig = self.sign_payload(payload, use_valid_key=True)
        self.last_valid_command = payload
        self.last_valid_signature_b64 = sig
        return self.submit_and_evaluate(payload, sig, command_category="AUTHORIZED_COMMAND")

    def inject_unauthorized_command(self, action: str = "OVERRIDE_ROOT_TELEMETRY_DOWNLINK") -> Dict[str, Any]:
        payload = self.create_command(action, "SAT-A", {"malicious_flag": True, "kill_telemetry": True})
        # Signed with rogue untrusted key + unauthorized action
        sig = self.sign_payload(payload, use_valid_key=False)
        return self.submit_and_evaluate(payload, sig, command_category="INJECTED_UNAUTHORIZED_SPOOF")

    def replay_previous_command(self) -> Dict[str, Any]:
        if not self.last_valid_command or not self.last_valid_signature_b64:
            # First send a valid command to have something to replay
            self.send_valid_command()
        
        # Re-send exact same valid payload with old nonce and signature
        return self.submit_and_evaluate(self.last_valid_command, self.last_valid_signature_b64, command_category="REPLAYED_EXPIRED_COMMAND")

    def reset_nodes(self) -> Dict[str, Any]:
        for node in self.nodes.values():
            node.seen_nonces.clear()
            node.status = "ONLINE"
            node.last_verified_command = None
            node.verification_count = 0
            node.rejection_count = 0
        self.last_command = None
        self.last_signature_b64 = None
        self.last_valid_command = None
        self.last_valid_signature_b64 = None
        self.last_consensus_result = None
        
        log_event("LAYER_1_CONSENSUS", "CONSENSUS_RESET", "INFO", "Space-mesh consensus nodes and nonces reset to nominal state.")
        return {"status": "SUCCESS", "message": "All 3 satellite nodes and anti-replay nonces reset."}

# Global singleton
consensus_engine = SpaceMeshConsensus()
