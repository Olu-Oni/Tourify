'use client'
import React from 'react';
import type { StatItem } from '../interfaces/types';


export default function StatsGrid({ stats }: { stats: Array<{ label: string; value: string; icon: React.ReactNode; change: string }> }) {
return (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
{stats.map((stat, i) => (
<div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
<div className="flex items-center justify-between mb-4">
<div className="text-slate-600">{stat.icon}</div>
<div className="text-2xl font-bold text-slate-900">{stat.value}</div>
</div>
<div className="text-sm font-medium text-slate-900 mb-1">{stat.label}</div>
<div className="text-xs text-green-600">{stat.change}</div>
</div>
))}
</div>
);
}