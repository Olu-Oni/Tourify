"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();

  const isActive = (path: string) =>
    pathname === path
      ? "text-white font-semibold"
      : "text-gray-300 hover:text-white transition";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
    } else {
      console.log("User logged out successfully");
      localStorage.removeItem("user");
      router.push("/");
    }
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
        <Link
          href="/"
          className="text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Tourify
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-1 justify-center gap-8">
          <Link href="/" className={isActive("/")}>
            Home
          </Link>
          <Link href="/about" className={isActive("/about")}>
            About
          </Link>
          <Link href="/documentation" className={isActive("/documentation")}>
            Docs
          </Link>
        </div>

        {user ? (
          <Link href="/dashboard">
            <button className="hidden md:block px-6 py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition duration-300 cursor-pointer">
              Dashboard
            </button>
          </Link>
        ) : (
          <Link href="/login">
            <button className="hidden md:block px-6 py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition duration-300 cursor-pointer">
              Get Started
            </button>
          </Link>
        )}

        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-full left-0 w-full overflow-hidden bg-slate-900 border-t border-white/10"
          >
            <div className="flex flex-col items-center gap-6 py-6">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={isActive("/")}
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className={isActive("/about")}
              >
                About
              </Link>
              <Link
                href="/documentation"
                onClick={() => setOpen(false)}
                className={isActive("/documentation")}
              >
                Docs
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="w-[85%]"
                  >
                    <button className="w-full text-white px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition duration-300">
                      Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="w-[85%] px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition duration-300"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="w-[85%]"
                  onClick={() => setOpen(false)}
                >
                  <button className="w-full text-white px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition duration-300">
                    Get Started
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
