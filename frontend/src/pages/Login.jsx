import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdShowChart, MdEmail, MdLock } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel">
        <div className="auth-panel-logo">
          <div className="auth-panel-logo-icon"><MdShowChart /></div>
          <span>FinTrack</span>
        </div>
        <h2 className="auth-panel-headline">
          Take control of<br />your finances.
        </h2>
        <p className="auth-panel-sub">
          Track income, manage budgets, and understand your spending habits — all in one beautiful dashboard.
        </p>
        <div className="auth-panel-stats">
          <div className="auth-stat">
            <div className="auth-stat-value">100%</div>
            <div className="auth-stat-label">Secure & Private</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-value">Real‑time</div>
            <div className="auth-stat-label">Budget Tracking</div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <h2 className="auth-form-title">Welcome back 👋</h2>
          <p className="auth-form-sub">
            Don't have an account? <Link to="/register">Sign up for free</Link>
          </p>

          {error && <div className="error-msg">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer-link">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
