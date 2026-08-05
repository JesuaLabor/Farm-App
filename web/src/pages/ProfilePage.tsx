import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { api } from '../api';

const philippineRegions = [
  'NCR - National Capital Region',
  'CAR - Cordillera Administrative Region',
  'Region I - Ilocos Region',
  'Region II - Cagayan Valley',
  'Region III - Central Luzon',
  'Region IV-A - CALABARZON',
  'MIMAROPA Region',
  'Region V - Bicol Region',
  'Region VI - Western Visayas',
  'Region VII - Central Visayas',
  'Region VIII - Eastern Visayas',
  'Region IX - Zamboanga Peninsula',
  'Region X - Northern Mindanao',
  'Region XI - Davao Region',
  'Region XII - SOCCSKSARGEN',
  'Region XIII - Caraga',
  'BARMM - Bangsamoro Autonomous Region',
];

const roleLabelMap: Record<string, string> = {
  farmer:    'Farmer Producer',
  buyer:     'Wholesale Buyer',
  supplier:  'Agri Supplier',
  expert:    'Agronomist Expert',
  lgu_staff: 'LGU Officer',
};

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [region, setRegion] = useState(user?.region || '');
  const [address, setAddress] = useState(user?.address || '');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.updateProfile({ firstName, lastName, phone, region, address });
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      await api.uploadPhoto(file);
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile photo updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Photo upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main" style={{ maxWidth: '800px' }}>
        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="page-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="page-header-label">Account settings</span>
            <h1 className="page-header-title">Personal profile</h1>
            <p className="page-header-sub">
              Manage your profile details, contact information, and regional location.
            </p>
          </div>
        </div>

        {message && (
          <div className={`feedback-box feedback-box--${message.type}`}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Avatar & Role Header Card */}
          <div className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-accent)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 800,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {user.photoUrl ? (
                  <img src={`http://localhost:8080${user.photoUrl}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.firstName[0]?.toUpperCase()
                )}
              </div>

              <label
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--green-700)',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
                title="Upload photo"
              >
                📷
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
            </div>

            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '2px 0 10px 0' }}>
                {user.email}
              </p>
              <span className="badge badge-green">
                {roleLabelMap[user.role] ?? user.role}
              </span>
              {uploading && (
                <span style={{ fontSize: '13px', color: 'var(--color-accent)', marginLeft: '12px', fontWeight: 600 }}>
                  Uploading photo…
                </span>
              )}
            </div>
          </div>

          {/* Details Form Card */}
          <div className="card-elevated">
            <h3 className="text-title" style={{ marginBottom: '20px' }}>
              Personal information
            </h3>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                <div className="form-field">
                  <label className="form-label">First name</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Last name</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Phone number</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 917 123 4567"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Region / Province</label>
                  <select
                    className="form-input"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="">Select Region</option>
                    {philippineRegions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Full address</label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, Barangay, City, Province"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn--primary"
                style={{ marginTop: '8px' }}
              >
                {saving ? 'Saving changes…' : 'Save profile changes'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
