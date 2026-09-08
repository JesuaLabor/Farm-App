import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api';

type FontSize = 'default' | 'large' | 'extra-large';

const fontSizeOptions: { key: FontSize; label: string; description: string; rootSize: string }[] = [
  { key: 'default', label: 'Default', description: '16px — Standard readability', rootSize: '16px' },
  { key: 'large', label: 'Large', description: '18px — Easier to read', rootSize: '18px' },
  { key: 'extra-large', label: 'Extra Large', description: '20px — Maximum clarity', rootSize: '20px' },
];

type Theme = 'light' | 'dark';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ─── Privacy & Security state ───
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  // ─── Appearance state ───
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('agriconnect_font_size') as FontSize) || 'default';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('agriconnect_theme') as Theme) || 'light';
  });

  // Apply font size changes
  useEffect(() => {
    const option = fontSizeOptions.find((o) => o.key === fontSize);
    if (option) {
      document.documentElement.style.fontSize = option.rootSize;
      localStorage.setItem('agriconnect_font_size', fontSize);
    }
  }, [fontSize]);

  // Apply theme changes
  useEffect(() => {
    localStorage.setItem('agriconnect_theme', theme);
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  if (!user) return null;

  // ─── Password change handler ───
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toastWarning('Missing Fields', 'All password fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      toastWarning('Password Too Short', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toastError('Passwords Do Not Match', 'New password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      toastWarning('Identical Password', 'New password must be different from current password.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      toastSuccess('Password Changed', 'Your password has been updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to change password.';
      toastError('Change Failed', errorMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  // ─── Logout all sessions ───
  const handleLogoutAllSessions = () => {
    logout();
    navigate('/login');
  };

  // Password strength indicator
  const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (!pw) return { label: '', color: 'transparent', width: '0%' };
    if (pw.length < 8) return { label: 'Too short', color: '#BA3C3C', width: '20%' };
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (pw.length >= 12 && score >= 3) return { label: 'Strong', color: '#1E7E45', width: '100%' };
    if (pw.length >= 8 && score >= 2) return { label: 'Good', color: '#B87A00', width: '66%' };
    return { label: 'Weak', color: '#BA3C3C', width: '33%' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27' }}>
          Settings
        </h1>
        <p style={{ fontSize: '20px', color: '#525450', marginTop: '4px' }}>
          Manage your account security and personalize your experience.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '720px' }}>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Privacy & Security Section                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#EAF6EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}
            >
              🔒
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
                Privacy & Security
              </h2>
              <p style={{ fontSize: '15px', color: '#525450', margin: '2px 0 0 0' }}>
                Manage your password and account security
              </p>
            </div>
          </div>

          {/* ─── Change Password Form ─── */}
          <div
            style={{
              marginTop: '24px',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#F7FAF7',
              border: '1.5px solid #D1E5D9',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#176B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Change Password
            </h3>

            <form onSubmit={handleChangePassword}>
              {/* Current Password */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '16px' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    style={{ fontSize: '17px', paddingRight: '52px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: '#525450',
                      padding: '4px',
                      minHeight: 'auto',
                    }}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label" style={{ fontSize: '16px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    style={{ fontSize: '17px', paddingRight: '52px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: '#525450',
                      padding: '4px',
                      minHeight: 'auto',
                    }}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: '#E4E2DC',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginBottom: '6px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: passwordStrength.width,
                        backgroundColor: passwordStrength.color,
                        borderRadius: '3px',
                        transition: 'width 0.3s ease, background-color 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: passwordStrength.color }}>
                    Password strength: {passwordStrength.label}
                  </span>
                </div>
              )}

              {/* Confirm New Password */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '16px' }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    style={{
                      fontSize: '17px',
                      paddingRight: '52px',
                      borderColor: confirmNewPassword && confirmNewPassword !== newPassword ? '#BA3C3C' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: '#525450',
                      padding: '4px',
                      minHeight: 'auto',
                    }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {confirmNewPassword && confirmNewPassword !== newPassword && (
                  <span style={{ fontSize: '14px', color: '#BA3C3C', fontWeight: 700 }}>
                    Passwords do not match
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPassword || !currentPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                className="btn btn-primary"
                style={{ fontSize: '17px', width: '100%' }}
              >
                {changingPassword ? 'Changing password…' : '🔑 Update Password'}
              </button>
            </form>
          </div>

          {/* ─── Login Sessions ─── */}
          <div
            style={{
              marginTop: '24px',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#FAFAF7',
              border: '1.5px solid #E4E2DC',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#176B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Login Sessions
            </h3>
            <p style={{ fontSize: '15px', color: '#525450', marginBottom: '16px', lineHeight: 1.5 }}>
              Signing out of all sessions will log you out from every device where you are currently signed in. You will need to sign in again on each device.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1.5px solid #E4E2DC',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#EAF6EE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                💻
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1C1A' }}>
                  Current Session
                </div>
                <div style={{ fontSize: '13px', color: '#525450', marginTop: '2px' }}>
                  This device • Active now
                </div>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#1E7E45',
                  background: '#EAF6EE',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(30, 126, 69, 0.2)',
                }}
              >
                ACTIVE
              </span>
            </div>

            <button
              onClick={handleLogoutAllSessions}
              className="btn"
              style={{
                width: '100%',
                fontSize: '16px',
                background: '#FDF2F2',
                color: '#BA3C3C',
                border: '2px solid #F8D7D7',
                fontWeight: 700,
              }}
            >
              🚪 Sign Out of All Sessions
            </button>
          </div>

          {/* ─── Data Privacy ─── */}
          <div
            style={{
              marginTop: '24px',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#FAFAF7',
              border: '1.5px solid #E4E2DC',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#176B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Data Privacy
            </h3>
            <p style={{ fontSize: '15px', color: '#525450', lineHeight: 1.6 }}>
              Your personal information is protected and only shared with authorized entities as needed for agricultural services. We follow data privacy best practices to keep your account secure.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '14px',
                padding: '12px 16px',
                background: '#EAF6EE',
                borderRadius: '12px',
                border: '1px solid rgba(23, 107, 58, 0.15)',
              }}
            >
              <span style={{ fontSize: '18px' }}>✅</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#176B3A' }}>
                Your account is secured with encrypted password storage (bcrypt)
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Appearance Section                                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#EBF4FC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}
            >
              🎨
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
                Appearance
              </h2>
              <p style={{ fontSize: '15px', color: '#525450', margin: '2px 0 0 0' }}>
                Customize the look and feel of the application
              </p>
            </div>
          </div>

          {/* ─── Theme Toggle ─── */}
          <div
            style={{
              marginTop: '24px',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#F7FAF7',
              border: '1.5px solid #D1E5D9',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#176B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              Theme
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Light Mode */}
              <button
                onClick={() => setTheme('light')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '20px 16px',
                  borderRadius: '16px',
                  border: `2.5px solid ${theme === 'light' ? '#176B3A' : '#E4E2DC'}`,
                  background: theme === 'light' ? '#EAF6EE' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  minHeight: 'auto',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    border: '2px solid #E4E2DC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                  }}
                >
                  ☀️
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: theme === 'light' ? '#0E4A27' : '#1A1C1A' }}>
                    Light
                  </div>
                  <div style={{ fontSize: '13px', color: '#525450', marginTop: '2px' }}>
                    Bright & clear
                  </div>
                </div>
                {theme === 'light' && (
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#176B3A', background: '#FFFFFF', padding: '3px 10px', borderRadius: '9999px', border: '1.5px solid #176B3A' }}>
                    Active
                  </span>
                )}
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => setTheme('dark')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '20px 16px',
                  borderRadius: '16px',
                  border: `2.5px solid ${theme === 'dark' ? '#176B3A' : '#E4E2DC'}`,
                  background: theme === 'dark' ? '#EAF6EE' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  minHeight: 'auto',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: '#1A1C1A',
                    border: '2px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                  }}
                >
                  🌙
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: theme === 'dark' ? '#0E4A27' : '#1A1C1A' }}>
                    Dark
                  </div>
                  <div style={{ fontSize: '13px', color: '#525450', marginTop: '2px' }}>
                    Easy on eyes
                  </div>
                </div>
                {theme === 'dark' && (
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#176B3A', background: '#FFFFFF', padding: '3px 10px', borderRadius: '9999px', border: '1.5px solid #176B3A' }}>
                    Active
                  </span>
                )}
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#525450', marginTop: '14px', fontStyle: 'italic' }}>
              Note: Dark mode is currently in preview. Some elements may not fully support dark mode yet.
            </p>
          </div>

          {/* ─── Text Size ─── */}
          <div
            style={{
              marginTop: '24px',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#FAFAF7',
              border: '1.5px solid #E4E2DC',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#176B3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
              Text Size
            </h3>
            <p style={{ fontSize: '15px', color: '#525450', marginBottom: '16px' }}>
              Adjust the text size across the entire application for better readability.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {fontSizeOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFontSize(option.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    border: `2.5px solid ${fontSize === option.key ? '#176B3A' : '#E4E2DC'}`,
                    background: fontSize === option.key ? '#EAF6EE' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                    minHeight: 'auto',
                    width: '100%',
                  }}
                >
                  {/* Radio indicator */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2.5px solid ${fontSize === option.key ? '#176B3A' : '#D8D6CF'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {fontSize === option.key && (
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#176B3A',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: option.rootSize, fontWeight: 700, color: fontSize === option.key ? '#0E4A27' : '#1A1C1A' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: '13px', color: '#525450', marginTop: '2px' }}>
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Preview */}
            <div
              style={{
                marginTop: '16px',
                padding: '16px 20px',
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1.5px solid #E4E2DC',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#525450', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Preview
              </div>
              <p style={{ fontSize: fontSizeOptions.find((o) => o.key === fontSize)?.rootSize, color: '#1A1C1A', lineHeight: 1.5 }}>
                This is how your text will look across the application. Larger text makes reading easier, especially on mobile devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
