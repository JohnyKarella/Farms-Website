"""SBL Farms & Nursery — Complete Python Backend Application.

Handles public enquiry submission, newsletter subscriptions, admin authentication,
enquiry lifecycle management, CSV exports, team reporting, and static website hosting.
"""

import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict
import urllib.parse

from dotenv import load_dotenv
from flask import (
    Flask,
    Response,
    g,
    jsonify,
    make_response,
    request,
    send_from_directory,
)
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
SITE_ROOT = BASE_DIR.parent
if str(SITE_ROOT) not in sys.path:
    sys.path.insert(0, str(SITE_ROOT))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

try:
    from backend.auth import (
        admin_required,
        authenticate_admin,
        change_admin_password,
        create_admin_session,
        get_bearer_token,
        init_default_admin,
        logout_admin,
    )
    from backend.database import (
        add_subscriber,
        delete_enquiry,
        get_enquiry_by_id,
        get_status_counts,
        init_db,
        insert_enquiry,
        list_enquiries,
        list_subscribers,
        update_enquiry,
    )
    from backend.services import (
        ALLOWED_STATUSES,
        ALLOWED_TELECALLER,
        calculate_team_analytics,
        digits_only,
        export_enquiries_to_csv,
        generate_reference,
        is_rate_limited,
        send_enquiry_email,
        validate_enquiry_payload,
    )
except ImportError:
    from auth import (  # type: ignore
        admin_required,
        authenticate_admin,
        change_admin_password,
        create_admin_session,
        get_bearer_token,
        init_default_admin,
        logout_admin,
    )
    from database import (  # type: ignore
        add_subscriber,
        delete_enquiry,
        get_enquiry_by_id,
        get_status_counts,
        init_db,
        insert_enquiry,
        list_enquiries,
        list_subscribers,
        update_enquiry,
    )
    from services import (  # type: ignore
        ALLOWED_STATUSES,
        ALLOWED_TELECALLER,
        calculate_team_analytics,
        digits_only,
        export_enquiries_to_csv,
        generate_reference,
        is_rate_limited,
        send_enquiry_email,
        validate_enquiry_payload,
    )

load_dotenv()
PORT = int(os.getenv("PORT", "5000"))
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

app = Flask(
    __name__,
    static_folder=str(SITE_ROOT),
    static_url_path="",
)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Admin-Token"],
        }
    },
)

# Initialize database schema and admin account
init_db()
init_default_admin()


# ── Security Headers ──────────────────────────────────────────


@app.after_request
def apply_security_headers(response: Response) -> Response:
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# ── Public APIs ───────────────────────────────────────────────


@app.get("/api/health")
def api_health() -> Response:
    """System and database health check."""
    counts = get_status_counts()
    return jsonify(
        {
            "ok": True,
            "service": "sbl-farms-backend",
            "database": "json",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "enquiryCounts": counts,
        }
    )


def handle_create_enquiry() -> Response:
    """Process public enquiry submission."""
    ip = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1").split(",")[0].strip()

    if is_rate_limited(ip, limit=12, window_seconds=600):
        return jsonify(
            {
                "success": False,
                "message": "Too many submissions from this IP. Please wait a few minutes and try again.",
            }
        ), 429

    body = request.get_json(silent=True) or {}
    errors, data = validate_enquiry_payload(body)
    if errors:
        return jsonify({"success": False, "message": errors[0], "errors": errors}), 400

    reference = generate_reference()
    record = {
        "reference": reference,
        "name": data["name"],
        "phone": data["phone"],
        "email": data["email"],
        "enquiryAbout": data["enquiryAbout"],
        "heardAbout": data["heardAbout"],
        "notes": data["notes"],
        "status": "new",
        "assignedTo": "",
        "contactedByTelecaller": "",
        "ip": ip,
    }

    saved = insert_enquiry(record)

    email_sent = False
    try:
        email_sent = send_enquiry_email(saved)
    except Exception as exc:
        app.logger.warning(f"Email dispatch error: {exc}")

    return jsonify(
        {
            "success": True,
            "reference": reference,
            "emailSent": email_sent,
            "message": "Your enquiry has been submitted successfully.",
            "enquiry": saved,
        }
    ), 201


app.add_url_rule("/api/enquiry", view_func=handle_create_enquiry, methods=["POST"])
app.add_url_rule("/api/enquiries", view_func=handle_create_enquiry, methods=["POST"])


@app.post("/api/newsletter")
@app.post("/api/subscribe")
def api_subscribe() -> Response:
    """Newsletter subscription endpoint."""
    ip = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1").split(",")[0].strip()
    body = request.get_json(silent=True) or {}
    email = str(body.get("email") or "").strip().lower()
    source = str(body.get("source") or "website").strip()

    if not email or "@" not in email:
        return jsonify({"success": False, "message": "Please provide a valid email address."}), 400

    subscriber = add_subscriber(email=email, source=source, ip=ip)
    return jsonify(
        {
            "success": True,
            "message": "Thank you for subscribing to SBL Farms updates!",
            "subscriber": subscriber,
        }
    ), 201


