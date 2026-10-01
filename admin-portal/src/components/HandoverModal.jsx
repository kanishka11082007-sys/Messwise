import React, { useState } from 'react';
import { ShieldCheck, X, Check, KeyRound } from 'lucide-react';

const HandoverModal = ({ isOpen, onClose, request, onVerify, onConfirm }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 4-digit OTP provided by the NGO driver.');
      return;
    }
    if (onVerify) {
      onVerify(request.id, otp.trim());
    } else if (onConfirm) {
      onConfirm(request.id, otp.trim());
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} />
            <h3>Donation Handover Verification</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ backgroundColor: 'var(--bg-canvas-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {request.food_title} ({request.meals} meals)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Driver: <strong>{request.volunteer_name || 'Helping Hands Volunteer'}</strong> ({request.vehicle || 'Van'})
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Enter 4-Digit Pickup OTP Code
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <KeyRound size={18} color="var(--accent-warm)" />
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value); setError(''); }}
                  placeholder="7412"
                  style={{
                    width: '140px',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textAlign: 'center',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--brand-900)',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                  autoFocus
                />
              </div>

              {request.otp && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Expected Demo OTP: <strong style={{ color: 'var(--brand-900)' }}>{request.otp}</strong>
                </div>
              )}

              {error && (
                <div style={{ color: 'var(--danger-text)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.4rem' }}>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check size={14} /> Verify & Complete Handover
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HandoverModal;
