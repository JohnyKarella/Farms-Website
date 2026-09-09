# 🌾 Sri Bhagyalakshmi Farms & Nursery (SBL Farms)

A modern, full-stack website and operational management system for **Sri Bhagyalakshmi Farms & Nursery**. Features a responsive frontend showcase, multi-step customer inquiry forms, and a secure administration desk for managing leads, orders, and services.

---

## 🚀 Key Features

### 🌿 Public Website
- **Farm Verticals & Services**: Dedicated pages for Agritourism, Dairy, Landscaping, Greenwalls, Corn Silage, Bio Gas, Aviary, and Event hosting.
- **Nursery Catalog**: Extensive plant categories (shrubs, trees, indoor/outdoor foliage, aquatic plants, and flowers).
- **Blog & Articles**: In-depth farming guides, seasonal plantation tips, and agriculture news.
- **Interactive Enquiry Booking**: Multi-step inquiry form (`contact.html`) with real-time field validation, category selection, and instant submission.

### 🛡️ Admin Operations Desk
- **Secure Admin Login (`admin.html`)**: JWT-based token authentication with hashed credential validation.
- **Lead Management Dashboard (`admin-dashboard.html`)**:
  - Live inquiry inbox with search by customer name, phone, email, or reference number.
  - Status management (`New`, `Contacted`, `Closed`, `Not Interested`).
  - Filtering by inquiry category and custom date ranges.
  - One-click **CSV Export** for reporting.
  - Team member performance query report.

### ⚙️ Backend Architecture
- **Flask REST API**: Modular Python backend handling inquiries, authentication, health monitoring, and newsletters.
- **Dual-Storage Engine**: High-concurrency **SQLite3** (`sbl_farms.db`) with WAL mode + automated JSON synchronization (`enquiries.json`).
- **Universal Origin Resolver**: Seamlessly supports `localhost`, local dev servers (Live Server/Vite), Cloudflare Tunnels, and cloud hosting (Render).

---

## 📁 Project Structure

```text
├── admin.html                 # Admin authentication portal
├── admin-dashboard.html       # Operations desk for managing leads
├── contact.html               # Multi-step customer inquiry booking
├── index.html                 # Main website homepage
├── agritour.html              # Agritourism & farm visit packages
├── nursery.html               # Plant nursery showcase
├── dairy.html                 # Dairy operations & products
├── landscape.html             # Landscape architecture & garden design
├── greenwall.html             # Vertical gardens & green walls
├── gallery.html               # Photo & video gallery
├── app.py                     # Root Python application entrypoint
├── requirements.txt           # Python dependencies (Flask, Gunicorn, etc.)
│
├── assets/                    # Static assets
│   ├── admin/                 # Admin dashboard styles & scripts
│   ├── css/                   # Global website styles
│   ├── js/                    # Core frontend scripts
│   ├── customs/               # Custom images, banners, and blog styles
│   └── images/                # Logos, icons, and plant media
│
└── backend/                   # Backend Python package
    ├── app.py                 # Flask server & REST API endpoints
    ├── server.py              # CLI runner with options (--port, --reset-password)
    ├── auth.py                # Admin authentication & token generation
    ├── database.py            # SQLite database manager & JSON syncing
    ├── services.py            # CSV export and utility services
    └── data/                  # SQLite database (sbl_farms.db) & inquiries
```

---

## 💻 Getting Started (Local Setup)

### 1. Prerequisites
- **Python 3.9+** installed on your system.
- Web browser (Chrome, Edge, Firefox, Safari).

### 2. Installation
1. Open a terminal in the project folder:
   ```bash
   cd "sbl_farms_with nursery-2-9-2026"
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```
3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

### 3. Run the Server
Run the application using Python:
```bash
python app.py
```
Or use the provided Windows batch script:
```cmd
start_server.bat
```

Once running, access the portals in your browser:
- 🌐 **Website**: [http://localhost:5000/](http://localhost:5000/)
- 📝 **Contact Form**: [http://localhost:5000/contact.html](http://localhost:5000/contact.html)
- 🔐 **Admin Login**: [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
- 📊 **Admin Dashboard**: [http://localhost:5000/admin-dashboard.html](http://localhost:5000/admin-dashboard.html)
- 🩺 **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

To reset the admin password from the command line:
```bash
python backend/server.py --reset-password your_new_password
```

---

## 🌐 Deploying to Render

This project is fully configured for deployment on [Render](https://render.com):

1. **Create a GitHub Repository**: Push the project code to your GitHub account.
2. **Create a Web Service on Render**:
   - Go to **Render Dashboard** -> **New +** -> **Web Service**.
   - Connect your GitHub repository.
3. **Configure Settings**:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn backend.app:app`
   - **Instance Type**: `Free`
4. Click **Deploy Web Service**. Render will build and provide a live public HTTPS URL.

---

## 🛠️ CLI Utilities

The backend CLI provides administrative commands:

```bash
# Export all inquiries to a CSV file
python backend/server.py --export-csv enquiries_backup.csv

# Initialize or repair database tables
python backend/server.py --init-db

# Run on a custom port
python backend/server.py --port 8000
```

---

## 📄 License
All rights reserved © Sri Bhagyalakshmi Farms & Nursery.
