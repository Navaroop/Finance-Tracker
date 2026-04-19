import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdCompareArrows, MdAccountBalanceWallet,
  MdLogout, MdShowChart
} from 'react-icons/md';
import '../styles/sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: <MdDashboard />,            label: 'Dashboard'    },
  { to: '/transactions', icon: <MdCompareArrows />,         label: 'Transactions' },
  { to: '/budget',       icon: <MdAccountBalanceWallet />,  label: 'Budget'       },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon-wrap">
          <MdShowChart className="logo-icon" />
        </div>
        <span className="logo-text">FinTrack</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">MAIN MENU</p>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom user strip */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar-sm">{initials}</div>
          <div className="user-info">
            <p className="user-name-sm">{user?.name}</p>
            <p className="user-email-sm">{user?.email}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <MdLogout />
        </button>
      </div>
    </aside>
  );
}
