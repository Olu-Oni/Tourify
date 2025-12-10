import "./style.css";
import { TourManager } from "./tourManager";
import { Analytics } from "./analytics";
import type { TourData, TourConfig, TourTheme } from "./types/index";

class TourWidget {
  private tourManager: TourManager | null = null;
  private analytics: Analytics | null = null;
  private config: TourConfig | null = null;
  private siteKey: string = "";

  init(config: Partial<TourConfig>): void {
    this.siteKey = this.generateSiteKey();
    
    this.config = {
      tourId: config.tourId || "default",
      autoStart: config.autoStart ?? true,
      showAvatar: config.showAvatar ?? true,
      theme: config.theme || "light",
      apiUrl: config.apiUrl || "https://your-api.com",
      ...config,
    };

    this.analytics = new Analytics(this.config.tourId, {
      apiUrl: this.config.apiUrl,
    });

    this.applyTheme();
    this.loadTourData();
  }

  private generateSiteKey(): string {
    const location = window.location;
    return `${location.hostname}${location.pathname}`;
  }

  private applyTheme(): void {
    if (this.config?.theme) {
      document.documentElement.setAttribute(
        "data-tour-theme",
        this.config.theme
      );
    }
  }

  private async loadTourData(): Promise<void> {
    let tourData: TourData;

    // Step 1: Try to fetch from Supabase
    try {
      const { TourFetcher } = await import('./tourFetcher');
      tourData = await TourFetcher.fetchTourById(this.config!.tourId) || 
                 await TourFetcher.fetchTourBySlug(this.config!.tourId) ||
                 null as any;
      
      if (tourData) {
        console.log('✅ Loaded tour from Supabase:', tourData.id);
        this.initializeTour(tourData);
        return;
      }
    } catch (supabaseError) {
      console.warn('Failed to fetch from Supabase:', supabaseError);
    }

    // Step 2: Try to fetch from custom API (only if real API URL provided)
    if (this.config?.apiUrl && !this.config.apiUrl.includes('your-api.com')) {
      try {
        tourData = await this.fetchTourFromAPI();
        console.log('✅ Loaded tour from API:', tourData.id);
        this.initializeTour(tourData);
        return;
      } catch (apiError) {
        console.warn('Failed to fetch from API:', apiError);
      }
    }

    // Step 3: Try to get mock tour for the tourId
    const mockTour = this.getMockTourData(this.config!.tourId);
    if (mockTour) {
      console.log('📋 Using mock tour data:', mockTour.id);
      tourData = mockTour;
      this.initializeTour(tourData);
      return;
    }

    // Step 4: Fall back to "no tour assigned" message
    console.log('ℹ️ No tour found for:', this.config!.tourId);
    tourData = this.getNoTourData();
    this.initializeTour(tourData);
  }

