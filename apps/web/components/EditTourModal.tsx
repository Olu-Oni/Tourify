"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useTours from "../hooks/useTours";

export default function EditTourModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { tours, updateTour } = useTours();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!id) return;
    const t = tours.find((x) => x.id === id);
    if (t) {
      setName(t.name ?? "");
      setDescription(t.description ?? "");
    }
  }, [id, tours]);

  if (!id) return null;

  const submit = async () => {
    await updateTour(id, { name, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-xl w-full max-w-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">Edit Tour</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Name</label>
            <input className="w-full border px-3 py-2 rounded" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm block mb-1">Description</label>
            <textarea className="w-full border px-3 py-2 rounded" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => void submit()}>Save</button>
        </div>
      </motion.div>
    </div>
  );
}
