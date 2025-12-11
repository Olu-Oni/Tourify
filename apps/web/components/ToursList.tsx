// app/dashboard/components/ToursList.tsx
"use client";
import React, { useState } from "react";
import useTours from "../hooks/useTours";
import EditTourModal from "./EditTourModal";
import { motion } from "framer-motion";

export default function ToursList() {
  const { tours, deleteTour } = useTours();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="bg-white p-6 rounded-xl border">
      <h3 className="text-lg font-semibold mb-4">Your Tours</h3>
      <div className="space-y-3">
        {tours.map((t) => (
          <motion.div key={t.id} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-gray-500">{t.description}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingId(t.id)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
              <button onClick={() => void deleteTour(t.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
            </div>
          </motion.div>
        ))}
      </div>

      <EditTourModal id={editingId} onClose={() => setEditingId(null)} />
    </div>
  );
}
