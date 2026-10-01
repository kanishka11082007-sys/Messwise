import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  CalendarCheck, 
  Award, 
  Leaf, 
  Star, 
  QrCode, 
  Check, 
  Sparkles, 
  Clock, 
  Send,
  LogOut,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Sidebar from './components/Sidebar';
import TicketModal from './components/TicketModal';
import LoginModal from './components/LoginModal';
import { studentApi, authApi } from './api/client';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicketMeal, setSelectedTicketMeal] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('messwise_jwt_token')));

  const [student, setStudent] = useState({
    name: 'Nitin Sharma',
    hostel: 'Hostel A (Aryabhatta)',
    room: 'B-304',
    diet: 'Vegetarian',
    meals_booked: 82,
    meals_saved: 14,
    co2_avoided_kg: 24.0,
    eco_rank: 12,
  });

  const [studentMeals, setStudentMeals] = useState({
    breakfast: { session: 'breakfast', menu: 'Poha + Milk + Banana', time: '7:00 AM - 9:00 AM', booked: true, status: 'Booked', token: 'BKF-892' },
    lunch: { session: 'lunch', menu: 'Rajma + Jeera Rice + Roti + Salad', time: '12:00 PM - 2:00 PM', booked: true, status: 'Booked', token: 'LCH-419' },
    dinner: { session: 'dinner', menu: 'Paneer Butter Masala + Roti + Dal', time: '7:00 PM - 9:00 PM', booked: false, status: 'Not Booked', token: null },
  });

  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  useEffect(() => {
    studentApi.getTodayMeals().then((res) => {
      if (res?.meals) {
        setStudentMeals(res.meals);
      }
    });
    studentApi.getMe().then((u) => {
      if (u) {
        setStudent((prev) => ({ ...prev, ...u }));
      }
    });
  }, []);

  const handleToggle = (session) => {
    const isNowBooking = !studentMeals[session]?.booked;
    const tokenStr = isNowBooking ? `TK-${session.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}` : null;

    setStudentMeals((prev) => ({
      ...prev,
      [session]: {
        ...prev[session],
        booked: isNowBooking,
        status: isNowBooking ? 'Booked' : 'Not Booked',
        token: tokenStr,
      },
    }));

    setStudent((prev) => ({
      ...prev,
      meals_booked: isNowBooking ? prev.meals_booked + 1 : Math.max(0, prev.meals_booked - 1),
      co2_avoided_kg: isNowBooking ? Math.round((prev.co2_avoided_kg + 0.3) * 10) / 10 : prev.co2_avoided_kg,
    }));

    if (isNowBooking) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#123B2A', '#EA580C', '#2F8563'],
      });
    }

    studentApi.toggleBooking(session).catch(() => {});
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    try {
      await studentApi.submitFeedback('lunch', feedbackRating, feedbackText);
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSubmitted(false), 3500);
    } catch {}
  };

  const bookingHistory = [
    { id: 'b-01', date: '16 Sep 2025', meal: 'Breakfast', item: 'Poha + Milk + Banana', status: 'Served', token: 'QR-BKF-1609' },
    { id: 'b-02', date: '16 Sep 2025', meal: 'Lunch', item: 'Rajma + Jeera Rice + Roti', status: 'Booked', token: 'QR-LCH-1609' },
    { id: 'b-03', date: '15 Sep 2025', meal: 'Dinner', item: 'Dal Tadka + Roti', status: 'Served', token: 'QR-DIN-1509' },
    { id: 'b-04', date: '15 Sep 2025', meal: 'Lunch', item: 'Chole Bhature + Rice', status: 'Served', token: 'QR-LCH-1509' },
    { id: 'b-05', date: '14 Sep 2025', meal: 'Dinner', item: 'Veg Pulao + Kadhi', status: 'Served', token: 'QR-DIN-1409' },
  ];

  return (
    <div className="portal-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="portal-main">
        {/* Header */}
        <header className="portal-header">
          <div className="header-title">
            <h1>Student Dining Portal</h1>
            <p>
              {student.name} • {student.hostel} (Room {student.room}) • {student.diet} Plan
            </p>
          </div>

          <div className="header-actions">
            <span className="badge badge-success">
              <CheckCircle2 size={13} /> Active Boarder
            </span>
            <span className="badge badge-neutral">
              Rank #{student.eco_rank} Eco Standing
            </span>

            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await authApi.logout();
                  setIsAuthenticated(false);
                }}
                className="btn btn-secondary btn-sm"
              >
                <LogOut size={14} /> Log Out
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn btn-primary btn-sm"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        </header>

        {/* Tab 1: Dashboard & RSVP */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI Summary Strip */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Meals Booked</div>
                  <div className="kpi-value">{student.meals_booked}</div>
                  <div className="kpi-meta">September active term</div>
                </div>
                <div className="kpi-icon brand">
                  <Utensils size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Surplus Prevented</div>
                  <div className="kpi-value">{student.meals_saved}</div>
                  <div className="kpi-meta">Via timely opt-outs</div>
                </div>
                <div className="kpi-icon brand">
                  <Leaf size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">CO₂ Diverted</div>
                  <div className="kpi-value">{student.co2_avoided_kg} kg</div>
                  <div className="kpi-meta">Clean air credits</div>
                </div>
                <div className="kpi-icon brand">
                  <Sparkles size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Green Streak</div>
                  <div className="kpi-value">14 Days</div>
                  <div className="kpi-meta">Consecutive meal logs</div>
                </div>
                <div className="kpi-icon warm">
                  <Award size={18} />
                </div>
              </div>
            </div>

            {/* Today's Meal RSVPs */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Utensils size={16} />
                  <span>Today's Meal RSVPs & Digital Passes</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Tue, 16 Sep 2025 • Cutoff: 2h before session
                </span>
              </div>

              <div className="panel-body">
                <div className="meal-rsvp-list">
                  {/* Breakfast */}
                  <div className={`meal-rsvp-item ${studentMeals.breakfast?.booked ? 'booked' : ''}`}>
                    <div className="meal-rsvp-info">
                      <div>
                        <div className="meal-session-name">Breakfast</div>
                        <div className="meal-time-tag">
                          <Clock size={12} /> {studentMeals.breakfast?.time}
                        </div>
                      </div>
                      <div className="meal-menu-text">
                        <strong>Menu:</strong> {studentMeals.breakfast?.menu}
                      </div>
                    </div>

                    <div className="meal-rsvp-actions">
                      <span className={`badge ${studentMeals.breakfast?.booked ? 'badge-success' : 'badge-neutral'}`}>
                        {studentMeals.breakfast?.booked ? 'Booked' : 'Not Booked'}
                      </span>
                      <button
                        className={`btn btn-sm ${studentMeals.breakfast?.booked ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleToggle('breakfast')}
                      >
                        {studentMeals.breakfast?.booked ? 'Cancel RSVP' : 'RSVP (Opt-In)'}
                      </button>
                      {studentMeals.breakfast?.booked && (
                        <button
                          className="btn btn-sm btn-warm"
                          onClick={() => setSelectedTicketMeal('breakfast')}
                        >
                          <QrCode size={13} /> Pass
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className={`meal-rsvp-item ${studentMeals.lunch?.booked ? 'booked' : ''}`}>
                    <div className="meal-rsvp-info">
                      <div>
                        <div className="meal-session-name">Lunch</div>
                        <div className="meal-time-tag">
                          <Clock size={12} /> {studentMeals.lunch?.time}
                        </div>
                      </div>
                      <div className="meal-menu-text">
                        <strong>Menu:</strong> {studentMeals.lunch?.menu}
                      </div>
                    </div>

                    <div className="meal-rsvp-actions">
                      <span className={`badge ${studentMeals.lunch?.booked ? 'badge-success' : 'badge-neutral'}`}>
                        {studentMeals.lunch?.booked ? 'Booked' : 'Not Booked'}
                      </span>
                      <button
                        className={`btn btn-sm ${studentMeals.lunch?.booked ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleToggle('lunch')}
                      >
                        {studentMeals.lunch?.booked ? 'Cancel RSVP' : 'RSVP (Opt-In)'}
                      </button>
                      {studentMeals.lunch?.booked && (
                        <button
                          className="btn btn-sm btn-warm"
                          onClick={() => setSelectedTicketMeal('lunch')}
                        >
                          <QrCode size={13} /> Pass
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className={`meal-rsvp-item ${studentMeals.dinner?.booked ? 'booked' : ''}`}>
                    <div className="meal-rsvp-info">
                      <div>
                        <div className="meal-session-name">Dinner</div>
                        <div className="meal-time-tag">
                          <Clock size={12} /> {studentMeals.dinner?.time}
                        </div>
                      </div>
                      <div className="meal-menu-text">
                        <strong>Menu:</strong> {studentMeals.dinner?.menu}
                      </div>
                    </div>

                    <div className="meal-rsvp-actions">
                      <span className={`badge ${studentMeals.dinner?.booked ? 'badge-success' : 'badge-neutral'}`}>
                        {studentMeals.dinner?.booked ? 'Booked' : 'Not Booked'}
                      </span>
                      <button
                        className={`btn btn-sm ${studentMeals.dinner?.booked ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleToggle('dinner')}
                      >
                        {studentMeals.dinner?.booked ? 'Cancel RSVP' : 'RSVP (Opt-In)'}
                      </button>
                      {studentMeals.dinner?.booked && (
                        <button
                          className="btn btn-sm btn-warm"
                          onClick={() => setSelectedTicketMeal('dinner')}
                        >
                          <QrCode size={13} /> Pass
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Kitchen Feedback */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Star size={16} />
                  <span>Kitchen Supervisor & Food Quality Feedback</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sent directly to mess supervisor
                </span>
              </div>

              <div className="panel-body">
                {feedbackSubmitted ? (
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--success-text)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <Check size={16} /> Rating recorded. Thank you for helping optimize kitchen preparation.
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Dish Quality Rating:</span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: star <= feedbackRating ? 'var(--accent-warm)' : 'var(--border-default)',
                              padding: '0.1rem',
                            }}
                          >
                            <Star size={20} fill={star <= feedbackRating ? 'var(--accent-warm)' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Portion or spice suggestions</label>
                      <input
                        type="text"
                        className="form-control"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="e.g. Lunch dal consistency was great, portion was adequate..."
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Send size={14} /> Submit Feedback
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Menu */}
        {activeTab === 'menu' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <Utensils size={16} />
                <span>Hostel A Weekly Dining Schedule</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Managed by Chef Rajesh Kumar
              </span>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th style={{ width: '140px' }}>Day</th>
                    <th>Breakfast</th>
                    <th>Lunch</th>
                    <th>Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { day: 'Monday', b: 'Idli Sambhar + Chutney', l: 'Chole + Jeera Rice + Roti', d: 'Mix Dal + Sev Tamatar + Chapati' },
                    { day: 'Tuesday (Today)', b: 'Poha + Milk + Banana', l: 'Rajma + Steamed Rice + Salad', d: 'Paneer Butter Masala + Roti', current: true },
                    { day: 'Wednesday', b: 'Aloo Paratha + Curd', l: 'Kadhi Pakoda + Rice', d: 'Egg Curry / Paneer Bhurji + Roti' },
                    { day: 'Thursday', b: 'Upma + Tea + Sprouts', l: 'Dal Makhani + Tandoori Roti', d: 'Veg Biryani + Cucumber Raita' },
                    { day: 'Friday', b: 'Puri Bhaji + Halwa', l: 'Sambar Rice + Papad', d: 'Matar Paneer + Pulao' },
                    { day: 'Saturday', b: 'Masala Dosa + Sambhar', l: 'Khichdi + Baingan Bharta', d: 'Dal Tadka + Jeera Rice' },
                    { day: 'Sunday', b: 'Pav Bhaji + Fruit Juice', l: 'Special Dum Biryani Feast', d: 'Light Khichdi + Curd' },
                  ].map((row, idx) => (
                    <tr key={idx} style={row.current ? { backgroundColor: 'var(--brand-50)' } : {}}>
                      <td style={{ fontWeight: 600 }}>
                        {row.day}
                        {row.current && <span className="badge badge-success" style={{ marginLeft: '0.4rem' }}>Today</span>}
                      </td>
                      <td>{row.b}</td>
                      <td>{row.l}</td>
                      <td>{row.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <CalendarCheck size={16} />
                <span>Booking & Digital Pass Records</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['all', 'Served', 'Booked'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`btn btn-sm ${historyFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {filter.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Meal Session</th>
                    <th>Date</th>
                    <th>Menu Items</th>
                    <th>Status</th>
                    <th className="text-right">Pass Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingHistory
                    .filter((b) => historyFilter === 'all' || b.status === historyFilter)
                    .map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600 }}>{b.meal}</td>
                        <td>{b.date}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{b.item}</td>
                        <td>
                          <span className={`badge ${b.status === 'Served' ? 'badge-success' : 'badge-warning'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.82rem' }}>
                          {b.token}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Impact */}
        {activeTab === 'impact' && (
          <div>
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Campus Ranking</div>
                  <div className="kpi-value">#12</div>
                  <div className="kpi-meta">Top 3% eco boarders</div>
                </div>
                <div className="kpi-icon brand">
                  <Award size={18} />
                </div>
              </div>
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Food Waste Diverted</div>
                  <div className="kpi-value">4.2 kg</div>
                  <div className="kpi-meta">Personal term contribution</div>
                </div>
                <div className="kpi-icon brand">
                  <Leaf size={18} />
                </div>
              </div>
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Carbon Offset</div>
                  <div className="kpi-value">24.0 kg</div>
                  <div className="kpi-meta">Equivalent CO2 emissions</div>
                </div>
                <div className="kpi-icon brand">
                  <Sparkles size={18} />
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Leaf size={16} />
                  <span>Campus Food Waste Prevention Protocol</span>
                </div>
              </div>
              <div className="panel-body">
                <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  By confirming attendance or opting out at least 2 hours prior to kitchen preparation cycles, our mess staff can reduce safety buffer margins from 18% down to 2.6%. Surplus portions from students who opt out are systematically redirected to verified local food bank networks.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <TicketModal
        isOpen={Boolean(selectedTicketMeal)}
        onClose={() => setSelectedTicketMeal(null)}
        mealType={selectedTicketMeal}
        mealData={selectedTicketMeal ? studentMeals[selectedTicketMeal] : null}
        studentName={student.name}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          if (user) setStudent((prev) => ({ ...prev, ...user }));
          studentApi.getTodayMeals().then((res) => {
            if (res?.meals) setStudentMeals(res.meals);
          });
        }}
      />
    </div>
  );
}

export default App;
