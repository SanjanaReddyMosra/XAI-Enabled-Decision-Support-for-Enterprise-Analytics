import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  ChartNoAxesCombined,
  GitCompare,
  Target,
  Lightbulb,
  GitBranch,
  ShieldQuestion,
  Scale,
  History,
  User,
  Network,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Analysis History', path: '/history', icon: History }
    ]
  },
  {
    title: 'DATA & MODEL',
    items: [
      { name: 'Dataset', path: '/dataset', icon: Database },
      { name: 'Data Quality', path: '/data-quality', icon: BadgeCheck },
      { name: 'Visualization', path: '/visualization', icon: BarChart3 },
      { name: 'Training & Testing', path: '/training', icon: BrainCircuit },
      { name: 'Evaluation', path: '/evaluation', icon: ChartNoAxesCombined },
      { name: 'Model Comparison', path: '/model-comparison', icon: GitCompare }
    ]
  },
  {
    title: 'EXPLAINABILITY',
    items: [
      { name: 'Prediction', path: '/prediction', icon: Target },
      { name: 'SHAP Analysis', path: '/shap', icon: Lightbulb },
      { name: 'Counterfactuals', path: '/counterfactual', icon: GitBranch },
      { name: 'Uncertainty', path: '/uncertainty', icon: ShieldQuestion },
      { name: 'Fairness Audit', path: '/fairness', icon: Scale }
    ]
  },
  {
    title: 'SYSTEM & PROFILE',
    items: [
      { name: 'My Profile', path: '/profile', icon: User },
      { name: 'Architecture', path: '/architecture', icon: Network },
      { name: 'About', path: '/about', icon: Info }
    ]
  }
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand & Abstract SVG Mark */}
      <div className="sidebar-header">
        <div className="brand-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="12" r="3" fill="#E5B95C" stroke="none" />
            <path d="M8 12h8" stroke="#FFFFFF" strokeDasharray="2 2" />
            <circle cx="12" cy="12" r="2.5" fill="#4F9C99" stroke="none" />
            <path d="M14 12h2" stroke="#FFFFFF" />
            <polygon points="17 9 22 12 17 15" fill="#FFFFFF" stroke="none" />
          </svg>
        </div>
        <div className="brand-info">
          <span className="brand-title">XAI Decision Intelligence</span>
          <span className="brand-subtitle">Enterprise Analytics</span>
        </div>
      </div>

      {/* Grouped Navigation */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.title} className="nav-group">
            <div className="nav-group-title">{group.title}</div>
            <ul className="nav-list">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={16} strokeWidth={2} />
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Enterprise System Info & User in Footer */}
      <div className="sidebar-footer">
        <div>
          <span style={{ fontWeight: 600, color: 'var(--navy-deep)', display: 'block' }}>
            {user ? `${user.first_name} ${user.last_name}` : 'German Credit XAI'}
          </span>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
            {user ? user.organization || 'Enterprise Analyst' : 'v1.0 • Academic Prod'}
          </div>
        </div>
        <span className="badge badge-teal" style={{ fontSize: '10px' }}>Active</span>
      </div>
    </aside>
  );
};

export default Sidebar;
