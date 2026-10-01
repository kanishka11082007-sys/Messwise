/**
 * Messwise - NGO Partner Portal Application Logic
 * Discover Surplus, 1-Click Request, Pickup Coordination with OTP, and Distribution Logging.
 */

(function() {
  'use strict';

  const App = {
    currentView: 'dashboard',
    selectedSurplusIdForRequest: null,

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

      // Request Modal
      this.modalRequest = document.getElementById('modal-request');
      this.btnCloseRequest = document.getElementById('btn-close-request');
      this.btnCancelRequest = document.getElementById('btn-cancel-request');
      this.btnSubmitRequest = document.getElementById('btn-submit-request');
      this.reqModalTitle = document.getElementById('req-modal-title');
      this.reqModalHostel = document.getElementById('req-modal-hostel');
      this.reqVolunteerName = document.getElementById('req-volunteer-name');
      this.reqVehicleSelect = document.getElementById('req-vehicle-select');
      this.reqEtaSelect = document.getElementById('req-eta-select');
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

      // Mobile Drawer
      if (this.btnSidebarOpen) {
        this.btnSidebarOpen.addEventListener('click', () => this.openSidebarMobile());
      }
      if (this.btnSidebarClose) {
        this.btnSidebarClose.addEventListener('click', () => this.closeSidebarMobile());
      }
      if (this.sidebarBackdrop) {
        this.sidebarBackdrop.addEventListener('click', () => this.closeSidebarMobile());
      }

      // Modal Events
      if (this.btnCloseRequest) {
        this.btnCloseRequest.addEventListener('click', () => this.closeRequestModal());
      }
      if (this.btnCancelRequest) {
        this.btnCancelRequest.addEventListener('click', () => this.closeRequestModal());
      }
      if (this.btnSubmitRequest) {
        this.btnSubmitRequest.addEventListener('click', () => this.submitSurplusRequest());
      }

      // Logout
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          if (confirm('Logout of Helping Hands NGO session?')) {
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

    // Open 1-Click Request Modal
    openRequestModal(surplusId) {
      const state = this.getState();
      if (!state) return;

      const item = state.surplusListings.find(s => s.id === surplusId);
      if (!item) return;

      if (item.status === 'Requested' || item.status === 'PickedUp') {
        alert(`This surplus batch has already been requested or picked up (${item.status}).`);
        return;
      }

      this.selectedSurplusIdForRequest = surplusId;
      if (this.reqModalTitle) this.reqModalTitle.textContent = `${item.title} (${item.meals} meals)`;
      if (this.reqModalHostel) this.reqModalHostel.textContent = `${item.hostel} • ${item.locationDetail} • Pickup before ${item.pickupDeadline}`;

      if (this.modalRequest) {
        this.modalRequest.classList.add('open');
      }
    },

    closeRequestModal() {
      if (this.modalRequest) {
        this.modalRequest.classList.remove('open');
      }
      this.selectedSurplusIdForRequest = null;
    },

    submitSurplusRequest() {
      if (!this.selectedSurplusIdForRequest) return;

      const vol = this.reqVolunteerName ? this.reqVolunteerName.value.trim() : 'Rakesh Verma';
      const veh = this.reqVehicleSelect ? this.reqVehicleSelect.value : 'Electric Van (DL-04-EV-8821)';
      const eta = this.reqEtaSelect ? this.reqEtaSelect.value : 'Within 30 mins';

      if (window.MesswiseStore) {
        const req = window.MesswiseStore.requestSurplus(this.selectedSurplusIdForRequest, {
          volunteerName: vol,
          vehicle: veh,
          eta: eta
        });

        if (req) {
          alert(`✅ Request Submitted to Mess Admin!\nBatch: ${req.foodTitle}\nYour Pickup OTP: ${req.otp}\nShow this 4-digit code at the mess counter.`);
          this.closeRequestModal();
          this.switchView('my-requests');
        }
      }
    },

    // Log Distribution Proof
    submitDistribution() {
      const batch = document.getElementById('dist-batch-select').value;
      const count = parseInt(document.getElementById('dist-people-count').value, 10) || 25;
      const loc = document.getElementById('dist-location-input').value.trim();

      if (!loc) {
        alert('Please enter distribution shelter location.');
        return;
      }

      if (window.MesswiseStore) {
        const dist = window.MesswiseStore.logDistribution({
          foodTitle: batch,
          beneficiaries: count,
          location: loc
        });

        alert(`❤️ Distribution Verified & Recorded!\n${dist.beneficiariesServed} people nourished at ${dist.location}.\nThank you for ensuring zero good food went to waste!`);
        this.switchView('dashboard');
      }
    },

    render() {
      const state = this.getState();
      if (!state) return;

      const ngo = state.ngoPartner;

      // 1. Stats Row on Dashboard (18, 4, 3, 184)
      const elDonations = document.getElementById('stat-donations-val');
      const elRequests = document.getElementById('stat-requests-val');
      const elPickups = document.getElementById('stat-pickups-val');
      const elPeople = document.getElementById('stat-people-val');

      if (elDonations) elDonations.textContent = ngo.stats.availableDonations;
      if (elRequests) elRequests.textContent = state.requests.length;
      const activePickups = state.requests.filter(r => r.status === 'Approved' || r.status === 'Ready For Pickup').length;
      if (elPickups) elPickups.textContent = Math.max(activePickups, ngo.stats.todaysPickups);
      if (elPeople) elPeople.textContent = ngo.stats.peopleServed;

      // Sidebar badges
      const badgeReq = document.getElementById('badge-requests-count');
      const badgePick = document.getElementById('badge-pickups-count');
      if (badgeReq) badgeReq.textContent = state.requests.length;
      if (badgePick) badgePick.textContent = ngo.stats.todaysPickups;

      // Impact Page Stats
      const elTotalMeals = document.getElementById('total-meals-rescued-val');
      const elTotalPeople = document.getElementById('total-beneficiaries-val');
      const elTotalCo2 = document.getElementById('total-co2-diverted-val');
      if (elTotalMeals) elTotalMeals.textContent = ngo.stats.totalMealsRescued.toLocaleString();
      if (elTotalPeople) elTotalPeople.textContent = (ngo.stats.totalMealsRescued - 130).toLocaleString();
      if (elTotalCo2) elTotalCo2.textContent = `${ngo.stats.co2DivertedKg} kg`;

      // 2. Render Dashboard Surplus Feed
      this.renderDashboardFeed();

      // 3. Render Catalog in Tab 2
      this.renderCatalog();

      // 4. Render My Requests in Tab 3
      this.renderMyRequests();

      // 5. Render Pickups in Tab 4
      this.renderPickups();

      // 6. Render Distributions History in Tab 5
      this.renderDistributionsHistory();
    },

    renderDashboardFeed() {
      const state = this.getState();
      const container = document.getElementById('dashboard-surplus-feed');
      if (!container || !state) return;

      const items = state.surplusListings || [];
      container.innerHTML = items.map(item => `
        <div class="surplus-card-row">
          <div class="food-thumb-wrap">
            <img src="${item.imageUrl}" alt="${item.title}" class="food-thumb">
          </div>
          <div class="food-info-block">
            <h4 class="food-title">${item.title}</h4>
            <div class="food-sub-meta">
              <span class="food-portions"><strong>${item.meals}</strong> meals</span>
              <span class="dot">•</span>
              <span class="food-location">${item.hostel} • ${item.distanceKm} km</span>
            </div>
            <div class="food-deadline-pill">
              Pickup before <strong>${item.pickupDeadline}</strong> (Held @ ${item.tempCelsius}°C)
            </div>
          </div>
          <div class="food-action-block">
            <button class="btn-request-food" ${item.status === 'Requested' ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''} onclick="window.NGOApp.openRequestModal('${item.id}')">
              ${item.status === 'Requested' ? 'Requested' : 'Request'}
            </button>
          </div>
        </div>
      `).join('');
    },

    renderCatalog() {
      const state = this.getState();
      const container = document.getElementById('full-catalog-grid');
      if (!container || !state) return;

      const zone = document.getElementById('filter-hostel-zone').value;
      const maxDist = parseFloat(document.getElementById('filter-max-distance').value) || 10;

      let list = state.surplusListings || [];
      if (zone !== 'all') {
        list = list.filter(item => item.hostel.includes(zone));
      }
      list = list.filter(item => parseFloat(item.distanceKm) <= maxDist);

      container.innerHTML = list.map(item => `
        <div class="catalog-card">
          <div class="catalog-thumb-box">
            <img src="${item.imageUrl}" alt="${item.title}" class="catalog-thumb">
            <span style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: #fff; padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700;">
              ${item.meals} Portions
            </span>
          </div>
          <div class="catalog-info">
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.3rem;">${item.title}</h4>
            <p style="font-size: 0.8rem; color: var(--slate-600); margin-bottom: 0.5rem;">${item.hostel} • ${item.distanceKm} km away</p>
            <div style="font-size: 0.75rem; color: var(--slate-500); margin-bottom: 0.85rem;">
              <span>🛡️ FSSAI Inspected</span> • <span>Expires: ${item.pickupDeadline}</span>
            </div>
            <button class="btn-action-primary full" onclick="window.NGOApp.openRequestModal('${item.id}')">
              ${item.status === 'Requested' ? 'Requested' : 'Request This Batch'}
            </button>
          </div>
        </div>
      `).join('');
    },

    renderMyRequests() {
      const state = this.getState();
      const container = document.getElementById('ngo-requests-list');
      if (!container || !state) return;

      if (!state.requests || state.requests.length === 0) {
        container.innerHTML = `<div class="card-box" style="text-align: center; color: var(--slate-400);">No requests submitted yet. Browse Available Food to request fresh surplus meals.</div>`;
        return;
      }

      container.innerHTML = state.requests.map(req => {
        let badgeClass = 'pending';
        if (req.status === 'Approved' || req.status === 'Ready For Pickup') badgeClass = 'approved';
        if (req.status === 'Collected') badgeClass = 'completed';

        return `
          <div class="request-card">
            <div class="req-header">
              <div>
                <span class="req-id">${req.id}</span>
                <strong style="margin-left: 0.5rem; font-size: 1.05rem;">${req.foodTitle} (${req.meals} meals)</strong>
              </div>
              <span class="req-badge ${badgeClass}">${req.status}</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--slate-600); margin-bottom: 0.5rem;">
              <span>Location: <strong>${req.hostel}</strong></span> • 
              <span>Assigned Vehicle: ${req.vehicle}</span> • 
              <span>Volunteer: ${req.volunteerName}</span>
            </div>
            <div class="req-body">
              <div class="req-otp-box">
                Mess Gate Verification OTP: <strong>${req.otp}</strong>
              </div>
              <div style="font-size: 0.78rem; color: var(--slate-500);">
                Estimated ETA: ${req.pickupTimeEstimated}
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    renderPickups() {
      const state = this.getState();
      const container = document.getElementById('pickups-coordination-grid');
      if (!container || !state) return;

      const activeList = state.requests.filter(r => r.status !== 'Collected');
      if (activeList.length === 0) {
        container.innerHTML = `<div class="card-box" style="grid-column: 1 / -1; text-align: center; color: var(--slate-400);">All scheduled pickups for today have been completed.</div>`;
        return;
      }

      container.innerHTML = activeList.map(item => `
        <div class="pickup-box">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--purple-700); text-transform: uppercase;">Active Pickup Schedule</span>
            <span class="req-badge approved">ETA: ${item.pickupTimeEstimated}</span>
          </div>
          <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">${item.foodTitle}</h4>
          <p style="font-size: 0.82rem; color: var(--slate-600); margin-bottom: 0.75rem;">${item.hostel} • Loading Dock Kitchen Bay</p>
          <div style="background: var(--purple-50); border: 1px dashed var(--purple-400); padding: 0.75rem; border-radius: var(--radius-sm); text-align: center; margin-bottom: 0.85rem;">
            <span style="font-size: 0.72rem; color: var(--purple-800); display: block;">Show to Mess Supervisor:</span>
            <span style="font-family: monospace; font-size: 1.6rem; font-weight: 700; letter-spacing: 0.15em; color: var(--purple-900);">${item.otp}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--slate-500);">
            Driver: ${item.volunteerName} (${item.vehicle})
          </div>
        </div>
      `).join('');
    },

    renderDistributionsHistory() {
      const state = this.getState();
      const container = document.getElementById('distributions-history-container');
      if (!container || !state) return;

      container.innerHTML = state.distributions.map(dist => `
        <div class="dist-history-item">
          <div class="dist-top">
            <strong>${dist.foodTitle} (${dist.beneficiariesServed} people)</strong>
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--emerald-600); background: var(--emerald-100); padding: 0.15rem 0.5rem; border-radius: 999px;">
              ${dist.proofStatus} ✓
            </span>
          </div>
          <div style="font-size: 0.8rem; color: var(--slate-600);">
            <span>📍 ${dist.location}</span> • <span>${dist.deliveredAt}</span>
          </div>
        </div>
      `).join('');
    }
  };

  window.NGOApp = App;
  document.addEventListener('DOMContentLoaded', () => App.init());

})();
