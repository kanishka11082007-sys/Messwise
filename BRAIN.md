# 🧠 BRAIN.md — Messwise Engineering Context

> **Central engineering context and architectural reference for Messwise.**  
> Consult this file first to understand the system design, current implementation state, and technical roadmaps without scanning the entire codebase.

---

## 1. PROJECT OVERVIEW

* **Project Name:** Messwise (Campus Food Ecosystem Hub)
* **Project Purpose:** A unified smart food-waste management ecosystem that bridges dining students, mess administration/supervisors, and verified food-rescue NGOs to minimize kitchen waste, optimize meal prep, and redistribute surplus food.
* **Current Development Stage:** Complete Intelligent Closed-Loop Food Management Ecosystem (PREDICT → PREVENT → MEASURE → RESCUE → VERIFY → LEARN).
* **Main Users / Roles:**
  1. **Students (`student-portal`):** Meal RSVP & smart opt-out deadlines, digital pass QR, multi-criteria feedback, and personal food impact tracking.
  2. **Mess Supervisors / Admins (`admin-portal`):** Calibrated demand forecasting with explainable signals, What-If simulator, batch production & 3-tier structured waste logging, 7x3 waste heatmap, surplus broadcast, and OTP handover verification.
  3. **Verified Food Rescue NGOs (`ngo-portal`):** Shelter demand registration, explainable smart matching, concurrency-safe claims, pickup tracking, OTP handover, and beneficiary distribution logging.
* **Main Business Objective:** Eliminate institutional campus food waste, optimize kitchen preparation quantities using demand prediction, and redistribute surplus edible food to local charities and vulnerable communities.

---

## 2. CURRENT TECHNOLOGY STACK

*(Detected and confirmed in the repository)*

* **Frontend Framework:** React.js (v18.3+), React Router v6, Axios
* **Build Tool:** Vite (v5.4+)
* **Styling:** Custom Botanical Design System (Vanilla CSS tokens, tactile pill buttons, card elevations)
* **Typography:** Google Fonts (`Outfit`, `Plus Jakarta Sans`)
* **UI & Icons:** Lucide React icons, Canvas Confetti (micro-interactions), Organic hand-crafted UI (No generic AI templates)
* **State Management:** React Context API (`MesswiseContext`) + Background FastAPI REST Synchronization
* **API / Client:** Axios client with JWT bearer interceptors (`frontend/src/api/client.js`)
* **Backend Technology:** Python 3.14, FastAPI (v0.115+), Uvicorn
* **Database:** SQLite / PostgreSQL with async SQLAlchemy ORM and Alembic migrations
* **Authentication:** JWT Bearer tokens with role-based access control (Student, Admin, NGO)
* **ML / AI:** `MealDemandForecastEngine` (Python scikit-learn/numpy turnout regression & insights)
* **Deployment / Configuration:** Git, `.gitignore`, local static servers (`python -m http.server` / VS Code Live Server)

---

## 3. TARGET ARCHITECTURE

### PROPOSED BACKEND ARCHITECTURE

#### Frontend (Target Evolution)
* **Core Framework:** React.js
* **Build Tool:** Vite
* **Routing:** React Router
* **API Client:** Axios
* **Styling Approach:** Existing curated CSS token system and custom variables
* **UI & Animations:** Existing CSS micro-animations and component styles

#### Backend (Target Specification)
* **Language & Runtime:** Python 3.10+
* **Web Framework:** FastAPI (high-performance async ASGI framework with automated OpenAPI/Swagger docs)
* **Database:** PostgreSQL (relational storage for users, messes, meals, RSVPs, surplus listings, and claims)
* **ORM:** SQLAlchemy (async ORM) with Alembic for database migrations
* **Data Validation & Schemas:** Pydantic v2
* **Authentication & Authorization:** JWT (JSON Web Tokens) with password hashing (bcrypt) and role-based access control (Student, Mess Admin, NGO Partner)
* **Caching & Message Broker:** Redis (only for real-time surplus notifications, caching heavy forecast analytics, and background dispatch worker queues)

#### AI / ML (Target Specification)
* **Runtime:** Python
* **Data Processing:** Pandas, NumPy (historical meal attendance, opt-out rates, calendar & weather correlation)
* **Machine Learning:** Scikit-learn (predictive regression/classification models for daily mess attendance and meal prep recommendation)
* **Scope:** Dedicated predictive service module callable via FastAPI endpoints.

#### Infrastructure & Ops (Target Specification)
* **Containerization:** Docker & Docker Compose (FastAPI, PostgreSQL, Redis)
* **Configuration:** Environment variables (`.env`) for secrets, database URLs, and environment toggles.

---

## 4. PROJECT STRUCTURE

```text
Messwise/
├── package.json            # Root convenience runner (dev:student, dev:admin, dev:ngo)
├── student-portal/         # Standalone React + Vite App (Port 3001)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/client.js
│       └── components/ (Sidebar, StatsCard, TicketModal)
├── admin-portal/           # Standalone React + Vite App (Port 3002)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/client.js
│       └── components/ (Sidebar, StatsCard, HandoverModal)
├── ngo-portal/             # Standalone React + Vite App (Port 3003)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/client.js
│       └── components/ (Sidebar, StatsCard, RequestModal)
├── frontend/               # Unified All-in-One React + Vite App (Port 5173)
├── backend/                # Python FastAPI Backend (Port 8000)
│   ├── app/ (main.py, api/, models/, schemas/, services/, db/, ml/)
│   └── tests/
└── shared/                 # Shared API client utilities
```

### Directory Responsibilities

* **`student-portal/`**: Handles student-facing interactions including meal opt-ins/opt-outs, daily menu browsing, meal quality ratings, and gamified sustainability badges.
* **`admin-portal/`**: Equips mess supervisors with attendance forecasts, daily plate/prep waste logging, analytics charts, and instant surplus food broadcasting to NGOs.
* **`ngo-portal/`**: Enables verified NGO food rescue workers to view available donations, claim portions, manage pickup timelines, and record beneficiaries served.
* **`shared/`**: Contains the cross-portal state synchronization layer and shared domain data models.

---

## 5. ARCHITECTURE RULES

1. **Modularity:** Keep modules, routes, and components small, self-contained, and single-purpose.
2. **Simplicity Over Abstraction:** Choose direct, readable solutions over deep inheritance or complex design patterns.
3. **Reuse Existing Patterns:** Reuse design tokens, utility functions, and established data models rather than creating duplicates.
4. **No Code Duplication:** Centralize shared business logic, types, and schema validators.
5. **Preserve Working Code:** Do not rewrite or refactor functioning features without an explicit requirement or architectural necessity.
6. **Mindful Dependency Management:** Do not introduce third-party libraries when built-in tools or existing dependencies solve the problem. Adopt external packages only when they eliminate significant boilerplate or bolster reliability.
7. **Clean & Purposeful Comments:** Avoid stating the obvious; use comments strictly to document non-obvious design choices, business rules, or edge cases.
8. **Clear & Consistent Naming:** Use domain-specific, consistent naming conventions across endpoints, variables, and components (`student`, `messAdmin`, `ngoPartner`, `surplusListing`).
9. **Strict Separation of Concerns:** Keep frontend presentation decoupled from backend business logic and database access layers.
