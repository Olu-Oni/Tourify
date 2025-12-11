// src/tourFetcher.ts - Fetch tours from Supabase
import { supabase } from './supabase';
import type { TourData, TourStep } from './types/index';

export class TourFetcher {
  /**
   * Fetch a tour by its ID from Supabase
   */
  static async fetchTourById(tourId: string): Promise<TourData | null> {
    try {
      // Step 1: Fetch tour metadata (PUBLIC TOURS ONLY for widget)
      console.log(`🔍 Fetching tour with ID: ${tourId}`);
      
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('id', tourId)  
        .eq('is_public', true)
        .single();

      if (tourError) {
        console.error('❌ Error fetching tour:', tourError);
        return null;
      }

      if (!tourData) {
        console.warn(`⚠️ Tour not found or not public: ${tourId}`);
        return null;
      }

      console.log(`✅ Tour found: "${tourData.title}" (${tourData.slug})`);

      // Step 2: Fetch tour steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('tour_steps')
        .select('*')
        .eq('tour_id', tourId)  
        .order('position', { ascending: true });

      if (stepsError) {
        console.error('❌ Error fetching tour steps:', stepsError);
        return null;
      }

      console.log(`📊 Found ${stepsData?.length || 0} steps`);
      console.log(`📊 steps are ${stepsData} `);

      // Step 3: Transform to widget format
      const steps: TourStep[] = (stepsData || []).map(step => ({
        id: step.step_id,  // Use step_id from your DB
        title: step.title,
        description: step.content,  // Maps to 'content' column in your DB
        target: step.target_selector,
        position: this.mapPosition(step.position),
      }));

      return {
        id: tourData.id,
        name: tourData.title,  // Use title as tour name
        steps,
      };
    } catch (error) {
      console.error('💥 Failed to fetch tour from Supabase:', error);
      return null;
    }
  }

  /**
   * Convert numeric position to string position for widget
   */
  private static mapPosition(position: number): TourStep['position'] {
    // Based on your DB, position is a number (0, 1, 2, 3, etc.)
    // Map to widget positions
    const positions: TourStep['position'][] = [
      'auto',    // 0
      'top',     // 1
      'bottom',  // 2
      'left',    // 3
      'right',   // 4
      'center',  // 5
    ];
    
    return positions[position] || 'auto';
  }

  /**
   * Fetch a tour by slug (for public embedding - WIDGET USES THIS)
   */
  static async fetchTourBySlug(slug: string): Promise<TourData | null> {
    try {
      console.log(`🔍 Fetching public tour by slug: "${slug}"`);
      
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('slug', slug)
        .eq('is_public', true)  // IMPORTANT: Only public tours for widgets
        .single();

      if (tourError) {
        console.error('❌ Error fetching tour by slug:', tourError);
        return null;
      }

      if (!tourData) {
        console.warn(`⚠️ Public tour with slug "${slug}" not found`);
        return null;
      }

      console.log(`✅ Found tour: "${tourData.title}" (ID: ${tourData.id})`);
      return this.fetchTourById(tourData.id);
      
    } catch (error) {
      console.error('💥 Failed to fetch tour by slug:', error);
      return null;
    }
  }

  /**
   * Quick test function using YOUR actual tour
   */
  static async testWithActualData(): Promise<void> {
    console.log('🧪 Testing TourFetcher with actual data...');
    
    // Use the tour ID from your logs
    const tourId = 'a7db84fb-c06f-4ec1-9f3c-43948a461b69';
    const slug = 'test-this-tour';
    
    console.log(`\n1. Testing fetchTourById("${tourId}")...`);
    const tourById = await this.fetchTourById(tourId);
    console.log('Result:', tourById ? '✅ Success' : '❌ Failed');
    
    console.log(`\n2. Testing fetchTourBySlug("${slug}")...`);
    const tourBySlug = await this.fetchTourBySlug(slug);
    console.log('Result:', tourBySlug ? '✅ Success' : '❌ Failed');
    
    if (tourBySlug) {
      console.log('\n📋 Tour details:');
      console.log('- Name:', tourBySlug.name);
      console.log('- ID:', tourBySlug.id);
      console.log('- Steps:', tourBySlug.steps.length);
      tourBySlug.steps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step.title} -> ${step.target}`);
      });
    }
  }
}