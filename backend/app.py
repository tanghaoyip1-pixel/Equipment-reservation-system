"""
Ono Lab - Equipment Reservation Backend
Simple Flask + SQLite backend
Run: python app.py
"""
import sqlite3
import os
from datetime import datetime, timezone
from contextlib import contextmanager
from flask import Flask, request, jsonify, g
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "ono_lab.db")

# --- Database ---

def init_db():
    """Initialize database — must be called within app context"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript("""
            CREATE TABLE IF NOT EXISTS devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL DEFAULT 'others',
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                location TEXT DEFAULT '',
                color TEXT DEFAULT '#1867C0',
                status TEXT DEFAULT 'active',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS reservations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
                user_name TEXT NOT NULL,
                color TEXT DEFAULT '',
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                status TEXT DEFAULT 'confirmed',
                batch_id TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                CHECK (end_time > start_time)
            );

            CREATE INDEX IF NOT EXISTS idx_reservations_time
                ON reservations(device_id, start_time, end_time);

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            -- Default settings
            INSERT OR IGNORE INTO settings (key, value) VALUES
                ('default_view_mode', '"day"'),
                ('time_slot_duration', '30'),
                ('working_hours_start', '"00:00"'),
                ('working_hours_end', '"23:59"'),
                ('allow_overlapping', 'false'),
                ('app_name', '"Ono Lab - Equipment Reservation"'),
                ('admin_password', '"admin123"');
    """)
    conn.commit()
    conn.close()

@contextmanager
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        db.commit()
    try:
        yield db
    finally:
        pass

@app.teardown_appcontext
def close_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        try:
            db.commit()
            db.close()
        except:
            db.close()

def dict_from_row(row):
    if row is None:
        return None
    result = {}
    for key in row.keys():
        # Convert snake_case to camelCase for frontend compatibility
        parts = key.split('_')
        camel_key = parts[0] + ''.join(p.title() for p in parts[1:])
        result[camel_key] = row[key]
    return result

def now_utc():
    return datetime.now(timezone.utc).isoformat()

# --- Helpers ---

def get_admin_password():
    with get_db() as db:
        row = db.execute("SELECT value FROM settings WHERE key = 'admin_password'").fetchone()
        if row:
            return row["value"].strip('"')
    return "admin123"

def check_admin():
    pw = request.headers.get("X-Admin-Password", "")
    return pw == get_admin_password()

# --- Devices ---

@app.route("/api/devices", methods=["GET"])
def list_devices():
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM devices ORDER BY category, name"
        ).fetchall()
        return jsonify({"items": [dict_from_row(r) for r in rows]})

@app.route("/api/devices/<int:device_id>", methods=["GET"])
def get_device(device_id):
    with get_db() as db:
        row = db.execute("SELECT * FROM devices WHERE id = ?", (device_id,)).fetchone()
        if not row:
            return jsonify({"error": "Device not found"}), 404
        return jsonify({"content": dict_from_row(row)})

@app.route("/api/devices", methods=["POST"])
def create_device():
    if not check_admin():
        return jsonify({"error": "Admin password required"}), 403
    data = request.get_json()
    now = now_utc()
    with get_db() as db:
        cur = db.execute(
            """INSERT INTO devices (category, name, description, location, color, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data.get("category", "others"),
                data["name"],
                data.get("description", ""),
                data.get("location", ""),
                data.get("color", "#1867C0"),
                data.get("status", "active"),
                now, now,
            ),
        )
        row = db.execute("SELECT * FROM devices WHERE id = ?", (cur.lastrowid,)).fetchone()
        return jsonify({"content": dict_from_row(row)}), 201

@app.route("/api/devices/<int:device_id>", methods=["PUT"])
def update_device(device_id):
    if not check_admin():
        return jsonify({"error": "Admin password required"}), 403
    data = request.get_json()
    now = now_utc()
    with get_db() as db:
        db.execute(
            """UPDATE devices SET category=?, name=?, description=?, location=?, color=?, status=?, updated_at=?
               WHERE id=?""",
            (
                data.get("category", "others"),
                data.get("name", ""),
                data.get("description", ""),
                data.get("location", ""),
                data.get("color", "#1867C0"),
                data.get("status", "active"),
                now,
                device_id,
            ),
        )
        row = db.execute("SELECT * FROM devices WHERE id = ?", (device_id,)).fetchone()
        if not row:
            return jsonify({"error": "Device not found"}), 404
        return jsonify({"content": dict_from_row(row)})

