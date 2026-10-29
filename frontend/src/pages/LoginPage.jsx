import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';
  const registeredNotice = location.state?.registeredNotice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Please provide both username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await login(usernameOrEmail.trim(), password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F4F7F9',
      padding: '24px 16px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(15, 34, 64, 0.08)',
        border: '1px solid var(--border-default)',
        padding: '36px 32px'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--navy-deep)',
            color: '#FFFFFF',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(15, 34, 64, 0.2)'
          }}>
            <ShieldCheck size={26} color="var(--gold-soft)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy-deep)', margin: 0 }}>
            Enterprise XAI Platform
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: 0 }}>
            Sign in to access credit-risk decision intelligence & audit records
          </p>
        </div>

        {/* Success Notice from Registration */}
        {registeredNotice && (
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
            <CheckCircle2 size={16} color="var(--green-forest)" style={{ flexShrink: 0 }} />
            <span>{registeredNotice}</span>
          </div>
        )}

        {/* Error Alert */}
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
            <AlertCircle size={16} color="var(--coral-warm)" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Username or Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--navy-deep)',
              marginBottom: '6px'
            }}>
              Username or Corporate Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={16} />
              </div>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="analyst@enterprise.com or username"
                required
                id="login-username-input"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '7px',
                  border: '1px solid var(--border-default)',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--navy-deep)' }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '12px', color: 'var(--teal-primary)', textDecoration: 'none', fontWeight: 500 }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                id="login-password-input"
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 38px',
                  borderRadius: '7px',
                  border: '1px solid var(--border-default)',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="remember-me" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Keep me signed in for 7 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            id="login-submit-btn"
            className="btn btn-primary"
            style={{
              padding: '11px',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px'
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div style={{
          marginTop: '26px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-default)',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          Don't have an enterprise account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--teal-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
