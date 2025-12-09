'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import type { NewTour, Step } from '../interfaces/types'


interface Props {
open: boolean;
onClose: () => void;
newTour: NewTour;
setNewTour: (t: NewTour) => void;
onCreate: () => Promise<void> | void;
addStep: () => void;
removeStep: (index: number) => void;
updateStep: (index: number, field: keyof Step, value: string) => void;
}


export default function CreateTourModal({ open, onClose, newTour, setNewTour, onCreate, addStep, removeStep, updateStep }: Props) {
if (!open) return null;


return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 overflow-y-auto">
<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.18 }} className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
<div className="sticky top-0 bg-white border-b border-slate-200 p-6">
<h2 className="text-2xl font-bold text-slate-900">Create New Tour</h2>
</div>


<div className="p-6 space-y-6">
<div>
<label className="block text-sm font-medium text-slate-900 mb-2">Tour Name *</label>
<input value={newTour.name} onChange={(e) => setNewTour({ ...newTour, name: e.target.value })} placeholder="Welcome Tour" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600" />
</div>


<div>
<label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
<textarea value={newTour.description} onChange={(e) => setNewTour({ ...newTour, description: e.target.value })} placeholder="Introduce new users to main features" rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
</div>


<div>
<div className="flex justify-between items-center mb-4">
<h3 className="text-lg font-semibold text-slate-900">Steps (Minimum 5)</h3>
<button onClick={addStep} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm flex items-center gap-2 transition"><Plus className="w-4 h-4"/>Add Step</button>
</div>


<div className="space-y-4">
{newTour.steps.map((step, index) => (
<div key={step.id} className="border border-slate-200 rounded-lg p-4">
<div className="flex justify-between items-start mb-4">
<h4 className="font-medium text-slate-900">Step {index + 1}</h4>
{newTour.steps.length > 5 && (
<button onClick={() => removeStep(index)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
)}
</div>


<div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-sm text-slate-600 mb-1">Title</label>
<input type="text" value={step.title} onChange={(e) => updateStep(index, 'title', e.target.value)} placeholder="Step title" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
</div>
<div>
<label className="block text-sm text-slate-600 mb-1">Target Selector</label>
<input type="text" value={step.targetSelector} onChange={(e) => updateStep(index, 'targetSelector', e.target.value)} placeholder="#element-id or .class-name" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
</div>
</div>


<div className="mt-3">
<label className="block text-sm text-slate-600 mb-1">Description</label>
<textarea value={step.description} onChange={(e) => updateStep(index, 'description', e.target.value)} placeholder="Explain this step" rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
</div>


<div className="mt-3">
<label className="block text-sm text-slate-600 mb-1">Position</label>
<select value={step.position} onChange={(e) => updateStep(index, 'position', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
<option value="top">Top</option>
<option value="bottom">Bottom</option>
<option value="left">Left</option>
<option value="right">Right</option>
</select>
</div>
</div>
))}
</div>
</div>
</div>


<div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3 justify-end">
<button onClick={onClose} className="px-6 py-3 border border-slate-300 hover:bg-slate-50 rounded-lg transition">Cancel</button>
<button onClick={() => void onCreate()} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition" disabled={!newTour.name || newTour.steps.filter(s => s.title).length < 5}>Create Tour</button>
</div>
</motion.div>
</div>
);
}