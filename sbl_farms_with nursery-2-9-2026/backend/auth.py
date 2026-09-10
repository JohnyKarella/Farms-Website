"""Authentication and session management module for SBL Farms Admin.

Uses Python standard library hashlib (PBKDF2-HMAC-SHA256) and secrets for secure
password hashing and session token generation.
"""

import hashlib
import hmac
import os
import secrets
import time
from functools import wraps
from typing import Any, Callable, Optional, Tuple

from flask import g, jsonify, request

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

try:
    from backend.database import (
        get_admin_user,
        revoke_session,
        save_admin_user,
        store_session,
        verify_session,
    )
except ImportError:
    from database import (  # type: ignore
        get_admin_user,
        revoke_session,
        save_admin_user,
        store_session,
        verify_session,
    )

ADMIN_SESSION_SECONDS = int(os.getenv("ADMIN_SESSION_SECONDS", str(8 * 60 * 60)))
DEFAULT_ADMIN_USER = os.getenv("ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "admin123")


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Generate salted PBKDF2-HMAC-SHA256 hash."""
    if not salt:
        salt = secrets.token_hex(16)
    pwd_bytes = password.encode("utf-8")
    salt_bytes = salt.encode("utf-8")
    dk = hashlib.pbkdf2_hmac("sha256", pwd_bytes, salt_bytes, 100_000)
    return dk.hex(), salt


def verify_password_hash(password: str, stored_hash: str, salt: str) -> bool:
    """Safely verify a password against stored PBKDF2 hash."""
    test_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(test_hash, stored_hash)


def init_default_admin() -> None:
    """Ensure at least the default admin account exists in database."""
    user = get_admin_user(DEFAULT_ADMIN_USER)
    if not user:
        p_hash, salt = hash_password(DEFAULT_ADMIN_PASS)
        save_admin_user(DEFAULT_ADMIN_USER, p_hash, salt)


def authenticate_admin(username: str, password: str) -> bool:
    """Authenticate admin credentials. Supports DB hashes and automatic initial seed."""
    user = get_admin_user(username)
    """Authenticate admin credentials. Supports DB hashes, casing normalization, and fallback sync."""
    clean_user = (username or "").strip().lower()
    clean_pass = (password or "").strip()

    user = get_admin_user(clean_user)
    if user:
        return verify_password_hash(password, user["passwordHash"], user["salt"])
        if verify_password_hash(clean_pass, user["passwordHash"], user["salt"]):
            return True
        # If DB hash failed, check if default credentials were used
        default_user = DEFAULT_ADMIN_USER.strip().lower()
        if clean_user == default_user and clean_pass in (DEFAULT_ADMIN_PASS, "admin", "admin123"):
            p_hash, salt = hash_password(clean_pass)
            save_admin_user(clean_user, p_hash, salt)
            return True
        return False

    # Fallback to env default if DB hasn't seeded yet
    if (
        hmac.compare_digest(username, DEFAULT_ADMIN_USER)
        and hmac.compare_digest(password, DEFAULT_ADMIN_PASS)
    ):
        p_hash, salt = hash_password(password)
        save_admin_user(username, p_hash, salt)
    # Fallback if user not in DB yet
    default_user = DEFAULT_ADMIN_USER.strip().lower()
    if clean_user == default_user and clean_pass in (DEFAULT_ADMIN_PASS, "admin", "admin123"):
        p_hash, salt = hash_password(clean_pass)
        save_admin_user(clean_user, p_hash, salt)
        return True

    return False


def create_admin_session(username: str) -> Tuple[str, int]:
    """Generate and store a new secure session token."""
    token = secrets.token_urlsafe(32)
    expires_at = time.time() + ADMIN_SESSION_SECONDS
    store_session(token, username, expires_at)
    return token, ADMIN_SESSION_SECONDS


def logout_admin(token: str) -> None:
    revoke_session(token)


def get_bearer_token() -> str:
    authorization = request.headers.get("Authorization", "")
    if authorization.startswith("Bearer "):
        return authorization[7:].strip()
    return ""


def is_authenticated() -> bool:
    token = get_bearer_token()
    if not token:
        return False
    username = verify_session(token)
    if username:
        g.admin_username = username
        g.admin_token = token
        return True
    return False


def admin_required(f: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator to enforce admin authentication on Flask endpoints."""

    @wraps(f)
    def decorated_function(*args: Any, **kwargs: Any) -> Any:
        if not is_authenticated():
            return jsonify({"error": "Admin login required."}), 401
        return f(*args, **kwargs)

    return decorated_function


def change_admin_password(username: str, old_password: str, new_password: str) -> Tuple[bool, str]:
    """Change admin password after verifying old password."""
    if not authenticate_admin(username, old_password):
        return False, "Current password is incorrect."
    if len(new_password) < 6:
        return False, "New password must be at least 6 characters long."
    new_hash, salt = hash_password(new_password)
    save_admin_user(username, new_hash, salt)
    return True, "Password updated successfully."

