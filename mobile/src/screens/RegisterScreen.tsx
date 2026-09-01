import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types/auth';
import { Spinner } from '../components/Spinner';

const roles: { role: Role; label: string; icon: string; desc: string }[] = [
  { role: 'farmer',    label: 'Farmer',    icon: '🧑‍🌾', desc: 'Sell produce & access market rates' },
  { role: 'buyer',     label: 'Buyer',     icon: '📦',  desc: 'Source fresh crops from local farms' },
  { role: 'supplier',  label: 'Supplier',  icon: '🚜',  desc: 'Sell seeds, fertilizers & machinery' },
  { role: 'expert',    label: 'Expert',    icon: '🎓',  desc: 'Provide agronomic advice & consultation' },
  { role: 'lgu_staff', label: 'LGU Staff', icon: '🏛️',  desc: 'Coordinate regional farm programs' },
];

export const RegisterScreen: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      await register({ email, password, role, firstName, lastName });
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
