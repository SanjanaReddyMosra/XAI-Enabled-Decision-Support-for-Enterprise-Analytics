import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowLeft, Lock, Info, Mail } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(15, 34, 64, 0.08)',
        border: '1px solid var(--border-default)',
        padding: '36px 32px'
      }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--navy-deep)',
            color: '#FFFFFF',
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(15, 34, 64, 0.2)'
          }}>
            <ShieldCheck size={26} color="var(--gold-soft)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy-deep)', margin: 0 }}>
            Password Recovery Notice
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: 0 }}>
            Enterprise Credential Governance & Access Management
          </p>
        </div>

        {/* Informational Policy Banner */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '8px',
          backgroundColor: '#F4F7FB',
          border: '1px solid #D6E4F0',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Info size={18} color="var(--navy-deep)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              <strong>Direct automated password redemption is restricted.</strong>
              <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                In accordance with enterprise risk governance, automated web-based password resets are not processed autonomously on this instance.
              </div>
            </div>
          </div>
        </div>

        {/* Token Context Notice */}
        {token ? (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: '#FFF9E6',
            border: '1px solid #FFE082',
            fontSize: '12px',
            color: '#8D6E14',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#8D6E14" style={{ flexShrink: 0 }} />
            <span>A reset token was received, but automated submission is disabled by server policy.</span>
          </div>
        ) : null}

        {/* Resolution Options */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-deep)', marginBottom: '10px' }}>
            Recommended Next Steps:
          </h4>
          <ul style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            paddingLeft: '20px',
            margin: 0,
            lineHeight: 1.7
          }}>
            <li>
              <strong>Contact Administrator:</strong> Contact your IT Security Officer or Enterprise Administrator to reset or re-issue your credentials.
            </li>
            <li>
              <strong>Active Sessions:</strong> If you know your current credentials, sign in and use the <Link to="/change-password" style={{ color: 'var(--navy-deep)', fontWeight: 600 }}>Change Password</Link> screen to update your password securely.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px 16px',
              backgroundColor: 'var(--navy-deep)',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              textAlign: 'center'
            }}
          >
            <Lock size={16} />
            <span>Return to Sign In</span>
          </Link>

          <Link
            to="/forgot-password"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: 'var(--navy-deep)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Forgot Password</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
