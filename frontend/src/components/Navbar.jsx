import React from 'react';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import '../styles/navbar.css';

export default function Navbar({ title, subtitle, action }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
        {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
      </div>
      <div className="navbar-right">
        {action && <div className="navbar-action">{action}</div>}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
        </button>
      </div>
    </header>
  );
}
