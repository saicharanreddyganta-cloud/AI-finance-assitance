import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Bot,
  TrendingUp,
  ShieldAlert,
  Target,
  ScanLine,
  Coins,
  Settings,
  BrainCircuit,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'AI Categorize', path: '/categorization', icon: Sparkles, badge: 'ML' },
    { name: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'Live AI' },
    { name: 'Forecast', path: '/forecast', icon: TrendingUp, badge: 'ML' },
    { name: 'Risk Center', path: '/risk-center', icon: ShieldAlert },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Receipts', path: '/receipts', icon: ScanLine, badge: 'OCR' },
    { name: 'Investments', path: '/investments', icon: Coins },
    { name: 'AI Architecture', path: '/ai-models', icon: BrainCircuit, badge: 'AIML' },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const notifications = [
    { id: 1, title: 'AI Category Alert', desc: 'Swiggy order categorized as Food Delivery (98% confidence)', time: '5m ago' },
    { id: 2, title: 'Budget Pace Warning', desc: 'Weekend spending increased by 24% vs weekdays', time: '1h ago' },
    { id: 3, title: 'Goal Milestone', desc: 'Travel goal reached 60% completion target!', time: 'Yesterday' }
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-200 select-none z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/25 ring-2 ring-brand-400/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                FinSight <span className="text-xs bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded font-mono font-semibold">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Smarter Money. Better Decisions.</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-brand-400 border border-brand-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Current User Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.full_name || 'Rahul Sharma'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'demo@finsight.ai'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MOBILE DRAWER --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-200 p-5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">F</div>
                  <span className="font-bold text-white">FinSight AI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                          isActive ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-brand-400">{item.badge}</span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300 truncate">{user?.full_name}</span>
              <button onClick={handleLogout} className="text-rose-400 text-sm font-semibold flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Breadcrumb indicator */}
            <div className="hidden sm:flex items-center text-xs font-medium text-slate-400 gap-1.5">
              <span>FinSight AI</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-800 font-semibold capitalize">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick AI badge */}
            <NavLink
              to="/assistant"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 text-brand-700 text-xs font-semibold hover:border-brand-300 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin-slow" />
              <span>Ask AI Assistant</span>
            </NavLink>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white"></span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-card border border-slate-200/80 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Live AI Notifications</span>
                    <span className="text-[11px] text-brand-600 font-semibold cursor-pointer">Mark read</span>
                  </div>
                  <div className="space-y-1.5">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name || 'Rahul Sharma'}</p>
                <p className="text-[10px] text-slate-400 font-medium">Demo Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
