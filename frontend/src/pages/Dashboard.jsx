import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MdTrendingUp, MdTrendingDown, MdAccountBalance,
  MdArrowUpward, MdArrowDownward
} from 'react-icons/md';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';
import api     from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

/* ── helpers ── */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

const CATEGORY_COLORS = [
  '#7C3AED','#10B981','#F59E0B','#EF4444',
  '#3B82F6','#EC4899','#14B8A6','#8B5CF6',
];

const CAT_INITIALS = (cat) => cat?.slice(0, 2).toUpperCase() || '??';

export default function Dashboard() {
  const { user }               = useAuth();
  const [summary, setSummary]  = useState(null);
  const [loading, setLoading]  = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/dashboard');
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="loading-screen"><div className="spinner" /></div>
      </div>
    </div>
  );

  const categories = Object.entries(summary?.expenseByCategory || {});
  const maxCatAmt  = Math.max(...categories.map(([, v]) => v), 1);

  /* Build a tiny sparkline from recent transactions (grouped by date) */
  const chartData = buildChartData(summary?.recentTransactions || []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar
          title={`${greeting}, ${user?.name?.split(' ')[0]} 👋`}
          subtitle="Here's your financial overview for this month"
        />

        <div className="page-body">
          {/* ── Summary Cards ── */}
          <div className="summary-grid">
            <SummaryCard
              cls="income"
              icon={<MdTrendingUp />}
              title="Total Income"
              value={fmt(summary?.totalIncome)}
            />
            <SummaryCard
              cls="expense"
              icon={<MdTrendingDown />}
              title="Total Expenses"
              value={fmt(summary?.totalExpenses)}
            />
            <SummaryCard
              cls="balance"
              icon={<MdAccountBalance />}
              title="Net Balance"
              value={fmt(summary?.balance)}
            />
          </div>

          {/* ── Smart Insights ── */}
          {summary?.insights && summary.insights.length > 0 && (
            <div className="insights-card">
              <p className="section-title">💡 Smart Insights</p>
              <div className="insights-list">
                {summary.insights.map((insight, idx) => (
                  <div key={idx} className={`insight-item ${insight.type.toLowerCase()}`}>
                    <div className="insight-icon">
                      {insight.type === 'POSITIVE' && '✅'}
                      {insight.type === 'NEGATIVE' && '📉'}
                      {insight.type === 'WARNING' && '⚠️'}
                      {insight.type === 'NEUTRAL' && '📌'}
                    </div>
                    <span className="insight-message">{insight.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Main Grid ── */}
          <div className="dashboard-grid">
            {/* Left col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Trend chart */}
              {chartData.length > 0 && (
                <div className="card">
                  <p className="section-title" style={{ marginBottom: 20 }}>Spending Trend (recent)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13 }}
                        formatter={(v) => [fmt(v), 'Amount']}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#7C3AED"
                        strokeWidth={2.5}
                        fill="url(#grad)"
                        dot={{ fill: '#7C3AED', r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent Transactions */}
              <div className="recent-card">
                <p className="section-title">
                  Recent Transactions
                  <Link to="/transactions">View all →</Link>
                </p>
                {summary?.recentTransactions?.length === 0 ? (
                  <div className="empty-state">
                    <span style={{ fontSize: 32, marginBottom: 8 }}>📄</span>
                    <p>No transactions yet — add your first one!</p>
                  </div>
                ) : (
                  <div className="recent-list">
                    {summary?.recentTransactions?.map((tx) => (
                      <div key={tx.id} className="recent-item">
                        <div className={`recent-item-icon ${tx.type.toLowerCase()}`}>
                          {CAT_INITIALS(tx.category)}
                        </div>
                        <div className="recent-item-info">
                          <div className="recent-item-title">{tx.title}</div>
                          <div className="recent-item-cat">{tx.category} · {tx.date}</div>
                        </div>
                        <div className={`recent-item-amount ${tx.type.toLowerCase()}`}>
                          {tx.type === 'INCOME' ? '+' : '−'}{fmt(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right col — Category breakdown */}
            <div className="category-card">
              <p className="section-title">
                Expenses by Category
                <Link to="/transactions">Details →</Link>
              </p>
              {categories.length === 0 ? (
                <div className="empty-state"><p>No expense data</p></div>
              ) : (
                <div className="category-list">
                  {categories.map(([cat, amt], i) => (
                    <div key={cat} className="category-row">
                      <div className="category-row-header">
                        <span className="category-name">{cat}</span>
                        <span className="category-amount">{fmt(amt)}</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${(amt / maxCatAmt) * 100}%`,
                            background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function SummaryCard({ cls, icon, title, value }) {
  return (
    <div className={`summary-card ${cls}`}>
      <div className="summary-card-header">
        <span className="summary-card-title">{title}</span>
        <div className="summary-card-icon">{icon}</div>
      </div>
      <div className="summary-card-value">{value}</div>
      <div className="summary-card-label">This month</div>
    </div>
  );
}

/* Group recent transactions by date for the sparkline */
function buildChartData(txs) {
  const map = {};
  txs.forEach((tx) => {
    const d = tx.date;
    if (!map[d]) map[d] = 0;
    if (tx.type === 'EXPENSE') map[d] += Number(tx.amount);
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date: date.slice(5), amount }));
}
