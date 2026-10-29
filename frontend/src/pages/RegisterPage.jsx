import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  User,
  Building,
  Lock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  ArrowRight
} from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Prefer not to say',
    phone: '',
    email: '',
    organization: '',
    job_title: '',
    department: '',
    years_of_experience: 1,
    username: '',
    password: '',
    confirm_password: '',
    terms_accepted: false,
    privacy_accepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required.';
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required.';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!formData.organization.trim()) errors.organization = 'Organization is required.';
    if (!formData.job_title.trim()) errors.job_title = 'Job title is required.';
    if (!formData.department.trim()) errors.department = 'Department is required.';
    if (formData.years_of_experience < 0) errors.years_of_experience = 'Years of experience cannot be negative.';

    if (!formData.username.trim()) {
      errors.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(formData.username.trim())) {
      errors.username = 'Username must be 3-30 characters (letters, numbers, underscores, dots, hyphens).';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.';
    }

    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match.';
    }

    if (!formData.terms_accepted) {
      errors.terms_accepted = 'You must accept the Terms of Service to create an account.';
    }

    if (!formData.privacy_accepted) {
      errors.privacy_accepted = 'You must acknowledge the Privacy Policy to create an account.';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for field on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please correct the highlighted errors before submitting.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      await register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        organization: formData.organization.trim(),
        job_title: formData.job_title.trim(),
        department: formData.department.trim(),
        years_of_experience: parseFloat(formData.years_of_experience) || 0,
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        terms_accepted: formData.terms_accepted,
        privacy_accepted: formData.privacy_accepted
      });

      // Redirect to login with success notice
      navigate('/login', {
        state: {
          registeredNotice: 'Registration successful! You may now sign in with your credentials.'
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  // Password criteria indicators
  const hasMinLen = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNum = /\d/.test(formData.password);
  const hasSpecial = /[^a-zA-Z\d]/.test(formData.password);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F4F7F9',
      padding: '40px 16px'
    }}>
      <div style={{
        maxWidth: '720px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(15, 34, 64, 0.08)',
        border: '1px solid var(--border-default)',
        padding: '36px 36px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy-deep)', margin: 0 }}>
            Enterprise User Registration
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: 0 }}>
            Create your analyst profile to access explainable credit intelligence & audit trails
          </p>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: '#FEECEC',
            border: '1px solid #F8C6C6',
            color: 'var(--coral-warm)',
            fontSize: '13px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={16} color="var(--coral-warm)" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* SECTION A: PERSONAL INFORMATION */}
          <div style={{
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#FAFCFD',
            border: '1px solid var(--border-default)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <User size={17} color="var(--teal-primary)" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-deep)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                A. Personal Information
              </h3>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#EFF6FF',
              borderRadius: '6px',
              fontSize: '11.5px',
              color: '#1E40AF',
              marginBottom: '16px'
            }}>
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>Demographic details are utilized strictly for user identification and access compliance. No Aadhaar, PAN, or financial credentials are requested.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. John"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.first_name ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.first_name && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.first_name}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Doe"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.last_name ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.last_name && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.last_name}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.date_of_birth ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.date_of_birth && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.date_of_birth}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.phone ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.phone && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.phone}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="analyst@organization.com"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.email ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.email && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.email}</span>}
              </div>
            </div>
          </div>

          {/* SECTION B: PROFESSIONAL INFORMATION */}
          <div style={{
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#FAFCFD',
            border: '1px solid var(--border-default)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Building size={17} color="var(--teal-primary)" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-deep)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                B. Professional Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Organization / Company *
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="e.g. Apex Global Analytics"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.organization ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.organization && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.organization}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Risk Officer"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.job_title ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.job_title && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.job_title}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Credit Underwriting"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.department ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.department && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.department}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  min="0"
                  max="60"
                  step="0.5"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.years_of_experience ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION C: ACCOUNT INFORMATION */}
          <div style={{
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#FAFCFD',
            border: '1px solid var(--border-default)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Lock size={17} color="var(--teal-primary)" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-deep)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                C. Account Credentials
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. jdoe_analyst"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${fieldErrors.username ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {fieldErrors.username && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.username}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter strong password"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 36px 8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${fieldErrors.password ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.password && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.password}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                    Confirm Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 36px 8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${fieldErrors.confirm_password ? 'var(--coral-warm)' : 'var(--border-default)'}`,
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.confirm_password && <span style={{ fontSize: '11px', color: 'var(--coral-warm)' }}>{fieldErrors.confirm_password}</span>}
                </div>
              </div>

              {/* Password strength checklist */}
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                fontSize: '11.5px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px'
              }}>
                <span style={{ color: hasMinLen ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                  {hasMinLen ? '✓' : '○'} 8+ Characters
                </span>
                <span style={{ color: hasUpper ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                  {hasUpper ? '✓' : '○'} Uppercase Letter
                </span>
                <span style={{ color: hasLower ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                  {hasLower ? '✓' : '○'} Lowercase Letter
                </span>
                <span style={{ color: hasNum ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                  {hasNum ? '✓' : '○'} Numeric Digit
                </span>
                <span style={{ color: hasSpecial ? 'var(--green-forest)' : 'var(--text-muted)' }}>
                  {hasSpecial ? '✓' : '○'} Special Symbol
                </span>
              </div>
            </div>
          </div>

          {/* SECTION D: CONSENT */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '10px',
            backgroundColor: '#FAFCFD',
            border: '1px solid var(--border-default)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileText size={17} color="var(--teal-primary)" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-deep)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                D. Compliance & Consent
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="terms_accepted"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="terms_accepted" style={{ fontSize: '12.5px', color: 'var(--navy-deep)', lineHeight: 1.4, cursor: 'pointer' }}>
                  I agree to the <strong>Enterprise Terms of Service</strong>, including responsible AI governance policies and audit record retention standards. *
                </label>
              </div>
              {fieldErrors.terms_accepted && (
                <span style={{ fontSize: '11px', color: 'var(--coral-warm)', marginLeft: '24px' }}>
                  {fieldErrors.terms_accepted}
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="privacy_accepted"
                  name="privacy_accepted"
                  checked={formData.privacy_accepted}
                  onChange={handleChange}
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="privacy_accepted" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
                  I acknowledge the <strong>Enterprise Privacy Policy</strong> regarding encrypted PostgreSQL storage of decision audits.
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <span>Creating Enterprise Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Existing account link */}
        <div style={{
          marginTop: '26px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-default)',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--teal-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
