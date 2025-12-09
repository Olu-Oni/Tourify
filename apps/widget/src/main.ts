import './style.css';
import { TourManager } from './tourManager';
import { Analytics } from './analytics';
import type { TourData, TourConfig } from './types/index';

console.log(' Main.ts loaded!');

class TourWidget {
  private tourManager: TourManager | null;
  private analytics: Analytics | null;
  private config: TourConfig | null;

  constructor() {
    this.tourManager = null;
    this.analytics = null;
    this.config = null;
  }

  // Initialize widget
  init(config: Partial<TourConfig>): void {
    this.config = {
      tourId: config.tourId || 'default',
      autoStart: config.autoStart !== false,
      showAvatar: config.showAvatar !== false,
      theme: config.theme || 'light',
      apiUrl: config.apiUrl || 'https://your-api.com',
      ...config
    };

    // Initialize analytics
    this.analytics = new Analytics(this.config.tourId, {
      apiUrl: this.config.apiUrl
    });

    // Fetch tour data and initialize
    this.loadTourData();
  }

  private async loadTourData(): Promise<void> {
    try {
      // For now, use mock data (later fetch from API)
      const tourData = this.getMockTourData();
      
      if (!this.analytics) {
        throw new Error('Analytics not initialized');
      }

      // Initialize tour manager
      this.tourManager = new TourManager(tourData, this.config!, this.analytics);

      // Auto-start if enabled
      if (this.config?.autoStart) {
        this.tourManager.start();
      }

      // Track initialization
      this.analytics.track('tour_initialized', {
        tourId: this.config!.tourId,
        stepsCount: tourData.steps.length
      });

    } catch (error) {
      console.error('Failed to load tour:', error);
    }
  }

  // Mock data (for now)
  private getMockTourData(): TourData {
    return {
      id: this.config!.tourId,
      name: 'Welcome Tour',
      steps: [
        {
          id: 'step-1',
          title: '👋 Welcome!',
          description: 'Let\'s take a quick tour to get you started.',
          target: 'body',
          position: 'center'
        },
        {
          id: 'step-2',
          title: '🎯 Main Navigation',
          description: 'This is where you\'ll find all the main features.',
          target: '#nav-menu',
        //   position: 'bottom'
        },
        {
          id: 'step-3',
          title: '✨ Create New',
          description: 'Click here to create your first project.',
          target: '#create-button',
        //   position: 'left'
        },
        {
          id: 'step-4',
          title: '📊 Dashboard',
          description: 'View your analytics and insights here.',
          target: '#dashboard-link',
        //   position: 'right'
        },
        {
          id: 'step-5',
          title: '🎉 You\'re All Set!',
          description: 'You\'re ready to get started. Enjoy!',
          target: 'body',
          position: 'center'
        }
      ]
    };
  }

  // Public API methods
  start(): void {
    this.tourManager?.start();
  }

  stop(): void {
    this.tourManager?.stop();
  }

  next(): void {
    this.tourManager?.next();
  }

  prev(): void {
    this.tourManager?.prev();
  }

  destroy(): void {
    this.tourManager?.stop();
    this.tourManager = null;
    this.analytics = null;
  }
}

// IIFE for auto-initialization
(function() {
  'use strict';

  console.log(' IIFE running');
  console.log(' Document ready state:', document.readyState);
  console.log(' Current script:', document.currentScript);

  // Prevent multiple initializations
  if ((window as any).TourifyWidget) {
    console.warn('TourWidget already initialized');
    return;
  }

  // Auto-initialize from script tag attributes
  function autoInit(): void {
    console.log(' AutoInit called');
    const scriptTag = document.currentScript as HTMLScriptElement | null;
    
    console.log('Script tag:', scriptTag);
    
    if (scriptTag) {
      const tourId = scriptTag.getAttribute('data-tour-id');
      const autoStart = scriptTag.getAttribute('data-auto-start') !== 'false';
      const showAvatar = scriptTag.getAttribute('data-show-avatar') !== 'false';
      
      console.log('Config:', { tourId, autoStart, showAvatar });
      
      if (tourId) {
        console.log('Initializing widget with tourId:', tourId);
        const widget = new TourWidget();
        widget.init({ tourId, autoStart, showAvatar });
        (window as any).TourWidget = widget;
      } else {
        console.log('No tourId found, initializing with defaults');
        const widget = new TourWidget();
        widget.init({ tourId: 'default', autoStart: true });
        (window as any).TourWidget = widget;
      }
    } else {
      console.log('No script tag found, initializing manually');
      const widget = new TourWidget();
      widget.init({ tourId: 'default', autoStart: true });
      (window as any).TourWidget = widget;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    console.log(' Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    console.log(' DOM already loaded, running autoInit now');
    autoInit();
  }

  // Export for manual initialization
  (window as any).TourifyWidget = TourWidget;

})();