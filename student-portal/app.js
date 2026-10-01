/**
 * Messwise - Student Portal Logic
 * Syncs seamlessly with MesswiseStore for real-time multi-portal simulation.
 */

(function() {
  'use strict';

  // Fallback if accessed standalone
  if (!window.MesswiseStore) {
    console.warn('MesswiseStore not detected, using local mock');
  }

  const App = {
    currentView: 'dashboard',
    selectedFilter: 'all',

    init() {
      this.bindElements();
      this.bindEvents();
      this.render();

      // Subscribe to cross-tab / shared state changes
      if (window.MesswiseStore) {
        window.MesswiseStore.subscribe(() => {
          this.render();
        });
      }
    },

    bindElements() {
      // Navigation
      this.navButtons = document.querySelectorAll('.sidebar-nav .nav-item');
      this.viewPanels = document.querySelectorAll('.view-panel');
      this.sidebar = document.getElementById('sidebar');
      this.sidebarBackdrop = document.getElementById('sidebar-backdrop');
      this.btnSidebarOpen = document.getElementById('btn-sidebar-open');
      this.btnSidebarClose = document.getElementById('btn-sidebar-close');

      // Meal toggle buttons
      this.btnToggleBreakfast = document.getElementById('btn-toggle-breakfast');
      this.btnToggleLunch = document.getElementById('btn-toggle-lunch');
      this.btnToggleDinner = document.getElementById('btn-toggle-dinner');

      // Ticket Modal
      this.modalTicket = document.getElementById('modal-ticket');
      this.btnCloseTicket = document.getElementById('btn-close-ticket');
      this.btnDoneTicket = document.getElementById('btn-done-ticket');
      this.modalTokenCode = document.getElementById('modal-token-code');
      this.modalMealName = document.getElementById('modal-meal-name');
      this.modalMenuDish = document.getElementById('modal-menu-dish');

      // Feedback
      this.starRatingBox = document.getElementById('star-rating-box');
      this.btnSubmitFeedback = document.getElementById('btn-submit-feedback');
    },

    bindEvents() {
      // Sidebar Navigation
      this.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetView = btn.dataset.view;
          this.switchView(targetView);
          this.closeSidebarMobile();
        });
      });

      // Mobile Drawer Toggle
      if (this.btnSidebarOpen) {
        this.btnSidebarOpen.addEventListener('click', () => this.openSidebarMobile());
      }
      if (this.btnSidebarClose) {
        this.btnSidebarClose.addEventListener('click', () => this.closeSidebarMobile());
      }
      if (this.sidebarBackdrop) {
        this.sidebarBackdrop.addEventListener('click', () => this.closeSidebarMobile());
      }

      // Meal Toggle Buttons on Dashboard
      if (this.btnToggleBreakfast) {
        this.btnToggleBreakfast.addEventListener('click', () => this.toggleBooking('breakfast'));
      }
      if (this.btnToggleLunch) {
        this.btnToggleLunch.addEventListener('click', () => this.toggleBooking('lunch'));
      }
      if (this.btnToggleDinner) {
        this.btnToggleDinner.addEventListener('click', () => this.toggleBooking('dinner'));
      }

      // Ticket Modal Actions
      if (this.btnCloseTicket) {
        this.btnCloseTicket.addEventListener('click', () => this.closeTicketModal());
      }
      if (this.btnDoneTicket) {
        this.btnDoneTicket.addEventListener('click', () => this.closeTicketModal());
      }
      if (this.modalTicket) {
        this.modalTicket.addEventListener('click', (e) => {
          if (e.target === this.modalTicket) this.closeTicketModal();
        });
      }

      // Filter pills in My Bookings
      const filterPills = document.querySelectorAll('.filter-pills .pill-btn');
      filterPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
          filterPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.selectedFilter = pill.dataset.filter;
          this.renderBookingsHistory();
        });
      });

      // Star rating in feedback
      if (this.starRatingBox) {
        const stars = this.starRatingBox.querySelectorAll('.star');
        stars.forEach(star => {
          star.addEventListener('click', () => {
            const val = parseInt(star.dataset.val, 10);
            stars.forEach(s => {
              const sVal = parseInt(s.dataset.val, 10);
              s.classList.toggle('active', sVal <= val);
            });
          });
        });
      }

      if (this.btnSubmitFeedback) {
        this.btnSubmitFeedback.addEventListener('click', () => {
          const input = document.getElementById('feedback-text');
          if (input && input.value.trim()) {
            alert('Thank you for rating today\'s mess meal! Your feedback has been logged for the Kitchen Supervisor.');
            input.value = '';
          } else {
            alert('Please add a comment before submitting.');
          }
        });
      }

      // Profile Save
      const btnSaveProfile = document.getElementById('btn-save-profile');
      if (btnSaveProfile) {
        btnSaveProfile.addEventListener('click', () => {
          alert('Preferences saved successfully! Your dietary choices are synced with the kitchen prep list.');
        });
      }

      // Logout
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          if (confirm('Do you want to log out of Nitin\'s student session?')) {
            alert('Logged out. Redirecting to Hub...');
            window.location.href = '../index.html';
          }
        });
      }
    },

    openSidebarMobile() {
      if (this.sidebar) this.sidebar.classList.add('open');
      if (this.sidebarBackdrop) this.sidebarBackdrop.classList.add('open');
    },

    closeSidebarMobile() {
      if (this.sidebar) this.sidebar.classList.remove('open');
      if (this.sidebarBackdrop) this.sidebarBackdrop.classList.remove('open');
    },

    switchView(viewId) {
      this.currentView = viewId;
      
      // Update sidebar nav active
      this.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
      });

      // Update panel visibility
      this.viewPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `view-${viewId}`);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    getState() {
      if (window.MesswiseStore) {
        return window.MesswiseStore.getState();
      }
      return null;
    },

    toggleBooking(mealType) {
      if (window.MesswiseStore) {
        window.MesswiseStore.toggleMealBooking(mealType);
      }
    },

    bookMealInstant(mealType) {
      const state = this.getState();
      if (!state) return;
      if (!state.student.todayBookings[mealType].booked) {
        this.toggleBooking(mealType);
      }
      this.openTicketModal(mealType);
    },

    openTicketModal(mealType) {
      const state = this.getState();
      if (!state) return;

      const booking = state.student.todayBookings[mealType];
      if (!booking || !booking.booked) {
        alert(`You have not booked ${mealType}. Please book it first!`);
        return;
      }

      const mealTitles = {
        breakfast: "Breakfast (07:00 - 09:00)",
        lunch: "Lunch (12:00 - 14:00)",
        dinner: "Dinner (19:00 - 21:00)"
      };

      if (this.modalTokenCode) this.modalTokenCode.textContent = booking.token || "TK-ACTIVE";
      if (this.modalMealName) this.modalMealName.textContent = mealTitles[mealType] || mealType;
      if (this.modalMenuDish) this.modalMenuDish.textContent = booking.menu;

      if (this.modalTicket) {
        this.modalTicket.classList.add('open');
      }
    },

    closeTicketModal() {
      if (this.modalTicket) {
        this.modalTicket.classList.remove('open');
      }
    },

    openSurplusModal(surplusId) {
      const state = this.getState();
      if (!state) return;
      const item = state.surplusListings.find(s => s.id === surplusId);
      if (!item) return;

      const confirmed = confirm(
        `Surplus Food Offer: ${item.title} (${item.meals} portions available at ${item.hostel})\n` +
        `Inspected under FSSAI hygiene standards at ${item.tempCelsius}°C.\n\n` +
        `Would you like to reserve a 1-student eco-portion for evening takeaway?`
      );

      if (confirmed) {
        alert(`Reserved 1 portion of ${item.title}! Pick up at ${item.locationDetail} before ${item.pickupDeadline}.`);
      }
    },

    render() {
      const state = this.getState();
      if (!state) return;

      const s = state.student;

      // 1. Sidebar student details
      const sidebarName = document.getElementById('sidebar-student-name');
      const sidebarRoom = document.getElementById('sidebar-hostel-room');
      const heroName = document.getElementById('hero-student-name');
      if (sidebarName) sidebarName.textContent = s.name;
      if (sidebarRoom) sidebarRoom.textContent = `${s.hostel.split(' ')[0]} • Room ${s.room}`;
      if (heroName) heroName.textContent = s.name.split(' ')[0];

      // 2. Metrics on Dashboard & Impact View
      const mBooked = document.getElementById('metric-meals-booked');
      const mSaved = document.getElementById('metric-meals-saved');
      const mCo2 = document.getElementById('metric-co2-avoided');
      const mRank = document.getElementById('student-rank-badge');

      if (mBooked) mBooked.textContent = s.mealsBooked;
      if (mSaved) mSaved.textContent = s.mealsSaved;
      if (mCo2) mCo2.innerHTML = `${s.co2AvoidedKg}<small>kg</small>`;
      if (mRank) mRank.textContent = `Rank #${s.rank}`;

      // Impact Page KPIs
      const pBooked = document.getElementById('impact-page-booked');
      const pSaved = document.getElementById('impact-page-saved');
      const pCo2 = document.getElementById('impact-page-co2');
      const pRank = document.getElementById('impact-page-rank');
      if (pBooked) pBooked.textContent = s.mealsBooked;
      if (pSaved) pSaved.textContent = s.mealsSaved;
      if (pCo2) pCo2.textContent = `${s.co2AvoidedKg} kg`;
      if (pRank) pRank.textContent = `#${s.rank}`;

      // 3. Render Today's Meals Row
      this.renderMealRow('breakfast', s.todayBookings.breakfast);
      this.renderMealRow('lunch', s.todayBookings.lunch);
      this.renderMealRow('dinner', s.todayBookings.dinner);

      // Active bookings counter badge in sidebar
      const activeCount = Object.values(s.todayBookings).filter(b => b.booked).length;
      const badgeActive = document.getElementById('badge-active-bookings');
      if (badgeActive) badgeActive.textContent = activeCount;

      // 4. Render Bookings History
      this.renderBookingsHistory();

      // 5. Render Wizard Dates & Slots
      this.renderBookingWizard();

      // 6. Render Weekly Menu Full
      this.renderWeeklyMenu();

      // 7. Render Surplus Catalog
      this.renderSurplusCatalog();
    },

    renderMealRow(type, booking) {
      const row = document.getElementById(`meal-row-${type}`);
      const badge = document.getElementById(`badge-status-${type}`);
      const btn = document.getElementById(`btn-toggle-${type}`);

      if (!row || !badge || !btn) return;

      if (booking.booked) {
        row.classList.remove('not-booked');
        badge.className = 'status-badge booked';
        badge.textContent = 'Booked ✓';
        btn.className = 'btn-toggle-meal';
        btn.textContent = 'Cancel';
      } else {
        row.classList.add('not-booked');
        badge.className = 'status-badge not-booked';
        badge.textContent = 'Not Booked';
        btn.className = 'btn-toggle-meal primary';
        btn.textContent = 'Book Now';
      }
    },

    renderBookingWizard() {
      const dateContainer = document.getElementById('wizard-date-tabs');
      if (!dateContainer || dateContainer.children.length > 0) return;

      const days = [
        { name: "Today", num: "16", active: true },
        { name: "Wed", num: "17", active: false },
        { name: "Thu", num: "18", active: false },
        { name: "Fri", num: "19", active: false },
        { name: "Sat", num: "20", active: false },
        { name: "Sun", num: "21", active: false },
        { name: "Mon", num: "22", active: false }
      ];

      dateContainer.innerHTML = days.map(d => `
        <div class="date-tab-pill ${d.active ? 'active' : ''}">
          <span class="day-name">${d.name}</span>
          <span class="day-num">${d.num}</span>
        </div>
      `).join('');
    },

    renderBookingsHistory() {
      const state = this.getState();
      const container = document.getElementById('bookings-history-list');
      if (!container || !state) return;

      let list = state.studentBookingsHistory || [];
      if (this.selectedFilter === 'active') {
        list = list.filter(item => item.status === 'Booked');
      } else if (this.selectedFilter === 'past') {
        list = list.filter(item => item.status === 'Served');
      }

      container.innerHTML = list.map(item => `
        <div class="ticket-item-card">
          <div class="ticket-top">
            <span class="ticket-date">${item.date} • ${item.meal}</span>
            <span class="status-badge ${item.status === 'Booked' ? 'booked' : ''}">${item.status}</span>
          </div>
          <h4 class="ticket-meal-name">${item.item}</h4>
          <p class="ticket-item-desc">Token: <code>${item.qr}</code></p>
          <div class="ticket-action-bar">
            <span style="font-size: 0.75rem; color: var(--text-muted);">Hostel A Central Mess</span>
            <button class="btn-sm-outline" onclick="window.StudentApp.openTicketModal('${item.meal.toLowerCase()}')">Show QR</button>
          </div>
        </div>
      `).join('');
    },

    renderWeeklyMenu() {
      const container = document.getElementById('menu-full-cards');
      if (!container || container.children.length > 0) return;

      const fullSchedule = [
        {
          type: "Breakfast (07:00 - 09:00)",
          dishes: [
            "Poha with Roasted Peanuts & Lemon",
            "Steamed Moong Sprouts",
            "Boiled Eggs / Fresh Bananas",
            "Hot Milk / Masala Chai"
          ],
          kcal: "420 kcal",
          protein: "14g",
          carbs: "58g"
        },
        {
          type: "Lunch (12:00 - 14:00)",
          dishes: [
            "Punjabi Rajma Gravy (Kidney Beans)",
            "Jeera Basmati Rice",
            "Tawa Phulka Rotis with Ghee",
            "Boondi Raita & Cucumber Salad"
          ],
          kcal: "680 kcal",
          protein: "22g",
          carbs: "88g"
        },
        {
          type: "Dinner (19:00 - 21:00)",
          dishes: [
            "Paneer Butter Masala",
            "Yellow Moong Dal Tadka",
            "Whole Wheat Phulkas (3 pcs)",
            "Kheer / Sweet Dish"
          ],
          kcal: "710 kcal",
          protein: "24g",
          carbs: "82g"
        }
      ];

      container.innerHTML = fullSchedule.map(col => `
        <div class="menu-full-col">
          <span class="col-header-chip">${col.type}</span>
          <ul style="list-style: none; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; color: var(--text-secondary);">
            ${col.dishes.map(d => `<li>• ${d}</li>`).join('')}
          </ul>
          <div class="nutrient-tags">
            <span class="nutri-pill">🔥 ${col.kcal}</span>
            <span class="nutri-pill">💪 ${col.protein} Protein</span>
            <span class="nutri-pill">🌾 ${col.carbs} Carbs</span>
          </div>
        </div>
      `).join('');
    },

    renderSurplusCatalog() {
      const state = this.getState();
      const container = document.getElementById('surplus-catalog-grid');
      if (!container || !state) return;

      const items = state.surplusListings || [];
      container.innerHTML = items.map(item => `
        <div class="card-box surplus-food-card">
          <div class="surplus-img-wrapper">
            <img src="${item.imageUrl}" alt="${item.title}" class="surplus-img">
            <span class="badge-meals-chip">${item.meals} meals remaining</span>
          </div>
          <div class="surplus-info">
            <div class="surplus-meta-top">
              <h4 class="surplus-title">${item.title}</h4>
              <span class="distance-pill">${item.hostel} • ${item.distanceKm} km</span>
            </div>
            <p class="surplus-deadline">⏳ Pickup before <strong>${item.pickupDeadline}</strong></p>
            <div style="margin-bottom: 0.85rem; font-size: 0.75rem; color: var(--text-secondary);">
              <span>🛡️ Temp: <strong>${item.tempCelsius}°C</strong></span> • 
              <span>Status: <strong style="color: var(--primary-700);">${item.status}</strong></span>
            </div>
            <button class="btn-primary-full" onclick="window.StudentApp.openSurplusModal('${item.id}')">
              Claim Student Portion
            </button>
          </div>
        </div>
      `).join('');
    }
  };

  // Expose global controller
  window.StudentApp = App;
  document.addEventListener('DOMContentLoaded', () => App.init());

})();
