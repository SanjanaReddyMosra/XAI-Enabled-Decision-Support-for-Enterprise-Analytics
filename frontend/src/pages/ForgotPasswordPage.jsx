import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      const res = await forgotPassword(email.trim());
      setMessage(res.message || 'If an account matches that email, reset instructions have been generated.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to request password reset.');
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'var(--navy-deep)',
            color: '#FFFFFF',
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(15, 34, 64, 0.2)'
          }}>
            <ShieldCheck size={24} color="var(--gold-soft)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy-deep)', margin: 0 }}>
            Password Recovery
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: 0 }}>
            Enter your registered enterprise email address to initiate secure access recovery.
          </p>
        </div>

        {message && (
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
            <span>{message}</span>
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
            <AlertCircle size={16} color="var(--coral-warm)" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '6px' }}>
              Registered Corporate Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@enterprise.com"
                required
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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '11px', fontSize: '14px', fontWeight: 600, marginTop: '4px' }}
          >
            {loading ? 'Processing...' : 'Send Recovery Instructions'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--teal-primary)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
