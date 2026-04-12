'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

// ─── Custom Tooltip ───────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-zinc-400 mb-2 font-medium">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-400 capitalize">{p.name}:</span>
          <span className="text-zinc-100 font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Monthly profit trend chart ───────────────────────────────

interface MonthlyData {
  month: string;
  revenue: number;
  profit: number;
  cost: number;
  sales_count: number;
}

interface ProfitTrendChartProps {
  data: MonthlyData[];
}

export function ProfitTrendChart({ data }: ProfitTrendChartProps) {
  const formatted = data.map(d => ({
    ...d,
    label: (() => {
      try { return format(parseISO(d.month + '-01'), 'MMM'); } catch { return d.month; }
    })(),
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={formatted} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
        <Area type="monotone" dataKey="profit" name="Profit" stroke="#22c55e" strokeWidth={2} fill="url(#profitGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Platform breakdown bar chart ─────────────────────────────

interface PlatformData {
  platform: string;
  revenue: number;
  profit: number;
  count: number;
}

interface PlatformChartProps {
  data: PlatformData[];
}

export function PlatformChart({ data }: PlatformChartProps) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey="platform" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="profit" name="Profit" fill="#22c55e" radius={[6, 6, 0, 0]} opacity={0.85} />
        <Bar dataKey="revenue" name="Revenue" fill="#f97316" radius={[6, 6, 0, 0]} opacity={0.5} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Mini sparkline ───────────────────────────────────────────

interface SparklineProps {
  data: number[];
  color?: string;
}

export function Sparkline({ data, color = '#22c55e' }: SparklineProps) {
  const formatted = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={formatted} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#spark-${color})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