# ── Admin Authentication APIs ─────────────────────────────────


@app.post("/api/admin/login")
def api_admin_login() -> Response:
    body = request.get_json(silent=True) or {}
    username = str(body.get("username") or "").strip()
    password = str(body.get("password") or "")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    if not authenticate_admin(username, password):
        return jsonify({"error": "Invalid admin username or password."}), 401

    token, expires_in = create_admin_session(username)
    return jsonify({"token": token, "expiresIn": expires_in, "username": username})


@app.post("/api/admin/logout")
def api_admin_logout() -> Response:
    token = get_bearer_token()
    if token:
        logout_admin(token)
    return jsonify({"message": "Logged out successfully."})


@app.get("/api/admin/me")
@admin_required
def api_admin_me() -> Response:
    return jsonify({"username": g.admin_username, "authenticated": True})


@app.post("/api/admin/change-password")
@admin_required
def api_admin_change_password() -> Response:
    body = request.get_json(silent=True) or {}
    old_pass = str(body.get("currentPassword") or "")
    new_pass = str(body.get("newPassword") or "")

    success, msg = change_admin_password(g.admin_username, old_pass, new_pass)
    if not success:
        return jsonify({"error": msg}), 400
    return jsonify({"message": msg})


# ── Admin Enquiry Desk APIs ───────────────────────────────────


@app.get("/api/admin/enquiries")
@admin_required
def api_admin_list_enquiries() -> Response:
    query = request.args.get("query", "").strip()
    status = request.args.get("status", "all").strip().lower()
    category = request.args.get("category", "all").strip()
    date_from = request.args.get("dateFrom")
    date_to = request.args.get("dateTo")
    assigned_to = request.args.get("assignedTo")

    items = list_enquiries(
        query=query,
        status=status,
        category=category,
        date_from=date_from,
        date_to=date_to,
        assigned_to=assigned_to,
    )
    return jsonify({"enquiries": items, "count": len(items)})


@app.get("/api/admin/enquiries/<enquiry_id>")
@admin_required
def api_admin_get_enquiry(enquiry_id: str) -> Response:
    item = get_enquiry_by_id(enquiry_id)
    if not item:
        return jsonify({"error": "Enquiry not found."}), 404
    return jsonify({"enquiry": item})


@app.patch("/api/admin/enquiries/<enquiry_id>")
@admin_required
def api_admin_update_enquiry(enquiry_id: str) -> Response:
    body = request.get_json(silent=True) or {}
    updates: Dict[str, Any] = {}

    if "status" in body:
        st = str(body.get("status") or "").strip().lower()
        if st not in ALLOWED_STATUSES:
            return jsonify({"error": "Invalid enquiry status."}), 422
        updates["status"] = st

    if "assignedTo" in body:
        assigned = str(body.get("assignedTo") or "").strip()
        if len(assigned) > 80:
            return jsonify({"error": "Assignee name is too long (max 80 chars)."}), 422
        updates["assignedTo"] = assigned

    if "contactedByTelecaller" in body:
        telecaller = str(body.get("contactedByTelecaller") or "").strip().lower()
        if telecaller not in ALLOWED_TELECALLER:
            return jsonify({"error": "Invalid telecaller flag."}), 422
        updates["contactedByTelecaller"] = telecaller

    if "name" in body:
        name = str(body.get("name") or "").strip()
        if name:
            updates["name"] = name

    if "phone" in body:
        phone = digits_only(str(body.get("phone") or ""))
        if phone:
            updates["phone"] = phone

    if "email" in body:
        email = str(body.get("email") or "").strip().lower()
        if email:
            updates["email"] = email

    if "enquiryAbout" in body:
        cat = str(body.get("enquiryAbout") or "").strip()
        if cat:
            updates["enquiryAbout"] = cat

    if "heardAbout" in body:
        updates["heardAbout"] = str(body.get("heardAbout") or "").strip()

    if "notes" in body:
        updates["notes"] = str(body.get("notes") or "").strip()

    updated = update_enquiry(enquiry_id, updates)
    if not updated:
        return jsonify({"error": "Enquiry not found."}), 404

    return jsonify({"message": "Enquiry updated successfully.", "enquiry": updated})


@app.route("/api/admin/enquiries/<enquiry_id>", methods=["DELETE"])
@app.route("/api/admin/enquiries/<enquiry_id>/delete", methods=["POST", "DELETE"])
@admin_required
def api_admin_delete_enquiry(enquiry_id: str) -> Response:
    success = delete_enquiry(enquiry_id)
    if not success:
        return jsonify({"error": "Enquiry not found."}), 404
    return jsonify({"ok": True, "message": "Enquiry deleted successfully."})


