'use client';

import React from "react";
import useUser from "@/hooks/useUser";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { PlayCircle, BarChart3, Settings, User as UserIcon } from 'lucide-react';

interface Props {
  active: 'tours' | 'analytics' | 'settings';
  setActive: (v: 'tours' | 'analytics' | 'settings') => void;
}

export default function DashboardSidebar({ active, setActive }: Props) {
  const user = useUser();
  const router = useRouter();

  return (
    <motion.aside
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen bg-slate-900 text-white p-6 flex flex-col justify-between relative"
    >
      <div>
        <div className="text-2xl font-bold mb-8 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          TourGuide
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActive('tours')}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
              active === 'tours' ? 'bg-purple-600' : 'hover:bg-slate-800'
            }`}
          >
            <PlayCircle className="w-5 h-5" /> Tours
          </button>
          <button
            onClick={() => setActive('analytics')}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
              active === 'analytics' ? 'bg-purple-600' : 'hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" /> Analytics
          </button>
          <button
            onClick={() => setActive('settings')}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
              active === 'settings' ? 'bg-purple-600' : 'hover:bg-slate-800'
            }`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-slate-800 rounded-lg p-4 flex flex-col items-start gap-1">
          <div className="text-sm text-gray-400">Signed in as</div>
          <div className="font-semibold">{user?.email ?? "—"}</div>
          <button
  className="text-sm text-purple-400 hover:text-purple-300 mt-2"
  onClick={async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }}
>
  Logout
</button>
        </div>
      </div>
    </motion.aside>
  );
}
