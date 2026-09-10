"""Business logic and utility services for SBL Farms & Nursery.

Includes validation, reference generator, email notification (SMTP),
CSV export generation, rate limiting, and analytics.
"""

import csv
import io
import os
import random
import re
import smtplib
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from html import escape
from typing import Any, Dict, List, Optional, Tuple

ENQUIRY_TO = os.getenv("ENQUIRY_TO", "sblfarms@sbl1972.com")
SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASS = os.getenv("SMTP_PASS", "").strip()
SMTP_FROM = os.getenv("SMTP_FROM", "SBL Farms <noreply@sbl1972.com>")

ALLOWED_STATUSES = {"new", "contacted", "closed", "not_interested"}
ALLOWED_TELECALLER = {"", "yes", "no"}

ENQUIRY_TOPICS = {
    "Agritour Booking",
    "Dairy",
    "Greenwall",
    "Landscaping",
    "Nimma Mali",
    "Corn Silage",
    "Events",
    "Aquatic Plants",
    "Aviary",
    "Biogas",
    "Nursery",
    "Other",
}

HEARD_ABOUT = {
    "Google Search",
    "Instagram / Facebook",
    "Friend / Family Referral",
    "Travel Blog / Article",
    "Corporate Event Planner",
    "Other",
}

PHONE_RE = re.compile(r"^[0-9]{10}$")
GMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@gmail\.com$", re.I)
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")

rate_buckets: Dict[str, deque] = defaultdict(deque)


