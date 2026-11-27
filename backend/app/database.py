import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "satvyuh.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS security_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            layer TEXT NOT NULL,
            event_type TEXT NOT NULL,
            status TEXT NOT NULL,
            message TEXT NOT NULL,
            details_json TEXT
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_layer ON security_events (layer)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON security_events (timestamp)")
    conn.commit()
    conn.close()

# Auto-initialize on import
init_db()

def log_event(layer: str, event_type: str, status: str, message: str, details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    init_db()
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] + " UTC"
    details_str = json.dumps(details) if details else "{}"
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO security_events (timestamp, layer, event_type, status, message, details_json)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (timestamp, layer, event_type, status, message, details_str))
    event_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": event_id,
        "timestamp": timestamp,
        "layer": layer,
        "event_type": event_type,
        "status": status,
        "message": message,
        "details": details or {}
    }

def get_events(limit: int = 50, layer: Optional[str] = None) -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if layer and layer.upper() != "ALL":
        cursor.execute("""
            SELECT id, timestamp, layer, event_type, status, message, details_json
            FROM security_events
            WHERE layer = ?
            ORDER BY id DESC
            LIMIT ?
        """, (layer, limit))
    else:
        cursor.execute("""
            SELECT id, timestamp, layer, event_type, status, message, details_json
            FROM security_events
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    events = []
    for r in rows:
        try:
            details = json.loads(r[6]) if r[6] else {}
        except Exception:
            details = {}
        events.append({
            "id": r[0],
            "timestamp": r[1],
            "layer": r[2],
            "event_type": r[3],
            "status": r[4],
            "message": r[5],
            "details": details
        })
    return events

def clear_events():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM security_events")
    conn.commit()
    conn.close()
    log_event("SYSTEM", "AUDIT_LOG_PURGE", "INFO", "Security event database cleared by operator request.")
