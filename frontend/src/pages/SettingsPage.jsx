import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  DollarSign,
  Bell,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle,
  Save,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user, updateUserProfile } = useAuth();
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [settings, setSettings] = useState({
    currency: '₹',
    monthly_budget: 35000,
    emergency_fund_target: 100000,
    risk_tolerance: 'Moderate',
    notifications_enabled: true,
    ai_suggestions_enabled: true,
    dark_mode: false
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/settings/profile?full_name=${encodeURIComponent(profileName)}`);
      updateUserProfile(profileName);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile name');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordMsg({ type: 'success', text: 'Password successfully updated!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Current password is incorrect'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-xl w-60"></div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Configure financial parameters, security preferences, and AI behavior.
        </p>
      </div>

      {settingsSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Preferences updated and synchronized across all modules!</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
        <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600" />
          <span>Profile Information</span>
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-4">Manage your display name and registered email</p>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'demo@finsight.ai'}
                className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Financial Preferences Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
        <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-brand-600" />
          <span>Financial Planning Preferences</span>
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-4">Budgets and risk calibration parameters</p>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Currency Symbol
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monthly Budget Ceiling (₹)
              </label>
              <input
                type="number"
                value={settings.monthly_budget}
                onChange={(e) => setSettings({ ...settings, monthly_budget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Fund Target (₹)
              </label>
              <input
                type="number"
                value={settings.emergency_fund_target}
                onChange={(e) => setSettings({ ...settings, emergency_fund_target: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Risk Tolerance Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Conservative', 'Moderate', 'Aggressive'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSettings({ ...settings, risk_tolerance: r })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    settings.risk_tolerance === r
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* AI and Notification Toggles */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">AI Optimization & Category Suggestions</p>
                  <p className="text-[11px] text-slate-400">Enable machine learning spending recommendations</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.ai_suggestions_enabled}
                onChange={(e) => setSettings({ ...settings, ai_suggestions_enabled: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Budget Pace & Anomaly Notifications</p>
                  <p className="text-[11px] text-slate-400">Receive alerts when weekend spend accelerates</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </form>
      </div>

      {/* Security: Password Change */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
        <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-600" />
          <span>Security & Authentication</span>
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-4">Update your password to safeguard your financial ledger</p>

        {passwordMsg.text && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}
          >
            {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow transition-all"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