@app.get("/api/admin/enquiries/export")
@admin_required
def api_admin_export_enquiries() -> Response:
    """Download enquiries as a formatted CSV spreadsheet."""
    query = request.args.get("query", "").strip()
    status = request.args.get("status", "all").strip().lower()
    category = request.args.get("category", "all").strip()
    date_from = request.args.get("dateFrom")
    date_to = request.args.get("dateTo")

    items = list_enquiries(
        query=query,
        status=status,
        category=category,
        date_from=date_from,
        date_to=date_to,
    )
    csv_content = export_enquiries_to_csv(items)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    filename = f"sbl_farms_enquiries_{timestamp}.csv"

    response = make_response(csv_content)
    response.headers["Content-Type"] = "text/csv; charset=utf-8"
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


@app.get("/api/admin/stats")
@admin_required
def api_admin_stats() -> Response:
    counts = get_status_counts()
    return jsonify({"stats": counts})


@app.get("/api/admin/reports/team")
@admin_required
def api_admin_team_reports() -> Response:
    items = list_enquiries()
    analytics = calculate_team_analytics(items)
    return jsonify({"teamReports": analytics})


@app.get("/api/admin/subscribers")
@admin_required
def api_admin_subscribers() -> Response:
    subs = list_subscribers()
    return jsonify({"subscribers": subs, "count": len(subs)})


# Legacy API token access
@app.get("/api/enquiries")
def api_legacy_list_enquiries() -> Response:
    token = request.headers.get("X-Admin-Token") or request.args.get("token", "")
    if not ADMIN_TOKEN or token != ADMIN_TOKEN:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    items = list_enquiries()
    return jsonify({"success": True, "count": len(items), "enquiries": items})


# ── Static Website Hosting ────────────────────────────────────

STATIC_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico", ".bmp",
    ".css", ".js", ".json", ".map", ".woff", ".woff2", ".ttf", ".eot",
    ".mp4", ".webm", ".mp3", ".wav", ".pdf", ".txt", ".xml",
}


def _resolve_file_case_insensitive(base: Path, rel_path: str) -> Path | None:
    parts = Path(rel_path).parts
    current = base
    for part in parts:
        if not current.is_dir():
            return None
        lower_part = part.lower()
        matched = None
        try:
            for entry in os.scandir(current):
                if entry.name.lower() == lower_part:
                    matched = Path(entry.path)
                    break
        except OSError:
            return None
        if not matched:
            return None
        current = matched
    return current if current.is_file() else None


@app.get("/")
def serve_index() -> Response:
    return send_from_directory(SITE_ROOT, "index.html")


@app.get("/<path:filename>")
def serve_static_file(filename: str) -> Response:
    clean_name = urllib.parse.unquote(filename).replace("\\", "")

    # 1. Exact match
    file_path = SITE_ROOT / clean_name
    if file_path.is_file():
        return send_from_directory(SITE_ROOT, clean_name)

    # 2. Case-insensitive lookup (crucial for Linux environments like Railway)
    resolved = _resolve_file_case_insensitive(SITE_ROOT, clean_name)
    if resolved and resolved.is_file():
        rel = resolved.relative_to(SITE_ROOT).as_posix()
        return send_from_directory(SITE_ROOT, rel)

    # 3. If missing an asset (image, css, js), return 404 instead of index.html
    ext = Path(clean_name).suffix.lower()
    if ext in STATIC_EXTENSIONS:
        return jsonify({"error": "Static asset not found"}), 404

    # 4. Clean HTML route (e.g. /events -> events.html)
    html_target = SITE_ROOT / f"{clean_name}.html"
    if html_target.is_file():
        return send_from_directory(SITE_ROOT, f"{clean_name}.html")
    resolved_html = _resolve_file_case_insensitive(SITE_ROOT, f"{clean_name}.html")
    if resolved_html and resolved_html.is_file():
        rel = resolved_html.relative_to(SITE_ROOT).as_posix()
        return send_from_directory(SITE_ROOT, rel)

    # 5. Fallback for client-side routing
    return send_from_directory(SITE_ROOT, "index.html")


# ── Error Handlers ────────────────────────────────────────────


@app.errorhandler(404)
def handle_404(e: Any) -> Response:
    if request.path.startswith("/api/"):
        return jsonify({"error": "API endpoint not found."}), 404
    return send_from_directory(SITE_ROOT, "index.html"), 404


@app.errorhandler(405)
def handle_405(e: Any) -> Response:
    if request.path.startswith("/api/"):
        return jsonify({"error": "Method not allowed for this endpoint."}), 405
    return jsonify({"error": "Method not allowed."}), 405


@app.errorhandler(500)
def handle_500(e: Any) -> Response:
    app.logger.error(f"Internal Server Error: {e}")
    if request.path.startswith("/api/"):
        return jsonify({"error": "Internal server error."}), 500
    return "<h3>Internal Server Error</h3>", 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
