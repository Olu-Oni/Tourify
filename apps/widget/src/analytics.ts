// src/analytics.ts - Track tour interactions with Supabase
import { supabase } from './supabase';

interface AnalyticsEvent {
  eventName: string;
  tourId: string;
  sessionId: string;
  timestamp: string;
  url: string;
  [key: string]: any;
}

interface AnalyticsConfig {
  apiUrl?: string;
  userId?: string;
}

export class Analytics {
  private tourId: string;
  private sessionId: string;
  private userId: string | null;
  private events: AnalyticsEvent[];
  private apiUrl: string;
  private useSupabase: boolean;

  constructor(tourId: string, config: AnalyticsConfig = {}) {
    this.tourId = tourId;
    this.sessionId = this.generateSessionId();
    this.userId = config.userId || null;
    this.events = [];
    this.apiUrl = config.apiUrl || 'https://your-api.com/analytics';
    
    // Use Supabase if not using custom API
    this.useSupabase = !config.apiUrl || config.apiUrl.includes('your-api.com');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(eventName: string, data: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      eventName,
      tourId: this.tourId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...data
    };

    // Store locally
    this.events.push(event);
    
    // Log to console with different colors for different events
    const logStyles = {
      'tour_started': 'background: #4CAF50; color: white; padding: 2px 4px; border-radius: 3px;',
      'tour_completed': 'background: #2196F3; color: white; padding: 2px 4px; border-radius: 3px;',
      'tour_skipped': 'background: #FF9800; color: white; padding: 2px 4px; border-radius: 3px;',
      'tour_stopped': 'background: #9E9E9E; color: white; padding: 2px 4px; border-radius: 3px;',
      'tour_initialized': 'background: #9C27B0; color: white; padding: 2px 4px; border-radius: 3px;',
      'step_viewed': 'background: #673AB7; color: white; padding: 2px 4px; border-radius: 3px;',
      'step_completed': 'background: #009688; color: white; padding: 2px 4px; border-radius: 3px;',
    };
    
    const style = logStyles[eventName as keyof typeof logStyles] || 'background: #666; color: white; padding: 2px 4px; border-radius: 3px;';
    console.log(`%c📊 ${eventName}`, style, data);
    
    // Send to Supabase or API
    if (this.useSupabase) {
      this.sendToSupabase(event);
    } else {
      this.sendToAPI(event);
    }
    
    // Store in localStorage for debugging
    this.saveToLocalStorage(event);
  }

  private async sendToSupabase(event: AnalyticsEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('tour_analytics')
        .insert({
          tour_id: event.tourId,
          step_id: event.stepId || null,
          event_type: event.eventName,
          session_id: event.sessionId,
          user_id: this.userId,
          payload: {
            // url: event.url,
            // timestamp: event.timestamp,
            ...event
          }
        });

      if (error) {
        console.error('Supabase analytics error:', error);
      }
    } catch (error) {
      console.error('Failed to send analytics to Supabase:', error);
    }
  }

  private async sendToAPI(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics to API:', error);
    }
  }

  private saveToLocalStorage(event: AnalyticsEvent): void {
    try {
      const key = `tour_analytics_${this.tourId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]') as AnalyticsEvent[];
      existing.push(event);
      
      // Keep only last 50 events
      if (existing.length > 50) {
        existing.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      // localStorage might be full or unavailable
      console.warn('Could not save analytics to localStorage');
    }
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  getStoredEvents(): AnalyticsEvent[] {
    try {
      const key = `tour_analytics_${this.tourId}`;
      return JSON.parse(localStorage.getItem(key) || '[]') as AnalyticsEvent[];
    } catch {
      return [];
    }
  }

  clearEvents(): void {
    this.events = [];
    const key = `tour_analytics_${this.tourId}`;
    localStorage.removeItem(key);
  }
}