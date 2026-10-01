/**
 * Messwise - Mess / Admin Portal Application Logic
 * Full AI Demand Forecasting, Batch Production Logging, FSSAI Surplus Publishing & Handover.
 */

(function() {
  'use strict';

  const App = {
    currentView: 'dashboard',
    activeHandoverRequestId: null,

    init() {
      this.bindElements();
      this.bindEvents();
      this.render();

      if (window.MesswiseStore) {
        window.MesswiseStore.subscribe(() => {
          this.render();
        });
      }
    },

    bindElements() {
      this.navButtons = document.querySelectorAll('.sidebar-nav .nav-item');
      this.viewPanels = document.querySelectorAll('.view-panel');
      this.sidebar = document.getElementById('sidebar');
      this.sidebarBackdrop = document.getElementById('sidebar-backdrop');
      this.btnSidebarOpen = document.getElementById('btn-sidebar-open');
      this.btnSidebarClose = document.getElementById('btn-sidebar-close');

      // Handover modal
      this.modalHandover = document.getElementById('modal-handover');
      this.btnCloseHandover = document.getElementById('btn-close-handover');
      this.btnCancelHandover = document.getElementById('btn-cancel-handover');
      this.btnConfirmHandover = document.getElementById('btn-confirm-handover');
      this.handoverOtpInput = document.getElementById('handover-otp-input');
      this.handoverHint = document.getElementById('handover-hint');

      // Production inputs
      this.prodPrepared = document.getElementById('prod-prepared-qty');
      this.prodServed = document.getElementById('prod-served-qty');
      this.prodLeftover = document.getElementById('prod-leftover-qty');
    },

    bindEvents() {
      // Navigation
      this.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.view;
          this.switchView(target);
          this.closeSidebarMobile();
        });
      });

      // Mobile drawer
      if (this.btnSidebarOpen) {
        this.btnSidebarOpen.addEventListener('click', () => this.openSidebarMobile());
      }
      if (this.btnSidebarClose) {
        this.btnSidebarClose.addEventListener('click', () => this.closeSidebarMobile());
      }
      if (this.sidebarBackdrop) {
        this.sidebarBackdrop.addEventListener('click', () => this.closeSidebarMobile());
      }

      // Auto compute leftover in production logger
      if (this.prodPrepared && this.prodServed && this.prodLeftover) {
        const updateLeftover = () => {
          const p = parseInt(this.prodPrepared.value, 10) || 0;
          const s = parseInt(this.prodServed.value, 10) || 0;
          this.prodLeftover.value = Math.max(0, p - s);
        };
        this.prodPrepared.addEventListener('input', updateLeftover);
        this.prodServed.addEventListener('input', updateLeftover);
      }

      // Handover modal
      if (this.btnCloseHandover) {
        this.btnCloseHandover.addEventListener('click', () => this.closeHandoverModal());
      }
      if (this.btnCancelHandover) {
        this.btnCancelHandover.addEventListener('click', () => this.closeHandoverModal());
      }
      if (this.btnConfirmHandover) {
        this.btnConfirmHandover.addEventListener('click', () => this.confirmHandoverOTP());
      }

      // Logout
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          if (confirm('Logout of Mess Supervisor session?')) {
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

      this.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
      });

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

    // AI Prediction Engine Simulation
    recomputeAI() {
      const state = this.getState();
      if (!state) return;

      const day = document.getElementById('sim-day-of-week').value;
      const isExam = document.getElementById('sim-exam-toggle').checked;
      const isHoliday = document.getElementById('sim-holiday-toggle').checked;
      const weather = document.getElementById('sim-weather-select').value;
      const ratio = parseInt(document.getElementById('sim-ratio-slider').value, 10) / 100;

      let baseDemand = 600 * ratio;

      // Factors
      if (day === 'wed') baseDemand *= 1.02;
      if (day === 'fri') baseDemand *= 0.86;
      if (day === 'sun') baseDemand *= 1.15;

      if (isExam) baseDemand *= 1.05;
      if (isHoliday) baseDemand *= 0.72;

      if (weather === 'heavy_rain') baseDemand *= 1.10;
      if (weather === 'extreme_heat') baseDemand *= 0.94;

      const finalDemand = Math.round(baseDemand);
      const recommended = Math.round(finalDemand * 1.026); // +2.6% buffer

      // Update UI elements in View 4
      const elDemand = document.getElementById('ai-output-demand');
      const elRec = document.getElementById('ai-output-recommended');
      if (elDemand) elDemand.textContent = finalDemand;
      if (elRec) elRec.textContent = recommended;

      // Update insights
      const insightsList = document.getElementById('ai-insights-list');
      if (insightsList) {
        insightsList.innerHTML = `
          <li>• Turnout Ratio Calibrated: ${(ratio*100).toFixed(0)}% (${Math.round(650*ratio)} boarders active).</li>
          <li>• Day Effect (${day.toUpperCase()}): ${day === 'fri' ? '-14% weekend departure' : day === 'sun' ? '+15% Sunday feast' : '+2% mid-week turnout'}.</li>
          <li>• External Signals: ${isExam ? 'Exam season active (+5% dinner crowd)' : 'Normal semester schedule'} | ${weather === 'heavy_rain' ? 'Rain (+10% indoor dining)' : 'Pleasant weather'}.</li>
          <li>• Safe Buffer: +${recommended - finalDemand} portions to ensure 0 student meal run-outs.</li>
        `;
      }

      // Update Dashboard widget
      const kpiDemand = document.getElementById('kpi-expected-demand');
      const kpiCook = document.getElementById('kpi-recommended-cook');
      if (kpiDemand) kpiDemand.textContent = finalDemand;
      if (kpiCook) kpiCook.textContent = recommended;

      // Persist to store
      state.messAdmin.aiPrediction.expectedDemand = finalDemand;
      state.messAdmin.aiPrediction.recommendedCook = recommended;
      if (window.MesswiseStore) {
        window.MesswiseStore.save(state);
      }
    },

    // Save Daily Batch Production
    saveProductionEntry() {
      const state = this.getState();
      if (!state) return;

      const prep = parseInt(this.prodPrepared.value, 10) || 0;
      const serv = parseInt(this.prodServed.value, 10) || 0;
      const left = Math.max(0, prep - serv);
      const waste = parseInt(document.getElementById('prod-waste-qty').value, 10) || 0;

      state.messAdmin.todayStats.prepared = prep;
      state.messAdmin.todayStats.served = serv;
      state.messAdmin.todayStats.surplus = left;
      state.messAdmin.todayStats.waste = waste;

      if (window.MesswiseStore) {
        window.MesswiseStore.save(state);
      }

      alert(`Batch production logged!\nPrepared: ${prep} | Served: ${serv} | Surplus: ${left} | Waste: ${waste}`);
      this.switchView('dashboard');
    },

    // Surplus Management: Publish new batch
    publishSurplusForm() {
      const title = document.getElementById('surplus-food-title').value.trim();
      const qty = parseInt(document.getElementById('surplus-food-qty').value, 10) || 20;
      const temp = parseInt(document.getElementById('surplus-temp').value, 10) || 65;
      const preptime = document.getElementById('surplus-preptime').value.trim();
      const deadline = document.getElementById('surplus-deadline-input').value.trim();
      const storage = document.getElementById('surplus-storage-type').value;

      if (!title) {
        alert('Please enter a dish title.');
        return;
      }

      if (window.MesswiseStore) {
        const newItem = window.MesswiseStore.publishSurplusItem({
          title,
          meals: qty,
          tempCelsius: temp,
          prepTime: preptime,
          pickupDeadline: deadline,
          storageCondition: storage
        });

        alert(`✅ FSSAI Certified Surplus Batch Published!\n"${newItem.title}" (${newItem.meals} meals) is now live on the NGO Partner Network.`);
        this.switchView('dashboard');
      }
    },

    openSurplusManageModal() {
      this.switchView('surplus-management');
    },

    // Donation Handover with OTP
    openHandoverModal(requestId, expectedOtp) {
      this.activeHandoverRequestId = requestId;
      if (this.handoverHint) {
        this.handoverHint.innerHTML = `Expected OTP for this batch: <strong>${expectedOtp}</strong>`;
      }
      if (this.handoverOtpInput) {
        this.handoverOtpInput.value = '';
      }
      if (this.modalHandover) {
        this.modalHandover.classList.add('open');
      }
    },

    closeHandoverModal() {
      if (this.modalHandover) {
        this.modalHandover.classList.remove('open');
      }
      this.activeHandoverRequestId = null;
    },

    confirmHandoverOTP() {
      if (!this.activeHandoverRequestId) return;
      const entered = this.handoverOtpInput ? this.handoverOtpInput.value.trim() : '';

      if (window.MesswiseStore) {
        const res = window.MesswiseStore.confirmHandover(this.activeHandoverRequestId, entered);
        alert(res.message);
        if (res.success) {
          this.closeHandoverModal();
        }
      }
    },

    approveRequest(requestId) {
      if (window.MesswiseStore) {
        window.MesswiseStore.approveRequest(requestId);
        alert('Request approved! Pickup status set to Ready for Collection.');
      }
    },

    render() {
      const state = this.getState();
      if (!state) return;

      const admin = state.messAdmin;

      // 1. Overview 4 Stats Cards (842, 817, 25, 6)
      const elPrep = document.getElementById('stat-prepared-val');
      const elServ = document.getElementById('stat-served-val');
      const elSurp = document.getElementById('stat-surplus-val');
      const elWst = document.getElementById('stat-waste-val');

      if (elPrep) elPrep.textContent = admin.todayStats.prepared;
      if (elServ) elServ.textContent = admin.todayStats.served;
      if (elSurp) elSurp.textContent = admin.todayStats.surplus;
      if (elWst) elWst.textContent = admin.todayStats.waste;

      // 2. AI Forecast Card
      const kpiDemand = document.getElementById('kpi-expected-demand');
      const kpiCook = document.getElementById('kpi-recommended-cook');
      if (kpiDemand) kpiDemand.textContent = admin.aiPrediction.expectedDemand;
      if (kpiCook) kpiCook.textContent = admin.aiPrediction.recommendedCook;

      // 3. Recent Surplus Food horizontal box
      const recentListing = state.surplusListings[0];
      if (recentListing) {
        const titleEl = document.getElementById('recent-surplus-title');
        const mealsEl = document.getElementById('recent-surplus-meals');
        const deadlineEl = document.getElementById('recent-surplus-deadline');
        const statusEl = document.getElementById('recent-surplus-status');

        if (titleEl) titleEl.textContent = recentListing.title;
        if (mealsEl) mealsEl.innerHTML = `<strong>${recentListing.meals}</strong> meals`;
        if (deadlineEl) deadlineEl.textContent = `Available till ${recentListing.pickupDeadline}`;
        if (statusEl) {
          statusEl.textContent = recentListing.status;
          statusEl.className = `badge-status-published ${recentListing.status.toLowerCase()}`;
        }
      }

      // Badges in sidebar
      const badgeSurplus = document.getElementById('badge-surplus-count');
      if (badgeSurplus) badgeSurplus.textContent = state.surplusListings.length;

      const badgeRequests = document.getElementById('badge-requests-count');
      if (badgeRequests) badgeRequests.textContent = `${state.requests.length} Req`;

      // 4. Render Active Surplus Feed in Tab 5
      this.renderSurplusCatalog();

      // 5. Render Requests in Tab 6
      this.renderRequestsTable();
    },

    renderSurplusCatalog() {
      const state = this.getState();
      const container = document.getElementById('admin-surplus-listings-list');
      if (!container || !state) return;

      container.innerHTML = state.surplusListings.map(item => `
        <div class="surplus-horizontal-item">
          <div class="surplus-thumb-box" style="width: 60px; height: 60px;">
            <img src="${item.imageUrl}" alt="${item.title}" class="surplus-thumb">
          </div>
          <div class="surplus-item-details">
            <div class="item-title-row">
              <h4 class="item-name">${item.title}</h4>
              <span class="badge-status-published">${item.status}</span>
            </div>
            <div class="item-spec-row">
              <span><strong>${item.meals}</strong> portions</span> • 
              <span>Expires: ${item.pickupDeadline}</span> • 
              <span>Temp: ${item.tempCelsius}°C</span>
            </div>
          </div>
          <div class="surplus-item-cta">
            <span style="font-size: 0.75rem; font-family: monospace; background: var(--slate-100); padding: 0.2rem 0.45rem; border-radius: 4px;">OTP: ${item.pickupOtp}</span>
          </div>
        </div>
      `).join('');
    },

    renderRequestsTable() {
      const state = this.getState();
      const tbody = document.getElementById('admin-requests-table-body');
      if (!tbody || !state) return;

      if (!state.requests || state.requests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--slate-400);">No active NGO collection requests.</td></tr>`;
        return;
      }

      tbody.innerHTML = state.requests.map(req => {
        let actionBtn = '';
        if (req.status === 'Pending Approval') {
          actionBtn = `<button class="btn-action-accent" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;" onclick="window.AdminApp.approveRequest('${req.id}')">Approve Request</button>`;
        } else if (req.status === 'Approved' || req.status === 'Ready For Pickup') {
          actionBtn = `<button class="btn-action-accent" style="background: var(--amber-600); padding: 0.3rem 0.65rem; font-size: 0.75rem;" onclick="window.AdminApp.openHandoverModal('${req.id}', '${req.otp}')">Verify OTP Handover</button>`;
        } else {
          actionBtn = `<span class="tag-status active" style="background: var(--admin-primary-100); color: var(--admin-primary-700);">Collected ✓</span>`;
        }

        return `
          <tr>
            <td><code>${req.id}</code></td>
            <td><strong>${req.ngoName}</strong></td>
            <td>${req.foodTitle}</td>
            <td><strong style="color: var(--amber-600);">${req.meals}</strong> meals</td>
            <td>${req.volunteerName} (${req.vehicle})</td>
            <td><span class="stat-tag tag-warning">${req.status}</span></td>
            <td>${actionBtn}</td>
          </tr>
        `;
      }).join('');
    }
  };

  window.AdminApp = App;
  document.addEventListener('DOMContentLoaded', () => App.init());

})();
