# 📡 API Requirements Specification — Messwise

> **Frontend-Backend Contract derived from existing portal interactions and state operations.**  
> Documents all RESTful and WebSocket endpoints required to connect the Student Portal, Admin Portal, NGO Portal, and Unified Hub to the backend.

---

## 1. Authentication & User Profile Endpoints

### 1.1 User Login
* **Feature:** Role-based authentication (Student, Mess Admin, NGO Partner)
* **Endpoint:** `POST /api/v1/auth/login`
* **Request:**
  ```json
  {
    "email": "nitin.sharma@campus.edu",
    "password": "secure_password",
    "role": "student"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "usr-student-01",
      "name": "Nitin Sharma",
      "email": "nitin.sharma@campus.edu",
      "role": "student",
      "hostel_id": "h-hostel-a",
      "roll_no": "2022CSB042",
      "room": "B-304"
    }
  }
  ```
* **Authentication:** Public (None)
* **Database:** `User`, `StudentProfile`, `Hostel`
* **Errors:**
  - `400 Bad Request`: Invalid payload format or missing credentials
  - `401 Unauthorized`: Invalid email or password
* **Frontend Usage:** `index.html` role selection, `student-portal`, `admin-portal`, `ngo-portal` session init

---

### 1.2 Get Current User Profile
* **Feature:** Fetch active user profile, stats, and preferences
* **Endpoint:** `GET /api/v1/users/me`
* **Request:** None (Bearer token in `Authorization` header)
* **Response (200 OK):**
  ```json
  {
    "id": "usr-student-01",
    "name": "Nitin Sharma",
    "email": "nitin.sharma@campus.edu",
    "role": "student",
    "hostel": "Hostel A (Aryabhatta)",
    "room": "B-304",
    "diet": "Vegetarian",
    "meals_booked": 82,
    "meals_saved": 14,
    "co2_avoided_kg": 24.0,
    "eco_rank": 12,
    "notifications_enabled": true
  }
  ```
* **Authentication:** Required (`student` | `admin` | `ngo`)
* **Database:** `User`, `StudentProfile` / `MessAdminProfile` / `NgoProfile`
* **Errors:**
  - `401 Unauthorized`: Missing / expired token
  - `404 Not Found`: User not found
* **Frontend Usage:** `student-portal` (Dashboard header, Profile view), `admin-portal`, `ngo-portal`

---

### 1.3 Update User Preferences
* **Feature:** Update dietary choice and notification preferences
* **Endpoint:** `PATCH /api/v1/users/me/preferences`
* **Request:**
  ```json
  {
    "diet": "Vegetarian",
    "notifications_enabled": true
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Preferences updated successfully",
    "diet": "Vegetarian",
    "notifications_enabled": true
  }
  ```
* **Authentication:** Required (`student`)
* **Database:** `StudentProfile`
* **Errors:**
  - `400 Bad Request`: Invalid dietary option
  - `401 Unauthorized`: Unauthorized
* **Frontend Usage:** `student-portal/app.js` (Profile view - "Save Changes")

---

## 2. Student Portal Endpoints (RSVP, Meals & Feedback)

### 2.1 Get Daily Menu & Active Bookings
* **Feature:** Fetch scheduled meals and RSVP status for the student
* **Endpoint:** `GET /api/v1/student/meals/today`
* **Request:** None (Bearer token)
* **Response (200 OK):**
  ```json
  {
    "date": "2025-09-16",
    "hostel": "Hostel A",
    "meals": {
      "breakfast": {
        "session": "breakfast",
        "menu": "Poha + Milk + Banana",
        "time": "7:00 AM - 9:00 AM",
        "booked": true,
        "token": "BKF-892",
        "status": "Booked"
      },
      "lunch": {
        "session": "lunch",
        "menu": "Rajma + Jeera Rice + Roti + Salad",
        "time": "12:00 PM - 2:00 PM",
        "booked": true,
        "token": "LCH-419",
        "status": "Booked"
      },
      "dinner": {
        "session": "dinner",
        "menu": "Paneer Butter Masala + Roti + Dal",
        "time": "7:00 PM - 9:00 PM",
        "booked": false,
        "token": null,
        "status": "Not Booked"
      }
    }
  }
  ```
* **Authentication:** Required (`student`)
* **Database:** `MealSchedule`, `MealBooking`, `MenuCatalog`
* **Errors:**
  - `401 Unauthorized`: Missing or invalid token
* **Frontend Usage:** `student-portal/app.js` (Dashboard meal cards, Ticket modal)

---

