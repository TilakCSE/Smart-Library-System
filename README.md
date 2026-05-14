# 📚 Smart Library System (SmartOS)

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)
![Unity](https://img.shields.io/badge/Unity-WebGL-white?style=for-the-badge&logo=unity&logoColor=black)
![Blender](https://img.shields.io/badge/Blender-3D-F5792A?style=for-the-badge&logo=blender&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

> **A next-generation spatial library management system bridging the physical and digital worlds.**
> 
> **Developed as a Minor Project for Navrachana University Vadodara (NUV).**

---

## 📖 Overview

The **Smart Library System** (codenamed SmartOS) is a modern, high-performance web application designed to revolutionize how students interact with physical library assets. Moving beyond traditional catalogs, this system integrates a **3D Digital Twin** of the library, allowing users to spatially locate books down to the exact Rack and Shelf. 

Wrapped in a premium, cyberpunk-inspired UI featuring skeuomorphic 3D bookshelves and glassmorphic dashboards, the system enforces strict GPS geofencing, tracks real-time circulation, and calculates dynamic fines, all powered by a robust Python/FastAPI backend.

🌐 **Live Demo:** [https://smart-library-system-orpin.vercel.app](https://smart-library-system-orpin.vercel.app) *(Requires NUV Microsoft SSO or authorized Student Login)*

---

## ✨ Key Features

- 🗺️ **3D Spatial Navigation:** Integrated Unity WebGL build and Blender-rendered assets map the physical library into a 3D Digital Twin. Locate any asset instantly in virtual space.
- 📍 **GPS Geofencing & Telemetry:** Uses the Haversine formula to strictly restrict 3D map access to users physically located within 50 meters of the NUV Library gates (includes a secret "God Mode" bypass for demonstrations).
- 🔐 **Microsoft SSO & Firebase Auth:** Seamless, secure login using university credentials via Firebase Authentication.
- 📊 **Real-Time Student Dashboard:** Tracks issued assets, overdue fines with dynamic accrual breakdowns, and spatial search history.
- 🤖 **AI-Powered Recommendations:** Smart asset suggestions based on the user's borrowing history and reading velocity.
- 🎨 **Cinematic & Skeuomorphic UI:** Highly interactive frontend featuring 3D continuous bookshelves, realistic lighting, shadows, and smooth page transitions using Framer Motion.
- 🛡️ **IoT Hardware Bridge Ready:** Backend architecture designed to accept real-time RFID/NFC circulation and gate logs from ESP32/Arduino scanners.

---

## 🛠️ Tech Stack

### Frontend (Monorepo `apps/frontend`)
* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion, MagicUI, Shadcn UI
* **State Management:** Zustand
* **API Client:** Axios

### Backend (Monorepo `apps/backend`)
* **Framework:** FastAPI (Python)
* **Database ORM:** SQLModel / SQLAlchemy 2.0
* **Database:** PostgreSQL (Hosted on NeonDB)
* **Authentication:** Firebase Admin SDK

### 3D & Spatial Design
* **Game Engine:** Unity (WebGL build for browser integration)
* **3D Modeling:** Blender (God View renders, environment mapping, rack/shelf coordinate plotting)

### Deployment
* **Frontend Environment:** Vercel
* **Backend Environment:** Hugging Face Spaces / Render
* **Database:** NeonDB Serverless Postgres

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* Python 3.10+
* PostgreSQL
* Firebase Project (with Web API keys and Service Account JSON)

### 1. Clone the Repository
```bash
git clone [https://github.com/YourUsername/smart-library-system.git](https://github.com/YourUsername/smart-library-system.git)
cd smart-library-system
2. Backend Setup
Bash
cd apps/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in the backend directory:

Code snippet
DATABASE_URL=postgresql://user:password@hostname/dbname
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account", ...}' # Stringified JSON
Run the server:

Bash
uvicorn app.main:app --reload --port 8000
3. Frontend Setup
Bash
cd apps/frontend
npm install
Create a .env.local file in the frontend directory:

Code snippet
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
Run the development server:

Bash
npm run dev
🏛️ Project Structure
Plaintext
smart-library-system/
├── apps/
│   ├── frontend/          # Next.js Application
│   │   ├── app/           # App Router Pages (Dashboard, Books, Login, Admin)
│   │   ├── components/    # Reusable UI elements & MagicUI components
│   │   ├── lib/           # Firebase & Axios configurations
│   │   └── store/         # Zustand global states (Geofence, Auth, Inventory)
│   │
│   └── backend/           # FastAPI Application
│       ├── app/
│       │   ├── api/       # Route endpoints (users, books, transactions)
│       │   ├── core/      # Config, security, and Auth middleware
│       │   ├── db/        # Database session and NeonDB engine
│       │   └── models/    # SQLModel definitions
│       └── seed_master.py # Database population and demo data injection script
│
├── .gitignore
└── README.md
🎓 Academic Credit
Navrachana University Vadodara (NUV)

Developer: Tilaksinh Chauhan

Program: B.Tech Computer Science and Engineering (CSE) - 3rd Year

Course Context: Minor Project (6th Semester)

📄 License
This project is licensed under the MIT License.

  
End of transmission. System initialized. 🟢