@app.route("/api/devices/<int:device_id>", methods=["DELETE"])
def delete_device(device_id):
    if not check_admin():
        return jsonify({"error": "Admin password required"}), 403
    with get_db() as db:
        db.execute("DELETE FROM reservations WHERE device_id = ?", (device_id,))
        db.execute("DELETE FROM devices WHERE id = ?", (device_id,))
        return jsonify({"success": True})

# --- Reservations ---

@app.route("/api/reservations", methods=["GET"])
def list_reservations():
    from_time = request.args.get("from", "2000-01-01T00:00:00")
    to_time = request.args.get("to", "2099-12-31T23:59:59")
    device_id = request.args.get("deviceId")

    query = """
        SELECT r.*, d.name as device_name, d.color as device_color
        FROM reservations r
        JOIN devices d ON r.device_id = d.id
        WHERE r.start_time < ? AND r.end_time > ?
        AND r.status = 'confirmed'
    """
    params = [to_time, from_time]

    if device_id:
        query += " AND r.device_id = ?"
        params.append(device_id)

    query += " ORDER BY r.start_time"

    with get_db() as db:
        rows = db.execute(query, params).fetchall()
        return jsonify({"items": [dict_from_row(r) for r in rows]})

@app.route("/api/reservations/<int:reservation_id>", methods=["GET"])
def get_reservation(reservation_id):
    with get_db() as db:
        row = db.execute(
            """SELECT r.*, d.name as device_name, d.color as device_color
               FROM reservations r JOIN devices d ON r.device_id = d.id
               WHERE r.id = ?""",
            (reservation_id,),
        ).fetchone()
        if not row:
            return jsonify({"error": "Reservation not found"}), 404
        return jsonify({"content": dict_from_row(row)})

@app.route("/api/reservations/check-conflicts", methods=["GET"])
def check_conflicts():
    device_id = request.args.get("device_id")
    start_time = request.args.get("start_time")
    end_time = request.args.get("end_time")
    exclude_id = request.args.get("exclude_id")

    query = """
        SELECT r.*, d.name as device_name, d.color as device_color
        FROM reservations r JOIN devices d ON r.device_id = d.id
        WHERE r.device_id = ? AND r.start_time < ? AND r.end_time > ?
        AND r.status = 'confirmed'
    """
    params = [device_id, end_time, start_time]

    if exclude_id:
        query += " AND r.id != ?"
        params.append(exclude_id)

    with get_db() as db:
        rows = db.execute(query, params).fetchall()
        conflicts = [dict_from_row(r) for r in rows]
        return jsonify({
            "content": {
                "hasConflict": len(conflicts) > 0,
                "conflicts": conflicts,
            }
        })