  private async fetchTourFromAPI(): Promise<TourData> {
    if (!this.config?.apiUrl) {
      throw new Error('No API URL provided');
    }

    const response = await fetch(`${this.config.apiUrl}/tours/${this.config.tourId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      id: data.id || this.config.tourId,
      name: data.name || 'Tour',
      steps: data.steps || [],
    };
  }

  private getMockTourData(tourId: string): TourData | null {
    const mockTours: Record<string, TourData> = {
      'tourify-default-1': {
        id: 'tourify-default-1',
        name: "Welcome Tour",
        steps: [
          {
            id: "step-1",
            title: "👋 Welcome!",
            description: "Let's take a quick tour to get you started.",
            target: "body",
            position: "center",
          },
          {
            id: "step-2",
            title: "🎯 Main Navigation",
            description: "This is where you'll find all the main features.",
            target: "#nav-menu",
            position: "bottom",
          },
          {
            id: "step-3",
            title: "✨ Create New",
            description: "Click here to create your first project.",
            target: "#create-button",
            position: "left",
          },
          {
            id: "step-4",
            title: "📊 Dashboard",
            description: "View your analytics and insights here.",
            target: "#dashboard-link",
            position: "right",
          },
          {
            id: "step-5",
            title: "🎉 You're All Set!",
            description: "You're ready to get started. Enjoy!",
            target: "body",
            position: "center",
          },
        ],
      },
      'tourify-default-2': {
        id: 'tourify-default-2',
        name: "E-Commerce Dashboard Tour",
        steps: [
          {
            id: "welcome-step",
            title: "🚀 Welcome to Your Dashboard!",
            description:
              "This interactive tour will guide you through the key features of your e-commerce dashboard. Let's get started!",
            target: "body",
            position: "center",
          },
          {
            id: "revenue-overview",
            title: "💰 Revenue Tracking",
            description:
              "Monitor your daily revenue with real-time updates. This card shows today's earnings compared to yesterday, with percentage change indicators.",
            target: "#revenue-card",
            position: "bottom",
          },
          {
            id: "orders-stats",
            title: "📦 Order Management",
            description:
              "Keep track of new orders coming in. This shows current order count and pending items that need fulfillment.",
            target: "#orders-card",
            position: "bottom",
          },
          {
            id: "quick-actions",
            title: "⚡ Quick Actions",
            description:
              "Frequently used actions are available here for efficiency. Add products, generate reports, view alerts, or create discounts with one click.",
            target: "#new-product-btn",
            position: "bottom",
          },
          {
            id: "recent-orders",
            title: "🔄 Recent Orders",
            description:
              "Monitor your latest orders with status indicators. Quickly see which orders are completed, processing, or pending.",
            target: ".recent-orders",
            position: "top",
          },
          {
            id: "view-all-orders",
            title: "🔍 Detailed View",
            description:
              "Click here to see all orders with advanced filtering and search capabilities.",
            target: "#view-all-orders",
            position: "left",
          },
          {
            id: "analytics-section",
            title: "📊 Sales Analytics",
            description:
              "Visualize your store performance with interactive charts. Customize the time period, metrics, and chart type to gain insights.",
            target: "#sales-chart",
            position: "top",
          },
          {
            id: "chart-controls",
            title: "🎛️ Customize Analytics",
            description:
              "Adjust these controls to change what data appears in your analytics chart. Try different time periods and metrics!",
            target: "#time-period",
            position: "bottom",
          },
          {
            id: "user-profile",
            title: "👤 Your Account",
            description:
              "Access your profile settings, switch accounts, or log out from here.",
            target: "#user-profile",
            position: "left",
          },
          {
            id: "scroll-test",
            title: "🧪 Scroll Testing",
            description:
              "This section tests the tour widget's ability to handle scrolling and position elements correctly when they're not in the initial viewport.",
            target: "#scroll-test-button",
            position: "top",
          },
          {
            id: "completion-step",
            title: "🎉 Setup Complete!",
            description:
              "You're now familiar with your e-commerce dashboard! Remember, you can always restart this tour from the help menu. Need more help? Check our documentation or contact support.",
            target: "body",
            position: "center",
          },
        ],
      },
    };

    return mockTours[tourId] || null;
  }

  private getNoTourData(): TourData {
    return {
      id: 'no-tour',
      name: 'No Tour Available',
      steps: [
        {
          id: 'no-tour-step',
          title: '📭 No Tour Assigned',
          description: `No tour found for ID: "${this.config!.tourId}". Please check your configuration or contact support.`,
          target: 'body',
          position: 'center',
        },
      ],
    };
  }

  private initializeTour(tourData: TourData): void {
    this.tourManager = new TourManager(
      tourData,
      this.config!,
      this.analytics!,
      this.siteKey
    );

    // Only auto-start if configured to do so
    if (this.config?.autoStart) {
      console.log('🚀 Auto-starting tour');
      this.tourManager.start();
    } else {
      console.log('⏸️ Tour initialized but not auto-started. Use button or call start() to begin.');
    }

    this.analytics!.track("tour_initialized", {
      tourId: this.config!.tourId,
      stepsCount: tourData.steps.length,
    });
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

  restart(): void {
    this.tourManager?.restart();
  }

  destroy(): void {
    this.tourManager?.stop();
    this.tourManager = null;
    this.analytics = null;
  }

  isActive(): boolean {
    return this.tourManager?.isActive ?? false;
  }
}

// ============================================================================
// CRITICAL: Capture document.currentScript IMMEDIATELY at top of file
// This MUST be before ANY functions, imports, or async operations
// ============================================================================
const SCRIPT_TAG = (() => {
  // Try document.currentScript first (works in IIFE)
  if (document.currentScript) {
    return document.currentScript as HTMLScriptElement;
  }
  
  // Fallback: search for our script in the DOM
  const scripts = document.querySelectorAll('script');
  return Array.from(scripts).find(script => {
    const src = script.getAttribute('src') || '';
    return (
      script.hasAttribute('data-tour-id') ||
      src.includes('tourify-widget')
    );
  }) as HTMLScriptElement | null;
})();

// Log immediately to verify capture
console.log('📦 Tourify Widget - Script Tag Captured:', SCRIPT_TAG);
console.log('📦 Tourify Widget - Attributes:', SCRIPT_TAG ? {
  'data-tour-id': SCRIPT_TAG.getAttribute('data-tour-id'),
  'data-auto-start': SCRIPT_TAG.getAttribute('data-auto-start'),
  'data-show-avatar': SCRIPT_TAG.getAttribute('data-show-avatar'),
  'data-theme': SCRIPT_TAG.getAttribute('data-theme'),
  'src': SCRIPT_TAG.getAttribute('src'),
} : 'NO SCRIPT TAG FOUND');

async function initWidget(): Promise<void> {
  let config: Partial<TourConfig>;
  
  // PRIORITY 1: Check for global config object
  if ((window as any).TOURIFY_CONFIG) {
    console.log('✅ Using window.TOURIFY_CONFIG');
    config = (window as any).TOURIFY_CONFIG;
  } 
  // PRIORITY 2: Use the captured script tag
  else {
    const scriptTag = SCRIPT_TAG;
    
    if (scriptTag) {
      console.log('✅ Using captured script tag attributes');
      console.log('📋 Tour ID:', scriptTag.getAttribute("data-tour-id"));
    } else {
      console.warn('⚠️ No script tag found! Using defaults. Consider using window.TOURIFY_CONFIG instead.');
    }

    // Use direct attributes from captured script tag
    config = {
      tourId: scriptTag?.getAttribute("data-tour-id") || "default",
      autoStart: scriptTag?.getAttribute("data-auto-start") !== "false",
      showAvatar: scriptTag?.getAttribute("data-show-avatar") !== "false",
      theme: (scriptTag?.getAttribute("data-theme") as TourTheme) || "light",
      apiUrl: scriptTag?.getAttribute("data-api-url") || "https://your-api.com",
    };
  }
  
  console.log('⚙️ Final widget config:', config);

  const widget = new TourWidget();
  widget.init(config);

  // Expose widget instance globally
  (window as any).TourWidget = widget;
  (window as any).TourifyWidget = TourWidget;

  // Auto-attach to restart button if it exists
  const restartButton = document.getElementById('tourify-restart-btn');
  if (restartButton) {
    restartButton.addEventListener('click', () => widget.restart());
    restartButton.style.display = 'block';
  }

  // Auto-attach to start button if it exists
  const startButton = document.getElementById('tourify-start-btn');
  if (startButton) {
    startButton.addEventListener('click', () => {
      console.log('▶️ Start button clicked');
      widget.start();
    });
    // Show the start button if autoStart is false
    if (config.autoStart === false) {
      startButton.style.display = 'block';
    }
  }
}

// Auto-initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}