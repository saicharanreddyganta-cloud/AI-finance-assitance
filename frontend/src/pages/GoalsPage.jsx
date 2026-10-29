import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  X,
  Check,
  PiggyBank,
  Edit2,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import { GoalModal } from '../components/GoalModal';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [optimizations, setOptimizations] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isContributeMode, setIsContributeMode] = useState(false);

  const [acceptedSuggestions, setAcceptedSuggestions] = useState({});
  const [dismissedSuggestions, setDismissedSuggestions] = useState({});

  const fetchGoalsData = async () => {
    try {
      setLoading(true);
      const [goalsRes, optRes] = await Promise.all([
        api.get('/goals'),
        api.get('/goals/optimization/suggestions')
      ]);
      setGoals(goalsRes.data);
      setOptimizations(optRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsData();
  }, []);

  const handleSaveGoal = async (formData) => {
    try {
      if (selectedGoal && !isContributeMode) {
        await api.put(`/goals/${selectedGoal.id}`, formData);
      } else {
        await api.post('/goals', formData);
      }
      setModalOpen(false);
      setSelectedGoal(null);
      fetchGoalsData();
    } catch (err) {
      console.error(err);
      alert('Failed to save goal');
    }
  };

  const handleContribute = async (goalId, amount) => {
    try {
      await api.post(`/goals/${goalId}/contribute?amount=${amount}`);
      setModalOpen(false);
      setSelectedGoal(null);
      setIsContributeMode(false);
      fetchGoalsData();
    } catch (err) {
      console.error(err);
      alert('Failed to record contribution');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to remove this goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        fetchGoalsData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete goal');
      }
    }
  };

  const handleAcceptSuggestion = (id) => {
    setAcceptedSuggestions((prev) => ({ ...prev, [id]: true }));
  };

  const handleDismissSuggestion = (id) => {
    setDismissedSuggestions((prev) => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-xl w-72"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Goals & Optimization
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Track dedicated target allocations and utilize AI optimization to accelerate completion dates.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedGoal(null);
            setIsContributeMode(false);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* --- AI GOAL OPTIMIZATION SECTION --- */}
      {optimizations && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-500/30 text-cyan-300 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                    AI Goal Optimization Engine
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    {optimizations.headline}
                  </h2>
                </div>
              </div>

              <div className="px-3 py-1.5 bg-white/10 rounded-xl border border-white/10 text-xs font-mono font-bold self-start sm:self-auto text-cyan-200">
                +₹{optimizations.monthly_potential?.toLocaleString('en-IN')}/mo Surplus Capacity
              </div>
            </div>

            {/* Suggestions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {optimizations.suggestions.map((sug) => {
                const isAccepted = acceptedSuggestions[sug.id];
                const isDismissed = dismissedSuggestions[sug.id];

                if (isDismissed) return null;

                return (
                  <div
                    key={sug.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isAccepted
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                        : 'bg-white/10 border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-cyan-300">
                        {sug.category}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-emerald-400">
                        +₹{sug.potential_savings.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white mb-1">{sug.tip}</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                      {sug.action}
                    </p>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      {isAccepted ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted & Applied
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAcceptSuggestion(sug.id)}
                            className="px-2.5 py-1 bg-brand-500 hover:bg-brand-400 text-white text-[11px] font-bold rounded-lg shadow transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button
                            onClick={() => handleDismissSuggestion(sug.id)}
                            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- GOALS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((g) => {
          const progress = Math.min(100, Math.round((g.current_amount / maxVal(g.target_amount)) * 100));
          return (
            <div
              key={g.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{g.name}</h3>
                      <span className="text-[11px] font-semibold text-slate-400">{g.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedGoal(g);
                        setIsContributeMode(false);
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amounts and Progress */}
                <div className="my-4">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{g.current_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      of ₹{g.target_amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress >= 100
                          ? 'bg-emerald-500'
                          : progress >= 50
                          ? 'bg-brand-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold mt-1 text-slate-500 font-mono">
                    <span>{progress}% Completed</span>
                    <span>Remaining: ₹{Math.max(0, g.target_amount - g.current_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 text-slate-600 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Date</span>
                    <span className="font-semibold text-slate-700">{g.target_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Contribution</span>
                    <span className="font-semibold text-slate-700 font-mono">₹{g.monthly_contribution?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Quick Deposit Action */}
              <button
                onClick={() => {
                  setSelectedGoal(g);
                  setIsContributeMode(true);
                  setModalOpen(true);
                }}
                className="w-full py-2.5 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <PiggyBank className="w-4 h-4 text-brand-600" />
                <span>Add Contribution</span>
              </button>
            </div>
          );
        })}
      </div>

      <GoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedGoal(null);
          setIsContributeMode(false);
        }}
        onSave={handleSaveGoal}
        onContribute={handleContribute}
        initialData={selectedGoal}
        isContributeMode={isContributeMode}
      />
    </div>
  );
};

const maxVal = (v) => (v && v > 0 ? v : 1);
