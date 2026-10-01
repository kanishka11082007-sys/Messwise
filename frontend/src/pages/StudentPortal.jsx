import React, { useState } from 'react';
import { 
  Utensils, 
  CalendarCheck, 
  Award, 
  Leaf, 
  Star, 
  QrCode, 
  Check, 
  X, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Send,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Sidebar from '../components/Sidebar';
import TicketModal from '../components/TicketModal';
import { useMesswise } from '../context/MesswiseContext';
import { studentApi } from '../api/client';

const StudentPortal = () => {
  const { currentUser, studentMeals, toggleMealBooking } = useMesswise();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicketMeal, setSelectedTicketMeal] = useState(null);
  
  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // History filter
  const [historyFilter, setHistoryFilter] = useState('all');

  const handleToggle = (session) => {
    const isNowBooking = !studentMeals[session]?.booked;
    toggleMealBooking(session);

    if (isNowBooking) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#123B2A', '#EA580C', '#2F8563']
      });
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    try {
      await studentApi.submitFeedback('lunch', feedbackRating, feedbackText);
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSubmitted(false), 3500);
    } catch (err) {}
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
      <Sidebar role="student" activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="portal-main">
        {/* Application Header */}
        <header className="portal-header">
          <div className="header-title">
            <h1>Student Dining Portal</h1>
            <p>
              {currentUser.name} • {currentUser.hostel} (Room {currentUser.room}) • {currentUser.diet} Plan
            </p>
          </div>

          <div className="header-actions">
            <span className="badge badge-success">
              <CheckCircle2 size={13} /> Active Boarder
            </span>
            <span className="badge badge-neutral">
              Rank #{currentUser.eco_rank} Campus Eco
            </span>
          </div>
        </header>

        {/* Tab 1: Dashboard & Today's RSVPs */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI Summary Strip */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Meals Booked</div>
                  <div className="kpi-value">{currentUser.meals_booked}</div>
                  <div className="kpi-meta">September active term</div>
                </div>
                <div className="kpi-icon brand">
                  <Utensils size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Surplus Prevented</div>
                  <div className="kpi-value">{currentUser.meals_saved}</div>
                  <div className="kpi-meta">Via timely opt-outs</div>
                </div>
                <div className="kpi-icon brand">
                  <Leaf size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">CO₂ Diverted</div>
                  <div className="kpi-value">{currentUser.co2_avoided_kg} kg</div>
                  <div className="kpi-meta">Certified environmental credits</div>
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

            {/* Today's Meal RSVPs Section */}
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

            {/* Meal Quality & Supervisor Feedback */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Star size={16} />
                  <span>Kitchen Supervisor & Food Quality Feedback</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Directly dispatched to hostel head chef
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
                      <label className="form-label">Portion or spice comments</label>
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

        {/* Tab 2: Weekly Menu */}
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

      {/* Pass Modal */}
      <TicketModal
        isOpen={Boolean(selectedTicketMeal)}
        onClose={() => setSelectedTicketMeal(null)}
        mealType={selectedTicketMeal}
        mealData={selectedTicketMeal ? studentMeals[selectedTicketMeal] : null}
        studentName={currentUser.name}
      />
    </div>
  );
};

export default StudentPortal;
