import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Step {
  id: string;
  tour_id: string;
  step_id: string;
  title: string;
  content: string;
  target_selector: string;
  position: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tour {
  id: string;
  created_by: string;
  title: string;
  description: string;
  is_public: boolean;
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

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: toursData, error: toursError } = await supabase
        .from("tours")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (toursError) {
        console.error("Supabase error:", toursError);
        throw new Error(`Database error: ${toursError.message}`);
      }

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

      const slug = tourData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

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

      if (tourError) throw tourError;

      const stepsToInsert = tourData.steps.map((step, index) => ({
        tour_id: newTour.id,
        step_id: `step_${index + 1}`,
        title: step.title,
        content: step.description,
        target_selector: step.targetSelector,
        position: index,
      }));

      const { error: stepsError } = await supabase
        .from("tour_steps")
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;

      await fetchTours();
      return newTour;
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating tour:", err);
      throw err;
    }
  };

  const updateTour = async (
    tourId: string,
    updates: Partial<{
      title: string;
      description: string;
      is_public: boolean;
    }>
  ) => {
    try {
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

  const updateTourSteps = async (tourId: string, steps: Array<{
    title: string;
    description: string;
    targetSelector: string;
    position: string;
    order: number;
  }>) => {
    try {
      await supabase.from("tour_steps").delete().eq("tour_id", tourId);

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

  const deleteTour = async (tourId: string) => {
    try {
      await supabase.from("tour_steps").delete().eq("tour_id", tourId);
      const { error } = await supabase.from("tours").delete().eq("id", tourId);

      if (error) throw error;

      await fetchTours();
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting tour:", err);
      throw err;
    }
  };

  const fetchTourStats = async (tourId: string): Promise<TourStats> => {
    try {
      const { count: viewsCount } = await supabase
        .from("tour_analytics")
        .select("*", { count: "exact", head: true })
        .eq("tour_id", tourId)
        .eq("event_type", "tour_started");

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