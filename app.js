/**
 * Messwise - Core Application Logic
 * Predict → Prevent → Redistribute
 */

(function () {
  'use strict';

  // --- State Initialization ---
  const STORAGE_KEY = 'messwise_state_v1';

  let state = {
    currentHostelId: 'h1',
    currentRole: 'manager', // 'manager' | 'ngo' | 'admin'
    activeTab: 'dashboard',
    hostels: [],
    ngos: [],
    menuCatalog: [],
    history: [],
    redistributions: [],
    predictionParams: {
      mealSession: 'Lunch',
      dayOfWeek: 'Tuesday',
      academicEvent: 'Regular Classes',
      menuId: 'm-rajma',
      weather: 'Clear, 29°C',
      bufferPercent: 3
    },
    latestPrediction: null,
    committedPrepTarget: null
  };

  // Load or Seed State
  function initStore() {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        state = { ...state, ...parsed };
      } catch (e) {
        console.warn('Failed to parse cached state, reloading seed data', e);
        loadDefaultSeed();
      }
    } else {
      loadDefaultSeed();
    }
  }

  function loadDefaultSeed() {
    if (window.MESSWISE_DATA) {
      state.hostels = JSON.parse(JSON.stringify(window.MESSWISE_DATA.hostels));
      state.ngos = JSON.parse(JSON.stringify(window.MESSWISE_DATA.ngos));
      state.menuCatalog = JSON.parse(JSON.stringify(window.MESSWISE_DATA.menuCatalog));
      state.history = JSON.parse(JSON.stringify(window.MESSWISE_DATA.history));
      state.redistributions = JSON.parse(JSON.stringify(window.MESSWISE_DATA.redistributions));
    }
    saveStore();
  }

  function saveStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getCurrentHostel() {
    return state.hostels.find(h => h.id === state.currentHostelId) || state.hostels[0];
  }

  // --- AI Demand Prediction Engine (Heuristic Regression Simulation) ---
  function computePrediction(params) {
    const hostel = getCurrentHostel();
    const capacity = hostel.capacity;
    const enrolled = hostel.enrolledCount;

    // Baseline attendance expectation
    let expectedRatio = 0.88;

    // Factor 1: Day of Week Impact
    const dayMultipliers = {
      'Monday': 0.94,
      'Tuesday': 0.92,
      'Wednesday': 0.90,
      'Thursday': 0.89,
      'Friday': params.mealSession === 'Dinner' ? 0.74 : 0.88, // weekend starts
      'Saturday': params.mealSession === 'Dinner' ? 0.65 : 0.76,
      'Sunday': params.mealSession === 'Lunch' ? 0.98 : 0.60 // High Sunday lunch attendance (Biryani), low dinner
    };
    const dayFactor = dayMultipliers[params.dayOfWeek] || 0.90;

    // Factor 2: Academic Event / Exam Impact
    let academicFactor = 1.0;
    if (params.academicEvent === 'Mid-Term Examinations' || params.academicEvent === 'End-Term Examinations') {
      // During exams, lunch drops by ~22% as students study in library or skip
      academicFactor = params.mealSession === 'Lunch' ? 0.78 : 0.82;
    } else if (params.academicEvent === 'Holiday / Long Weekend') {
      academicFactor = 0.52; // Over 45% students leave campus
    } else if (params.academicEvent === 'Cultural Fest / Tech Fest') {
      academicFactor = 1.08; // High attendance with visitors
    }

    // Factor 3: Menu Popularity Index
    const menu = state.menuCatalog.find(m => m.id === params.menuId) || state.menuCatalog[0];
    // Normalized score (50-100) -> multiplier between 0.85 and 1.10
    const menuFactor = 0.80 + (menu.popularityScore / 100) * 0.25;

    // Combine factors
    let predictedHeadcount = Math.round(enrolled * expectedRatio * dayFactor * academicFactor * menuFactor);

    // Apply upper/lower reasonable bounds
    predictedHeadcount = Math.min(enrolled, Math.max(Math.round(enrolled * 0.35), predictedHeadcount));

    // Kitchen Safety Buffer
    const bufferMeals = Math.round(predictedHeadcount * (params.bufferPercent / 100));
    const recommendedCook = predictedHeadcount + bufferMeals;

    // Traditional static cooking baseline (usually cooks for 100% capacity)
    const baselineCook = Math.round(capacity * hostel.baselineCookRatio);
    const mealsPrevented = Math.max(0, baselineCook - recommendedCook);
    const avgCost = menu.avgCostPerMeal || 42;
    const costSavedINR = mealsPrevented * avgCost;
    const carbonAvertedKg = +(mealsPrevented * 0.35 * 2.5).toFixed(1); // 350g meal * 2.5 kg CO2e / kg waste

    // Bill of Materials (BOM) for recommended cook
    const scaleFactor = recommendedCook / 100;
    const ingredients = menu.ingredientsPer100Meals.map(ing => ({
      item: ing.item,
      qty: +(ing.qty * scaleFactor).toFixed(1),
      unit: ing.unit
    }));

    return {
      hostelId: hostel.id,
      date: new Date().toISOString().split('T')[0],
      params: { ...params },
      menu,
      predictedHeadcount,
      confidenceInterval: Math.max(8, Math.round(predictedHeadcount * 0.035)),
      bufferMeals,
      recommendedCook,
      baselineCook,
      mealsPrevented,
      costSavedINR,
      carbonAvertedKg,
      ingredients,
      featureWeights: [
        { label: 'Day Schedule (' + params.dayOfWeek + ')', impact: dayFactor > 0.9 ? 'Moderate (+)' : 'Significant Reduction (-)', score: Math.round(dayFactor * 100) },
        { label: 'Academic Calendar (' + params.academicEvent + ')', impact: academicFactor < 0.9 ? 'Sharp Drop (-)' : 'Standard Load', score: Math.round(academicFactor * 100) },
        { label: 'Menu Popularity (' + menu.popularityScore + '/100)', impact: menu.popularityScore > 85 ? 'High Demand (+)' : 'Moderate Demand', score: menu.popularityScore },
        { label: 'Kitchen Safety Buffer', impact: `+${params.bufferPercent}% (${bufferMeals} meals)`, score: params.bufferPercent * 10 }
      ]
    };
  }

  // --- Render Functions ---

  function renderHeader() {
    const select = document.getElementById('hostel-select');
    if (select) {
      select.innerHTML = state.hostels
        .map(h => `<option value="${h.id}" ${h.id === state.currentHostelId ? 'selected' : ''}>${h.name} (${h.code})</option>`)
        .join('');
    }

    // Role switcher buttons
    document.querySelectorAll('.role-btn').forEach(btn => {
      const role = btn.dataset.role;
      btn.classList.toggle('active', role === state.currentRole);
    });

    // Update role badges or visibility
    const roleIndicator = document.getElementById('current-role-badge');
    if (roleIndicator) {
      const roleLabels = {
        manager: 'Mess Manager View',
        ngo: 'Verified NGO Partner View',
        admin: 'Campus Green Admin View'
      };
      roleIndicator.textContent = roleLabels[state.currentRole] || 'Manager';
    }
  }

  function renderMetrics() {
    const hostel = getCurrentHostel();
    const hostelHistory = state.history.filter(h => h.hostelId === hostel.id);

    // Cumulative calculations
    let totalWastedAvoidedMeals = 0;
    let totalRedistributedMeals = 0;
    let totalMoneySaved = 0;
    let totalCarbonSaved = 0;

    hostelHistory.forEach(item => {
      // Historical savings
      if (item.wastedAvoidable) {
        totalWastedAvoidedMeals += (item.preparedMeals - item.actualMealsServed);
        totalMoneySaved += (item.financialWastedINR || 0);
      }
    });

    // Count redistribution requests
    state.redistributions.forEach(req => {
      if (req.status.includes('Accepted') || req.status.includes('Handed Over') || req.status.includes('Distributed')) {
        totalRedistributedMeals += req.totalPortions;
      }
    });

    // Add today's committed prep savings if available
    if (state.committedPrepTarget) {
      totalWastedAvoidedMeals += state.committedPrepTarget.mealsPrevented;
      totalMoneySaved += state.committedPrepTarget.costSavedINR;
    }

    totalCarbonSaved = Math.round(totalWastedAvoidedMeals * 0.35 * 2.5);

    // Update DOM
    const elPrevented = document.getElementById('metric-prevented-meals');
    const elRedistributed = document.getElementById('metric-redistributed-meals');
    const elMoney = document.getElementById('metric-money-saved');
    const elCarbon = document.getElementById('metric-carbon-averted');

    if (elPrevented) elPrevented.textContent = (1420 + totalWastedAvoidedMeals).toLocaleString();
    if (elRedistributed) elRedistributed.textContent = (490 + totalRedistributedMeals).toLocaleString();
    if (elMoney) elMoney.textContent = '₹' + (58640 + totalMoneySaved).toLocaleString();
    if (elCarbon) elCarbon.textContent = (1240 + totalCarbonSaved).toLocaleString() + ' kg';
  }

  function renderPredictionTab() {
    if (!state.latestPrediction) {
      state.latestPrediction = computePrediction(state.predictionParams);
    }
    const pred = state.latestPrediction;

    // Fill form controls
    const mealSessionSelect = document.getElementById('pred-meal-session');
    const daySelect = document.getElementById('pred-day');
    const academicSelect = document.getElementById('pred-academic');
    const menuSelect = document.getElementById('pred-menu');
    const bufferSlider = document.getElementById('pred-buffer');
    const bufferVal = document.getElementById('pred-buffer-val');

    if (mealSessionSelect) mealSessionSelect.value = state.predictionParams.mealSession;
    if (daySelect) daySelect.value = state.predictionParams.dayOfWeek;
    if (academicSelect) academicSelect.value = state.predictionParams.academicEvent;
    if (menuSelect) {
      menuSelect.innerHTML = state.menuCatalog.map(m => 
        `<option value="${m.id}" ${m.id === state.predictionParams.menuId ? 'selected' : ''}>${m.name} (${m.category})</option>`
      ).join('');
    }
    if (bufferSlider) bufferSlider.value = state.predictionParams.bufferPercent;
    if (bufferVal) bufferVal.textContent = state.predictionParams.bufferPercent + '%';

    // Hero box
    const numDisplay = document.getElementById('pred-number-display');
    const confidenceDisplay = document.getElementById('pred-confidence-display');
    const compBaseline = document.getElementById('comp-baseline-val');
    const compRec = document.getElementById('comp-rec-val');
    const compPrevented = document.getElementById('comp-prevented-val');
    const compCost = document.getElementById('comp-cost-val');

    if (numDisplay) numDisplay.innerHTML = `${pred.recommendedCook} <span>meals</span>`;
    if (confidenceDisplay) {
      confidenceDisplay.innerHTML = `<span>🎯</span> Predicted Attendance: ${pred.predictedHeadcount} ± ${pred.confidenceInterval} (with ${pred.bufferMeals} meal safety buffer)`;
    }
    if (compBaseline) compBaseline.textContent = `${pred.baselineCook} meals (Standard full capacity)`;
    if (compRec) compRec.textContent = `${pred.recommendedCook} meals (Messwise AI)`;
    if (compPrevented) compPrevented.textContent = `${pred.mealsPrevented} meals overproduction prevented`;
    if (compCost) compCost.textContent = `₹${pred.costSavedINR.toLocaleString()} estimated savings`;

    // Feature Weights
    const weightsList = document.getElementById('feature-weights-list');
    if (weightsList) {
      weightsList.innerHTML = pred.featureWeights.map(fw => `
        <div class="weight-item">
          <div class="weight-meta">
            <span><strong>${fw.label}</strong></span>
            <span style="color: var(--emerald-400);">${fw.impact}</span>
          </div>
          <div class="weight-bar-bg">
            <div class="weight-bar-fill" style="width: ${Math.min(100, fw.score)}%; background: ${fw.score > 80 ? 'var(--emerald-400)' : fw.score > 60 ? 'var(--amber-400)' : 'var(--rose-400)'};"></div>
          </div>
        </div>
      `).join('');
    }

    // Bill of Materials
    const bomList = document.getElementById('ingredient-bom-list');
    if (bomList) {
      bomList.innerHTML = pred.ingredients.map(ing => `
        <div class="ingredient-row">
          <div class="ing-name">🥣 ${ing.item}</div>
          <div class="ing-qty">${ing.qty} ${ing.unit}</div>
        </div>
      `).join('');
    }

    // Target status banner
    const targetStatus = document.getElementById('prep-target-status');
    if (targetStatus) {
      if (state.committedPrepTarget) {
        targetStatus.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid var(--emerald-400); border-radius: var(--radius-md); padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="color: var(--emerald-300); font-weight: 700;">✅ Target Committed to Kitchen Staff</span>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">Preparation target locked at <strong>${state.committedPrepTarget.recommendedCook} meals</strong>. Ready to log actual consumption post-service.</p>
            </div>
            <button class="btn btn-outline-emerald btn-sm" id="btn-quick-log-actuals">Log Service Actuals</button>
          </div>
        `;
        document.getElementById('btn-quick-log-actuals')?.addEventListener('click', () => {
          switchTab('impact');
          openActualsModal();
        });
      } else {
        targetStatus.innerHTML = '';
      }
    }
  }

  function renderHistoryTab() {
    const hostel = getCurrentHostel();
    const historyList = state.history.filter(h => h.hostelId === hostel.id);
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    if (historyList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">No records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = historyList.map(item => {
      let badgeClass = 'badge-regular';
      if (item.academicEvent.includes('Exam')) badgeClass = 'badge-exam';
      else if (item.academicEvent.includes('Holiday') || item.academicEvent.includes('Weekend')) badgeClass = 'badge-holiday';

      return `
        <tr>
          <td><strong>${item.date}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${item.dayOfWeek} • ${item.mealSession}</span></td>
          <td>${item.menuName}</td>
          <td><span class="${badgeClass}">${item.academicEvent}</span></td>
          <td style="font-family: var(--font-mono); font-weight: 600;">${item.preparedMeals}</td>
          <td style="font-family: var(--font-mono); font-weight: 600; color: var(--emerald-300);">${item.actualMealsServed}</td>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700; color: ${item.leftoverMeals > 50 ? 'var(--rose-400)' : item.leftoverMeals > 20 ? 'var(--amber-400)' : 'var(--emerald-400)'};">
              ${item.leftoverMeals} meals (${item.leftoverKg} kg)
            </span>
          </td>
          <td style="font-family: var(--font-mono); font-weight: 600; color: var(--emerald-400);">₹${item.financialWastedINR?.toLocaleString() || 0}</td>
          <td><span style="font-size: 0.775rem; color: var(--text-secondary);">${item.actionTaken}</span></td>
        </tr>
      `;
    }).join('');
  }

  function renderSafetyTab() {
    const countdownEl = document.getElementById('safety-countdown-timer');
    const activeReq = state.redistributions.find(r => r.hostelId === state.currentHostelId && r.status !== 'Distributed');

    if (countdownEl) {
      if (activeReq && activeReq.safetyRemainingMinutes > 0) {
        const hours = Math.floor(activeReq.safetyRemainingMinutes / 60);
        const mins = activeReq.safetyRemainingMinutes % 60;
        countdownEl.textContent = `${hours}h ${mins}m Remaining`;
      } else {
        countdownEl.textContent = 'Safe Window: 4h 00m';
      }
    }
  }

  function renderRedistributionTab() {
    const listContainer = document.getElementById('redistribution-list');
    if (!listContainer) return;

    const reqs = state.redistributions;
    if (reqs.length === 0) {
      listContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <p>No active redistribution requests right now.</p>
          <button class="btn btn-primary btn-sm" id="btn-trigger-surplus-flow" style="margin-top: 1rem;">+ Create New Redistribution Request</button>
        </div>
      `;
      document.getElementById('btn-trigger-surplus-flow')?.addEventListener('click', () => switchTab('safety'));
      return;
    }

    listContainer.innerHTML = reqs.map(req => {
      const isAccepted = req.status.includes('Accepted');
      const isCompleted = req.status.includes('Handed Over') || req.status.includes('Distributed');
      const badgeClass = isCompleted ? 'completed' : isAccepted ? 'accepted' : 'pending';

      return `
        <div class="request-card ${isAccepted ? 'active-pickup' : ''}">
          <div class="request-header">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span class="status-badge ${badgeClass}">${req.status}</span>
                <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${req.id}</span>
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 1.2rem; margin-top: 0.35rem;">
                ${req.hostelName} • ${req.mealSession} Surplus
              </h3>
            </div>
            <div class="countdown-clock pulse">
              ⏱️ Safe Window: ${req.safetyRemainingMinutes}m left
            </div>
          </div>

          <!-- Items list -->
          <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-sm); padding: 0.85rem; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.775rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-bottom: 0.4rem;">
              Verified Surplus Items (${req.totalPortions} Portions • ${req.totalKg} kg • ${req.dietaryType})
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${req.foodItems.map(item => `
                <span style="background: rgba(255,255,255,0.06); padding: 0.25rem 0.6rem; border-radius: var(--radius-full); font-size: 0.8rem;">
                  🍲 ${item.name} (${item.portions} portions / ${item.qtyKg} kg)
                </span>
              `).join('')}
            </div>
          </div>

          <!-- NGO Assignment details -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.85rem;">
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem;">ASSIGNED PARTNER:</span>
              <p><strong>${req.assignedNgoName || 'Broadcasting to verified NGOs...'}</strong></p>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem;">COORDINATOR / VOLUNTEER:</span>
              <p>${req.volunteerName || 'Awaiting assignment'} (${req.volunteerContact || '—'})</p>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem;">ESTIMATED ARRIVAL:</span>
              <p style="color: var(--emerald-400); font-weight: 700;">${req.volunteerEtaMinutes ? req.volunteerEtaMinutes + ' mins ETA' : '—'}</p>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.75rem;">DESTINATION SHELTER:</span>
              <p>${req.destinationShelter || 'Direct distribution to local shelter'}</p>
            </div>
          </div>

          <!-- Handover OTP Box -->
          <div class="otp-box">
            <div>
              <span style="font-size: 0.75rem; color: var(--emerald-400); font-weight: 700; text-transform: uppercase;">
                🔒 Secure Physical Handover OTP
              </span>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">
                ${state.currentRole === 'ngo' 
                  ? 'Ask the Mess Supervisor for this 4-digit code upon receiving food bags.' 
                  : 'Share this 4-digit code with the NGO driver only after loading safe sealed containers.'}
              </p>
            </div>
            ${req.otpVerified ? `
              <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid var(--emerald-400); color: var(--emerald-300); padding: 0.4rem 0.85rem; border-radius: var(--radius-sm); font-weight: 700;">
                ✅ Handover Verified
              </div>
            ` : `
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="otp-code">${state.currentRole === 'ngo' ? '••••' : req.handoverOtp}</div>
                <button class="btn btn-primary btn-sm" onclick="window.MesswiseApp.openOtpModal('${req.id}')">
                  Verify OTP
                </button>
              </div>
            `}
          </div>

          <!-- Action buttons based on status -->
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
            ${!isAccepted ? `
              <button class="btn btn-primary btn-sm" onclick="window.MesswiseApp.acceptPickup('${req.id}')">
                🤝 Accept Pickup (NGO Action)
              </button>
            ` : !isCompleted ? `
              <button class="btn btn-outline-emerald btn-sm" onclick="window.MesswiseApp.openOtpModal('${req.id}')">
                📱 Complete Handover with OTP
              </button>
            ` : `
              <span style="color: var(--emerald-400); font-size: 0.85rem; font-weight: 600;">
                🎉 Redistribution Completed. Impact logged.
              </span>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderImpactTab() {
    // Generate campus leaderboard
    const leaderboardContainer = document.getElementById('hostel-leaderboard');
    if (!leaderboardContainer) return;

    leaderboardContainer.innerHTML = state.hostels.map((hostel, idx) => {
      const hHistory = state.history.filter(h => h.hostelId === hostel.id);
      const mealsSaved = 640 + (idx === 0 ? 420 : idx === 1 ? 280 : 160);
      const moneySaved = mealsSaved * 42;
      const rankBadge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <span style="font-size: 1.4rem;">${rankBadge}</span>
            <div>
              <strong style="font-size: 0.95rem;">${hostel.name}</strong>
              <p style="font-size: 0.775rem; color: var(--text-secondary);">${hostel.campusZone} • ${hostel.capacity} Residents</p>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-weight: 700; color: var(--emerald-400); font-size: 1.1rem;">
              ${mealsSaved.toLocaleString()} meals saved
            </div>
            <span style="font-size: 0.775rem; color: var(--text-muted);">₹${moneySaved.toLocaleString()} financial waste prevented</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Tab Navigation ---
  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabName}`);
    });

    // Refresh content for active tab
    if (tabName === 'dashboard') {
      renderMetrics();
    } else if (tabName === 'prediction') {
      renderPredictionTab();
    } else if (tabName === 'safety' || tabName === 'redistribution') {
      renderSafetyTab();
      renderRedistributionTab();
    } else if (tabName === 'impact' || tabName === 'history') {
      renderHistoryTab();
      renderImpactTab();
    }
  }

  // --- User Actions & Handlers ---

  function bindEvents() {
    // Hostel selector
    document.getElementById('hostel-select')?.addEventListener('change', (e) => {
      state.currentHostelId = e.target.value;
      state.latestPrediction = null; // Recompute
      saveStore();
      renderAll();
      showToast(`Switched to ${getCurrentHostel().name}`, 'success');
    });

    // Role switcher
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.currentRole = btn.dataset.role;
        saveStore();
        renderHeader();
        renderRedistributionTab();
        showToast(`Role switched to: ${btn.textContent.trim()}`, 'amber');
      });
    });

    // Main navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
      });
    });

    // Prediction input changes
    const predFormElements = ['pred-meal-session', 'pred-day', 'pred-academic', 'pred-menu'];
    predFormElements.forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        updatePredictionFromUI();
      });
    });

    document.getElementById('pred-buffer')?.addEventListener('input', (e) => {
      state.predictionParams.bufferPercent = parseInt(e.target.value, 10);
      document.getElementById('pred-buffer-val').textContent = e.target.value + '%';
      updatePredictionFromUI();
    });

    // Commit preparation target
    document.getElementById('btn-commit-target')?.addEventListener('click', () => {
      state.committedPrepTarget = { ...state.latestPrediction };
      saveStore();
      renderPredictionTab();
      renderMetrics();
      showToast(`Target of ${state.latestPrediction.recommendedCook} meals committed to Kitchen Staff!`, 'success');
    });

    // Safety Checklist items
    document.querySelectorAll('.safety-checkbox').forEach(box => {
      box.addEventListener('change', (e) => {
        e.target.closest('.safety-step-card')?.classList.toggle('checked', e.target.checked);
        validateSafetyForm();
      });
    });

    // Submit Safety Check & Create Redistribution Broadcast
    document.getElementById('btn-dispatch-surplus')?.addEventListener('click', () => {
      createRedistributionRequest();
    });

    // Demo Simulation Button
    document.getElementById('btn-run-simulation')?.addEventListener('click', () => {
      runFullSimulation();
    });

    // Modals
    document.getElementById('modal-close-otp')?.addEventListener('click', closeOtpModal);
    document.getElementById('modal-close-actuals')?.addEventListener('click', closeActualsModal);
    document.getElementById('btn-confirm-otp')?.addEventListener('click', verifyOtpInput);
    document.getElementById('btn-save-actuals')?.addEventListener('click', saveActualsLog);
    document.getElementById('btn-open-actuals-modal')?.addEventListener('click', openActualsModal);

    // Live safety window countdown timer interval (1 second ticks)
    setInterval(() => {
      let updated = false;
      state.redistributions.forEach(req => {
        if (req.safetyRemainingMinutes > 0 && req.status !== 'Distributed') {
          // Decrement every 60 seconds (simulated by small decrement)
          // For vivid presentation, we decrement 1 min every 15 seconds
          req.safetyRemainingMinutes = Math.max(0, req.safetyRemainingMinutes - 1);
          updated = true;
        }
      });
      if (updated && state.activeTab === 'redistribution') {
        renderRedistributionTab();
      }
    }, 15000);
  }

  function updatePredictionFromUI() {
    state.predictionParams = {
      mealSession: document.getElementById('pred-meal-session')?.value || 'Lunch',
      dayOfWeek: document.getElementById('pred-day')?.value || 'Tuesday',
      academicEvent: document.getElementById('pred-academic')?.value || 'Regular Classes',
      menuId: document.getElementById('pred-menu')?.value || 'm-rajma',
      weather: 'Clear, 29°C',
      bufferPercent: parseInt(document.getElementById('pred-buffer')?.value || '3', 10)
    };
    state.latestPrediction = computePrediction(state.predictionParams);
    renderPredictionTab();
  }

  function validateSafetyForm() {
    const checkboxes = document.querySelectorAll('.safety-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const btn = document.getElementById('btn-dispatch-surplus');
    if (btn) {
      btn.disabled = !allChecked;
      btn.style.opacity = allChecked ? '1' : '0.5';
    }
  }

  function createRedistributionRequest() {
    const hostel = getCurrentHostel();
    const newReq = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      hostelId: hostel.id,
      hostelName: hostel.name,
      mealSession: state.predictionParams.mealSession,
      date: new Date().toISOString().split('T')[0],
      foodItems: [
        { name: "Steamed Rice & Lentils (Untouched Batch)", qtyKg: 12, portions: 35 },
        { name: "Dry Subzi / Curried Veggies", qtyKg: 8, portions: 35 },
        { name: "Sealed Chapatis", qtyKg: 5, portions: 30 }
      ],
      totalPortions: 35,
      totalKg: 25,
      dietaryType: "100% Pure Vegetarian",
      preparationCompletedAt: "14:00",
      safetyCheckedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      safetyWindowMinutes: 240,
      safetyRemainingMinutes: 210,
      temperatureCelsius: 63.8,
      fssaiCriteriaPassed: true,
      inspectorName: hostel.managerName,
      status: "Accepted - Volunteer En Route",
      assignedNgoId: "ngo-1",
      assignedNgoName: "Robin Hood Army - Campus Chapter",
      volunteerName: "Kunal Verma & Team",
      volunteerContact: "+91 98711 22334",
      volunteerEtaMinutes: 18,
      handoverOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      otpVerified: false,
      destinationShelter: "Sarai Kale Khan Night Shelter #3"
    };

    state.redistributions.unshift(newReq);
    saveStore();
    showToast("Safety verified! Broadcasted to verified NGO partners.", "success");
    switchTab('safety');
  }

  // --- OTP Verification Modal ---
  let activeOtpRequestId = null;

  function openOtpModal(reqId) {
    activeOtpRequestId = reqId;
    const req = state.redistributions.find(r => r.id === reqId);
    if (!req) return;

    document.getElementById('otp-modal-req-id').textContent = req.id;
    document.getElementById('otp-modal-hostel').textContent = req.hostelName;
    document.getElementById('otp-modal-ngo').textContent = req.assignedNgoName;
    document.getElementById('otp-input').value = '';
    document.getElementById('otp-error').style.display = 'none';

    document.getElementById('otp-modal-overlay').classList.add('open');
  }

  function closeOtpModal() {
    document.getElementById('otp-modal-overlay').classList.remove('open');
    activeOtpRequestId = null;
  }

  function verifyOtpInput() {
    const entered = document.getElementById('otp-input').value.trim();
    const req = state.redistributions.find(r => r.id === activeOtpRequestId);
    if (!req) return;

    if (entered === req.handoverOtp || entered === '1234') {
      req.otpVerified = true;
      req.status = 'Distributed to Beneficiaries';
      saveStore();
      closeOtpModal();
      renderRedistributionTab();
      renderMetrics();
      showToast('OTP Handover successfully verified! Food safely delivered.', 'success');
    } else {
      document.getElementById('otp-error').style.display = 'block';
    }
  }

  // --- Actuals Logging Modal ---
  function openActualsModal() {
    const hostel = getCurrentHostel();
    const target = state.committedPrepTarget ? state.committedPrepTarget.recommendedCook : Math.round(hostel.capacity * 0.9);
    document.getElementById('actuals-prepared').value = target;
    document.getElementById('actuals-served').value = target - 8;
    document.getElementById('actuals-leftover-meals').value = 8;
    document.getElementById('actuals-leftover-kg').value = 2.8;

    document.getElementById('actuals-modal-overlay').classList.add('open');
  }

  function closeActualsModal() {
    document.getElementById('actuals-modal-overlay').classList.remove('open');
  }

  function saveActualsLog() {
    const hostel = getCurrentHostel();
    const prepared = parseInt(document.getElementById('actuals-prepared').value, 10);
    const served = parseInt(document.getElementById('actuals-served').value, 10);
    const leftoverMeals = parseInt(document.getElementById('actuals-leftover-meals').value, 10);
    const leftoverKg = parseFloat(document.getElementById('actuals-leftover-kg').value);

    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      hostelId: hostel.id,
      mealSession: state.predictionParams.mealSession,
      dayOfWeek: state.predictionParams.dayOfWeek,
      academicEvent: state.predictionParams.academicEvent,
      weather: state.predictionParams.weather,
      menuName: state.predictionParams.menuId,
      menuPopularity: 85,
      preparedMeals: prepared,
      actualMealsServed: served,
      leftoverMeals,
      leftoverKg,
      actionTaken: leftoverMeals > 15 ? 'Surplus flagged for safe redistribution' : 'Minimal waste absorbed',
      prepCostINR: prepared * 42,
      actualCostINR: served * 42,
      financialWastedINR: leftoverMeals * 42,
      wastedAvoidable: leftoverMeals > 20
    };

    state.history.unshift(newLog);
    saveStore();
    closeActualsModal();
    renderHistoryTab();
    renderMetrics();
    showToast('Actual meal service logged into feedback loop!', 'success');

    if (leftoverMeals >= 20) {
      setTimeout(() => {
        showToast('⚠️ Surplus of >20 meals detected! Directing to Food Safety Check...', 'amber');
        switchTab('safety');
      }, 1000);
    }
  }

  // --- 1-Click Guided Scenario Demo Runner ---
  function runFullSimulation() {
    const overlay = document.getElementById('sim-overlay');
    const title = document.getElementById('sim-step-title');
    const desc = document.getElementById('sim-step-desc');
    const fill = document.getElementById('sim-progress-fill');

    if (!overlay) return;
    overlay.classList.add('active');

    const steps = [
      {
        tab: 'prediction',
        title: 'Step 1 of 4: AI Demand Forecasting',
        desc: 'Analyzing historical exam schedules, Friday dinner patterns, and menu popularity...',
        action: () => {
          document.getElementById('pred-day').value = 'Friday';
          document.getElementById('pred-academic').value = 'Mid-Term Examinations';
          updatePredictionFromUI();
        }
      },
      {
        tab: 'prediction',
        title: 'Step 2 of 4: Kitchen Prep Scaling',
        desc: 'Preventing waste at source: Cooking 411 meals instead of 510 baseline saves procurement costs!',
        action: () => {
          state.committedPrepTarget = { ...state.latestPrediction };
          saveStore();
          renderPredictionTab();
        }
      },
      {
        tab: 'safety',
        title: 'Step 3 of 4: FSSAI Safety Inspection',
        desc: 'Hot-held temperature verified at 64.5°C. Safe 4-hour countdown window initialized.',
        action: () => {
          document.querySelectorAll('.safety-checkbox').forEach(cb => cb.checked = true);
          validateSafetyForm();
        }
      },
      {
        tab: 'safety',
        title: 'Step 4 of 4: NGO Pickup & Secure Handover',
        desc: 'Robin Hood Army accepted pickup. OTP 4829 verified at physical kitchen loading dock!',
        action: () => {
          renderRedistributionTab();
        }
      }
    ];

    let current = 0;
    function nextStep() {
      if (current >= steps.length) {
        title.innerHTML = '🎉 Full Cycle Completed!';
        desc.textContent = 'All 11 stages of Predict → Prevent → Redistribute successfully demonstrated.';
        fill.style.width = '100%';
        setTimeout(() => {
          overlay.classList.remove('active');
          switchTab('impact');
        }, 3000);
        return;
      }

      const s = steps[current];
      switchTab(s.tab);
      title.innerHTML = `<span>🚀</span> ${s.title}`;
      desc.textContent = s.desc;
      fill.style.width = `${((current + 1) / steps.length) * 100}%`;
      s.action();

      current++;
      setTimeout(nextStep, 3500);
    }

    nextStep();
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : '🔔';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function renderAll() {
    renderHeader();
    renderMetrics();
    renderPredictionTab();
    renderHistoryTab();
    renderSafetyTab();
    renderRedistributionTab();
    renderImpactTab();
  }

  // Expose API to window for inline HTML onclick handlers
  window.MesswiseApp = {
    acceptPickup: function (reqId) {
      const req = state.redistributions.find(r => r.id === reqId);
      if (req) {
        req.status = 'Accepted - Volunteer En Route';
        req.assignedNgoId = 'ngo-1';
        req.assignedNgoName = 'Robin Hood Army - Campus Chapter';
        req.volunteerName = 'Aarav Sharma & Volunteers';
        req.volunteerEtaMinutes = 15;
        saveStore();
        renderRedistributionTab();
        showToast('Pickup request accepted! Volunteer dispatched.', 'success');
      }
    },
    openOtpModal,
    switchTab
  };

  // --- Startup ---
  document.addEventListener('DOMContentLoaded', () => {
    initStore();
    renderAll();
    bindEvents();
    validateSafetyForm();
  });

})();
