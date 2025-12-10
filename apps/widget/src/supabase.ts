// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jhrxcjsqktqyecuzqsxk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_SKA7rhjs6-AJl4-Rd8CLbg_pVm5JYvc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      tours: {
        Row: {
          id: string;
          tour_id: string;
          slug: string;
          config: any;
          public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          slug: string;
          config?: any;
          public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tour_id?: string;
          slug?: string;
          config?: any;
          public?: boolean;
          created_at?: string;
        };
      };
      tour_steps: {
        Row: {
          id: string;
          tour_id: string;
          step_id: string;
          position: number;
          title: string;
          content: string;
          target_selector: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          step_id: string;
          position: number;
          title: string;
          content: string;
          target_selector: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tour_id?: string;
          step_id?: string;
          position?: number;
          title?: string;
          content?: string;
          target_selector?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tour_analytics: {
        Row: {
          id: string;
          tour_id: string;
          step_id: string | null;
          event_type: string;
          session_id: string;
          user_id: string | null;
          payload: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          step_id?: string | null;
          event_type: string;
          session_id: string;
          user_id?: string | null;
          payload?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          tour_id?: string;
          step_id?: string | null;
          event_type?: string;
          session_id?: string;
          user_id?: string | null;
          payload?: any;
          created_at?: string;
        };
      };
      embeds: {
        Row: {
          id: string;
          tour_id: string;
          slug: string;
          config: any;
          public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          slug: string;
          config?: any;
          public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tour_id?: string;
          slug?: string;
          config?: any;
          public?: boolean;
          created_at?: string;
        };
      };
    };
  };
}