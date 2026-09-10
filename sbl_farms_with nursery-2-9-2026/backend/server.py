"""Main CLI runner and server executable for SBL Farms & Nursery.

Usage:
    python backend/server.py
    python backend/server.py --port 5000
    python backend/server.py --init-db
    python backend/server.py --reset-password newpass123
    python backend/server.py --export-csv enquiries_export.csv
"""

import argparse
import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.app import app, PORT
from backend.auth import hash_password, init_default_admin
from backend.database import (
    DB_PATH,
    JSON_PATH,
    get_status_counts,
    init_db,
    list_enquiries,
    save_admin_user,
)
from backend.services import export_enquiries_to_csv


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="SBL Farms & Nursery Python Server")
    parser.add_argument("--port", type=int, default=PORT, help="Port to listen on (default 5000)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host interface (default 0.0.0.0)")
    parser.add_argument("--init-db", action="store_true", help="Initialize database schema and exit")
    parser.add_argument("--reset-password", type=str, help="Reset admin password to given string and exit")
    parser.add_argument("--export-csv", type=str, nargs="?", const="sbl_enquiries.csv", help="Export all enquiries to CSV and exit")
    return parser.parse_args()


def run_cli_actions(args: argparse.Namespace) -> bool:
    """Handle CLI-only commands before starting server. Returns True if command was executed."""
    if args.init_db:
        print("Initializing database...")
        init_db()
        init_default_admin()
        counts = get_status_counts()
        print(f"[OK] Database ready at: {DB_PATH}")
        print(f"[OK] JSON file sync at: {JSON_PATH}")
        print(f"[OK] Total enquiries: {counts['all']}")
        return True

    if args.reset_password:
        new_pwd = args.reset_password.strip()
        if len(new_pwd) < 6:
            print("Error: Password must be at least 6 characters.")
            sys.exit(1)
        init_db()
        p_hash, salt = hash_password(new_pwd)
        save_admin_user("admin", p_hash, salt)
        print("[OK] Admin password has been updated successfully for user 'admin'.")
        return True

    if args.export_csv:
        init_db()
        items = list_enquiries()
        csv_text = export_enquiries_to_csv(items)
        out_file = Path(args.export_csv)
        out_file.write_text(csv_text, encoding="utf-8")
        print(f"[OK] Exported {len(items)} enquiries to {out_file.resolve()}")
        return True

    return False


def main() -> None:
    args = parse_arguments()
    if run_cli_actions(args):
        return

    # Ensure DB & admin user ready
    init_db()
    init_default_admin()

    counts = get_status_counts()
    port = args.port
    host = args.host

    print("=" * 64)
    print("  SRI BHAGYALAKSHMI FARMS & NURSERY - PYTHON BACKEND")
    print("[OK] Storage Engine: Pure JSON Data Store")
    print(f"[OK] Total Leads:   {counts['all']} ({counts['new']} new, {counts['contacted']} contacted)")
    print("-" * 64)
    print(f"  Website Home:  http://localhost:{port}/")
    print(f"  Contact Form:  http://localhost:{port}/contact.html")
    print(f"  Admin Desk:    http://localhost:{port}/admin.html")
    print(f"  Admin Portal:  http://localhost:{port}/admin-dashboard.html")
    print(f"  API Health:    http://localhost:{port}/api/health")
    print("=" * 64)
    print("Server is active. Press Ctrl+C to stop.\n")

    app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    main()