@app.route("/api/reservations", methods=["POST"])
def create_reservation():
    data = request.get_json()
    now = now_utc()

    # Check conflicts
    with get_db() as db:
        existing = db.execute(
            """SELECT r.*, d.name as device_name
               FROM reservations r JOIN devices d ON r.device_id = d.id
               WHERE r.device_id = ? AND r.start_time < ? AND r.end_time > ?
               AND r.status = 'confirmed'""",
            (data["deviceId"], data["endTime"], data["startTime"]),
        ).fetchone()

        if existing:
            return jsonify({
                "error": "This time slot is already reserved.",
                "conflict": dict_from_row(existing),
            }), 409

        cur = db.execute(
            """INSERT INTO reservations (device_id, user_name, color, title, description, start_time, end_time, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data["deviceId"],
                data["userName"],
                data.get("color", ""),
                data["title"],
                data.get("description", ""),
                data["startTime"],
                data["endTime"],
                now, now,
            ),
        )
        row = db.execute(
            "SELECT r.*, d.name as device_name, d.color as device_color FROM reservations r JOIN devices d ON r.device_id = d.id WHERE r.id = ?",
            (cur.lastrowid,),
        ).fetchone()
        return jsonify({"content": dict_from_row(row)}), 201

@app.route("/api/reservations/<int:reservation_id>", methods=["PUT"])
def update_reservation(reservation_id):
    data = request.get_json()
    now = now_utc()
    with get_db() as db:
        # Check conflicts (exclude self)
        existing = db.execute(
            """SELECT id FROM reservations
               WHERE device_id = ? AND start_time < ? AND end_time > ?
               AND status = 'confirmed' AND id != ?""",
            (data["deviceId"], data["endTime"], data["startTime"], reservation_id),
        ).fetchone()

        if existing:
            return jsonify({"error": "This time slot is already reserved."}), 409

        db.execute(
            """UPDATE reservations SET device_id=?, user_name=?, title=?, description=?, start_time=?, end_time=?, updated_at=?
               WHERE id=?""",
            (
                data["deviceId"],
                data["userName"],
                data["title"],
                data.get("description", ""),
                data["startTime"],
                data["endTime"],
                now,
                reservation_id,
            ),
        )
        row = db.execute(
            "SELECT r.*, d.name as device_name, d.color as device_color FROM reservations r JOIN devices d ON r.device_id = d.id WHERE r.id = ?",
            (reservation_id,),
        ).fetchone()
        if not row:
            return jsonify({"error": "Not found"}), 404
        return jsonify({"content": dict_from_row(row)})

@app.route("/api/reservations/<int:reservation_id>", methods=["DELETE"])
def delete_reservation(reservation_id):
    with get_db() as db:
        db.execute("DELETE FROM reservations WHERE id = ?", (reservation_id,))
        return jsonify({"success": True})

@app.route("/api/reservations/batch", methods=["POST"])
def create_batch_reservations():
    data = request.get_json()
    dates = data["dates"]
    start_time = data["startTime"]  # HH:mm
    end_time = data["endTime"]      # HH:mm
    device_ids = data["deviceIds"]
    user_name = data["userName"]
    title = data["title"]
    description = data.get("description", "")
    now = now_utc()

    created = []
    skipped = []

    with get_db() as db:
        for date_str in dates:
            full_start = f"{date_str}T{start_time}:00"
            full_end = f"{date_str}T{end_time}:00"
            for device_id in device_ids:
                # Check conflict
                conflict = db.execute(
                    """SELECT id FROM reservations
                       WHERE device_id = ? AND start_time < ? AND end_time > ?
                       AND status = 'confirmed'""",
                    (device_id, full_end, full_start),
                ).fetchone()

                if conflict:
                    # Get conflicting reservation details
                    conflict_row = db.execute(
                        "SELECT r.user_name, d.name as device_name FROM reservations r JOIN devices d ON r.device_id = d.id WHERE r.id = ?",
                        (conflict["id"],),
                    ).fetchone()
                    skipped.append({
                        "date": date_str,
                        "deviceId": device_id,
                        "deviceName": conflict_row["device_name"] if conflict_row else f"Device #{device_id}",
                        "reservedBy": conflict_row["user_name"] if conflict_row else "unknown",
                        "reason": "Conflict",
                    })
                    continue

                cur = db.execute(
                    """INSERT INTO reservations (device_id, user_name, color, title, description, start_time, end_time, created_at, updated_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (device_id, user_name, data.get("color", ""), title, description, full_start, full_end, now, now),
                )
                row = db.execute(
                    "SELECT r.*, d.name as device_name, d.color as device_color FROM reservations r JOIN devices d ON r.device_id = d.id WHERE r.id = ?",
                    (cur.lastrowid,),
                ).fetchone()
                created.append(dict_from_row(row))

    return jsonify({"items": created, "skipped": skipped}), 201

# --- Settings ---

@app.route("/api/settings", methods=["GET"])
def get_settings():
    with get_db() as db:
        rows = db.execute("SELECT * FROM settings").fetchall()
        return jsonify({"items": [dict_from_row(r) for r in rows]})

@app.route("/api/settings", methods=["PUT"])
def update_settings():
    if not check_admin():
        return jsonify({"error": "Admin password required"}), 403
    data = request.get_json()
    now = now_utc()
    with get_db() as db:
        for key, value in data.items():
            json_value = jsonify_value(value)
            db.execute(
                "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=?, updated_at=?",
                (key, json_value, now, json_value, now),
            )
        return jsonify({"success": True})

def jsonify_value(value):
    """Ensure value is stored as a JSON-compatible string"""
    import json
    return json.dumps(value) if not isinstance(value, str) else json.dumps(value)

# --- Auth (simple) ---

@app.route("/api/auth/check-admin", methods=["POST"])
def check_admin_auth():
    data = request.get_json()
    password = data.get("password", "")
    if password == get_admin_password():
        return jsonify({"valid": True})
    return jsonify({"valid": False}), 403

# --- Start ---

if __name__ == "__main__":
    with app.app_context():
        init_db()
    print("✅ Database initialized")
    print("🚀 Server starting at http://localhost:8080")
    print("📋 Admin password: admin123 (change in Settings)")
    app.run(debug=False, port=8080)
