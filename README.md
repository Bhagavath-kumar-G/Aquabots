# AquaBots — Smart Panchayat Drainage and Flood-Response Platform

A comprehensive civic drainage management and flood-response platform designed for panchayat administrations and citizens. The system pairs citizen complaint reporting with IoT telemetry, automated AI-assisted classification, duplicate detection, transparent priority ranking, authorized resolution verification, safe-route advisories, and real-time panchayat operational analytics.

---

## 🏛️ System Architecture

The application is structured into a modern dual-layer architecture:

1. **Frontend (`/`)**:
   - **Framework**: React 19, TypeScript, Vite
   - **Styling**: Tailwind CSS
   - **Mapping**: Leaflet & React-Leaflet
   - **Internationalization**: i18next (English & Tamil `ta-IN`)
   - **Speech Recognition**: Web Speech API (`ta-IN`) with accessible offline quick-phrase fallback
   - **API Client**: `src/services/api.ts` with resilient backend connectivity and offline state synchronization

2. **Backend (`/server`)**:
   - **Runtime**: Node.js + Express (TypeScript)
   - **Database**: MongoDB with Mongoose ORM
   - **Resilience**: Dual-mode store (`store.ts`) that operates seamlessly on active MongoDB connections or automatically falls back to an in-memory/seeded repository if MongoDB is offline.
   - **File Uploads**: Multer file handler for secure photo evidence storage with sanitization.
   - **Validation & Business Logic**:
     - `duplicateDetector.ts`: Haversine spatial proximity (<250m) + 48h temporal window + Jaccard token similarity.
     - `aiClassifier.ts`: Multi-lingual (Tamil & English) heuristic classification with confidence scoring.
     - `priorityCalculator.ts`: Transparent scoring engine taking into account water depth, life safety, critical hazards, hospital/school proximity, and waiting time.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm or yarn
- *(Optional)* MongoDB running locally on port 27017 or a MongoDB Atlas URI. If unavailable, the server automatically boots in resilient memory fallback mode.

### 1. Backend Setup & Run

```bash
cd server
npm install
npm run build
npm run dev
```

The backend server runs on `http://localhost:5000` with the API served at `http://localhost:5000/api`.

### 2. Frontend Setup & Run

In the root directory:

```bash
npm install
npm run dev
```

The frontend launches on `http://localhost:5173`.

---

## ⚙️ Environment Variables

### Frontend (`.env` in root)
See `.env.example`:
```env
# Base URL for the AquaBots Node.js + Express backend API
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (`server/.env`)
See `server/.env.example`:
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String (e.g., local MongoDB or MongoDB Atlas cluster)
# If omitted or offline, the server runs seamlessly in resilient fallback mode
MONGODB_URI=mongodb://127.0.0.1:27017/aquabots_db

# Allowed Frontend Origins for CORS
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=https://aquabots.vercel.app
```

---

## 📡 API Documentation

### 1. Citizen Complaints & Incident Management
- `GET /api/complaints`: Retrieve all complaint records with full audit trail, priority score, and duplicate flags.
- `GET /api/complaints/:id`: Retrieve single incident details.
- `POST /api/complaints`: Submit a new complaint. Accepts multipart form data (photo upload `photo`) or JSON. Performs automated AI classification and duplicate detection.
- `PATCH /api/complaints/:id/status`: Transition lifecycle status (`Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` ➔ `Reopened`). **Mandatory**: Moving to `Resolved` requires authorized personnel verification fields (`verifiedBy`, `resolutionNote`, optional `resolutionPhoto`).
- `PATCH /api/complaints/:id/assign-crew`: Assign an emergency or desilting crew.
- `PATCH /api/complaints/:id/confirm-category`: Human confirmation or correction of AI-suggested category.
- `POST /api/complaints/:id/duplicate-action`: Human reviewer action to `Merge` or `Dismiss` a flagged duplicate.

### 2. IoT Sensor Telemetry & Dev Simulator
- `GET /api/sensors/readings`: Fetch latest sensor telemetry records.
- `GET /api/sensors/health`: Fetch operational status and health metrics of deployed IoT devices.
- `POST /api/sensors/readings`: Ingest device telemetry. Validates payload fields (`deviceId`, `reading`, `unit`, `timestamp`, `status`) and bounds checks physical readings.
- `POST /api/sensors/simulate`: Development simulator endpoint to inject simulated sensor data with explicit `isSimulated: true` tags.

### 3. Road Closures & Safe Route Advisories
- `GET /api/hazards/road-closures`: List active road closures categorized by status: `Official`, `Unverified`, or `Expired`.
- `POST /api/hazards/check-route`: Evaluate a navigation waypoint sequence for hazard intersections and generate safe detour advisories. *Strict safety rule: Never declares a route safe based only on unverified citizen complaints.*

### 4. Panchayat Analytics
- `GET /api/analytics/panchayat`: Real-time operational metrics:
  - Total complaint volume and backlog
  - Average response time and resolution time
  - Recurring waterlogging hotspots
  - Inspection coverage percentage
  - Sensor network uptime and availability

---

## 🧪 Comprehensive Verification & Test Plan

| Feature Area | Test Scenario | Expected Result |
| :--- | :--- | :--- |
| **Citizen Complaints** | Submit complaint with photo attachment and description | Complaint is assigned unique ID, photo is stored, and incident appears in command queue. |
| **Tamil Voice Input** | Click microphone on Public Portal and speak in Tamil | Speech is transcribed to Tamil text, displayed for citizen review/edit before final submission. Accessible quick-phrases available if mic is unavailable. |
| **AI Classification** | Enter description mentioning "submerged electrical pole" or "குப்பை அடைப்பு" | AI suggests appropriate category with confidence score; user or dispatcher confirms or changes category. |
| **Duplicate Flagging** | Submit two complaints within 250m and 48 hours | System flags second report with proximity & time explanation; requires human dispatcher to Merge or Keep Separate. |
| **Verified Resolution** | Attempt to transition status to "Resolved" | System opens mandatory verification dialog requiring officer name, field desilting notes, and optional photo before closure. |
| **IoT Sensor Ingestion** | Send reading via `POST /api/sensors/readings` | Payload is validated against bounds; malformed events rejected with 400 Bad Request. |
| **Sensor Simulator** | Trigger "Simulate IoT Telemetry" in Rover Monitor | Telemetry updates in real-time with prominent `[DEVELOPMENT SIMULATION]` badges. |
| **Hazard Map & Safe Routes** | View map overlays for closures and risk zones | Official closures marked in red, unverified reports marked in amber. Detour advisory alerts displayed with disclaimers. |
| **Panchayat Analytics** | Click "View Analytics" from dashboard | Modal displays live metrics calculated from records, clearly labelling demo datasets. |

---

## 🔒 Security & Data Integrity
- Credentials and database connection strings are stored exclusively in `.env` variables and never exposed to the client-side bundle.
- File uploads are validated by MIME type and size, stored safely with sanitized unique identifiers.
- All risk scores and AI classifications are transparently documented with their underlying factor breakdowns and never misrepresented as proven predictive models.
