import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100dvh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Left Branding Panel */}
      <div
        className="hero-gradient"
        style={{
          flex: '1.15',
          padding: '56px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient radial glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%), ' +
              'radial-gradient(ellipse at 20% 80%, rgba(0,0,0,0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            🌾
          </div>
          <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            AgriConnect
          </span>
        </div>

        {/* Main copy */}
        <div style={{ maxWidth: '480px', position: 'relative' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '5px 14px',
              borderRadius: '6px',
              marginBottom: '20px',
            }}
          >
            Philippine Agricultural Platform
          </div>

          <h1
            className="text-display"
            style={{ color: '#fff', marginBottom: '18px' }}
          >
            Where farmers and markets connect
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.65,
              opacity: 0.85,
              maxWidth: '400px',
              textWrap: 'pretty' as any,
            }}
          >
            Streamline supply chains, track live commodity prices, and work
            alongside LGU units and crop specialists — all in one place.
          </p>
        </div>

        {/* Trust indicators */}
        <div
          style={{
            display: 'flex',
            gap: '28px',
            opacity: 0.75,
            fontSize: '13px',
            fontWeight: 500,
            position: 'relative',
          }}
        >
          {['Role-based access', 'Direct trade', 'Expert guidance'].map((item) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                }}
              >
                ✓
              </span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Right Login Form */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          background: 'var(--color-bg)',
        }}
      >
        <div
          className="animate-fade-in"
          style={{ width: '100%', maxWidth: '420px' }}
        >
          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: '6px',
                letterSpacing: '-0.5px',
              }}
            >
              Welcome back
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Sign in to your AgriConnect account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="form-error" role="alert" style={{ marginBottom: '24px' }}>
              <span aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label htmlFor="login-email" className="form-label">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-full"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Register link */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
            }}
          >
            No account yet?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--color-accent)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = 'underline')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = 'none')}
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
