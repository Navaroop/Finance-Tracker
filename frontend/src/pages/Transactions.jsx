import React, { useEffect, useState, useCallback } from 'react';
import { MdAdd, MdEdit, MdDelete, MdFilterList, MdClose, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';
import api     from '../api/axios';
import '../styles/transactions.css';

const CATEGORIES = [
  'Food','Housing','Transport','Entertainment',
  'Health','Education','Shopping','Salary','Freelance','Other'
];

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

const EMPTY_FORM = {
  title: '', amount: '', type: 'EXPENSE',
  category: 'Food', date: new Date().toISOString().slice(0, 10), description: '', isRecurring: false
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editTx, setEditTx]             = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [formErr, setFormErr]           = useState('');

  /* Filters */
  const [search,    setSearch]    = useState('');
  const [typeF,     setTypeF]     = useState('ALL');
  const [categoryF, setCategoryF] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [endDate,   setEndDate]   = useState(new Date().toISOString().slice(0, 10));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)    params.search    = search;
      if (typeF !== 'ALL') params.type = typeF;
      if (categoryF) params.category  = categoryF;
      if (startDate) params.startDate = startDate;
      if (endDate)   params.endDate   = endDate;
      const { data } = await api.get('/transactions', { params });
      setTransactions(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, typeF, categoryF, startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  /* Debounce search */
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openAdd = () => { setEditTx(null); setForm(EMPTY_FORM); setFormErr(''); setShowModal(true); };
  const openEdit = (tx) => {
    setEditTx(tx);
    setForm({
      title: tx.title, amount: String(tx.amount), type: tx.type,
      category: tx.category, date: tx.date, description: tx.description || '',
      isRecurring: tx.isRecurring || false
    });
    setFormErr('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditTx(null); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!form.title.trim()) { setFormErr('Title is required.'); return; }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setFormErr('Enter a valid positive amount.'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editTx) {
        await api.put(`/transactions/${editTx.id}`, payload);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', payload);
        toast.success('Transaction added');
      }

      // Budget check
      if (payload.type === 'EXPENSE') {
        try {
          const d = new Date(payload.date);
          const month = d.getMonth() + 1;
          const year = d.getFullYear();
          const { data: budgets } = await api.get('/budgets', { params: { month, year } });
          const budget = budgets.find((b) => b.category === payload.category);
          
          if (budget) {
            if (budget.percentage >= 100) {
              toast.error(`🚨 You exceeded ${payload.category} budget!`, { duration: 5000 });
            } else if (budget.percentage >= 80) {
              toast.error(`⚠️ ${payload.category} budget almost exceeded!`, { duration: 4000 });
            }
          }
        } catch (e) {
          console.error('Budget check passed', e);
        }
      }

      closeModal();
      load();
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transaction deleted');
    } catch (e) { console.error(e); }
  };

  const clearFilters = () => {
    setSearchInput(''); setSearch(''); setTypeF('ALL'); setCategoryF(''); setStartDate(''); setEndDate('');
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar
          title="Transactions"
          subtitle="Track every rupee in and out"
          action={
            <button className="btn-add" onClick={openAdd}>
              <MdAdd /> Add Transaction
            </button>
          }
        />

        <div className="page-body">
          {/* Filter bar */}
          <div className="filter-bar">
            <input
              type="text"
              placeholder="🔍  Search transactions…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <select value={typeF} onChange={(e) => setTypeF(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            <select value={categoryF} onChange={(e) => setCategoryF(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate}   onChange={(e) => setEndDate(e.target.value)} />
            <button className="filter-clear" onClick={clearFilters}>Clear</button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="loading-screen" style={{ height: 300 }}>
              <div className="spinner" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 40, marginBottom: 12 }}>📂</span>
              <p>No transactions found. Try adjusting your filters or add a new one.</p>
            </div>
          ) : (
            <div className="tx-table-wrap">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <div className="tx-title-cell">
                          <div className={`tx-icon ${tx.type.toLowerCase()}`}>
                            {tx.category?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="tx-title">
                              {tx.title}
                              {tx.isRecurring && <span className="recurring-badge" title="Recurring Transaction">🔁</span>}
                            </div>
                            {tx.description && <div className="tx-desc">{tx.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-warning">{tx.category}</span>
                      </td>
                      <td>
                        {tx.type === 'INCOME'
                          ? <span className="badge-success">Income</span>
                          : <span className="badge-danger">Expense</span>}
                      </td>
                      <td>
                        <span className={`tx-amount ${tx.type.toLowerCase()}`}>
                          {tx.type === 'INCOME' ? '+' : '−'}{fmt(tx.amount)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{tx.date}</td>
                      <td>
                        <div className="tx-actions">
                          <button className="btn-icon edit"   onClick={() => openEdit(tx)}>  <MdEdit />   </button>
                          <button className="btn-icon delete" onClick={() => handleDelete(tx.id)}><MdDelete /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editTx ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="modal-close" onClick={closeModal}><MdClose /></button>
            </div>

            {/* Type toggle */}
            <div className="type-toggle">
              {['INCOME','EXPENSE'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`type-btn ${form.type === t ? 'active ' + t.toLowerCase() : ''}`}
                  onClick={() => setForm({ ...form, type: t })}
                >
                  {t === 'INCOME' ? <MdTrendingUp /> : <MdTrendingDown />}
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {formErr && <div className="error-msg">{formErr}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" placeholder="e.g. Grocery run" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" name="amount" placeholder="0" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input name="description" placeholder="Optional note" value={form.description} onChange={handleChange} />
              </div>

              {!editTx && (
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      name="isRecurring" 
                      checked={form.isRecurring} 
                      onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} 
                    />
                    🔁 Repeat Monthly
                  </label>
                  <p className="checkbox-hint">Automatically creates this transaction every month.</p>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editTx ? 'Save Changes' : 'Add Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
