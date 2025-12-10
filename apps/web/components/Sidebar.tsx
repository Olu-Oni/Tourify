'use client'
import React from 'react';
import { PlayCircle, BarChart3, Settings } from 'lucide-react';


interface Props { active: string; setActive: (v: 'tours'|'analytics'|'settings') => void }
export default function Sidebar({ active, setActive }: Props) {
return (
<aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6">
    <div className="text-2xl font-bold mb-8 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        TourGuide
    </div>
    <nav className="space-y-2">
        <button onClick={() => setActive('tours')} className={`w-full text-left px-4 py-3 rounded-lg transition ${active === 'tours' ? 'bg-purple-600' : 'hover:bg-slate-800'}`}>
            <PlayCircle className="inline w-5 h-5 mr-3" /> Tours
        </button>
        <button onClick={() => setActive('analytics')} className={`w-full text-left px-4 py-3 rounded-lg transition ${active === 'analytics' ? 'bg-purple-600' : 'hover:bg-slate-800'}`}>
            <BarChart3 className="inline w-5 h-5 mr-3" /> Analytics
        </button>
        <button onClick={() => setActive('settings')} className={`w-full text-left px-4 py-3 rounded-lg transition ${active === 'settings' ? 'bg-purple-600' : 'hover:bg-slate-800'}`}>
            <Settings className="inline w-5 h-5 mr-3" /> Settings
        </button>
    </nav>


    <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Signed in as</div>
            <div className="font-semibold">user@example.com</div>
            <button className="text-sm text-purple-400 hover:text-purple-300 mt-2">Sign Out</button>
        </div>
    </div>
</aside>
);
}
// import Link from "next/link";
// import React from "react";

// export default function Sidebar() {
//   return (
//     <aside className="lg:col-span-1">
//       <div className="sticky top-24 space-y-1">
//         <Link
//           href="#getting-started"
//           className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
//         >
//           Getting Started
//         </Link>
//         <Link
//           href="#installation"
//           className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
//         >
//           Installation
//         </Link>
//         <Link
//           href="#basic-usage"
//           className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
//         >
//           Basic Usage
//         </Link>
//         <Link
//           href="#configuration"
//           className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
//         >
//           Configuration
//         </Link>
//         <Link
//           href="#custom-tours"
//           className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
//         >
//           Custom Tours
//         </Link>
//         <Link
//           href="#api-reference"
//           className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
//         >
//           API Reference
//         </Link>
//       </div>
//     </aside>
//   );
// }
