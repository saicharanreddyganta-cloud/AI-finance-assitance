import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import api from '../services/api';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics', { params: { timeframe } });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-xl w-72"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl"></div>
          <div className="h-80 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const COLORS = ['#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#6366F1', '#10B981', '#14B8A6'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Spending & Cash Flow Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Deep statistical breakdown of inflows, recurring outflows, and behavioral patterns.
          </p>
        </div>

        {/* Timeframe pill selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl self-start sm:self-auto">
          {['monthly', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                timeframe === t
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'monthly' ? 'Current Month' : 'All Historical'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Outflow</span>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-mono">
            ₹{data.total_expenses?.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-rose-500 font-semibold mt-1 inline-block">Active period expenditure</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Monthly Expense</span>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-mono">
            ₹{data.avg_monthly_expense?.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Trailing average burn rate</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Savings Rate</span>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 font-mono">
            {data.savings_rate}%
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Above 20% safe benchmark</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Highest Category</span>
          <p className="text-2xl sm:text-3xl font-bold text-brand-600 mt-2 truncate">
            {data.highest_spending_category}
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Primary expenditure driver</span>
        </div>
      </div>

      {/* AI Behavioral Pattern Detection Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-brand-500/30 text-brand-300 rounded-lg">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Detected AI Spending Patterns
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.pattern_insights.map((pattern, idx) => (
            <div key={idx} className="p-3.5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-xs font-medium text-slate-200 leading-relaxed">{pattern}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1 Charts: Income vs Expense & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Income vs Expenses</h3>
              <p className="text-xs text-slate-400 font-medium">Monthly comparison of cash inflow vs burn</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.income_vs_expense} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Category Outflow Breakdown</h3>
              <p className="text-xs text-slate-400 font-medium">Distribution by category</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.category_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                >
                  {data.category_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Monthly Savings Trend & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Trend Line Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Savings Rate Trajectory</h3>
              <p className="text-xs text-slate-400 font-medium">Historical net retained savings over time</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.savings_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Savings']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981' }}
                  name="Net Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Payment Channels</h3>
              <p className="text-xs text-slate-400 font-medium">UPI, Credit Card, Debit Card, Cash distribution</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.payment_methods} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis type="category" dataKey="method" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Total']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Highest Transactions Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
        <h3 className="font-bold text-base text-slate-900 mb-1">Single Highest Transactions</h3>
        <p className="text-xs text-slate-400 font-medium mb-4">Top individual expenditures requiring audit</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Date</th>
                <th className="pb-3">Merchant / Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Payment Method</th>
                <th className="pb-3 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.highest_transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-2 text-slate-500 font-mono">{tx.date}</td>
                  <td className="py-3 font-semibold text-slate-800">{tx.description}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{tx.payment_method}</td>
                  <td className="py-3 pr-2 text-right font-mono font-bold text-slate-900 text-sm">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
