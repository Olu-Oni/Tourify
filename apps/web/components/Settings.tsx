'use client'
import React from 'react';


export default function Settings() {
return (
<div className="bg-white rounded-xl border border-slate-200 p-8">
<h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>
<div className="space-y-6">
<div>
<label className="block text-sm font-medium text-slate-900 mb-2">API Key</label>
<input type="text" value="pk_live_xxxxxxxxxxxxxxxx" readOnly className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50" />
</div>
<div>
<label className="block text-sm font-medium text-slate-900 mb-2">Widget CDN URL</label>
<input type="text" value="https://cdn.tourguide.com/widget.js" readOnly className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50" />
</div>
</div>
</div>
);
}