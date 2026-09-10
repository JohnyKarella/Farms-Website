"""Pure JSON Storage module for SBL Farms & Nursery.

Stores data in JSON files (enquiries.json, admin_users.json, subscribers.json, sessions.json)
with thread-safe locking and atomic file writing. Completely replaces SQLite.
"""

import json
import os
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

ENQUIRIES_PATH = DATA_DIR / "enquiries.json"
ADMIN_USERS_PATH = DATA_DIR / "admin_users.json"
SUBSCRIBERS_PATH = DATA_DIR / "subscribers.json"
SESSIONS_PATH = DATA_DIR / "sessions.json"

# Aliases for backward compatibility
JSON_PATH = ENQUIRIES_PATH
DB_PATH = ENQUIRIES_PATH

_lock = threading.RLock()


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _read_json(path: Path, default_factory: Any) -> Any:
    ensure_dirs()
    if not path.exists():
        return default_factory()
    try:
        content = path.read_text(encoding="utf-8").strip()
        if not content:
            return default_factory()
        return json.loads(content)
    except Exception:
        return default_factory()


def _write_json(path: Path, data: Any) -> None:
    ensure_dirs()
    tmp_path = path.with_suffix(".tmp")
    text = json.dumps(data, indent=2, ensure_ascii=False)
    tmp_path.write_text(text, encoding="utf-8")
    tmp_path.replace(path)


def init_db() -> None:
    """Initialize JSON storage files if they do not exist."""
    ensure_dirs()
    with _lock:
        if not ENQUIRIES_PATH.exists():
            _write_json(ENQUIRIES_PATH, [])
        if not ADMIN_USERS_PATH.exists():
            _write_json(ADMIN_USERS_PATH, [])
        if not SUBSCRIBERS_PATH.exists():
            _write_json(SUBSCRIBERS_PATH, [])
        if not SESSIONS_PATH.exists():
            _write_json(SESSIONS_PATH, {})


# ── Enquiry CRUD ───────────────────────────────────────────────


