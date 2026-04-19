import React, { useEffect, useState, useCallback } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';
import api     from '../api/axios';
import '../styles/budget.css';

const CATEGORIES = [
  'Food','Housing','Transport','Entertainment',
  'Health','Education','Shopping','Salary','Freelance','Other'
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

const progressColor = (pct) => {
  if (pct >= 100) return 'var(--danger)';
  if (pct >= 75)  return 'var(--warning)';
  return 'var(--accent)';
};

const EMPTY_FORM = { category: 'Food', limitAmount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() };

export default function Budget() {
  const now = new Date();
  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year,  setYear]        = useState(now.getFullYear());
  const [budgets, setBudgets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets', { params: { month, year } });
      setBudgets(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditBudget(null);
    setForm({ ...EMPTY_FORM, month, year });
    setFormErr('');
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditBudget(b);
    setForm({ category: b.category, limitAmount: String(b.limitAmount), month: b.month, year: b.year });
    setFormErr('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditBudget(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!form.limitAmount || isNaN(form.limitAmount) || Number(form.limitAmount) <= 0) {
      setFormErr('Enter a valid positive limit.'); return;
    }
    setSaving(true);
    try {
      await api.post('/budgets', { ...form, limitAmount: Number(form.limitAmount) });
      toast.success(editBudget ? 'Budget updated' : 'Budget set');
      closeModal();
      load();
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Something went wrong.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      toast.success('Budget deleted');
    } catch (e) { console.error(e); }
  };

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar
          title="Budget"
          subtitle="Set spending limits per category"
          action={
            <button className="btn-add" onClick={openAdd}>
              <MdAdd /> Set Budget
            </button>
          }
        />

        <div className="page-body">
          {/* Month / Year selector */}
          <div className="month-selector">
            <label>Period</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="loading-screen" style={{ height: 300 }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="budget-grid">
              {budgets.map((b) => (
                <BudgetCard key={b.id} budget={b} month={month} year={year}
                  onEdit={() => openEdit(b)} onDelete={() => handleDelete(b.id)} />
              ))}

              {/* Add placeholder card */}
              <div className="budget-add-card" onClick={openAdd}>
                <div className="budget-add-icon"><MdAdd /></div>
                <span className="budget-add-label">Add new budget</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editBudget ? 'Edit Budget' : 'Set Budget Limit'}</h2>
              <button className="modal-close" onClick={closeModal}><MdClose /></button>
            </div>

            {formErr && <div className="error-msg">{formErr}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Limit (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  min="1" step="1"
                  value={form.limitAmount}
                  onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Month</label>
                  <select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>
                    {years.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editBudget ? 'Update Budget' : 'Set Budget'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Budget Card sub-component ── */
function BudgetCard({ budget, onEdit, onDelete }) {
  const { category, limitAmount, spent, percentage } = budget;
  const pct   = Math.min(percentage ?? 0, 100);
  const color = progressColor(pct);

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <div className="budget-cat-badge">
          <div className="budget-cat-icon">{category?.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className="budget-cat-name">{category}</div>
            <div className="budget-cat-period">{MONTHS[budget.month - 1]} {budget.year}</div>
          </div>
        </div>
        <div className="budget-card-actions">
          <button className="btn-icon edit"   onClick={onEdit}>  <MdEdit />   </button>
          <button className="btn-icon delete" onClick={onDelete}><MdDelete /></button>
        </div>
      </div>

      <div className="budget-amounts">
        <span className="budget-spent">{fmt(spent)}</span>
        <span className="budget-limit">of {fmt(limitAmount)}</span>
      </div>

      <div className="budget-progress-bar">
        <div
          className="budget-progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      <div className="budget-pct" style={{ color }}>
        {pct >= 100
          ? '⚠️  Over budget!'
          : pct >= 75
          ? `${pct}% used — almost there`
          : `${pct}% used`}
      </div>
    </div>
  );
}
