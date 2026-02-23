# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# 🚀 Simple Integration Guide - Smart VMS AI Module

**Crystal Clear Workflow: One-Time Setup + Web App Control**

---

## 📋 Overview

```
┌─────────────────────────────────────────────────────────┐
│  ONE-TIME SETUP (Command Line)                          │
│  Run ONCE at the beginning                              │
└─────────────────────────────────────────────────────────┘
    python boundary_setup.py --camera_id cam1 --source 1
    Creates: boundaries/cam1_boundary.json

┌─────────────────────────────────────────────────────────┐
│  EVERYTHING ELSE (React Web App)                        │
│  NO Swagger UI, NO command line                         │
└─────────────────────────────────────────────────────────┘
    ├─ Register Visitors (auto ID: V001, V002, V003...)
    ├─ View Alerts Dashboard
    ├─ Manage Cameras (start/stop)
    ├─ Track Visitors
    └─ View System Stats
```

---

## ⚙️ System Components

### **1. Python AI Service (Port 8000)**
- **NO Swagger UI** ✅ (disabled in app.py)
- Only REST API endpoints
- Called by C# backend

### **2. C# .NET Backend (Port 5260)**
- Bridge between React and Python AI
- Auto-generates visitor IDs (V001, V002, V003...)
- Handles file uploads

### **3. React Frontend (Port 3000)**
- All user interactions
- Camera capture (source 1)
- Dashboards and management

### **4. MongoDB (Port 27017)**
- Stores face embeddings
- Stores events and alerts

---

## 🎯 Step-by-Step Setup

### **Phase 1: Start All Services**

#### 1.1 Start MongoDB
```bash
# Windows
mongod --dbpath C:\data\db

# Linux/macOS
mongod --dbpath /data/db
```

#### 1.2 Start Python AI Service
```bash
cd smart-vms-ai
cd ai_service


python -m venv venv
venv\Scripts\activate
pip install -r .\requirements.txt 


python app.py
```

**Expected output:**
```
🚀 Smart VMS AI Service starting...
✅ System ready.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Test it:**
```bash
curl http://localhost:8000/health -UseBasicParsing
```

**Important:** NO Swagger UI will open. This is correct! ✅

#### 1.3 Start C# Backend
```bash
cd SVMS.API
dotnet run (if throws error "dotnet add package Newtonsoft.Json")
```

#### 1.4 Start React App
```bash
cd new_svms
npm start
```

---

### **Phase 2: ONE-TIME Boundary Setup (Command Line)**

**Run this ONCE for each camera:**

```bash
cd ai_service
python boundary_setup.py --camera_id entrance_cam --source 1
```

**Instructions:**
1. Your **USB webcam (source 1)** will open
2. Click points on video to draw polygon boundary
3. Press **'s'** to save
4. File saved: `boundaries/entrance_cam_boundary.json`

**That's it! You never need to run this again unless you want to change the boundary.**

---

### **Phase 3: Everything Else via Web App**

#### 3.1 Register Camera
1. Open browser: `http://localhost:3000`
2. Navigate to: **Security → Camera Management**
3. Click **"Register New Camera"**
4. Fill in:
   - Camera ID: `entrance_cam`
   - Location: `Main Entrance`
   - Webcam Index: `1` (USB camera)
   - Zone Type: `General` or `Restricted`
5. Click **"Register Camera"**
6. Click **"Start"** button

**Done!** Camera is now monitoring.

#### 3.2 Register Visitor
1. Navigate to: **Security → Register Visitor**
2. Fill in visitor details (name, email, phone, etc.)
3. Step 3: Click **"Open Camera"**
   - USB webcam (source 1) opens automatically
4. Click **"Capture Photo"**
5. Review and submit

**What happens:**
- Visitor ID auto-generated: V001, V002, V003...
- Photo sent to AI service
- Face enrolled automatically
- Notification sent to host

#### 3.3 View Alerts
1. Navigate to: **Security → Alerts Dashboard**
2. See real-time alerts:
   - Geofence violations
   - Restricted zone entries
   - Unknown persons
   - Re-entry without exit
3. Auto-refreshes every 10 seconds

#### 3.4 Manage Cameras
1. Navigate to: **Security → Camera Management**
2. See all registered cameras
3. Start/Stop cameras with buttons
4. View system stats

---

## 📁 Files to Add to Your Project

### **React Components** (add to `new_svms/src/pages/`)
- `SecurityRegisterVisitor.jsx` (UPDATED - with camera capture)
- `SecurityAlertsDashboard.jsx` (NEW - view alerts)
- `SecurityCameraManagement.jsx` (NEW - manage cameras)

### **C# Backend** (add to `backend/Controllers/`)
- `VisitorsController.cs` (NEW - visitor + alerts endpoints)
- `CamerasController.cs` (INCLUDED in VisitorsController.cs)

### **Python AI Service** (already in `ai_service/`)
- `app.py` (UPDATED - Swagger UI disabled)
- `boundary_setup.py` (KEEP as separate tool)
- All other files unchanged

