import React, { useState, useEffect } from 'react';
import { X, Target, PlusCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoalModal = ({ isOpen, onClose, onSave, onContribute, initialData = null, isContributeMode = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    monthly_contribution: '',
    category: 'Savings',
    status: 'In Progress'
  });
  const [contributionAmount, setContributionAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        target_amount: initialData.target_amount || '',
        current_amount: initialData.current_amount || 0,
        target_date: initialData.target_date || '',
        monthly_contribution: initialData.monthly_contribution || '',
        category: initialData.category || 'Savings',
        status: initialData.status || 'In Progress'
      });
    } else {
      setFormData({
        name: '',
        target_amount: '',
        current_amount: 0,
        target_date: '',
        monthly_contribution: '',
        category: 'Savings',
        status: 'In Progress'
      });
    }
    setContributionAmount('');
    setError('');
  }, [initialData, isOpen, isContributeMode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isContributeMode) {
      const amt = parseFloat(contributionAmount);
      if (!amt || amt <= 0) {
        setError('Please enter a valid contribution amount');
        return;
      }
      // Fire confetti celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onContribute(initialData.id, amt);
      return;
    }

    if (!formData.name.trim()) {
      setError('Goal name is required');
      return;
    }
    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      setError('Please enter a valid target amount');
      return;
    }

    onSave({
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
      monthly_contribution: parseFloat(formData.monthly_contribution) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isContributeMode
                  ? `Contribute to ${initialData?.name}`
                  : initialData
                  ? 'Edit Financial Goal'
                  : 'Create Financial Goal'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {isContributeMode ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Current Progress:</span>
                <span className="font-bold text-slate-900">
                  ₹{initialData?.current_amount?.toLocaleString('en-IN')} / ₹{initialData?.target_amount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contribution Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Laptop, Travel, Emergency Fund..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="target_amount"
                    value={formData.target_amount}
                    onChange={handleChange}
                    placeholder="60000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Saved (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="current_amount"
                    value={formData.current_amount}
                    onChange={handleChange}
                    placeholder="15000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    name="target_date"
                    value={formData.target_date}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Monthly Contribution (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="monthly_contribution"
                    value={formData.monthly_contribution}
                    onChange={handleChange}
                    placeholder="5000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isContributeMode ? 'Deposit Contribution' : initialData ? 'Save Goal' : 'Create Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
