import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import api from '../services/api';

export const RiskCenterPage = () => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRisk = async () => {
    try {
      setLoading(true);
      const res = await api.get('/risk');
      setRiskData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-xl w-72"></div>
        <div className="h-36 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!riskData) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-brand-600" />
            <span>Automated Diagnostic Risk Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Risk Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Continuous algorithmic monitoring of liquidity buffers, discretionary exposure, and debt servicing.
          </p>
        </div>

        <button
          onClick={fetchRisk}
          className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl self-start sm:self-auto transition-colors"
          title="Recompute Risk Metrics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Overall Health Score Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 z-10 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Composite Financial Wellness Index
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {riskData.overall_status}
          </h2>
          <p className="text-xs text-slate-400 max-w-md">
            Calculated across spending variance, discretionary outflow ratio, savings discipline, and liquid runway.
          </p>
          <p className="text-[11px] text-slate-500 font-mono">Last computed: {riskData.updated_at}</p>
        </div>

        {/* Score Ring / Badge */}
        <div className="z-10 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-4 border-brand-500/30 bg-slate-800 flex flex-col items-center justify-center shadow-glow">
            <span className="text-3xl font-black font-mono text-white">{riskData.overall_score}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ 100</span>
          </div>
          <span className="text-xs text-brand-300 font-semibold mt-2">FinSight Health Score</span>
        </div>
      </div>

      {/* 4 Risk Dimension Indicator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskData.indicators.map((ind, idx) => {
          const isHigh = ind.level === 'High';
          const isMed = ind.level === 'Medium';
          const isLow = ind.level === 'Low';

          const badgeClasses = isHigh
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : isMed
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200';

          const IconComponent = isHigh ? AlertTriangle : isMed ? ShieldAlert : ShieldCheck;

          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${ind.color}15`, color: ind.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{ind.name}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeClasses}`}>
                    {ind.level} Risk
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                  {ind.reason}
                </p>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-0.5">
                    Supporting Data Metric:
                  </span>
                  <span className="font-bold font-mono text-slate-800">{ind.supporting_metric}</span>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold text-xs shrink-0 mt-0.5">&bull; Suggested Action:</span>
                  <p className="text-xs text-slate-700 font-medium leading-tight">
                    {ind.suggested_action}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
