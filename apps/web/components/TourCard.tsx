'use client'
import React from 'react';
import { Edit2, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Tour } from '@/interfaces/types';


interface Props {
tour: Tour;
onEdit: (t: Tour) => void;
onCopy: (id: string) => void;
onToggle: (id: string) => void;
onDelete: (id: string) => void;
}


export default function TourCard({ tour, onEdit, onCopy, onToggle, onDelete }: Props) {
return (
<div className="bg-white rounded-xl border border-slate-200 p-6">
<div className="flex items-start justify-between">
<div className="flex-1">
<div className="flex items-center gap-3 mb-2">
<h3 className="text-xl font-semibold text-slate-900">{tour.name}</h3>
<span className={`px-3 py-1 rounded-full text-xs font-medium ${tour.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{tour.isActive ? 'Active' : 'Paused'}</span>
</div>
<p className="text-slate-600 mb-4">{tour.description}</p>


<div className="grid grid-cols-4 gap-4 mb-4">
<div>
<div className="text-sm text-slate-500">Steps</div>
<div className="text-lg font-semibold text-slate-900">{tour.steps}</div>
</div>
<div>
<div className="text-sm text-slate-500">Views</div>
<div className="text-lg font-semibold text-slate-900">{tour.views.toLocaleString()}</div>
</div>
<div>
<div className="text-sm text-slate-500">Completions</div>
<div className="text-lg font-semibold text-slate-900">{tour.completions.toLocaleString()}</div>
</div>
<div>
<div className="text-sm text-slate-500">Rate</div>
<div className="text-lg font-semibold text-green-600">{tour.completionRate}%</div>
</div>
</div>


<div className="flex gap-3">
<button onClick={() => onEdit(tour)} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm transition"><Edit2 className="w-4 h-4"/>Edit</button>
<button onClick={() => onCopy(tour.id)} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm transition"><Copy className="w-4 h-4"/>Copy Code</button>
<button onClick={() => onToggle(tour.id)} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm transition">{tour.isActive ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}{tour.isActive ? 'Pause' : 'Activate'}</button>
<button onClick={() => onDelete(tour.id)} className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 text-sm transition"><Trash2 className="w-4 h-4"/>Delete</button>
</div>
</div>
</div>
</div>
);
}