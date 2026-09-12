import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types/auth';
import { Spinner } from '../components/Spinner';
import {
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
} from '../data/philippineLocations';

const roles: { role: Role; label: string; icon: string; desc: string }[] = [
  { role: 'farmer', label: 'Farmer', icon: '🧑‍🌾', desc: 'Sell produce & access market rates' },
  { role: 'buyer', label: 'Buyer', icon: '📦', desc: 'Source fresh crops from local farms' },
  { role: 'supplier', label: 'Supplier', icon: '🏪', desc: 'Sell seeds, fertilizers & machinery' },
  { role: 'lgu_staff', label: 'LGU Staff', icon: '🏛️', desc: 'Coordinate regional farm programs' },
];

const ALL_REGIONS = getRegions();
const DEFAULT_REGION = 'Region X - Northern Mindanao';
const DEFAULT_PROV = 'Bukidnon';
const DEFAULT_MUN = 'Malaybalay City';
const DEFAULT_BAR = 'Aglayan';

export const RegisterScreen: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [province, setProvince] = useState(DEFAULT_PROV);
  const [municipality, setMunicipality] = useState(DEFAULT_MUN);
  const [barangay, setBarangay] = useState(DEFAULT_BAR);

  const [role, setRole] = useState<Role>('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedPending, setSubmittedPending] = useState(false);

  const provinces = getProvinces(region);
  const municipalities = getMunicipalities(region, province);
  const barangays = getBarangays(region, province, municipality);

  const handleRegionChange = (newRegion: string) => {
    const provs = getProvinces(newRegion);
    const newProv = provs[0] || '';
    const muns = getMunicipalities(newRegion, newProv);
    const newMun = muns[0] || '';
    const bars = getBarangays(newRegion, newProv, newMun);

    setRegion(newRegion);
    setProvince(newProv);
    setMunicipality(newMun);
    setBarangay(bars[0] || '');
  };

  const handleProvinceChange = (newProv: string) => {
    const muns = getMunicipalities(region, newProv);
    const newMun = muns[0] || '';
    const bars = getBarangays(region, newProv, newMun);

    setProvince(newProv);
    setMunicipality(newMun);
    setBarangay(bars[0] || '');
  };

  const handleMunicipalityChange = (newMun: string) => {
    const bars = getBarangays(region, province, newMun);
    setMunicipality(newMun);
    setBarangay(bars[0] || '');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all required fields.'); return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await register({ email, password, role, firstName, lastName, region, province, municipality, barangay });
      if (res.token) {
        navigate('/dashboard');
      } else {
        setSubmittedPending(true);
      }
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; response?: { data?: { error?: string } } };
      if (e.code === 'ECONNABORTED' || e.message === 'Network Error' || !e.response) {
        setError('Cannot reach server. Make sure the backend is running and accessible.');
      } else {
        setError(e.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submittedPending) {
    const approverText = role === 'lgu_staff' ? 'Super Admin' : `LGU Staff of ${municipality || region}`;

    return (
      <div className="auth-root">
        <div className="auth-header">
          <div className="auth-logo-mark">⏳</div>
          <div className="auth-app-name">Application Submitted</div>
          <div className="auth-tagline">Pending Approval</div>
        </div>

        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
            Your account application for{' '}
            <strong>Brgy. {barangay}, {municipality}, {province} ({region})</strong> has been submitted.
            <br /><br />
            It is currently pending approval by the <strong>{approverText}</strong>.
          </p>

          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="auth-header">
        <div className="auth-logo-mark">🌾</div>
        <div className="auth-app-name">AgriConnect</div>
        <div className="auth-tagline">Join the Philippine agricultural community</div>
      </div>

      <form className="auth-card" onSubmit={handleRegister} noValidate>
        <div className="auth-card-title">Create your account</div>
        <div className="auth-card-subtitle">Choose a role to get started</div>

        {error && <div className="error-box">{error}</div>}

        {/* Role selector */}
        <label className="label">Your role</label>
        <div className="role-grid">
          {roles.map((r) => (
            <button
              key={r.role}
              type="button"
              className={`role-card ${role === r.role ? 'selected' : ''}`}
              onClick={() => setRole(r.role)}
            >
              <span className="role-icon">{r.icon}</span>
              <div className="role-label">{r.label}</div>
              <div className="role-desc">{r.desc}</div>
            </button>
          ))}
        </div>

        {/* Name row */}
        <div className="field-row">
          <div className="field">
            <label className="label" htmlFor="reg-first">First name</label>
            <input
              id="reg-first"
              className="input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Juan"
              autoComplete="given-name"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="reg-last">Last name</label>
            <input
              id="reg-last"
              className="input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="dela Cruz"
              autoComplete="family-name"
            />
          </div>
        </div>

        {/* Cascading Location */}
        <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--color-surface, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)', marginBottom: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '10px' }}>
            📍 Your LGU Jurisdiction
          </div>

          {/* 1. Region */}
          <div className="field">
            <label className="label" htmlFor="reg-region">1. Region</label>
            <select
              id="reg-region"
              className="input"
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
            >
              {ALL_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* 2. Province */}
          <div className="field">
            <label className="label" htmlFor="reg-province">2. Province</label>
            <select
              id="reg-province"
              className="input"
              value={province}
              onChange={(e) => handleProvinceChange(e.target.value)}
            >
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* 3. Municipality */}
          <div className="field">
            <label className="label" htmlFor="reg-municipality">3. Municipality / City</label>
            <select
              id="reg-municipality"
              className="input"
              value={municipality}
              onChange={(e) => handleMunicipalityChange(e.target.value)}
            >
              {municipalities.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* 4. Barangay */}
          <div className="field">
            <label className="label" htmlFor="reg-barangay">4. Barangay</label>
            <select
              id="reg-barangay"
              className="input"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
            >
              {barangays.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="reg-email">Email address</label>
          <input
            id="reg-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@agri.com"
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="reg-password">Password (min. 8 characters)</label>
          <input
            id="reg-password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <Spinner size={20} /> : 'Create account'}
        </button>

        <div className="link-row">
          Already registered?{' '}
          <span className="link-accent" onClick={() => navigate('/login')}>
            Sign in
          </span>
        </div>
      </form>

      <div className="auth-footer">AgriConnect · Department of Agriculture Partnership</div>
    </div>
  );
};
