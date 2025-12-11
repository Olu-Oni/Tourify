// src/tourFetcher.ts - Fetch tours from Supabase
import { supabase } from './supabase';
import type { TourData, TourStep } from './types/index';

export class TourFetcher {
  /**
   * Fetch a tour by its ID from Supabase
   */
  static async fetchTourById(tourId: string): Promise<TourData | null> {
    try {
      // Fetch tour metadata
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('tour_id', tourId)
        .eq('public', true)
        .single();

      if (tourError) {
        console.error('Error fetching tour:', tourError);
        return null;
      }

      if (!tourData) {
        console.warn(`Tour not found: ${tourId}`);
        return null;
      }

      // Fetch tour steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('tour_steps')
        .select('*')
        .eq('tour_id', tourId)
        .order('position', { ascending: true });

      if (stepsError) {
        console.error('Error fetching tour steps:', stepsError);
        return null;
      }

      // Transform database format to widget format
      const steps: TourStep[] = (stepsData || []).map(step => ({
        id: step.step_id,
        title: step.title,
        description: step.content,
        target: step.target_selector,
        position: 'auto' as const, // You can store this in the DB if needed
      }));

      return {
        id: tourData.tour_id,
        name: tourData.slug || tourId,
        steps,
      };
    } catch (error) {
      console.error('Failed to fetch tour from Supabase:', error);
      return null;
    }
  }

  /**
   * Fetch a tour by slug
   */
  static async fetchTourBySlug(slug: string): Promise<TourData | null> {
    try {
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('slug', slug)
        .eq('public', true)
        .single();

      if (tourError || !tourData) {
        return null;
      }

      return this.fetchTourById(tourData.tour_id);
    } catch (error) {
      console.error('Failed to fetch tour by slug:', error);
      return null;
    }
  }

  /**
   * Fetch all public tours
   */
  static async fetchAllTours(): Promise<TourData[]> {
    try {
      const { data: toursData, error } = await supabase
        .from('tours')
        .select('tour_id')
        .eq('public', true);

      if (error || !toursData) {
        return [];
      }

      const tours = await Promise.all(
        toursData.map(tour => this.fetchTourById(tour.tour_id))
      );

      return tours.filter((tour): tour is TourData => tour !== null);
    } catch (error) {
      console.error('Failed to fetch all tours:', error);
      return [];
    }
  }
}