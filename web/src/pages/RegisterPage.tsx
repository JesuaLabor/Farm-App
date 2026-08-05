import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types/auth';

const rolesList: { role: Role; title: string; desc: string; icon: string }[] = [
  { role: 'farmer',   title: 'Farmer',    desc: 'Sell produce and access live market rates',       icon: '🧑‍🌾' },
  { role: 'buyer',    title: 'Buyer',     desc: 'Source fresh crops and livestock directly',        icon: '📦' },
  { role: 'supplier', title: 'Supplier',  desc: 'Sell seeds, fertilizers, and machinery',          icon: '🚜' },
  { role: 'expert',   title: 'Expert',    desc: 'Provide agronomic advice and consultation',        icon: '🎓' },
  { role: 'lgu_staff',title: 'LGU Staff', desc: 'Coordinate regional agricultural programs',        icon: '🏛️' },
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>('farmer');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({ email, password, role, firstName, lastName });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = rolesList.find((r) => r.role === role);

  return (
    <div
      className="gradient-bg"
      style={{
        minHeight: '100dvh',
        padding: '48px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '620px',
          borderRadius: 'var(--radius-xl)',
          padding: '44px',
          marginBottom: '40px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <span style={{ fontSize: '26px' }}>🌾</span>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--color-text)',
                letterSpacing: '-0.4px',
              }}
            >
              AgriConnect
            </span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--color-text)',
              letterSpacing: '-0.4px',
              marginBottom: '6px',
            }}
          >
            Create your account
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Choose your role to personalize your experience
          </p>
        </div>

        {error && (
          <div className="form-error" role="alert" style={{ marginBottom: '24px' }}>
            <span aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Role Selection */}
          <div style={{ marginBottom: '28px' }}>
            <div className="form-label" style={{ marginBottom: '12px' }}>
              Select your role
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '10px',
              }}
            >
              {rolesList.map((r) => {
                const isSelected = role === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    id={`role-${r.role}`}
                    onClick={() => setRole(r.role)}
                    aria-pressed={isSelected}
                    style={{
                      padding: '16px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '2px solid var(--color-accent)'
                        : '1.5px solid var(--color-border)',
                      backgroundColor: isSelected
                        ? 'var(--color-accent-light)'
                        : 'var(--color-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--gray-300)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--gray-50)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                      }
                    }}
                  >
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{r.icon}</div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: isSelected ? 'var(--green-700)' : 'var(--color-text)',
                        marginBottom: '3px',
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.4,
                      }}
                    >
                      {r.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name fields */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            <div className="form-group">
              <label htmlFor="reg-firstname" className="form-label">
                First name
              </label>
              <input
                id="reg-firstname"
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Maria"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-lastname" className="form-label">
                Last name
              </label>
              <input
                id="reg-lastname"
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Santos"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label htmlFor="reg-email" className="form-label">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label htmlFor="reg-password" className="form-label">
              Password{' '}
              <span style={{ fontWeight: 400, color: 'var(--color-text-light)' }}>
                (8+ characters)
              </span>
            </label>
            <input
              id="reg-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            id="register-submit"
            disabled={loading}
            className="btn btn-primary btn-lg btn-full"
          >
            {loading
              ? 'Creating account…'
              : `Register as ${selectedRole?.title ?? 'Farmer'}`}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = 'underline')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = 'none')}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
