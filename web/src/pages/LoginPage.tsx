import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import agriConnectLogo from '../assets/AgriConnect.svg';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error, warning } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Exclude dark mode on the login page
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    return () => {
      const saved = localStorage.getItem('agriconnect_theme') || 'light';
      let effective = saved;
      if (saved === 'system') {
        effective = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      if (effective === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    };
  }, []);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      warning('Required Fields Missing', 'Please provide both your email address and password.');
      setHasError(true);
      return;
    }

    setLoading(true);
    setHasError(false);

    try {
      await login({ email: email.trim(), password });
      success('Welcome back!', 'Signed in successfully. Redirecting to your dashboard...');
      navigate(from, { replace: true });
    } catch (err: any) {
      setHasError(true);
      const errMsg: string =
        err.response?.data?.error ||
        'Login failed. Please verify your credentials and try again.';

      // Determine appropriate toast type and display in top-right
      if (errMsg.toLowerCase().includes('pending approval')) {
        warning(
          'Account Pending Verification',
          errMsg
        );
      } else if (errMsg.toLowerCase().includes('rejected')) {
        error(
          'Registration Denied',
          errMsg
        );
      } else {
        error(
          'Sign-in Failed',
          errMsg
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page-root"
      style={{
        display: 'flex',
        minHeight: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        background: '#FAF8F5',
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════════════
          LEFT BRANDING & HERO PANEL (Rich High-Contrast Forest Green Gradient)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: '1.15',
          padding: '56px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #062814 0%, #0E4A27 45%, #15803D 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Ambient radial glows for visual depth */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.15) 0%, transparent 55%), ' +
              'radial-gradient(ellipse at 15% 85%, rgba(0,0,0,0.25) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Logo & Platform Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2 }}>
          <img
            src={agriConnectLogo}
            alt="AgriConnect Logo"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              objectFit: 'cover',
              border: '1.5px solid rgba(255,255,255,0.35)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1, color: '#FFFFFF' }}>
              AgriConnect
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 500, letterSpacing: '0.2px' }}>
              Connect. Grow. Prosper.
            </div>
          </div>
        </div>

        {/* Hero Narrative Copy */}
        <div style={{ maxWidth: '480px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#FFFFFF',
              padding: '6px 16px',
              borderRadius: '20px',
              marginBottom: '22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span>🇵🇭</span>
            <span>Philippine Agricultural Platform</span>
          </div>

          <h1
            style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '18px',
              lineHeight: 1.2,
              letterSpacing: '-0.8px',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            Where farmers, suppliers & markets connect.
          </h1>

          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '430px',
              margin: 0,
            }}
          >
            Streamline agricultural trade, monitor live DA commodity price benchmarks, access municipal assistance programs, and work with licensed agronomists — all in one secure platform.
          </p>
        </div>

        {/* Platform Pillars / Trust Indicators */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '24px',
          }}
        >
          {[
            'Direct Farm-to-Market Trade',
            'Official LGU Price Benchmarks',
            'Role-Based Secure Access',
            'Agricultural Community Hub',
          ].map((item) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  border: '1.5px solid #FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          RIGHT SIGN-IN FORM PANEL (Clean, High-Affordance & Top-Right Notifications)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          backgroundColor: '#FAF8F5',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#FFFFFF',
            padding: '40px 36px',
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
            border: '1.5px solid #E2E8F0',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '30px',
                fontWeight: 800,
                color: '#0E4A27',
                marginBottom: '8px',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
              }}
            >
              Welcome back
            </h2>
            <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
              Sign in with your verified credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  marginBottom: '8px',
                }}
              >
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '16px',
                    color: '#94A3B8',
                    pointerEvents: 'none',
                  }}
                >
                  ✉️
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@gmail.com"
                  className="form-input"
                  style={{
                    height: '50px',
                    paddingLeft: '46px',
                    fontSize: '15px',
                    borderRadius: '12px',
                    border: hasError ? '2px solid #EF4444' : '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  Password
                </label>
              </div>

              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '16px',
                    color: '#94A3B8',
                    pointerEvents: 'none',
                  }}
                >
                  🔒
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                  style={{
                    height: '50px',
                    paddingLeft: '46px',
                    paddingRight: '48px',
                    fontSize: '15px',
                    borderRadius: '12px',
                    border: hasError ? '2px solid #EF4444' : '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#64748B',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '26px',
                fontSize: '14px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#176B3A', cursor: 'pointer' }}
                />
                <span>Remember me</span>
              </label>

              <span style={{ color: '#64748B', fontSize: '13px' }}>
                Need help? <strong style={{ color: '#0E4A27' }}>Contact LGU</strong>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{
                height: '52px',
                fontSize: '16px',
                fontWeight: 800,
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(23, 107, 58, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span>🔄</span> Signing in…
                </>
              ) : (
                'Sign in to AgriConnect →'
              )}
            </button>
          </form>

          {/* Create Account Link */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid #F1F5F9',
              textAlign: 'center',
              fontSize: '14px',
              color: '#64748B',
            }}
          >
            No account yet?{' '}
            <Link
              to="/register"
              style={{
                color: '#176B3A',
                fontWeight: 800,
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
