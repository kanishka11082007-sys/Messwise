/**
 * Messwise API Client
 * Connects frontend portals directly to FastAPI backend (/api/v1).
 */

(function (root) {
  'use strict';

  const API_BASE_URL = root.MESSWISE_API_URL || 'http://localhost:8000/api/v1';

  const ApiClient = {
    token: localStorage.getItem('messwise_jwt_token') || null,

    setToken(token) {
      this.token = token;
      if (token) {
        localStorage.setItem('messwise_jwt_token', token);
      } else {
        localStorage.removeItem('messwise_jwt_token');
      }
    },

    getHeaders() {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      return headers;
    },

    async request(endpoint, options = {}) {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {})
        }
      };

      try {
        const response = await fetch(url, config);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP error ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.warn(`[Messwise API Error] ${endpoint}:`, err.message);
        throw err;
      }
    },

    // --- Authentication ---
    async login(email, password, role) {
      const res = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });
      if (res.access_token) {
        this.setToken(res.access_token);
      }
      return res;
    },

    async getMe() {
      return await this.request('/users/me');
    },

    async updatePreferences(prefs) {
      return await this.request('/users/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify(prefs)
      });
    },

    // --- Student Endpoints ---
    async getStudentMeals() {
      return await this.request('/student/meals/today');
    },

    async toggleStudentBooking(mealSession) {
      return await this.request('/student/meals/toggle', {
        method: 'POST',
        body: JSON.stringify({ meal_session: mealSession })
      });
    },

    async getStudentHistory(filter = 'all') {
      return await this.request(`/student/bookings/history?filter=${filter}`);
    },

    async submitStudentFeedback(mealSession, rating, comment) {
      return await this.request('/student/feedback', {
        method: 'POST',
        body: JSON.stringify({ meal_session: mealSession, rating, comment })
      });
    },

    async getStudentImpact() {
      return await this.request('/student/impact');
    },

    // --- Admin Endpoints ---
    async getAdminStats() {
      return await this.request('/admin/dashboard/stats');
    },

    async predictDemand(params) {
      return await this.request('/forecast/predict', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    async simulateWhatIf(params) {
      return await this.request('/forecast/what-if', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },

    async getForecastAccuracy() {
      return await this.request('/forecast/accuracy');
    },

    async logProduction(data) {
      return await this.request('/admin/production/log', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async logWaste(data) {
      return await this.request('/admin/waste/log', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async getWasteHeatmap() {
      return await this.request('/admin/waste/heatmap');
    },

    async publishSurplus(data) {
      return await this.request('/admin/surplus/publish', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async approveRequest(requestId) {
      return await this.request(`/admin/requests/${requestId}/approve`, {
        method: 'POST'
      });
    },

    async verifyHandover(requestId, otp) {
      return await this.request('/admin/handover/verify', {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId, otp })
      });
    },

    // --- NGO Endpoints ---
    async getAvailableSurplus(dietary) {
      const q = dietary ? `?dietary=${dietary}` : '';
      return await this.request(`/ngo/surplus/available${q}`);
    },

    async registerNgoDemand(data) {
      return await this.request('/ngo/demand', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async getNgoDemands() {
      return await this.request('/ngo/demand');
    },

    async getSmartMatches(params = {}) {
      const q = new URLSearchParams(params).toString();
      return await this.request(`/ngo/matches${q ? '?' + q : ''}`);
    },

    async requestSurplus(surplusId, details) {
      return await this.request(`/ngo/surplus/${surplusId}/request`, {
        method: 'POST',
        body: JSON.stringify(details)
      });
    },

    async getNgoRequests() {
      return await this.request('/ngo/requests');
    },

    async logDistribution(data) {
      return await this.request('/ngo/distribution/log', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    // --- Impact Ledger ---
    async getImpactLedger(limit = 20) {
      return await this.request(`/impact/ledger?limit=${limit}`);
    },

    async getImpactSummary() {
      return await this.request('/impact/summary');
    }
  };

  root.MesswiseApi = ApiClient;
})(typeof window !== 'undefined' ? window : this);