def digits_only(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def is_rate_limited(ip: str, limit: int = 10, window_seconds: int = 600) -> bool:
    """Sliding-window IP rate limiter to protect public endpoints."""
    now = time.time()
    hits = rate_buckets[ip]
    while hits and now - hits[0] > window_seconds:
        hits.popleft()
    hits.append(now)
    return len(hits) > limit


def generate_reference() -> str:
    """Generate a unique reference code like SBL-74347346."""
    suffix = str(int(time.time() * 1000))[-6:]
    return f"SBL-{suffix}{random.randint(10, 99)}"


def validate_enquiry_payload(body: Dict[str, Any]) -> Tuple[List[str], Dict[str, Any]]:
    """Validate public enquiry submission data."""
    errors: List[str] = []
    if not isinstance(body, dict):
        return ["Invalid request body."], {}

    name = str(body.get("name") or "").strip()
    phone = digits_only(str(body.get("phone") or ""))
    email = str(body.get("email") or "").strip().lower()
    enquiry_about = str(body.get("enquiryAbout") or "").strip()
    heard_about = str(body.get("heardAbout") or "").strip()
    notes = str(body.get("notes") or "").strip()

    if not name:
        errors.append("Please enter your name.")
    elif len(name) > 80:
        errors.append("Name must not exceed 80 characters.")

    if not phone or not PHONE_RE.match(phone):
        errors.append("Please enter a valid 10-digit phone number.")

    if not email or not (GMAIL_RE.match(email) or EMAIL_RE.match(email)):
        errors.append("Please enter a valid email address.")

    if not enquiry_about:
        errors.append("Please select what your enquiry is about.")

    if not heard_about:
        heard_about = "Other"

    if len(notes) > 4000:
        errors.append("Remarks/notes must not exceed 4000 characters.")

    data = {
        "name": name,
        "phone": phone,
        "email": email,
        "enquiryAbout": enquiry_about,
        "heardAbout": heard_about,
        "notes": notes,
    }
    return errors, data


def send_enquiry_email(enquiry: Dict[str, Any]) -> bool:
    """Send formatted notification email via SMTP. Fails gracefully if unconfigured."""
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        return False

    notes = enquiry.get("notes") or "—"
    ref = enquiry.get("reference", "N/A")
    name = enquiry.get("name", "N/A")
    phone = enquiry.get("phone", "N/A")
    email = enquiry.get("email", "N/A")
    category = enquiry.get("enquiryAbout", "General Enquiry")
    heard = enquiry.get("heardAbout", "N/A")

    text = (
        f"New SBL Farms Enquiry\n"
        f"---------------------\n"
        f"Reference: {ref}\n"
        f"Name: {name}\n"
        f"Phone: {phone}\n"
        f"Email: {email}\n"
        f"Enquiry about: {category}\n"
        f"Heard about us: {heard}\n"
        f"Remarks: {notes}\n"
    )

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial, sans-serif; line-height:1.6; color:#17241d;">
        <h2 style="color:#276a4c;">New SBL Farms Enquiry Received</h2>
        <p><strong>Reference:</strong> {escape(ref)}</p>
        <table cellpadding="10" cellspacing="0" border="1" style="border-collapse:collapse; border-color:#dfe7df; width:100%; max-width:600px;">
            <tr style="background:#f6f8f4;"><td style="width:35%;"><strong>Name</strong></td><td>{escape(name)}</td></tr>
            <tr><td><strong>Phone / WhatsApp</strong></td><td><a href="tel:{escape(phone)}">{escape(phone)}</a></td></tr>
            <tr style="background:#f6f8f4;"><td><strong>Email</strong></td><td><a href="mailto:{escape(email)}">{escape(email)}</a></td></tr>
            <tr><td><strong>Enquiry About</strong></td><td>{escape(category)}</td></tr>
            <tr style="background:#f6f8f4;"><td><strong>Heard About Us</strong></td><td>{escape(heard)}</td></tr>
            <tr><td><strong>Remarks / Notes</strong></td><td style="white-space:pre-wrap;">{escape(notes)}</td></tr>
        </table>
        <p style="font-size:12px; color:#718078; margin-top:24px;">Sri Bhagyalakshmi Farms Enquiry Desk</p>
    </body>
    </html>
    """

    msg = EmailMessage()
    msg["Subject"] = f"SBL Enquiry [{ref}] — {category} ({name})"
    msg["From"] = SMTP_FROM
    msg["To"] = ENQUIRY_TO
    msg["Reply-To"] = email
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
            smtp.starttls()
            smtp.login(SMTP_USER, SMTP_PASS)
            smtp.send_message(msg)
        return True
    except Exception as exc:
        # SMTP logging
        print(f"[Email Warning] Could not dispatch SMTP notification: {exc}")
        return False


def export_enquiries_to_csv(items: List[Dict[str, Any]]) -> str:
    """Generate RFC 4180 compliant CSV string from list of enquiry dictionaries."""
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    headers = [
        "Reference",
        "Created At (UTC)",
        "Name",
        "Phone",
        "Email",
        "Enquiry Category",
        "Heard Via",
        "Status",
        "Assigned To",
        "Contacted by Telecaller",
        "Remarks / Notes",
        "Client IP",
    ]
    writer.writerow(headers)

    for item in items:
        writer.writerow(
            [
                item.get("reference", ""),
                item.get("createdAt", ""),
                item.get("name", ""),
                item.get("phone", ""),
                item.get("email", ""),
                item.get("enquiryAbout", ""),
                item.get("heardAbout", ""),
                item.get("status", "new"),
                item.get("assignedTo", ""),
                item.get("contactedByTelecaller", ""),
                item.get("notes", ""),
                item.get("ip", ""),
            ]
        )

    return output.getvalue()


def calculate_team_analytics(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate detailed member query statistics."""
    members_map: Dict[str, Dict[str, int]] = defaultdict(
        lambda: {"total": 0, "new": 0, "contacted": 0, "closed": 0, "not_interested": 0}
    )

    for item in items:
        member = (item.get("assignedTo") or "").strip() or "__unassigned__"
        st = (item.get("status") or "new").strip().lower()
        members_map[member]["total"] += 1
        if st in members_map[member]:
            members_map[member][st] += 1

    return dict(members_map)

