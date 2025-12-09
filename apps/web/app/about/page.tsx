"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiUser, FiZap, FiHeart, FiAward, FiTarget } from "react-icons/fi";
import { LuRocket as Rocket } from "react-icons/lu";

export default function AboutPage() {
  const values = [
    {
      icon: <FiUser className="w-8 h-8" />,
      title: "User First",
      description:
        "We design every feature with the end user in mind, ensuring delightful experiences",
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: "Performance",
      description:
        "Lightning-fast load times and smooth animations without compromising functionality",
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: "Simplicity",
      description:
        "Complex technology made simple. No technical knowledge required",
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Quality",
      description:
        "Enterprise-grade reliability with attention to every detail",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Tours" },
    { value: "98%", label: "Completion Rate" },
    { value: "5M+", label: "Users Guided" },
    { value: "500+", label: "Happy Customers" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About Tourify
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              We're on a mission to make onboarding delightful for every user,
              everywhere. Built by developers, for developers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-8 md:p-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Our Story</h2>
            </div>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                Tourify was born from a simple frustration: onboarding new users
                shouldn't be complicated. As developers, we've all struggled
                with creating engaging product tours that actually help users
                understand our applications.
              </p>
              <p>
                We saw teams spending weeks building custom onboarding flows,
                only to realize they needed better analytics, A/B testing, or
                the ability to update tours without deploying code. There had to
                be a better way.
              </p>
              <p>
                So we built Tourify - a platform that combines beautiful design,
                powerful features, and dead-simple integration. Now, any team
                can create professional onboarding experiences in minutes, not
                weeks.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-400">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-6 hover:border-purple-400/50 transition"
              >
                <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTarget className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-xl text-white/90 leading-relaxed">
              To empower every company, regardless of size or technical
              expertise, to create world-class onboarding experiences that
              delight users and drive product adoption.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Built With Modern Tech
            </h2>
            <p className="text-xl text-gray-400">
              Leveraging the best tools to deliver exceptional performance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Frontend
              </h3>
              <div className="space-y-2 text-gray-400">
                <div>• Next.js 14 (React)</div>
                <div>• TypeScript</div>
                <div>• Tailwind CSS</div>
                <div>• Framer Motion</div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Backend</h3>
              <div className="space-y-2 text-gray-400">
                <div>• Supabase</div>
                <div>• Next.js API Routes</div>
                <div>• Real-time Analytics</div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Widget</h3>
              <div className="space-y-2 text-gray-400">
                <div>• Vite</div>
                <div>• Three.js</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Onboarding?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of companies using Tourify to create amazing user
              experiences
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition cursor-pointer">
                Start Free Trial
              </button>

              <Link href="/documentation">
                <button className="px-8 py-4 border border-white/20 hover:bg-white/10 text-white rounded-lg font-semibold transition cursor-pointer">
                  View Documentation
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
