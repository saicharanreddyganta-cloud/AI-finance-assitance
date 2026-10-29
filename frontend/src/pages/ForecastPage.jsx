import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, BrainCircuit, ShieldAlert, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import api from '../services/api';

export const ForecastPage = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const res = await api.get('/forecast');
        setForecast(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-xl w-72"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  if (!forecast) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
          <BrainCircuit className="w-3.5 h-3.5 text-brand-600" />
          <span>Supervised Time-Series & Regularized Ridge Regression</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Expense Forecasting & Cash Flow Projection
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Predict future monthly outflows, expected net savings, and category variance using machine learning models.
        </p>
      </div>

      {/* 3 Key Forecast Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Next Month Expected Expense
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            ₹{forecast.next_month_expense.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-brand-600 font-semibold">
            <span>Trajectory: {forecast.trend_direction}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Expected Monthly Savings
          </span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2 font-mono">
            ₹{forecast.expected_savings.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>Target monthly surplus</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Model Confidence Rating
          </span>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2 font-mono">
            {forecast.confidence_score}%
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-semibold">
            <span>R² Statistical Fit Bounded</span>
          </div>
        </div>
      </div>

      {/* Main Forecast Chart: Historical vs Predicted with Confidence Bounds */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Cash Flow Projection: Historical vs Forecasted
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Dashed line represents projected values with empirical volatility intervals
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-0.5 bg-slate-700"></span> Historical Actual
            </span>
            <span className="flex items-center gap-1.5 text-brand-600">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-brand-600"></span> ML Forecast
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-3 h-3 bg-indigo-100 rounded"></span> Volatility Band
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecast.points} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="boundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                formatter={(val, name) => [val ? `₹${Number(val).toLocaleString('en-IN')}` : '-', name]}
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {/* Upper & Lower Bound envelope */}
              <Area type="monotone" dataKey="upper_bound" stroke="none" fill="url(#boundGrad)" name="Upper Confidence Band" />
              <Area type="monotone" dataKey="lower_bound" stroke="none" fill="#ffffff" name="Lower Confidence Band" />

              {/* Historical Line */}
              <Line
                type="monotone"
                dataKey="historical_expense"
                stroke="#0F172A"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0F172A' }}
                name="Historical Expense"
                connectNulls={false}
              />

              {/* Projected Line */}
              <Line
                type="monotone"
                dataKey="forecast_expense"
                stroke="#3B82F6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 5, fill: '#3B82F6' }}
                name="Projected Expense"
                connectNulls={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Insights and Category Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Insights */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-base text-slate-900">Model Insights & Reasoning</h3>
          </div>
          <div className="space-y-3">
            {forecast.insights.map((ins, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0"></span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">{ins}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-brand-50/70 border border-brand-200/60 rounded-xl text-[11px] text-brand-900">
            <strong>Active Algorithm:</strong> {forecast.model_used}. Model regularly retrains upon incoming transaction ingestion.
          </div>
        </div>

        {/* Category Projections */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900">Category-Level Projections</h3>
            <span className="text-xs font-semibold text-slate-400">Next Month</span>
          </div>

          <div className="space-y-2.5">
            {forecast.category_forecasts?.map((cf, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{cf.category}</p>
                  <p className="text-[11px] text-slate-400">Current: ₹{cf.current_month.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 font-mono">₹{cf.predicted_next_month.toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] font-bold ${cf.change_pct <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {cf.change_pct <= 0 ? cf.change_pct : `+${cf.change_pct}`}% expected
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
