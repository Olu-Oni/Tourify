import { useEffect, useState, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tour } from "../interfaces/types";
import { getSupabase } from "../lib/supabaseClient";
import { toast } from "sonner";

export function useTours(initial: Tour[] = []) {
  const [tours, setTours] = useState<Tour[]>(initial);
  const supabase = getSupabase();
  const subRef = useRef<ReturnType<SupabaseClient["channel"]> | null>(null);

  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase not configured — using local state only.");
      return;
    }

    const channel = supabase
      .channel("public:tours")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tours" },
        (payload) => {
          const ev = payload.eventType;
          const record = (payload.new ?? payload.old) as any;

          if (!record?.id) return;

          if (ev === "INSERT") {
            setTours((prev) => {
              if (prev.some((t) => t.id === String(record.id))) return prev;
              toast.success(`Tour created: ${record.name}`);
              return [...prev, normalize(record)];
            });
          }

          if (ev === "UPDATE") {
            toast.success(`Tour updated: ${record.name}`);
            setTours((prev) =>
              prev.map((t) =>
                t.id === String(record.id) ? normalize(record) : t
              )
            );
          }

          if (ev === "DELETE") {
            toast.success("Tour deleted");
            setTours((prev) => prev.filter((t) => t.id !== String(record.id)));
          }
        }
      )
      .subscribe();

    subRef.current = channel;

    // initial fetch
    (async () => {
      const { data, error } = await supabase.from("tours").select("*");
      if (error) {
        console.error("Failed to fetch tours", error);
        toast.error("Failed to load tours");
        return;
      }
      if (data) setTours(data.map(normalize));
    })();

    return () => {
      try {
        if (subRef.current) supabase.removeChannel(subRef.current);
      } catch {
        /* ignore */
      }
    };
  }, [supabase]);

  // ---------------------------
  // CRUD helpers
  // ---------------------------
  const createTour = async (t: Omit<Tour, "id">): Promise<Tour> => {
    const sup = getSupabase();

    if (!sup) {
      const next: Tour = { ...t, id: Date.now().toString() };
      setTours((prev) => [...prev, next]);
      toast.success("Tour created (local)");
      return next;
    }

    const { data, error } = await sup.from("tours").insert(t).select().single();
    if (error || !data) {
      toast.error("Failed to create tour");
      throw error;
    }

    toast.success("Tour created");
    return normalize(data);
  };

  const updateTour = async (id: string, updates: Partial<Tour>) => {
    const sup = getSupabase();

    if (!sup) {
      setTours((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      toast.success("Tour updated (local)");
      return;
    }

    const { data, error } = await sup
      .from("tours")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      toast.error("Failed to update tour");
      throw error;
    }

    setTours((prev) => prev.map((t) => (t.id === id ? normalize(data) : t)));
  };

  const deleteTour = async (id: string) => {
    const sup = getSupabase();

    if (!sup) {
      setTours((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tour deleted (local)");
      return;
    }

    const { error } = await sup.from("tours").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete tour");
      throw error;
    }
    // realtime handles UI update
  };

  return { tours, createTour, updateTour, deleteTour, setTours };
}

// ---------------------------
// Normalizer
// ---------------------------
function normalize(raw: Record<string, unknown>): Tour {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    isActive: Boolean(raw.isActive),
    steps: Number(raw.steps ?? 0),
    views: Number(raw.views ?? 0),
    completions: Number(raw.completions ?? 0),
    completionRate: Number(raw.completionRate ?? 0),
  };
}
