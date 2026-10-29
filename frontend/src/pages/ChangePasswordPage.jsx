import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SectionHeader from '../components/common/SectionHeader';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';

export const ChangePasswordPage = () => {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Password criteria indicators
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNum = /\d/.test(newPassword);
  const hasSpecial = /[^a-zA-Z\d]/.test(newPassword);
  const isMatch = newPassword && newPassword === confirmNewPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!hasMinLen || !hasUpper || !hasLower || !hasNum || !hasSpecial) {
      setErrorMessage('New password must satisfy all 5 complexity criteria.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await changePassword(currentPassword, newPassword, confirmNewPassword);
      setSuccessMessage(res.message || 'Password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        tag="SECURITY & ACCESS MANAGEMENT"
        title="Update Account Password"
        subtitle="Verify your existing credentials to establish a cryptographically salted bcrypt password hash."
      />

      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '28px' }}>
          {successMessage && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--green-soft)',
              border: '1px solid #C6E9D7',
              color: 'var(--green-forest)',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: '#FEECEC',
              border: '1px solid #F8C6C6',
              color: 'var(--coral-warm)',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Current Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                Current Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 36px 9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter newly chosen password"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 36px 9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Password Criteria Checklist */}
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '6px',
              fontSize: '11.5px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px'
            }}>
              <span style={{ color: hasMinLen ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                {hasMinLen ? '✓' : '○'} At least 8 characters
              </span>
              <span style={{ color: hasUpper ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                {hasUpper ? '✓' : '○'} Uppercase letter (A-Z)
              </span>
              <span style={{ color: hasLower ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                {hasLower ? '✓' : '○'} Lowercase letter (a-z)
              </span>
              <span style={{ color: hasNum ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                {hasNum ? '✓' : '○'} Numeric digit (0-9)
              </span>
              <span style={{ color: hasSpecial ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                {hasSpecial ? '✓' : '○'} Special character (!@#$...)
              </span>
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${confirmNewPassword && !isMatch ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {confirmNewPassword && !isMatch && (
                <span style={{ fontSize: '11px', color: 'var(--coral-warm)', marginTop: '4px', display: 'block' }}>
                  Passwords do not match.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '11px', fontSize: '13.5px', fontWeight: 600, marginTop: '8px' }}
            >
              {loading ? 'Verifying & Updating...' : 'Update Password Hash'}
            </button>
          </form>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-default)', textAlign: 'center' }}>
            <Link
              to="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                color: 'var(--teal-primary)',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
