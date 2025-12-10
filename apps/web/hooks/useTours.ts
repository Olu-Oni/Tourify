// import { useEffect, useState } from "react";
// import type { Tour } from "@/interfaces/types";
// import { toast } from "sonner";
// import { createClient } from "@supabase/supabase-js"

// export function useTours() {
//   const supabase = createClient();
//   const [tours, setTours] = useState<Tour[]>([]);
//   const [loading, setLoading] = useState(true);

//   async function fetchTours() {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("tours")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) toast.error(error.message);
//     else setTours(data || []);

//     setLoading(false);
//   }

//   async function createTour(payload: Omit<Tour, "id">) {
//     const { data, error } = await supabase.from("tours").insert(payload);

//     if (error) return toast.error(error.message);

//     toast.success("Tour created!");
//     fetchTours();
//   }

//   async function updateTour(id: string, payload: Partial<Tour>) {
//     const { error } = await supabase
//       .from("tours")
//       .update(payload)
//       .eq("id", id);

//     if (error) return toast.error(error.message);

//     toast.success("Tour updated!");
//     fetchTours();
//   }

//   async function deleteTour(id: string) {
//     const { error } = await supabase.from("tours").delete().eq("id", id);

//     if (error) return toast.error(error.message);

//     toast.success("Tour deleted!");
//     fetchTours();
//   }

//   useEffect(() => {
//     fetchTours();
//   }, []);

//   return {
//     tours,
//     loading,
//     createTour,
//     updateTour,
//     deleteTour,
//   };
// }


// app/dashboard/hooks/useTours.ts
// "use client";
// import { useEffect, useState, useRef } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { toast } from "sonner";

// export type Tour = {
//   id: string;
//   name: string;
//   description?: string;
//   is_active?: boolean;
//   steps?: number;
//   views?: number;
//   completions?: number;
//   completion_rate?: number;
//   created_at?: string;
//   updated_at?: string;
// };

// export default function useTours() {
//   const [tours, setTours] = useState<Tour[]>([]);
//   const subRef = useRef<any>(null);

//   useEffect(() => {
//     let mounted = true;

//     async function load() {
//       const { data, error } = await supabase.from("tours").select("*").order("created_at", { ascending: false });
//       if (error) {
//         toast.error(error.message);
//       } else if (mounted) {
//         setTours(data ?? []);
//       }
//     }

//     load();

//     // Realtime subscription
//     try {
//       const channel = supabase
//         .channel("public:tours")
//         .on(
//           "postgres_changes",
//           { event: "*", schema: "public", table: "tours" },
//           (payload) => {
//             const ev = payload.eventType;
//             const record = payload.new ?? payload.old;
//             if (ev === "INSERT") {
//               setTours((s) => [record, ...s]);
//               toast.success("Tour created");
//             } else if (ev === "UPDATE") {
//               setTours((s) => s.map((t) => (t.id === record.id ? record : t)));
//               toast.success("Tour updated");
//             } else if (ev === "DELETE") {
//               setTours((s) => s.filter((t) => t.id !== record.id));
//               toast.success("Tour deleted");
//             }
//           }
//         )
//         .subscribe();

//       subRef.current = channel;
//     } catch (e) {
//       console.warn("Realtime subscription failed", e);
//     }

//     return () => {
//       mounted = false;
//       try {
//         if (subRef.current) supabase.removeChannel(subRef.current);
//       } catch {}
//     };
//   }, []);

//   // CRUD
//   const createTour = async (payload: Omit<Tour, "id" | "created_at" | "updated_at">) => {
//     const { data, error } = await supabase.from("tours").insert([payload]).select().single();
//     if (error) toast.error(error.message);
//     else toast.success("Created tour");
//     return data;
//   };

//   const updateTour = async (id: string, payload: Partial<Tour>) => {
//     const { data, error } = await supabase.from("tours").update(payload).eq("id", id).select().single();
//     if (error) toast.error(error.message);
//     else toast.success("Updated tour");
//     return data;
//   };

//   const deleteTour = async (id: string) => {
//     const { error } = await supabase.from("tours").delete().eq("id", id);
//     if (error) toast.error(error.message);
//     else toast.success("Deleted tour");
//   };

//   return { tours, createTour, updateTour, deleteTour };
// }


// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";

// export interface Step {
//   id: string;
//   title: string;
//   description: string;
//   targetSelector: string;
//   position: string;
// }

// export interface Tour {
//   id: string;
//   name: string;
//   description: string;
//   isActive: boolean;
//   steps: Step[];
//   views: number;
//   completions: number;
//   completionRate: number;
// }

// export default function useTours() {
//   const [tours, setTours] = useState<Tour[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch tours for the signed-in user
//   const fetchTours = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("tours")
//       .select("*, steps(*)")
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching tours:", error.message);
//     } else {
//       setTours(data || []);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchTours();
//   }, []);

//   const createTour = async (tour: Omit<Tour, "id" | "views" | "completions" | "completionRate">) => {
//     const { data, error } = await supabase
//       .from("tours")
//       .insert([tour])
//       .select()
//       .single();

//     if (error) throw error;

//     setTours((prev) => [data, ...prev]);
//     return data;
//   };

//   const updateTour = async (id: string, updates: Partial<Tour>) => {
//     const { data, error } = await supabase
//       .from("tours")
//       .update(updates)
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) throw error;

//     setTours((prev) => prev.map((t) => (t.id === id ? data : t)));
//     return data;
//   };

//   const deleteTour = async (id: string) => {
//     const { error } = await supabase.from("tours").delete().eq("id", id);
//     if (error) throw error;
//     setTours((prev) => prev.filter((t) => t.id !== id));
//   };

