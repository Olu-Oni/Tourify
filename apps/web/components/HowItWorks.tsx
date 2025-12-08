"use client";

import { motion } from "framer-motion";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-400">
            Get started in minutes, no technical knowledge required
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              num: "1",
              title: "Create Tour",
              desc: "Use our visual editor to build your tour",
            },
            {
              num: "2",
              title: "Add Script",
              desc: "Copy 2 lines of code to your website",
            },
            {
              num: "3",
              title: "Track Results",
              desc: "Monitor engagement with built-in analytics",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 mx-auto">
                {step.num}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
