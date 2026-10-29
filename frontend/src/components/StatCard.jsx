import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const StatCard = ({ title, amount, change, trend = 'up', icon: Icon, color = 'blue', subtitle }) => {
  const isPositive = trend === 'up';
  const isNeutral = trend === 'neutral';

  const colorStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      badge: isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      badge: isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600',
      badge: isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200',
    }
  };

  const currentTheme = colorStyles[color] || colorStyles.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${currentTheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          ₹{typeof amount === 'number' ? amount.toLocaleString('en-IN') : amount}
        </h3>
      </div>

      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
        {change !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${currentTheme.badge}`}>
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            ) : isNeutral ? (
              <Minus className="w-3 h-3 text-slate-500" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-rose-600" />
            )}
            {Math.abs(change)}%
          </span>
        )}
        <span className="text-xs text-slate-400 font-medium">
          {subtitle || 'from previous month'}
        </span>
      </div>
    </div>
  );
};