//   return { tours, loading, fetchTours, createTour, updateTour, deleteTour };
// }


// 


import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Step {
  id: string;
  tour_id: string;
  step_id: string;
  title: string;
  content: string; // Changed from 'description'
  target_selector: string; // Changed from 'targetSelector'
  position: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tour {
  id: string;
  created_by: string; // Changed from user_id
  title: string; // Changed from 'name'
  description: string;
  is_public: boolean; // Changed from 'isActive'
  slug: string;
  created_at?: string;
  updated_at?: string;
  steps?: Step[];
}

export interface TourStats {
  views: number;
  completions: number;
  completionRate: number;
}

export default function useTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tours with their steps
  const fetchTours = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch tours for current user
      const { data: toursData, error: toursError } = await supabase
        .from("tours")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (toursError) {
        console.error("Supabase error:", toursError);
        throw new Error(`Database error: ${toursError.message}`);
      }

      console.log("Raw tours data from Supabase:", toursData);

      // Fetch steps for each tour
      const toursWithSteps = await Promise.all(
        (toursData || []).map(async (tour) => {
          const { data: stepsData, error: stepsError } = await supabase
            .from("tour_steps")
            .select("*")
            .eq("tour_id", tour.id)
            .order("position", { ascending: true });

          if (stepsError) {
            console.error("Error fetching steps:", stepsError);
          }

          return {
            ...tour,
            steps: stepsData || [],
          };
        })
      );

      setTours(toursWithSteps);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching tours:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new tour with steps
  const createTour = async (tourData: {
    name: string;
    description: string;
    isActive: boolean;
    steps: Array<{
      title: string;
      description: string;
      targetSelector: string;
      position: string;
      order: number;
    }>;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate slug from name
      const slug = tourData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Insert tour with correct column names
      const { data: newTour, error: tourError } = await supabase
        .from("tours")
        .insert({
          created_by: user.id,
          title: tourData.name,
          description: tourData.description,
          is_public: tourData.isActive,
          slug: slug,
        })
        .select()
        .single();

      if (tourError) {
        console.error("Error creating tour:", tourError);
        throw tourError;
      }

      // Insert steps with correct column names
      const stepsToInsert = tourData.steps.map((step, index) => ({
        tour_id: newTour.id,
        step_id: `step_${index + 1}`,
        title: step.title,
        content: step.description, // Map to 'content'
        target_selector: step.targetSelector, // Map to 'target_selector'
        position: index, // Use index as position
      }));

      const { error: stepsError } = await supabase
        .from("tour_steps")
        .insert(stepsToInsert);

      if (stepsError) {
        console.error("Error creating steps:", stepsError);
        throw stepsError;
      }

      // Refresh tours
      await fetchTours();
      return newTour;
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating tour:", err);
      throw err;
    }
  };

  // Update tour (title, description, is_pub)
  const updateTour = async (
    tourId: string,
    updates: Partial<{
      title: string;
      description: string;
      is_public: boolean;
    }>
  ) => {
    try {
      // Map to correct column names
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.is_public !== undefined) dbUpdates.is_public = updates.is_public;

      const { error } = await supabase
        .from("tours")
        .update(dbUpdates)
        .eq("id", tourId);

      if (error) throw error;

      await fetchTours();
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating tour:", err);
      throw err;
    }
  };

  // Update tour steps
  const updateTourSteps = async (tourId: string, steps: Array<{
    title: string;
    description: string;
    targetSelector: string;
    position: string;
    order: number;
  }>) => {
    try {
      // Delete existing steps
      await supabase.from("tour_steps").delete().eq("tour_id", tourId);

      // Insert new steps
      const stepsToInsert = steps.map((step, index) => ({
        tour_id: tourId,
        step_id: `step_${index + 1}`,
        title: step.title,
        content: step.description,
        target_selector: step.targetSelector,
        position: index,
      }));

      const { error } = await supabase
        .from("tour_steps")
        .insert(stepsToInsert);

      if (error) throw error;

      await fetchTours();
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating steps:", err);
      throw err;
    }
  };

  // Delete tour
  const deleteTour = async (tourId: string) => {
    try {
      // Delete steps first
      await supabase.from("tour_steps").delete().eq("tour_id", tourId);

      // Delete tour
      const { error } = await supabase.from("tours").delete().eq("id", tourId);

      if (error) throw error;

      await fetchTours();
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting tour:", err);
      throw err;
    }
  };

  // Fetch tour analytics
  const fetchTourStats = async (tourId: string): Promise<TourStats> => {
    try {
      // Count views (tour_started events)
      const { count: viewsCount } = await supabase
        .from("tour_analytics")
        .select("*", { count: "exact", head: true })
        .eq("tour_id", tourId)
        .eq("event_type", "tour_started");

      // Count completions (tour_completed events)
      const { count: completionsCount } = await supabase
        .from("tour_analytics")
        .select("*", { count: "exact", head: true })
        .eq("tour_id", tourId)
        .eq("event_type", "tour_completed");

      const views = viewsCount || 0;
      const completions = completionsCount || 0;
      const completionRate = views > 0 ? Math.round((completions / views) * 100) : 0;

      return { views, completions, completionRate };
    } catch (err) {
      console.error("Error fetching stats:", err);
      return { views: 0, completions: 0, completionRate: 0 };
    }
  };

  useEffect(() => {
    fetchTours();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("tours-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tours" },
        () => {
          fetchTours();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tours,
    loading,
    error,
    createTour,
    updateTour,
    updateTourSteps,
    deleteTour,
    fetchTourStats,
    refetch: fetchTours,
  };
}