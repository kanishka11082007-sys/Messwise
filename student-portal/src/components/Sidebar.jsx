import React from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  CalendarCheck, 
  Award, 
  LogOut,
  ExternalLink
} from 'lucide-react';
import { authApi } from '../api/client';

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <aside className="portal-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Utensils size={18} strokeWidth={2.2} />
        </div>
        <div className="brand-text">
          <h2>MessWise</h2>
          <span className="brand-badge">Student Portal</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Dining Operations</div>
        
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <div className="nav-label">
            <LayoutDashboard size={16} />
            <span>Today's RSVPs</span>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => onTabChange('menu')}
        >
          <div className="nav-label">
            <Utensils size={16} />
            <span>Weekly Dining Menu</span>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabChange('history')}
        >
          <div className="nav-label">
            <CalendarCheck size={16} />
            <span>Meal Pass History</span>
          </div>
        </button>

        <div className="nav-section-title" style={{ marginTop: '0.5rem' }}>Performance</div>

        <button
          className={`nav-item ${activeTab === 'impact' ? 'active' : ''}`}
          onClick={() => onTabChange('impact')}
        >
          <div className="nav-label">
            <Award size={16} />
            <span>Eco Impact</span>
          </div>
          <span className="nav-badge">#12 Rank</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 0.5rem' }}>
          Switch Workspaces
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <a
            href="http://localhost:3002"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', justifyContent: 'center' }}
          >
            Admin
          </a>
          <a
            href="http://localhost:3003"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', justifyContent: 'center' }}
          >
            NGO
          </a>
        </div>

        <div className="user-mini-card">
          <div className="user-mini-info">
            <div className="user-avatar">NS</div>
            <div>
              <div className="user-name">Nitin Sharma</div>
              <div className="user-sub">Hostel A • B-304</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
