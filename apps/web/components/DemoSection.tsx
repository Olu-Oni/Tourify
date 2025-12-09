"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IoMdArrowForward } from "react-icons/io";

export default function DemoSection() {
  return (
    <section className="py-20 px-6 bg-linear-to-r from-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of companies using Tourify to onboard their users
          </p>

          <Link href="#">
            <button className="px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 rounded-lg font-semibold flex items-center gap-2 mx-auto transition duration-300 cursor-pointer">
              Start Free Trial
              <IoMdArrowForward className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