### 2.2 Toggle Meal RSVP (Book / Cancel Meal)
* **Feature:** Student books or opts-out of a specific meal session
* **Endpoint:** `POST /api/v1/student/meals/toggle`
* **Request:**
  ```json
  {
    "meal_session": "dinner",
    "date": "2025-09-16"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "meal_session": "dinner",
    "booked": true,
    "status": "Booked",
    "token": "TK-DIN-843",
    "co2_avoided_kg": 24.3,
    "meals_booked": 83,
    "message": "Meal RSVP updated successfully"
  }
  ```
* **Authentication:** Required (`student`)
* **Database:** `MealBooking`, `StudentProfile`, `MealDemandAggregate`
* **Errors:**
  - `400 Bad Request`: Invalid session or cutoff window expired
  - `401 Unauthorized`: Token invalid
* **Frontend Usage:** `student-portal/app.js` (`toggleBooking`, `bookMealInstant`)

---

### 2.3 Get Student Bookings & History
* **Feature:** View past and upcoming meal bookings with digital QR/tokens
* **Endpoint:** `GET /api/v1/student/bookings/history`
* **Query Params:** `?filter=all|active|served|cancelled`
* **Request:** None
* **Response (200 OK):**
  ```json
  {
    "total": 5,
    "items": [
      { "id": "b-01", "date": "16 Sep 2025", "meal": "Breakfast", "item": "Poha + Milk", "status": "Served", "token": "QR-BKF-1609" },
      { "id": "b-02", "date": "16 Sep 2025", "meal": "Lunch", "item": "Rajma + Rice", "status": "Booked", "token": "QR-LCH-1609" }
    ]
  }
  ```
* **Authentication:** Required (`student`)
* **Database:** `MealBooking`, `MenuCatalog`
* **Errors:**
  - `401 Unauthorized`: Unauthorized
* **Frontend Usage:** `student-portal/app.js` (My Bookings view)

---

### 2.4 Submit Meal Feedback & Rating
* **Feature:** Rate daily meal quality and submit suggestions to mess staff
* **Endpoint:** `POST /api/v1/student/feedback`
* **Request:**
  ```json
  {
    "meal_session": "lunch",
    "rating": 5,
    "comment": "Rajma was very well cooked today, perfect spice balance!"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "fb-901",
    "message": "Feedback submitted successfully to kitchen supervisor",
    "submitted_at": "2025-09-16T13:45:00Z"
  }
  ```
* **Authentication:** Required (`student`)
* **Database:** `MealFeedback`
* **Errors:**
  - `400 Bad Request`: Missing comment or invalid star rating (1-5)
  - `401 Unauthorized`: Unauthorized
* **Frontend Usage:** `student-portal/app.js` (Feedback modal & rating form)

---

## 3. Mess / Admin Portal Endpoints (Forecasting, Waste & Surplus Broadcast)

### 3.1 Get Admin Dashboard Stats
* **Feature:** Fetch daily operational summary (Prepared, Served, Surplus, Plate Waste)
* **Endpoint:** `GET /api/v1/admin/dashboard/stats`
* **Request:** None
* **Response (200 OK):**
  ```json
  {
    "mess_name": "Hostel A - Aryabhatta Central Mess",
    "supervisor": "Rajesh Kumar",
    "date": "Tue, 16 Sep 2025",
    "today_stats": {
      "prepared": 842,
      "served": 817,
      "surplus": 25,
      "waste": 6
    },
    "registered_boarders": 650,
    "active_rsvps": 598
  }
  ```
* **Authentication:** Required (`admin`)
* **Database:** `DailyProductionLog`, `MessAdminProfile`, `MealBooking`
* **Errors:**
  - `401 Unauthorized` / `403 Forbidden`: Insufficient role
* **Frontend Usage:** `admin-portal/app.js` (Dashboard 4 KPI cards)

---

### 3.2 AI Meal Demand Prediction
* **Feature:** Machine learning prediction for tomorrow's cook requirements
* **Endpoint:** `POST /api/v1/admin/forecast/predict`
* **Request:**
  ```json
  {
    "hostel_id": "h-hostel-a",
    "target_date": "2025-09-17",
    "day_of_week": "wed",
    "meal_session": "Lunch",
    "turnout_ratio": 0.92,
    "exam_season": false,
    "holiday_factor": false,
    "weather": "clear",
    "menu_id": "m-rajma"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "target_date": "Tomorrow (Wed, 17 Sep 2025)",
    "expected_demand": 560,
    "recommended_cook": 575,
    "buffer_margin_percent": 2.6,
    "waste_risk": "Low",
    "confidence_percent": 94.2,
    "insights": [
      "Turnout Ratio Calibrated: 92% (598 boarders active).",
      "Wednesday attendance peaks at dinner (+8%).",
      "External Signals: Normal semester schedule | Pleasant weather.",
      "Safe Buffer: +15 portions to ensure 0 student meal run-outs."
    ]
  }
  ```
