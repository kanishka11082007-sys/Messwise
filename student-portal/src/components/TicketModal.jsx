import React from 'react';
import { QrCode, X, Check, Printer, Clock } from 'lucide-react';

const TicketModal = ({ isOpen, onClose, mealType, mealData, studentName = 'Nitin Sharma' }) => {
  if (!isOpen || !mealData) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={18} />
            <h3>Digital Meal Pass</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            backgroundColor: 'var(--bg-canvas-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Hostel A • Aryabhatta Dining Facility
            </div>
            
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {mealType?.toUpperCase()} SESSION
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--brand-50)', color: 'var(--brand-900)', border: '1px solid var(--brand-100)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-xs)', fontWeight: 600, fontSize: '0.78rem', margin: '0.65rem 0' }}>
              <Clock size={13} />
              <span>{mealData.time}</span>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', margin: '0.4rem 0' }}>
              {mealData.menu}
            </div>

            <div style={{ margin: '1rem auto 0.65rem', width: '120px', height: '120px', backgroundColor: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
              <QrCode size={75} color="var(--brand-900)" />
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>DINING COUNTER QR</span>
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--brand-900)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
              {mealData.token || 'TK-ACTIVE-892'}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Registered to: <strong>{studentName}</strong> (2022CSB042)
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Print Pass
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            <Check size={14} /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