def insert_enquiry(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    enquiry_id = data.get("id") or f"{int(time.time() * 1000):x}"
    created_at = data.get("createdAt") or now

    item = {
        "id": enquiry_id,
        "reference": str(data.get("reference") or f"SBL-{int(time.time()*1000)}"),
        "name": str(data.get("name") or "").strip(),
        "phone": str(data.get("phone") or "").strip(),
        "email": str(data.get("email") or "").strip().lower(),
        "enquiryAbout": str(data.get("enquiryAbout") or "").strip(),
        "heardAbout": str(data.get("heardAbout") or "").strip(),
        "notes": str(data.get("notes") or "").strip(),
        "status": str(data.get("status") or "new").strip().lower(),
        "assignedTo": str(data.get("assignedTo") or "").strip(),
        "contactedByTelecaller": str(data.get("contactedByTelecaller") or "").strip().lower(),
        "ip": str(data.get("ip") or "").strip(),
        "createdAt": created_at,
        "updatedAt": now,
    }

    with _lock:
        items = _read_json(ENQUIRIES_PATH, list)
        items.append(item)
        _write_json(ENQUIRIES_PATH, items)

    return item


def get_enquiry_by_id(enquiry_id: str) -> Optional[Dict[str, Any]]:
    target = str(enquiry_id or "").strip()
    if not target:
        return None
    with _lock:
        items = _read_json(ENQUIRIES_PATH, list)
        for item in items:
            if str(item.get("id")) == target:
                return dict(item)
    return None


def get_enquiry_by_reference(reference: str) -> Optional[Dict[str, Any]]:
    target = str(reference or "").strip().lower()
    if not target:
        return None
    with _lock:
        items = _read_json(ENQUIRIES_PATH, list)
        for item in items:
            if str(item.get("reference") or "").lower() == target:
                return dict(item)
    return None


def list_enquiries(
    query: str = "",
    status: str = "all",
    category: str = "all",
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    assigned_to: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Query enquiries with optional filters, returned newest first."""
    with _lock:
        items = _read_json(ENQUIRIES_PATH, list)

    filtered: List[Dict[str, Any]] = []
    q = (query or "").strip().lower()

    for item in items:
        # Status filter
        item_status = (item.get("status") or "new").lower()
        if status and status != "all" and item_status != status.lower():
            continue

        # Category filter
        item_cat = (item.get("enquiryAbout") or "").strip()
        if category and category != "all" and item_cat != category:
            continue

        # Date range filter
        created = item.get("createdAt") or ""
        if date_from and created < (date_from + "T00:00:00"):
            continue
        if date_to and created > (date_to + "T23:59:59"):
            continue

        # Assigned to filter
        if assigned_to is not None:
            cur_assigned = (item.get("assignedTo") or "").strip()
            if assigned_to == "__unassigned__":
                if cur_assigned:
                    continue
            elif cur_assigned != assigned_to:
                continue

        # Free text search
        if q:
            haystack = " ".join([
                str(item.get("name") or ""),
                str(item.get("email") or ""),
                str(item.get("phone") or ""),
                str(item.get("reference") or ""),
                str(item.get("enquiryAbout") or ""),
                str(item.get("notes") or ""),
            ]).lower()
            if q not in haystack:
                continue

        filtered.append(dict(item))

    # Sort descending by createdAt
    filtered.sort(key=lambda x: str(x.get("createdAt") or ""), reverse=True)
    return filtered


def update_enquiry(enquiry_id: str, fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update specific fields of an enquiry record."""
    target = str(enquiry_id or "").strip()
    if not target:
        return None

    allowed_keys = {
        "status",
        "assignedTo",
        "contactedByTelecaller",
        "name",
        "phone",
        "email",
        "enquiryAbout",
        "heardAbout",
        "notes",
    }

    with _lock:
        items = _read_json(ENQUIRIES_PATH, list)
        found = False
        updated_item: Optional[Dict[str, Any]] = None

        for item in items:
            if str(item.get("id")) == target:
                for key, val in fields.items():
                    if key in allowed_keys:
                        item[key] = val
                item["updatedAt"] = datetime.now(timezone.utc).isoformat()
                updated_item = dict(item)
                found = True
                break

        if found and updated_item:
            _write_json(ENQUIRIES_PATH, items)
            return updated_item
    return None


def delete_enquiry(enquiry_id: str) -> bool:
    target = str(enquiry_id or "").strip()
    if not target:
        return False
    with _lock:
        items = _read_json(ENQUIRIES_PATH, list)
        initial_len = len(items)
        items = [item for item in items if str(item.get("id")) != target and str(item.get("reference")) != target]
        if len(items) < initial_len:
            _write_json(ENQUIRIES_PATH, items)
            return True
    return False


def get_status_counts() -> Dict[str, int]:
    with _lock:
        items = _read_json(ENQUIRIES_PATH, list)

    counts = {"all": 0, "new": 0, "contacted": 0, "closed": 0, "not_interested": 0}
    total = 0
    for item in items:
        s = (item.get("status") or "new").lower()
        if s in counts:
            counts[s] += 1
        else:
            counts["new"] += 1
        total += 1
    counts["all"] = total
    return counts


# ── Subscriber Management ──────────────────────────────────────


def add_subscriber(email: str, source: str = "website", ip: str = "") -> Dict[str, Any]:
    email_clean = email.strip().lower()
    now = datetime.now(timezone.utc).isoformat()
    sub_id = f"sub_{int(time.time()*1000):x}"

    with _lock:
        subs = _read_json(SUBSCRIBERS_PATH, list)
        existing = next((s for s in subs if s.get("email") == email_clean), None)
        if existing:
            existing["source"] = source
            existing["ip"] = ip
            _write_json(SUBSCRIBERS_PATH, subs)
            return dict(existing)

        new_sub = {"id": sub_id, "email": email_clean, "source": source, "ip": ip, "createdAt": now}
        subs.append(new_sub)
        _write_json(SUBSCRIBERS_PATH, subs)
        return new_sub


def list_subscribers() -> List[Dict[str, Any]]:
    with _lock:
        subs = _read_json(SUBSCRIBERS_PATH, list)
    return sorted(subs, key=lambda s: str(s.get("createdAt") or ""), reverse=True)


# ── Admin User & Session Management ─────────────────────────────


def get_admin_user(username: str) -> Optional[Dict[str, Any]]:
    clean_user = (username or "").strip().lower()
    if not clean_user:
        return None
    with _lock:
        users = _read_json(ADMIN_USERS_PATH, list)
        for user in users:
            if (user.get("username") or "").lower() == clean_user:
                return {
                    "id": user.get("id"),
                    "username": user.get("username"),
                    "passwordHash": user.get("passwordHash") or user.get("password_hash"),
                    "salt": user.get("salt"),
                    "createdAt": user.get("createdAt"),
                }
    return None


def save_admin_user(username: str, password_hash: str, salt: str) -> None:
    clean_user = (username or "").strip()
    now = datetime.now(timezone.utc).isoformat()
    user_id = f"usr_{int(time.time()*1000):x}"

    with _lock:
        users = _read_json(ADMIN_USERS_PATH, list)
        existing = next((u for u in users if (u.get("username") or "").lower() == clean_user.lower()), None)
        if existing:
            existing["passwordHash"] = password_hash
            existing["salt"] = salt
            existing["updatedAt"] = now
        else:
            users.append({
                "id": user_id,
                "username": clean_user,
                "passwordHash": password_hash,
                "salt": salt,
                "createdAt": now,
                "updatedAt": now,
            })
        _write_json(ADMIN_USERS_PATH, users)


def store_session(token: str, username: str, expires_at: float) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _lock:
        sessions = _read_json(SESSIONS_PATH, dict)
        sessions[token] = {
            "username": username,
            "expiresAt": expires_at,
            "createdAt": now,
        }
        _write_json(SESSIONS_PATH, sessions)


def verify_session(token: str) -> Optional[str]:
    """Verify session token; returns username if valid, None if expired or not found."""
    if not token:
        return None
    now = time.time()
    with _lock:
        sessions = _read_json(SESSIONS_PATH, dict)
        session = sessions.get(token)
        if not session:
            return None
        if session.get("expiresAt", 0) <= now:
            sessions.pop(token, None)
            _write_json(SESSIONS_PATH, sessions)
            return None
        return str(session.get("username"))


def revoke_session(token: str) -> None:
    if not token:
        return
    with _lock:
        sessions = _read_json(SESSIONS_PATH, dict)
        if token in sessions:
            sessions.pop(token, None)
            _write_json(SESSIONS_PATH, sessions)


def purge_expired_sessions() -> int:
    now = time.time()
    removed = 0
    with _lock:
        sessions = _read_json(SESSIONS_PATH, dict)
        to_delete = [t for t, s in sessions.items() if s.get("expiresAt", 0) <= now]
        for t in to_delete:
            sessions.pop(t, None)
            removed += 1
        if removed > 0:
            _write_json(SESSIONS_PATH, sessions)
    return removed
