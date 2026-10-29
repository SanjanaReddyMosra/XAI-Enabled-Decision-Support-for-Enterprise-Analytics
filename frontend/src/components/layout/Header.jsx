import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronRight,
  User,
  KeyRound,
  History,
  LogOut,
  ChevronDown,
  Shield
} from 'lucide-react';
import { usePrediction } from '../../context/PredictionContext';
import { useAuth } from '../../context/AuthContext';

const routeTitleMap = {
  '/dashboard': { title: 'Dashboard', breadcrumb: 'Overview' },
  '/dataset': { title: 'Dataset & Ingestion', breadcrumb: 'Data & Model' },
  '/data-quality': { title: 'Data Quality & Cleaning', breadcrumb: 'Data & Model' },
  '/visualization': { title: 'Dataset Visualizations', breadcrumb: 'Data & Model' },
  '/training': { title: 'Training & Testing', breadcrumb: 'Data & Model' },
  '/evaluation': { title: 'Model Evaluation', breadcrumb: 'Data & Model' },
  '/model-comparison': { title: 'Model Comparison', breadcrumb: 'Data & Model' },
  '/prediction': { title: 'Credit Risk Prediction', breadcrumb: 'Explainability' },
  '/shap': { title: 'SHAP Feature Attribution', breadcrumb: 'Explainability' },
  '/counterfactual': { title: 'Counterfactual Explanations', breadcrumb: 'Explainability' },
  '/uncertainty': { title: 'Conformal Uncertainty', breadcrumb: 'Explainability' },
  '/fairness': { title: 'Fairness Audit', breadcrumb: 'Explainability' },
  '/history': { title: 'Analysis History', breadcrumb: 'Audit & Records' },
  '/profile': { title: 'User Profile', breadcrumb: 'Account' },
  '/change-password': { title: 'Change Password', breadcrumb: 'Security' },
  '/architecture': { title: 'System Architecture', breadcrumb: 'System' },
  '/about': { title: 'About & Documentation', breadcrumb: 'System' },
};

export const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { systemHealth } = usePrediction();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentRoute = routeTitleMap[location.pathname] || { title: 'Decision Intelligence', breadcrumb: 'System' };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return 'U';
    return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
  };

  return (
    <header className="top-header">
      {/* Left: Mobile Toggle, Breadcrumb & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ display: 'none', padding: '6px' }}
          id="mobile-nav-toggle"
          aria-label="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        <div className="header-left">
          <div className="header-breadcrumbs">
            <span>Home</span>
            <ChevronRight size={12} />
            <span>{currentRoute.breadcrumb}</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--navy-deep)', fontWeight: 500 }}>{currentRoute.title}</span>
          </div>
          <h1 className="header-page-title">{currentRoute.title}</h1>
        </div>
      </div>

      {/* Right: Live System Status Badges & Authenticated User Profile */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="status-indicator-badge" title="FastAPI Microservice Health">
          <span className={`status-dot ${systemHealth.apiConnected ? 'green' : 'coral'}`}></span>
          <span>{systemHealth.apiConnected ? 'API Connected' : 'Connecting to API...'}</span>
        </div>

        {/* User Account Menu */}
        {isAuthenticated && user ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FAFCFD',
                border: '1px solid var(--border-default)',
                padding: '4px 10px 4px 6px',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              aria-label="User Account Menu"
              id="user-profile-menu-button"
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--navy-deep)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                {getInitials(user.first_name, user.last_name)}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', display: 'block' }}>
                  {user.first_name} {user.last_name}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                  {user.organization || user.role}
                </span>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '210px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(15, 34, 64, 0.15)',
                border: '1px solid var(--border-default)',
                zIndex: 1000,
                overflow: 'hidden',
                padding: '6px 0'
              }}>
                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-default)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                    @{user.username}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    color: 'var(--navy-deep)',
                    textDecoration: 'none'
                  }}
                  className="dropdown-item-hover"
                >
                  <User size={14} color="var(--teal-primary)" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/history"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    color: 'var(--navy-deep)',
                    textDecoration: 'none'
                  }}
                  className="dropdown-item-hover"
                >
                  <History size={14} color="var(--teal-primary)" />
                  <span>Analysis History</span>
                </Link>

                <Link
                  to="/change-password"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    color: 'var(--navy-deep)',
                    textDecoration: 'none'
                  }}
                  className="dropdown-item-hover"
                >
                  <KeyRound size={14} color="var(--teal-primary)" />
                  <span>Change Password</span>
                </Link>

                <div style={{ borderTop: '1px solid var(--border-default)', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      color: 'var(--coral-warm)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    className="dropdown-item-hover"
                  >
                    <LogOut size={14} color="var(--coral-warm)" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
