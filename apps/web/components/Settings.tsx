"use client";

import React from "react";
import { toast } from "sonner";

export default function Settings() {
  const copyApiKey = async () => {
    await navigator.clipboard.writeText(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "");
    toast.success("API key copied");
  };

  return (
    <div className="bg-white p-6 rounded-xl border">
      <h3 className="text-lg font-semibold mb-4">Settings</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">API Key</label>
          <div className="flex gap-2">
            <input readOnly value={process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? ""} className="flex-1 border px-3 py-2 rounded bg-slate-50" />
            <button className="px-3 py-2 bg-slate-900 text-white rounded" onClick={copyApiKey}>Copy</button>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Widget CDN</label>
          <input readOnly value="https://cdn.tourguide.com/widget.js" className="w-full border px-3 py-2 rounded bg-slate-50" />
        </div>
      </div>
    </div>
  );
}
