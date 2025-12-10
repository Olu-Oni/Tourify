import type {
  TourData,
  TourConfig,
  TourStep,
  ITourManager,
  IAnalytics,
  TourProgress,
} from "./types/index";
import { TourAvatar } from "./avatar";

export class TourManager implements ITourManager {
  private tourData: TourData;
  private config: TourConfig;
  private analytics: IAnalytics;
  private currentStep: number = 0;
  private isActive: boolean = false;

  // UI Elements
  private overlay: HTMLElement | null = null;
  private tooltip: HTMLElement | null = null;
  private spotlight: HTMLElement | null = null;
  private avatar: TourAvatar | null = null;
  private avatarContainer: HTMLElement | null = null;

  // Event handlers
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private scrollPreventHandler: ((e: Event) => void) | null = null;

  // Cleanup functions
  private cleanupFunctions: (() => void)[] = [];
  
  // State management for preventing race conditions
  private isTransitioning: boolean = false;
  private tooltipTransitionPromise: Promise<void> | null = null;
  private currentStepIndex: number = -1;

  constructor(tourData: TourData, config: TourConfig, analytics: IAnalytics) {
    this.tourData = tourData;
    this.config = config;
    this.analytics = analytics;

    this.loadProgress();
  }

  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.createOverlay();
    this.showStep(this.currentStep);
    this.analytics.track("tour_started", { tourId: this.tourData.id });
  }

  stop(): void {
    this.isActive = false;
    this.cleanup();
    this.saveProgress();
    this.analytics.track("tour_stopped", {
      tourId: this.tourData.id,
      currentStep: this.currentStep,
    });
  }

  next(): void {
    if (this.currentStep < this.tourData.steps.length - 1) {
      this.analytics.track("step_completed", {
        stepId: this.tourData.steps[this.currentStep].id,
        stepNumber: this.currentStep + 1,
      });

      this.currentStep++;
      this.showStep(this.currentStep);
      this.saveProgress();
    } else {
      this.complete();
    }
  }

  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep(this.currentStep);
      this.saveProgress();
    }
  }

  skip(): void {
    this.analytics.track("tour_skipped", {
      tourId: this.tourData.id,
      atStep: this.currentStep + 1,
    });
    this.stop();
  }

  complete(): void {
    this.avatar?.run();

    this.analytics.track("tour_completed", {
      tourId: this.tourData.id,
      totalSteps: this.tourData.steps.length,
    });

    localStorage.removeItem(`tour_progress_${this.tourData.id}`);

    setTimeout(() => this.stop(), 1500);
  }

  private async showStep(stepIndex: number): Promise<void> {
    // Prevent multiple simultaneous transitions
    if (this.isTransitioning) {
      if (this.tooltipTransitionPromise) {
        await this.tooltipTransitionPromise;
      }
    }

    this.isTransitioning = true;
    
    try {
      const step = this.tourData.steps[stepIndex];

      let targetElement = document.querySelector(step.target) as HTMLElement;

      if (!targetElement) {
        targetElement = document.body;
        console.warn(`Target element "${step.target}" not found`);
      }

      // Check if we can update existing tooltip instead of recreating
      const canUpdateExisting = this.tooltip && this.currentStepIndex !== -1;
      
      if (canUpdateExisting) {
        // Update existing tooltip content and position
        await this.updateTooltip(step, targetElement, stepIndex);
      } else {
        // Clean up previous tooltip and spotlight with proper timing
        this.tooltipTransitionPromise = this.removeTooltip();
        await this.tooltipTransitionPromise;
        this.removeSpotlight();

        this.createSpotlight(targetElement);
        this.scrollToElement(targetElement);
        await this.createTooltip(step, targetElement, stepIndex);
      }

      // Update spotlight for new target
      this.updateSpotlight(targetElement);
      
      this.currentStepIndex = stepIndex;

      this.analytics.track("step_viewed", {
        stepId: step.id,
        stepNumber: stepIndex + 1,
      });
    } finally {
      this.isTransitioning = false;
      this.tooltipTransitionPromise = null;
    }
  }

  private createOverlay(): void {
    this.overlay = document.createElement("div");
    this.overlay.className = "tour-overlay";
    document.body.appendChild(this.overlay);

    this.disableScroll();

    // Force reflow
    void this.overlay.offsetWidth;

    requestAnimationFrame(() => {
      this.overlay?.classList.add("active");
    });
  }

  private disableScroll(): void {
    if (this.scrollPreventHandler) return;

    this.scrollPreventHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const options = { passive: false, capture: true };

    document.addEventListener("wheel", this.scrollPreventHandler, options);
    document.addEventListener("mousewheel", this.scrollPreventHandler, options);
    document.addEventListener("DOMMouseScroll", this.scrollPreventHandler, options);
    document.addEventListener("touchmove", this.scrollPreventHandler, options);
    document.addEventListener("keydown", this.preventKeyboardScroll, options);

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  private preventKeyboardScroll(e: KeyboardEvent): void {
    const scrollKeys = [" ", "PageUp", "PageDown", "End", "Home", "ArrowUp", "ArrowDown"];

    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  }

  private enableScroll(): void {
    if (this.scrollPreventHandler) {
      const options = { capture: true };

      document.removeEventListener("wheel", this.scrollPreventHandler, options);
      document.removeEventListener("mousewheel", this.scrollPreventHandler, options);
      document.removeEventListener("DOMMouseScroll", this.scrollPreventHandler, options);
      document.removeEventListener("touchmove", this.scrollPreventHandler, options);
      document.removeEventListener("keydown", this.preventKeyboardScroll, options);

      this.scrollPreventHandler = null;
    }

    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  private createSpotlight(targetElement: HTMLElement): void {
    const rect = targetElement.getBoundingClientRect();

    if (!this.spotlight) {
      this.spotlight = document.createElement("div");
      this.spotlight.className = "tour-spotlight";
      document.body.appendChild(this.spotlight);
    }

    this.spotlight.style.top = `${rect.top - 10}px`;
    this.spotlight.style.left = `${rect.left - 10}px`;
    this.spotlight.style.width = `${rect.width + 14}px`;
    this.spotlight.style.height = `${rect.height + 14}px`;

    this.setupSpotlightAutoUpdate(targetElement);
  }

  private updateSpotlight(targetElement: HTMLElement): void {
    if (!this.spotlight) return;
    
    const rect = targetElement.getBoundingClientRect();
    this.spotlight.style.top = `${rect.top - 10}px`;
    this.spotlight.style.left = `${rect.left - 10}px`;
    this.spotlight.style.width = `${rect.width + 14}px`;
    this.spotlight.style.height = `${rect.height + 14}px`;
  }

  private setupSpotlightAutoUpdate(targetElement: HTMLElement): void {
    const updateHandler = () => this.updateSpotlight(targetElement);

    window.addEventListener("resize", updateHandler);
    window.addEventListener("scroll", updateHandler);

    // Store cleanup function
    const cleanup = () => {
      window.removeEventListener("resize", updateHandler);
      window.removeEventListener("scroll", updateHandler);
    };
    
    this.cleanupFunctions.push(cleanup);
  }

  private removeSpotlight(): void {
    if (this.spotlight) {
      this.spotlight.remove();
      this.spotlight = null;
    }
  }

  private saveProgress(): void {
    const progress: TourProgress = { currentStep: this.currentStep };
    localStorage.setItem(
      `tour_progress_${this.tourData.id}`,
      JSON.stringify(progress)
    );
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem(`tour_progress_${this.tourData.id}`);
      if (saved) {
        const progress: TourProgress = JSON.parse(saved);
        this.currentStep = progress.currentStep;
      }
    } catch (error) {
      console.warn("Could not load progress:", error);
    }
  }

  private scrollToElement(element: HTMLElement): void {
    this.enableScroll();

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    setTimeout(() => this.disableScroll(), 500);
  }

  private async removeTooltip(): Promise<void> {
    if (!this.tooltip) {
      return;
    }

    const tooltipToRemove = this.tooltip;
    this.tooltip = null; // Clear reference immediately to prevent race conditions

    try {
      // Remove event listeners first
      this.removeTooltipEvents();
      
      // Clean up any cleanup functions
      this.cleanupFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.warn("Error during cleanup:", error);
        }
      });
      this.cleanupFunctions = [];

      // Clean up mini avatar if it exists
      const miniAvatar = (tooltipToRemove as any)._miniAvatar;
      if (miniAvatar && typeof miniAvatar.destroy === 'function') {
        try {
          miniAvatar.destroy();
        } catch (error) {
          console.warn("Error destroying mini avatar:", error);
        }
      }

      // Remove tooltip with fade out animation
      tooltipToRemove.classList.remove("active");
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Ensure tooltip is still in DOM before removing
      if (tooltipToRemove.parentNode) {
        tooltipToRemove.remove();
      }
    } catch (error) {
      console.warn("Error during tooltip removal:", error);
      // Force remove if there's an error
      if (tooltipToRemove.parentNode) {
        tooltipToRemove.remove();
      }
    }
  }

  private removeTooltipEvents(): void {
    if (this.keyboardHandler) {
      document.removeEventListener("keydown", this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  private cleanup(): void {
    // Reset transition state
    this.isTransitioning = false;
    this.tooltipTransitionPromise = null;
    this.currentStepIndex = -1;
    
    this.removeTooltipEvents();
    
    // Execute all cleanup functions
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    });
    this.cleanupFunctions = [];

    // Clean up tooltip immediately
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }

    // Clean up any remaining tooltip elements in DOM
    const existingTooltips = document.querySelectorAll('.tour-tooltip');
    existingTooltips.forEach(tooltip => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    });

    if (this.avatar) {
      this.avatar.destroy();
      this.avatar = null;
    }

    if (this.avatarContainer) {
      this.avatarContainer.style.opacity = "0";
      this.avatarContainer.style.transform = "scale(0.8)";
      setTimeout(() => {
        this.avatarContainer?.remove();
        this.avatarContainer = null;
      }, 300);
    }

    if (this.spotlight) {
      this.spotlight.remove();
      this.spotlight = null;
    }

    if (this.overlay) {
      this.overlay.classList.remove("active");
      setTimeout(() => {
        this.overlay?.remove();
        this.overlay = null;
        this.enableScroll();
      }, 300);
    }
  }

  private async createTooltip(
    step: TourStep,
    targetElement: HTMLElement,
    stepIndex: number
  ): Promise<void> {
    // Ensure no existing tooltip elements are in the DOM
    const existingTooltips = document.querySelectorAll('.tour-tooltip');
    existingTooltips.forEach(tooltip => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    });

    // Small delay to ensure DOM is clean
    await new Promise(resolve => setTimeout(resolve, 10));

    this.tooltip = document.createElement("div");
    this.tooltip.className = "tour-tooltip";

    const totalSteps = this.tourData.steps.length;
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === totalSteps - 1;

    this.tooltip.innerHTML = `
      <div class="tour-tooltip-content">
        <div class="tour-tooltip-header">
          <div class="tour-avatar-mini" id="avatar-container-${stepIndex}">
            <!-- Avatar will be rendered here by Three.js -->
          </div>
          <div class="tour-tooltip-header-content">
            <h3>${step.title}</h3>
            <button class="tour-close-btn" aria-label="Close tour">×</button>
          </div>
        </div>
        <p>${step.description}</p>
        <div class="tour-tooltip-footer">
          <div class="tour-progress">
            <span>Step ${stepIndex + 1} of ${totalSteps}</span>
            <div class="tour-progress-bar">
              <div class="tour-progress-fill" style="width: ${
                ((stepIndex + 1) / totalSteps) * 100
              }%"></div>
            </div>
          </div>
          <div class="tour-tooltip-actions">
            ${
              !isFirst
                ? '<button class="tour-btn tour-btn-secondary tour-prev-btn">← Back</button>'
                : ""
            }
            <button class="tour-btn tour-btn-primary tour-next-btn">
              ${isLast ? "Finish" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.tooltip);

    // Wait for DOM to be ready
    await new Promise(resolve => requestAnimationFrame(resolve));

    const avatarContainer = this.tooltip.querySelector(
      ".tour-avatar-mini"
    ) as HTMLElement;

    if (avatarContainer && this.tooltip && this.config.showAvatar) {
      try {
        const modelUrl = (this.config as any).modelUrl;
        const tooltipAvatar = new TourAvatar(avatarContainer, modelUrl);
        
        (this.tooltip as any)._miniAvatar = tooltipAvatar;
        
        setTimeout(() => {
          if (stepIndex === 0) {
            tooltipAvatar.peck();
          } else if (isLast) {
            tooltipAvatar.run();
          } else {
            tooltipAvatar.eat();
          }
        }, 300);
      } catch (error) {
        console.error("Failed to create avatar in tooltip:", error);
        if (avatarContainer) {
          avatarContainer.innerHTML = '👋';
          avatarContainer.classList.add('avatar-fallback');
        }
      }
    }

    // Dynamically import TooltipHelper
    const { TooltipHelper } = await import("./tooltip-helper");
    
    // Position the tooltip
    await TooltipHelper.positionTooltip(
      this.tooltip,
      targetElement,
      step.position
    );

    // Set up auto-update
    const cleanup = TooltipHelper.createAutoUpdate(
      this.tooltip,
      targetElement,
      step.position
    );

    // Store cleanup function
    this.cleanupFunctions.push(cleanup);

    // Attach events
    this.attachTooltipEvents();

    // Animate in
    requestAnimationFrame(() => {
      this.tooltip?.classList.add("active");
    });
  }

  private async updateTooltip(
    step: TourStep,
    targetElement: HTMLElement,
    stepIndex: number
  ): Promise<void> {
    if (!this.tooltip) return;

    const totalSteps = this.tourData.steps.length;
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === totalSteps - 1;

    // Clean up existing avatar
    const existingMiniAvatar = (this.tooltip as any)._miniAvatar;
    if (existingMiniAvatar && typeof existingMiniAvatar.destroy === 'function') {
      try {
        existingMiniAvatar.destroy();
      } catch (error) {
        console.warn("Error destroying existing mini avatar:", error);
      }
    }

    // Update tooltip content
    this.tooltip.innerHTML = `
      <div class="tour-tooltip-content">
        <div class="tour-tooltip-header">
          <div class="tour-avatar-mini" id="avatar-container-${stepIndex}">
            <!-- Avatar will be rendered here by Three.js -->
          </div>
          <div class="tour-tooltip-header-content">
            <h3>${step.title}</h3>
            <button class="tour-close-btn" aria-label="Close tour">×</button>
          </div>
        </div>
        <p>${step.description}</p>
        <div class="tour-tooltip-footer">
          <div class="tour-progress">
            <span>Step ${stepIndex + 1} of ${totalSteps}</span>
            <div class="tour-progress-bar">
              <div class="tour-progress-fill" style="width: ${
                ((stepIndex + 1) / totalSteps) * 100
              }%"></div>
            </div>
          </div>
          <div class="tour-tooltip-actions">
            ${
              !isFirst
                ? '<button class="tour-btn tour-btn-secondary tour-prev-btn">← Back</button>'
                : ""
            }
            <button class="tour-btn tour-btn-primary tour-next-btn">
              ${isLast ? "Finish" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    `;

    // Wait for DOM to be ready
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Set up new avatar
    const avatarContainer = this.tooltip.querySelector(
      ".tour-avatar-mini"
    ) as HTMLElement;

    if (avatarContainer && this.tooltip && this.config.showAvatar) {
      try {
        const modelUrl = (this.config as any).modelUrl;
        const tooltipAvatar = new TourAvatar(avatarContainer, modelUrl);
        
        (this.tooltip as any)._miniAvatar = tooltipAvatar;
        
        setTimeout(() => {
          if (stepIndex === 0) {
            tooltipAvatar.peck();
          } else if (isLast) {
            tooltipAvatar.run();
          } else {
            tooltipAvatar.eat();
          }
        }, 300);
      } catch (error) {
        console.error("Failed to create avatar in tooltip:", error);
        if (avatarContainer) {
          avatarContainer.innerHTML = '👋';
          avatarContainer.classList.add('avatar-fallback');
        }
      }
    }

    // Dynamically import TooltipHelper and reposition
    const { TooltipHelper } = await import("./tooltip-helper");
    
    // Position the tooltip
    await TooltipHelper.positionTooltip(
      this.tooltip,
      targetElement,
      step.position
    );

    // Clean up old cleanup functions
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    });
    this.cleanupFunctions = [];

    // Set up new auto-update
    const cleanup = TooltipHelper.createAutoUpdate(
      this.tooltip,
      targetElement,
      step.position
    );

    // Store cleanup function
    this.cleanupFunctions.push(cleanup);

    // Reattach events
    this.attachTooltipEvents();
  }

  private attachTooltipEvents(): void {
    if (!this.tooltip) return;

    const nextBtn = this.tooltip.querySelector(".tour-next-btn") as HTMLButtonElement;
    const prevBtn = this.tooltip.querySelector(".tour-prev-btn") as HTMLButtonElement;
    const closeBtn = this.tooltip.querySelector(".tour-close-btn") as HTMLButtonElement;

    nextBtn?.addEventListener("click", () => this.next());
    prevBtn?.addEventListener("click", () => this.prev());
    closeBtn?.addEventListener("click", () => this.skip());

    this.keyboardHandler = (e: KeyboardEvent) => {
      if (!this.isActive) return;
      
      if (e.key === "Escape") this.skip();
      if (e.key === "ArrowRight") this.next();
      if (e.key === "Enter") this.next();
      if (e.key === "ArrowLeft") this.prev();
    };

    document.addEventListener("keydown", this.keyboardHandler);
  }
}