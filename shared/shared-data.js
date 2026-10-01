/**
 * Messwise - Unified Reactive Data Store
 * Keeps Student, Mess Admin, and NGO Partner portals in sync via localStorage.
 */

(function(root) {
  'use strict';

  const STORAGE_KEY = 'messwise_shared_state_v1';

  // Realistic Initial Mock Data matching infographics
  const DEFAULT_STATE = {
    // Current Student Profile (Nitin)
    student: {
      name: "Nitin Sharma",
      email: "nitin.sharma@campus.edu",
      rollNo: "2022CSB042",
      hostel: "Hostel A (Aryabhatta)",
      room: "B-304",
      avatar: "👨‍🎓",
      mealsBooked: 82,
      mealsSaved: 14,
      co2AvoidedKg: 24,
      rank: 12,
      diet: "Vegetarian",
      notifications: true,
      todayBookings: {
        breakfast: { booked: true, menu: "Poha + Milk + Banana", time: "7:00 AM - 9:00 AM", status: "Booked", token: "BKF-892" },
        lunch: { booked: true, menu: "Rajma + Jeera Rice + Roti + Salad", time: "12:00 PM - 2:00 PM", status: "Booked", token: "LCH-419" },
        dinner: { booked: false, menu: "Paneer Butter Masala + Roti + Dal", time: "7:00 PM - 9:00 PM", status: "Not Booked", token: null }
      }
    },

    // Current Mess / Admin Context
    messAdmin: {
      messName: "Hostel A - Aryabhatta Central Mess",
      supervisor: "Rajesh Kumar",
      date: "Tue, 16 Sep 2025",
      todayStats: {
        prepared: 842,
        served: 817,
        surplus: 25,
        waste: 6
      },
      aiPrediction: {
        targetDate: "Tomorrow (Wed, 17 Sep 2025)",
        expectedDemand: 560,
        recommendedCook: 575,
        wasteRisk: "Low",
        confidence: 94.2,
        factors: {
          examSeason: false,
          holidayFactor: false,
          weather: "Clear / Pleasant",
          dayOfWeek: "Wednesday",
          historicalAttendanceRatio: 0.92
        },
        insights: [
          "Wednesday attendance peaks at dinner (+8%).",
          "No mid-term exams scheduled for tomorrow.",
          "Buffer margin calculated at +2.6% over registered bookings."
        ]
      }
    },

    // Current NGO Partner Context (Helping Hands NGO)
    ngoPartner: {
      id: "ngo-helping-hands",
      name: "Helping Hands NGO",
      tagline: "Together we can eliminate hunger",
      contactPerson: "Dr. Sunita Rao",
      phone: "+91 98450 12345",
      fssaiVerified: true,
      stats: {
        availableDonations: 18,
        pendingRequests: 4,
        todaysPickups: 3,
        peopleServed: 184,
        totalMealsRescued: 4320,
        co2DivertedKg: 648
      }
    },

    // Available Surplus Food Listings (Shared across Admin & NGO)
    surplusListings: [
      {
        id: "surplus-1",
        title: "Rajma Rice",
        meals: 25,
        hostel: "Hostel A",
        locationDetail: "Hostel A Dining Hall, Counter 2",
        distanceKm: 2.3,
        pickupDeadline: "4:00 PM",
        timeRemaining: "1h 45m left",
        status: "Published", // Published, Requested, PickedUp, Distributed
        prepTime: "12:15 PM today",
        tempCelsius: 64,
        storageCondition: "Insulated Stainless Steel Warmer",
        foodType: "Cooked Main Course (Vegetarian)",
        fssaiSafetyPassed: true,
        dietary: "Vegetarian",
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
        requestedByNgo: null,
        pickupOtp: "7412",
        distributionProof: null
      },
      {
        id: "surplus-2",
        title: "Roti + Dal Makhani",
        meals: 40,
        hostel: "Hostel B",
        locationDetail: "Hostel B Kitchen Bay, Gate 3",
        distanceKm: 3.1,
        pickupDeadline: "5:00 PM",
        timeRemaining: "2h 45m left",
        status: "Published",
        prepTime: "1:00 PM today",
        tempCelsius: 68,
        storageCondition: "Insulated Casseroles",
        foodType: "Cooked Bread & Gravy (Vegetarian)",
        fssaiSafetyPassed: true,
        dietary: "Vegetarian",
        imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80",
        requestedByNgo: null,
        pickupOtp: "3829",
        distributionProof: null
      },
      {
        id: "surplus-3",
        title: "Veg Dum Biryani + Raita",
        meals: 30,
        hostel: "Hostel A",
        locationDetail: "Hostel A Dining Hall, Counter 1",
        distanceKm: 2.8,
        pickupDeadline: "3:30 PM",
        timeRemaining: "1h 15m left",
        status: "Published",
        prepTime: "12:30 PM today",
        tempCelsius: 70,
        storageCondition: "Thermal Insulated Food Drum",
        foodType: "Rice Preparation (Vegetarian)",
        fssaiSafetyPassed: true,
        dietary: "Vegetarian",
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80",
        requestedByNgo: null,
        pickupOtp: "9104",
        distributionProof: null
      },
      {
        id: "surplus-4",
        title: "Mixed Seasonal Sabzi + Paratha",
        meals: 20,
        hostel: "Hostel C (Girls Wing)",
        locationDetail: "Block 2 Dining Hall",
        distanceKm: 1.8,
        pickupDeadline: "5:30 PM",
        timeRemaining: "3h 15m left",
        status: "Published",
        prepTime: "1:15 PM today",
        tempCelsius: 65,
        storageCondition: "Hot Case Stainless Steel",
        foodType: "Fresh Vegetables & Wheat Bread",
        fssaiSafetyPassed: true,
        dietary: "Vegetarian",
        imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80",
        requestedByNgo: null,
        pickupOtp: "5512",
        distributionProof: null
      }
    ],

    // Active NGO Requests
    requests: [
      {
        id: "req-101",
        surplusId: "surplus-1",
        foodTitle: "Rajma Rice",
        meals: 25,
        hostel: "Hostel A",
        ngoName: "Helping Hands NGO",
        volunteerName: "Rakesh Verma",
        vehicle: "Electric Van (DL-04-EV-8821)",
        requestedAt: "1:40 PM",
        status: "Approved", // Pending, Approved, In-Transit, Completed
        pickupTimeEstimated: "3:15 PM",
        otp: "7412"
      }
    ],

    // History of student meal bookings
    studentBookingsHistory: [
      { id: "b-01", date: "16 Sep 2025", meal: "Breakfast", item: "Poha + Milk", status: "Served", qr: "QR-BKF-1609" },
      { id: "b-02", date: "16 Sep 2025", meal: "Lunch", item: "Rajma + Rice", status: "Booked", qr: "QR-LCH-1609" },
      { id: "b-03", date: "15 Sep 2025", meal: "Dinner", item: "Dal Tadka + Roti", status: "Served", qr: "QR-DIN-1509" },
      { id: "b-04", date: "15 Sep 2025", meal: "Lunch", item: "Chole Bhature", status: "Served", qr: "QR-LCH-1509" },
      { id: "b-05", date: "14 Sep 2025", meal: "Dinner", item: "Veg Pulao + Kadhi", status: "Served", qr: "QR-DIN-1409" }
    ],

    // Completed Distributions
    distributions: [
      {
        id: "dist-201",
        foodTitle: "Kadhi Pakoda + Rice",
        meals: 35,
        beneficiariesServed: 35,
        location: "Kalyanpuri Labor Shelter",
        deliveredAt: "Yesterday, 4:30 PM",
        ngoName: "Helping Hands NGO",
        proofStatus: "Verified"
      },
      {
        id: "dist-202",
        foodTitle: "Dal Palak + Chapati",
        meals: 50,
        beneficiariesServed: 50,
        location: "Railway Colony Community Center",
        deliveredAt: "14 Sep, 5:00 PM",
        ngoName: "Helping Hands NGO",
        proofStatus: "Verified"
      }
    ]
  };

  class MesswiseStore {
    constructor() {
      this.listeners = [];
      this.state = this.load();
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.state = this.load();
          this.notify();
        }
      });
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err) {
        console.warn('Failed to parse localStorage state:', err);
      }
      this.save(DEFAULT_STATE);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }

    save(newState) {
      this.state = newState;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      this.notify();
    }

    getState() {
      return this.state;
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    notify() {
      this.listeners.forEach(fn => {
        try { fn(this.state); } catch (e) { console.error(e); }
      });
    }

    // --- Actions ---

    // 1. Student toggles meal booking
    toggleMealBooking(mealType) {
      const state = this.getState();
      const current = state.student.todayBookings[mealType];
      if (!current) return;

      const isNowBooked = !current.booked;
      current.booked = isNowBooked;
      current.status = isNowBooked ? "Booked" : "Not Booked";
      current.token = isNowBooked ? `TK-${mealType.substring(0,3).toUpperCase()}-${Math.floor(100 + Math.random()*900)}` : null;

      if (isNowBooked) {
        state.student.mealsBooked += 1;
        state.student.co2AvoidedKg = Math.round((state.student.co2AvoidedKg + 0.3) * 10) / 10;
        state.messAdmin.aiPrediction.expectedDemand += 1;
        state.studentBookingsHistory.unshift({
          id: `b-${Date.now()}`,
          date: "16 Sep 2025",
          meal: mealType.charAt(0).toUpperCase() + mealType.slice(1),
          item: current.menu,
          status: "Booked",
          qr: `QR-${current.token}`
        });
      } else {
        state.student.mealsBooked = Math.max(0, state.student.mealsBooked - 1);
        state.messAdmin.aiPrediction.expectedDemand = Math.max(0, state.messAdmin.aiPrediction.expectedDemand - 1);
      }

      this.save(state);
      return current;
    }

    // 2. Mess Admin Publishes Surplus Food
    publishSurplusItem(item) {
      const state = this.getState();
      const newItem = {
        id: `surplus-${Date.now()}`,
        title: item.title,
        meals: parseInt(item.meals, 10) || 20,
        hostel: item.hostel || state.messAdmin.messName.split(' - ')[0],
        locationDetail: item.locationDetail || "Dining Hall Counter 1",
        distanceKm: (2.0 + Math.random() * 1.5).toFixed(1),
        pickupDeadline: item.pickupDeadline || "5:00 PM",
        timeRemaining: "3h left",
        status: "Published",
        prepTime: item.prepTime || "Just now",
        tempCelsius: parseInt(item.tempCelsius, 10) || 68,
        storageCondition: item.storageCondition || "Insulated Warmer",
        foodType: item.foodType || "Fresh Cooked Food",
        fssaiSafetyPassed: true,
        dietary: item.dietary || "Vegetarian",
        imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
        requestedByNgo: null,
        pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        distributionProof: null
      };

      state.surplusListings.unshift(newItem);
      state.messAdmin.todayStats.surplus += newItem.meals;
      state.ngoPartner.stats.availableDonations += 1;

      this.save(state);
      return newItem;
    }

    // 3. NGO Requests Food
    requestSurplus(surplusId, requestDetails) {
      const state = this.getState();
      const listing = state.surplusListings.find(s => s.id === surplusId);
      if (!listing || listing.status !== "Published") return null;

      listing.status = "Requested";
      listing.requestedByNgo = state.ngoPartner.name;

      const newReq = {
        id: `req-${Date.now()}`,
        surplusId: listing.id,
        foodTitle: listing.title,
        meals: listing.meals,
        hostel: listing.hostel,
        ngoName: state.ngoPartner.name,
        volunteerName: requestDetails.volunteerName || "Anjali Gupta",
        vehicle: requestDetails.vehicle || "Insulated Van (DL-02-B-9910)",
        requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Pending Approval",
        pickupTimeEstimated: requestDetails.eta || "Within 45 mins",
        otp: listing.pickupOtp
      };

      state.requests.unshift(newReq);
      state.ngoPartner.stats.pendingRequests += 1;
      this.save(state);
      return newReq;
    }

    // 4. Mess Admin Approves / Handover Verified
    approveRequest(requestId) {
      const state = this.getState();
      const req = state.requests.find(r => r.id === requestId);
      if (req) {
        req.status = "Approved";
        const listing = state.surplusListings.find(s => s.id === req.surplusId);
        if (listing) listing.status = "Ready For Pickup";
        this.save(state);
      }
    }

    // 5. Handover Completed (OTP Verification)
    confirmHandover(requestId, enteredOtp) {
      const state = this.getState();
      const req = state.requests.find(r => r.id === requestId);
      if (!req) return { success: false, message: "Request not found" };

      if (req.otp !== enteredOtp) {
        return { success: false, message: "Incorrect OTP! Verification failed." };
      }

      req.status = "Collected";
      const listing = state.surplusListings.find(s => s.id === req.surplusId);
      if (listing) listing.status = "PickedUp";

      state.ngoPartner.stats.pendingRequests = Math.max(0, state.ngoPartner.stats.pendingRequests - 1);
      state.ngoPartner.stats.todaysPickups += 1;
      state.messAdmin.todayStats.surplus = Math.max(0, state.messAdmin.todayStats.surplus - req.meals);

      this.save(state);
      return { success: true, message: `Successfully verified! ${req.meals} meals handed over for redistribution.` };
    }

    // 6. NGO logs distribution proof
    logDistribution(data) {
      const state = this.getState();
      const newDist = {
        id: `dist-${Date.now()}`,
        foodTitle: data.foodTitle,
        meals: parseInt(data.beneficiaries, 10) || 25,
        beneficiariesServed: parseInt(data.beneficiaries, 10) || 25,
        location: data.location || "Community Shelter",
        deliveredAt: "Just now",
        ngoName: state.ngoPartner.name,
        proofStatus: "Verified"
      };

      state.distributions.unshift(newDist);
      state.ngoPartner.stats.peopleServed += newDist.beneficiariesServed;
      state.ngoPartner.stats.totalMealsRescued += newDist.meals;
      state.ngoPartner.stats.co2DivertedKg += Math.round(newDist.meals * 0.45);
      state.student.mealsSaved += 1;

      this.save(state);
      return newDist;
    }

    // Reset to defaults
    reset() {
      this.save(JSON.parse(JSON.stringify(DEFAULT_STATE)));
    }
  }

  // Expose singleton on window
  root.MesswiseStore = new MesswiseStore();

})(typeof window !== 'undefined' ? window : this);
