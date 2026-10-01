# 🍱 Messwise — Campus Food Ecosystem Hub

> **Unified Smart Food-Waste Management Ecosystem** connecting Students, Mess Supervisors, and Verified NGOs.

---

## 🌟 Overview

**Messwise** is an integrated platform designed to tackle food waste in institutional campus messes and hostels. By bridging the communication gap between dining students, mess operations staff, and local food rescue NGOs, Messwise ensures accurate meal forecasting, transparent waste tracking, and fast redistribution of surplus food.

---

## 🚀 Portals & Modules

The platform is split into three interconnected frontend portals:

1. **🎓 Student Portal** (`/student-portal`)
   - **Meal RSVP & Opt-outs:** Signal meal attendance in advance to reduce over-preparation.
   - **Daily Menu & Rating:** View scheduled items and submit dish feedback.
   - **Green Impact Score:** Gamified eco-rewards, streaks, and waste awareness metrics.

2. **🛠️ Admin / Mess Supervisor Portal** (`/admin-portal`)
   - **Attendance & Demand Forecast:** Real-time preparation estimates based on RSVP data.
   - **Daily Waste Analytics:** Record food surplus, unserved prep, and plate waste with visual charts.
   - **One-Click Surplus Broadcast:** Instantly notify verified NGOs when surplus edible food is available.

3. **🤝 NGO Food Rescue Portal** (`/ngo-portal`)
   - **Live Surplus Feeds:** Real-time notification of available surplus meals across campus dining halls.
   - **Claim & Dispatch:** Claim food allotments, schedule volunteer pickup windows, and track distribution.
   - **Impact Logging:** Log beneficiaries fed and total kilograms rescued.

4. **🌐 Unified Hub (`/index.html`)**
   - Quick launcher and overview linking all three portals together.

---

## 💻 Tech Stack

- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Design System:** Custom CSS variables, responsive typography (Outfit & Plus Jakarta Sans), micro-interactions
- **Data Layer:** Centralized state and shared mock models (`/shared/shared-data.js` and `data.js`)

---

## 🏃 Getting Started

No build tools or installations required!

1. Clone or download this repository:
   ```bash
   git clone https://github.com/pasta-07/Messwise.git
   cd Messwise
   ```

2. Open `index.html` in any modern web browser, or serve with a lightweight local server:
   ```bash
   # Using VS Code: Right-click index.html -> "Open with Live Server"
   # Or using Python:
   python -m http.server 8000
   ```
