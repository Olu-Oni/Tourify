import Link from "next/link";
import React from "react";

export default function Sidebar() {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-24 space-y-1">
        <Link
          href="#getting-started"
          className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          Getting Started
        </Link>
        <Link
          href="#installation"
          className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          Installation
        </Link>
        <Link
          href="#basic-usage"
          className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          Basic Usage
        </Link>
        <Link
          href="#configuration"
          className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          Configuration
        </Link>
        <Link
          href="#custom-tours"
          className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          Custom Tours
        </Link>
        <Link
          href="#api-reference"
          className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          API Reference
        </Link>
      </div>
    </aside>
  );
}
