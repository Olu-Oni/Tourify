import "./style.css";
import { TourManager } from "./tourManager";
import { Analytics } from "./analytics";
import type { TourData, TourConfig } from "./types/index";

class TourWidget {
  private tourManager: TourManager | null = null;
  private analytics: Analytics | null = null;
  private config: TourConfig | null = null;

  init(config: Partial<TourConfig>): void {
    this.config = {
      tourId: config.tourId || "default",
      autoStart: config.autoStart ?? true,
      showAvatar: config.showAvatar ?? true,
      theme: config.theme || "light",
      apiUrl: config.apiUrl || "https://your-api.com",
      apiKey: config.apiKey || "",
      ...config,
    };

    this.applyTheme();

        this.analytics = new Analytics(this.config.tourId, {
      apiUrl: this.config.apiUrl,
    });
    
    console.log(this.analytics)
    this.loadTourData();
  }

   private applyTheme(): void {
    if (this.config?.theme) {
      document.documentElement.setAttribute('data-tour-theme', this.config.theme);
    }
  }

  private async loadTourData(): Promise<void> {
    try {
      // use api call later
      const tourData = this.getMockTourData(1);

      this.tourManager = new TourManager(
        tourData,
        this.config!,
        this.analytics!
      );

      if (this.config?.autoStart) {
        this.tourManager.start();
      }

      this.analytics!.track("tour_initialized", {
        tourId: this.config!.tourId,
        stepsCount: tourData.steps.length,
      });
    } catch (error) {
      console.error("Failed to load tour:", error);
    }
  }

  private getMockTourData(num: number): TourData {
    switch (num) {
      case 1:
        return {
          id: this.config!.tourId,
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
        };

      case 2:
        return {
          id: "ecommerce-onboarding",
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
              id: "sidebar-navigation",
              title: "📁 Navigation Menu",
              description:
                "Access all major sections of your store here. The Dashboard is currently selected, but you can quickly jump to Products, Orders, Customers, Analytics, or Settings.",
              target: "#dashboard-nav",
              position: "right",
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
          // settings: {
          //   showProgress: true,
          //   allowSkip: true,
          //   highlightTargets: true,
          //   modalOverlay: true,
          //   scrollPadding: 20
          // }
        };
      default:
        return {
          id: "ecommerce-onboarding",
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
          ],
        };
    }
  }

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

function initWidget(): void {
  let scriptTag: HTMLScriptElement | null = null;

  // Try getting non-local script first
  if (document.currentScript) {
    scriptTag = document.currentScript as HTMLScriptElement;
  } else {
    // Fallback for module scripts in development
    scriptTag = document.querySelector('script[type="module"][data-tour-id]') as HTMLScriptElement | null;
    
    // Fallback for production CDN script
    if (!scriptTag) {
      scriptTag = document.querySelector('script[src*="tourify-widget"][data-tour-id]') as HTMLScriptElement | null;
    }
  }

  const config: Partial<TourConfig> = {
    tourId: scriptTag?.getAttribute("data-tour-id") || "default",
    autoStart: scriptTag?.getAttribute("data-auto-start") === "true",
    showAvatar: scriptTag?.getAttribute("data-show-avatar") !== "false",
    apiKey: scriptTag?.getAttribute("data-api-key") || "",
  };

  console.log('Script tag:', scriptTag);
  console.log('Tour ID:', scriptTag?.getAttribute("data-tour-id"));
  console.log('Config:', config);

  const widget = new TourWidget();
  widget.init(config);

  (window as any).TourWidget = widget;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}

(window as any).TourifyWidget = TourWidget;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}

(window as any).TourifyWidget = TourWidget;
