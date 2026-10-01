import React, { useState } from 'react';
import { Truck, X, Check, MapPin, Clock } from 'lucide-react';

const RequestModal = ({ isOpen, onClose, surplus, surplusItem, onSubmit }) => {
  const item = surplus || surplusItem;
  const [volunteerName, setVolunteerName] = useState('Rakesh Verma');
  const [vehicle, setVehicle] = useState('Electric Van (DL-04-EV-8821)');
  const [eta, setEta] = useState('Within 30 mins');

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(item.id, {
      volunteer_name: volunteerName,
      vehicle: vehicle,
      eta: eta
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={18} />
            <h3>Dispatch Food Rescue Van</h3>
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
                {item.title} ({item.meals} portions)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={13} /> {item.hostel} • {item.location_detail}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} /> Deadline: {item.pickup_deadline}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Volunteer Driver Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rescue Vehicle Type</label>
                <select
                  className="form-control"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                >
                  <option value="Electric Van (DL-04-EV-8821)">Electric Van (DL-04-EV-8821) — Insulated Warmer</option>
                  <option value="Food Rescue Truck (DL-01-A-4432)">Food Rescue Truck (DL-01-A-4432) — Large Capacity</option>
                  <option value="Two-Wheeler Hot Case (DL-08-K-9012)">Two-Wheeler Hot Case (DL-08-K-9012) — Quick Dispatch</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Estimated Time of Arrival (ETA)</label>
                <select
                  className="form-control"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                >
                  <option value="Within 20 mins">Within 20 mins (Driver en route)</option>
                  <option value="Within 30 mins">Within 30 mins</option>
                  <option value="Within 45 mins">Within 45 mins</option>
                  <option value="Within 1 hour">Within 1 hour</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check size={14} /> Confirm & Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
