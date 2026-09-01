import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/Spinner';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; response?: { data?: { error?: string } } };
      if (e.code === 'ECONNABORTED' || e.message === 'Network Error' || !e.response) {
        setError('Cannot reach server. Please make sure the backend is running and try again.');
      } else {
        setError(e.response?.data?.error || 'Login failed. Check your credentials and try again.');
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
        <div className="auth-tagline">
          Connecting farmers, buyers, and suppliers across the Philippines
        </div>
      </div>

      <form className="auth-card" onSubmit={handleLogin} noValidate>
        <div className="auth-card-title">Welcome back</div>
        <div className="auth-card-subtitle">Sign in to your account</div>

        {error && <div className="error-box">{error}</div>}

        <div className="field">
          <label className="label" htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="farmer@agri.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <Spinner size={20} /> : 'Sign in'}
        </button>

        <div className="link-row">
          New to AgriConnect?{' '}
          <span className="link-accent" onClick={() => navigate('/register')}>
            Create an account
          </span>
        </div>
      </form>

      <div className="auth-footer">AgriConnect · Department of Agriculture Partnership</div>
    </div>
  );
};