* **Authentication:** Required (`admin`)
* **Database / ML Model:** `HistoricalAttendance`, Scikit-learn regression model
* **Errors:**
  - `400 Bad Request`: Invalid parameters
  - `401 Unauthorized`: Unauthorized
* **Frontend Usage:** `admin-portal/app.js` (AI Prediction View & dynamic sliders)

---

### 3.3 Log Daily Batch Production & Waste
* **Feature:** Record prepared, served, unserved leftover, and plate waste
* **Endpoint:** `POST /api/v1/admin/production/log`
* **Request:**
  ```json
  {
    "meal_session": "Lunch",
    "prepared_qty": 842,
    "served_qty": 817,
    "waste_qty": 6,
    "notes": "Optimal turnout"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "prod-log-501",
    "prepared": 842,
    "served": 817,
    "surplus": 25,
    "waste": 6,
    "logged_at": "2025-09-16T14:30:00Z"
  }
  ```
* **Authentication:** Required (`admin`)
* **Database:** `DailyProductionLog`
* **Errors:**
  - `400 Bad Request`: `served_qty` exceeds `prepared_qty`
  - `401 Unauthorized`: Unauthorized
* **Frontend Usage:** `admin-portal/app.js` (Batch Production Logger)

---

### 3.4 Publish FSSAI Verified Surplus Batch
* **Feature:** Broadcast surplus food batch to verified NGO network
* **Endpoint:** `POST /api/v1/admin/surplus/publish`
* **Request:**
  ```json
  {
    "title": "Rajma Rice",
    "meals": 25,
    "hostel": "Hostel A",
    "location_detail": "Hostel A Dining Hall, Counter 2",
    "temp_celsius": 68,
    "prep_time": "12:15 PM today",
    "pickup_deadline": "4:00 PM",
    "storage_condition": "Insulated Stainless Steel Warmer",
    "food_type": "Cooked Main Course (Vegetarian)",
    "dietary": "Vegetarian",
    "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "surplus-992",
    "title": "Rajma Rice",
    "meals": 25,
    "status": "Published",
    "fssai_safety_passed": true,
    "pickup_otp": "7412",
    "published_at": "2025-09-16T14:40:00Z"
  }
  ```
* **Authentication:** Required (`admin`)
* **Database:** `SurplusListing`
* **Errors:**
  - `400 Bad Request`: Temperature below FSSAI safety threshold (< 60°C for hot food)
  - `401 Unauthorized`: Unauthorized
* **Frontend Usage:** `admin-portal/app.js` (Publish Surplus Form)

---

### 3.5 Approve NGO Surplus Request
* **Feature:** Mess admin approves pending pickup request from an NGO
* **Endpoint:** `POST /api/v1/admin/requests/{request_id}/approve`
* **Request:** None
* **Response (200 OK):**
  ```json
  {
    "request_id": "req-101",
    "status": "Approved",
    "message": "Request approved. Pickup marked Ready for Collection."
  }
  ```
* **Authentication:** Required (`admin`)
* **Database:** `SurplusRequest`, `SurplusListing`
* **Errors:**
  - `404 Not Found`: Request not found
  - `400 Bad Request`: Request already processed
* **Frontend Usage:** `admin-portal/app.js` (`approveRequest`)

---

### 3.6 Confirm Food Handover via OTP Verification
* **Feature:** Mess supervisor inputs 4-digit OTP provided by NGO driver at handover counter
* **Endpoint:** `POST /api/v1/admin/handover/verify`
* **Request:**
  ```json
  {
    "request_id": "req-101",
    "otp": "7412"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "request_id": "req-101",
    "status": "Collected",
    "meals_handed_over": 25,
    "message": "Successfully verified! 25 meals handed over for redistribution."
  }
  ```
* **Authentication:** Required (`admin`)
* **Database:** `SurplusRequest`, `SurplusListing`, `DistributionHistory`
* **Errors:**
  - `400 Bad Request`: Incorrect OTP
  - `404 Not Found`: Request not found
* **Frontend Usage:** `admin-portal/app.js` (Handover OTP Modal)

---

## 4. NGO Food Rescue Portal Endpoints (Claims, Pickups & Impact)

