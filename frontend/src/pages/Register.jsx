import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdShowChart } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          Your finances,<br />beautifully organised.
        </h2>
        <p className="auth-panel-sub">
          Set budgets per category, filter transactions, and get a clear picture of where your money goes every month.
        </p>
        <div className="auth-panel-stats">
          <div className="auth-stat">
            <div className="auth-stat-value">Free</div>
            <div className="auth-stat-label">Always free plan</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-value">JWT</div>
            <div className="auth-stat-label">Secure auth</div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <h2 className="auth-form-title">Create account ✨</h2>
          <p className="auth-form-sub">
            Already have one? <Link to="/login">Sign in</Link>
          </p>

          {error && <div className="error-msg">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full name</label>
              <input
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  name="confirm"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer-link">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
