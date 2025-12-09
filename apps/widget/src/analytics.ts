// analytics.ts - Track tour interactions

interface AnalyticsEvent {
  eventName: string;
  tourId: string;
  sessionId: string;
  timestamp: string;
  url: string;
  userAgent: string;
  [key: string]: any;
}

interface AnalyticsConfig {
  apiUrl?: string;
}

export class Analytics {
  private tourId: string;
  private sessionId: string;
  private events: AnalyticsEvent[];
  private apiUrl: string;

  constructor(tourId: string, config: AnalyticsConfig = {}) {
    this.tourId = tourId;
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.apiUrl = config.apiUrl || 'https://your-api.com/analytics';
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
      userAgent: navigator.userAgent,
      ...data
    };

    // Store locally
    this.events.push(event);
    
    // Log to console (for development)
    console.log('📊 Analytics:', eventName, data);
    
    // Send to API (implement later)
    this.sendToAPI(event);
    
    // Store in localStorage for debugging
    this.saveToLocalStorage(event);
  }

  private async sendToAPI(event: AnalyticsEvent): Promise<void> {
    try {
      // Uncomment when you have API endpoint
      /*
      await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
      */
    } catch (error) {
      console.error('Failed to send analytics:', error);
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