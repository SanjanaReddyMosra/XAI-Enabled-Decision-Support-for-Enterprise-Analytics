import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SectionHeader from '../components/common/SectionHeader';
import {
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Briefcase
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    organization: '',
    job_title: '',
    department: '',
    years_of_experience: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        organization: user.organization || '',
        job_title: user.job_title || '',
        department: user.department || '',
        years_of_experience: user.years_of_experience ?? 0
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'years_of_experience' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await updateProfile(formData);
      setSuccessMessage('Profile details updated and persisted successfully.');
      setIsEditing(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div>
      <SectionHeader
        tag="USER PROFILE & IDENTITY"
        title="Enterprise Analyst Account"
        subtitle="Manage your registered professional credentials, system permissions, and session access security."
      />

      {successMessage && (
        <div style={{
          padding: '12px 16px',
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
          padding: '12px 16px',
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Main Details Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-default)' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)', margin: 0 }}>
                Analyst Registration Profile
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Stored persistently in PostgreSQL under User ID: #{user.id}
              </p>
            </div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary btn-sm"
              >
                Edit Permitted Fields
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              {/* First Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Last Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Username (Immutable) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Username (Fixed Identity)
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: '#F1F5F9',
                    color: 'var(--text-muted)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Email (Immutable for security) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Corporate Email (Primary Account Identifier)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: '#F1F5F9',
                    color: 'var(--text-muted)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Organization */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Organization
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Job Title */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Job Title
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Department */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '5px' }}>
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  disabled={!isEditing}
                  min="0"
                  max="60"
                  step="0.5"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Gender */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Gender (Declared)
                </label>
                <input
                  type="text"
                  value={user.gender || 'Not specified'}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    backgroundColor: '#F1F5F9',
                    color: 'var(--text-muted)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {isEditing && (
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={15} />
                  <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Sidebar: Security & Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Account Meta Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 0, marginBottom: '14px' }}>
              Account Identity
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Role:</span>
                <span className="badge badge-teal" style={{ textTransform: 'capitalize' }}>{user.role}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Status:</span>
                <span className="badge badge-green">Active</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Created At:</span>
                <span style={{ fontWeight: 600, color: 'var(--navy-deep)' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Sign In:</span>
                <span style={{ fontWeight: 600, color: 'var(--navy-deep)' }}>
                  {user.last_login ? new Date(user.last_login).toLocaleString() : 'Active session'}
                </span>
              </div>

              {user.terms_accepted_at && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Terms Accepted:</span>
                  <span style={{ fontWeight: 500, color: 'var(--green-forest)', fontSize: '11.5px' }}>
                    {new Date(user.terms_accepted_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Security Actions Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 0, marginBottom: '14px' }}>
              Security & Credentials
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to="/change-password"
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  fontSize: '13px'
                }}
              >
                <KeyRound size={15} />
                <span>Change Password</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--coral-warm)',
                  borderColor: '#F8C6C6',
                  fontSize: '13px'
                }}
              >
                <LogOut size={15} />
                <span>Log Out of Session</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