### 4.1 Get Live Surplus Food Feed
* **Feature:** Real-time list of all available surplus food donations across campus
* **Endpoint:** `GET /api/v1/ngo/surplus/available`
* **Query Params:** `?dietary=Vegetarian&status=Published`
* **Request:** None
* **Response (200 OK):**
  ```json
  {
    "count": 4,
    "items": [
      {
        "id": "surplus-1",
        "title": "Rajma Rice",
        "meals": 25,
        "hostel": "Hostel A",
        "location_detail": "Hostel A Dining Hall, Counter 2",
        "distance_km": 2.3,
        "pickup_deadline": "4:00 PM",
        "time_remaining": "1h 45m left",
        "status": "Published",
        "temp_celsius": 64,
        "storage_condition": "Insulated Stainless Steel Warmer",
        "food_type": "Cooked Main Course (Vegetarian)",
        "dietary": "Vegetarian",
        "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80"
      }
    ]
  }
  ```
* **Authentication:** Required (`ngo`)
* **Database:** `SurplusListing`
* **Errors:**
  - `401 Unauthorized`: Unauthorized
* **Frontend Usage:** `ngo-portal/app.js` (Dashboard surplus feed & catalog tab)

---

### 4.2 Submit 1-Click Surplus Request
* **Feature:** NGO claims a surplus batch and designates volunteer & pickup ETA
* **Endpoint:** `POST /api/v1/ngo/surplus/{surplus_id}/request`
* **Request:**
  ```json
  {
    "volunteer_name": "Rakesh Verma",
    "vehicle": "Electric Van (DL-04-EV-8821)",
    "eta": "Within 30 mins"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "request_id": "req-101",
    "surplus_id": "surplus-1",
    "food_title": "Rajma Rice",
    "meals": 25,
    "status": "Pending Approval",
    "otp": "7412",
    "message": "Request submitted to Mess Admin. Present OTP 7412 at counter."
  }
  ```
* **Authentication:** Required (`ngo`)
* **Database:** `SurplusRequest`, `SurplusListing`
* **Errors:**
  - `400 Bad Request`: Surplus batch already claimed or expired
  - `404 Not Found`: Surplus batch not found
* **Frontend Usage:** `ngo-portal/app.js` (1-Click Claim Modal)

---

### 4.3 Get NGO Requests & Active Pickups
* **Feature:** Track status of all pending, approved, and transit requests
* **Endpoint:** `GET /api/v1/ngo/requests`
* **Request:** None
* **Response (200 OK):**
  ```json
  {
    "total": 3,
    "requests": [
      {
        "id": "req-101",
        "surplus_id": "surplus-1",
        "food_title": "Rajma Rice",
        "meals": 25,
        "hostel": "Hostel A",
        "volunteer_name": "Rakesh Verma",
        "vehicle": "Electric Van (DL-04-EV-8821)",
        "requested_at": "1:40 PM",
        "status": "Approved",
        "pickup_time_estimated": "3:15 PM",
        "otp": "7412"
      }
    ]
  }
  ```
* **Authentication:** Required (`ngo`)
* **Database:** `SurplusRequest`
* **Errors:**
  - `401 Unauthorized`: Unauthorized
* **Frontend Usage:** `ngo-portal/app.js` (My Requests & Pickups tabs)

---

### 4.4 Log Beneficiary Distribution Proof
* **Feature:** Record delivered meals, location, and beneficiary count after food rescue
* **Endpoint:** `POST /api/v1/ngo/distribution/log`
* **Request:**
  ```json
  {
    "food_title": "Rajma Rice",
    "beneficiaries_served": 25,
    "location": "Kalyanpuri Labor Shelter",
    "notes": "Distributed hot meals safely"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "dist-301",
    "food_title": "Rajma Rice",
    "beneficiaries_served": 25,
    "location": "Kalyanpuri Labor Shelter",
    "delivered_at": "2025-09-16T16:30:00Z",
    "co2_diverted_kg": 11.25,
    "proof_status": "Verified"
  }
  ```
* **Authentication:** Required (`ngo`)
* **Database:** `DistributionRecord`, `NgoProfile`, `EcosystemStats`
* **Errors:**
  - `400 Bad Request`: Missing location or invalid count (< 1)
  - `401 Unauthorized`: Unauthorized
* **Frontend Usage:** `ngo-portal/app.js` (Distribution Log tab)

---

## 5. Real-Time WebSocket Channel (Optional / Recommended)

* **Endpoint:** `WS /api/v1/ws/live`
* **Events Emitted:**
  - `SURPLUS_PUBLISHED`: Broadcast to connected NGOs when new edible batch is listed.
  - `SURPLUS_REQUESTED`: Broadcast to Mess Admin when an NGO claims a batch.
  - `HANDOVER_COMPLETED`: Update live counter across Student, Admin, and NGO dashboards.
* **Authentication:** Query token `?token=...`
