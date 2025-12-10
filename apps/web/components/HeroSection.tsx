"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { IoMdArrowForward } from "react-icons/io";

export default function HeroSection() {
  const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    { step: "" },
    { step: "" },
    { step: "" },
    { step: "" },
    { step: "" },
  ];

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Onboard Users
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                With Style
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Create beautiful, interactive product tours that guide users
              through your app. No coding required, analytics included.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login">
                <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition duration-300 cursor-pointer">
                  Get Started Free
                  <IoMdArrowForward className="w-5 h-5" />
                </button>
              </Link>

              <Link href="https://tourify-widget.vercel.app/test/test2.html">
                <button className="px-8 py-4 border border-white/20 hover:bg-white/10 text-white rounded-lg font-semibold transition duration-300 cursor-pointer">
                  View Demo
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 p-8 shadow-2xl">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              <motion.div
                key={demoStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-600/20 border border-purple-400/30 rounded-xl p-6 mb-4"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  See users complete tasks faster and with less frustration.
                </h3>
                <p className="text-gray-300 mb-4">
                  Guiding users every step of the way.
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {demoSteps.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition ${
                          i === demoStep ? "bg-purple-400 w-8" : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="px-4 py-2 text-white bg-purple-600  rounded-lg text-sm flex items-center gap-2"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
