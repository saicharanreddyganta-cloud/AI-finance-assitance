import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  Plus,
  ArrowUpRight,
  PieChart as PieIcon,
  Edit2,
  Trash2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import api from '../services/api';
import { InvestmentModal } from '../components/InvestmentModal';

export const InvestmentsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/investments');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (selectedAsset) {
        await api.put(`/investments/${selectedAsset.id}`, formData);
      } else {
        await api.post('/investments', formData);
      }
      setModalOpen(false);
      setSelectedAsset(null);
      fetchInvestments();
    } catch (err) {
      console.error(err);
      alert('Failed to save investment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this investment record?')) {
      try {
        await api.delete(`/investments/${id}`);
        fetchInvestments();
      } catch (err) {
        console.error(err);
        alert('Failed to delete investment');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-xl w-72"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EAB308', '#8B5CF6'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Investment Portfolio & Asset Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Track stocks, mutual funds, sovereign gold, and fixed deposits with consolidated returns.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedAsset(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Investment</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Invested</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            ₹{data.total_invested.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Cost basis across all holdings</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Value</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-brand-600 mt-2 font-mono">
            ₹{data.current_value.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Latest aggregated portfolio valuation</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Gain / Profit</span>
          <p className={`text-2xl sm:text-3xl font-extrabold mt-2 font-mono ${data.total_gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {data.total_gain >= 0 ? '+' : ''}₹{data.total_gain.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Unrealized capital gain</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Return</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-6 h-6" />
            <span>{data.return_percentage}%</span>
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Cumulative return on invested capital</span>
        </div>
      </div>

      {/* Grid: Asset Allocation Donut & Holdings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Allocation Chart */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Asset Allocation</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Capital diversification</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {data.allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Valuation']}
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {data.allocation.map((al, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: al.color }} />
                  <span className="font-semibold text-slate-700">{al.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-500 font-medium">₹{al.value.toLocaleString('en-IN')}</span>
                  <span className="font-bold text-slate-900 text-[11px] w-10 text-right">{al.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Assets Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Portfolio Holdings</h3>
              <p className="text-xs text-slate-400 font-medium">Individual instrument performance tracking</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Investment</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-right">Invested</th>
                  <th className="pb-3 text-right">Current Value</th>
                  <th className="pb-3 text-right">Return</th>
                  <th className="pb-3 pr-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                      {item.notes && <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.notes}</div>}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-600">
                      ₹{item.invested_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      ₹{item.current_value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-600">
                      +{item.return_percentage}%
                    </td>
                    <td className="py-3 pr-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedAsset(item);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <InvestmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAsset(null);
        }}
        onSave={handleSave}
        initialData={selectedAsset}
      />
    </div>
  );
};
