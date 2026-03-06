import React from "react";

const colorMap = {
  emerald: {
    bg: 'bg-linear-to-br from-emerald-500 to-emerald-600',
    light: 'bg-emerald-400/20',
    ring: 'ring-emerald-500/20',
  },
  blue: {
    bg: 'bg-linear-to-br from-blue-500 to-blue-600',
    light: 'bg-blue-400/20',
    ring: 'ring-blue-500/20',
  },
  amber: {
    bg: 'bg-linear-to-br from-amber-500 to-orange-500',
    light: 'bg-amber-400/20',
    ring: 'ring-amber-500/20',
  },
  violet: {
    bg: 'bg-linear-to-br from-violet-500 to-purple-600',
    light: 'bg-violet-400/20',
    ring: 'ring-violet-500/20',
  },
  rose: {
    bg: 'bg-linear-to-br from-rose-500 to-pink-600',
    light: 'bg-rose-400/20',
    ring: 'ring-rose-500/20',
  },
  cyan: {
    bg: 'bg-linear-to-br from-cyan-500 to-teal-600',
    light: 'bg-cyan-400/20',
    ring: 'ring-cyan-500/20',
  },
  indigo: {
    bg: 'bg-linear-to-br from-indigo-500 to-blue-700',
    light: 'bg-indigo-400/20',
    ring: 'ring-indigo-500/20',
  },
  red: {
    bg: 'bg-linear-to-br from-red-500 to-red-600',
    light: 'bg-red-400/20',
    ring: 'ring-red-500/20',
  },
  green: {
    bg: 'bg-linear-to-br from-green-500 to-green-600',
    light: 'bg-green-400/20',
    ring: 'ring-green-500/20',
  },
};

const Statcard = ({ icon, title, value, subtitle, color = "blue" }) => {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${c.bg} ring-1 ${c.ring} hover:shadow-xl transition-shadow`}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <h3 className="text-2xl font-extrabold tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.light}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Statcard;