---

## 🔄 Complete Workflow Example

### **Scenario: Register and Monitor a Visitor**

```
Day 1 - Setup (ONE TIME):
├─ 1. Start all services (MongoDB, Python, C#, React)
├─ 2. Run: python boundary_setup.py --camera_id entrance_cam --source 1
├─ 3. Draw boundary, press 's' to save
└─ 4. Register camera via web app, click "Start"

Day 2 - Normal Operations (ALWAYS):
├─ 1. Open web app
├─ 2. Security registers visitor (auto ID: V001)
├─ 3. Webcam opens, captures photo
├─ 4. Visitor enrolled automatically
├─ 5. Camera detects visitor face
├─ 6. Tracks position relative to boundary
├─ 7. Alert if outside boundary >60s
└─ 8. Security sees alert in dashboard

Day 3+ - Just use the web app!
```

---

## 🎨 React Router Setup

Add these routes to your `App.js`:

```javascript
import SecurityRegisterVisitor from './pages/SecurityRegisterVisitor';
import SecurityAlertsDashboard from './pages/SecurityAlertsDashboard';
import SecurityCameraManagement from './pages/SecurityCameraManagement';

<Routes>
  <Route path="/security/register-visitor" element={<SecurityRegisterVisitor />} />
  <Route path="/security/alerts" element={<SecurityAlertsDashboard />} />
  <Route path="/security/cameras" element={<SecurityCameraManagement />} />
  {/* ... other routes ... */}
</Routes>
```

---

## 🔧 Configuration Summary

| Setting | Value | Where |
|---------|-------|-------|
| **Camera Source** | `1` (USB webcam) | Everywhere |
| **AI Service URL** | `http://localhost:8000` | C# controllers |
| **Backend URL** | `http://localhost:5260` | React components |
| **MongoDB URI** | `mongodb://localhost:27017` | Python app.py |
| **Visitor ID Format** | V001, V002, V003... | Auto-generated |
| **Swagger UI** | Disabled ✅ | app.py |
| **Boundary Tool** | Separate ✅ | Run once |

---

## ✅ Checklist Before Demo

- [ ] MongoDB running
- [ ] Python AI service running (port 8000)
- [ ] C# backend running (port 5260)
- [ ] React app running (port 3000)
- [ ] Boundary drawn (`boundary_setup.py` executed once)
- [ ] Camera registered via web app
- [ ] Camera started via web app
- [ ] Test visitor enrolled via web form
- [ ] Alerts appearing in dashboard

---

## 🐛 Troubleshooting

### **Issue: "Cannot connect to AI service"**
**Solution:** Check if Python service is running on port 8000
```bash
curl http://localhost:8000/health
```

### **Issue: "Webcam not opening in browser"**
**Solution:** Check browser permissions, use `https://` or `localhost`

### **Issue: "Visitor ID not auto-incrementing"**
**Solution:** Check if AI service `/visitors` endpoint is accessible

### **Issue: "Boundary not loading"**
**Solution:** Check if `boundaries/entrance_cam_boundary.json` exists

---

## 📊 API Endpoints Summary

### **From React → C# Backend**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/visitors/register` | POST | Register visitor + enroll face |
| `/api/visitors/alerts` | GET | Get all alerts |
| `/api/visitors/alerts/geofence` | GET | Get geofence alerts only |
| `/api/visitors/stats` | GET | Get system statistics |
| `/api/cameras/register` | POST | Register new camera |
| `/api/cameras/list` | GET | List all cameras |
| `/api/cameras/{id}/start` | POST | Start camera monitoring |
| `/api/cameras/{id}/stop` | POST | Stop camera monitoring |

### **From C# Backend → Python AI**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/enroll` | POST | Enroll visitor face |
| `/alerts` | GET | Get alerts |
| `/alerts/geofence` | GET | Get geofence alerts |
| `/visitors` | GET | Get enrolled visitors |
| `/stats` | GET | Get system stats |
| `/cameras/register` | POST | Register camera |
| `/cameras` | GET | List cameras |
| `/cameras/{id}/start` | POST | Start camera |
| `/cameras/{id}/stop` | POST | Stop camera |

---

## 🎯 Key Points to Remember

1. **boundary_setup.py is separate** — Run it ONCE, not via web app ✅
2. **NO Swagger UI** — Python service has NO UI ✅
3. **Everything via React** — Registration, alerts, camera management ✅
4. **Auto visitor IDs** — V001, V002, V003... automatically ✅
5. **Camera source = 1** — USB webcam everywhere ✅

---

## 🚀 You're Ready!

Your system is now fully integrated with ZERO command-line tools (except the one-time boundary setup). Everything is controlled through your React web app!

**Demo Flow:**
1. Open web app
2. Register visitor → camera opens → photo captured → enrolled automatically
3. Go to Camera Management → see camera status
4. Go to Alerts Dashboard → see real-time alerts
5. Impress your professors! 🎓

