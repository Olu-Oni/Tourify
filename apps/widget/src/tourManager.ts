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

  private showStep(stepIndex: number): void {
    const step = this.tourData.steps[stepIndex];

    this.removeTooltip();

    let targetElement = document.querySelector(step.target) as HTMLElement;

    if (!targetElement) {
      targetElement = document.body;
      console.warn(`Target element "${step.target}" not found`);
    }

    this.createSpotlight(targetElement);
    this.scrollToElement(targetElement);
    void this.createTooltip(step, targetElement, stepIndex);

    this.analytics.track("step_viewed", {
      stepId: step.id,
      stepNumber: stepIndex + 1,
    });
  }

  private createOverlay(): void {
    this.overlay = document.createElement("div");
    this.overlay.className = "tour-overlay";
    document.body.appendChild(this.overlay);

    this.disableScroll();

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
    const rect = targetElement.getBoundingClientRect();
    if (this.spotlight) {
      this.spotlight.style.top = `${rect.top - 10}px`;
      this.spotlight.style.left = `${rect.left - 10}px`;
      this.spotlight.style.width = `${rect.width + 14}px`;
      this.spotlight.style.height = `${rect.height + 14}px`;
    }
  }

  private setupSpotlightAutoUpdate(targetElement: HTMLElement): void {
    const updateHandler = () => this.updateSpotlight(targetElement);

    window.addEventListener("resize", updateHandler);
    window.addEventListener("scroll", updateHandler);

    if (this.spotlight) {
      (this.spotlight as any)._cleanup = () => {
        window.removeEventListener("resize", updateHandler);
        window.removeEventListener("scroll", updateHandler);
      };
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

  private removeTooltip(): void {
    if (this.tooltip) {
      const cleanup = (this.tooltip as any)._cleanup;
      if (cleanup) cleanup();

      const miniAvatar = (this.tooltip as any)._miniAvatar;
      if (miniAvatar && typeof miniAvatar.destroy === 'function') {
        miniAvatar.destroy();
      }

      this.tooltip.remove();
      this.tooltip = null;
    }
    
    if (this.spotlight) {
      const cleanup = (this.spotlight as any)._cleanup;
      if (cleanup) cleanup();
    }
  }

  private cleanup(): void {
    this.removeTooltip();

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

    if (this.keyboardHandler) {
      document.removeEventListener("keydown", this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  private async createTooltip(
    step: TourStep,
    targetElement: HTMLElement,
    stepIndex: number
  ): Promise<void> {
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

    await new Promise(resolve => setTimeout(resolve, 50));

    const avatarContainer = this.tooltip?.querySelector(
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

    const { TooltipHelper } = await import("./types/tooltip-helper");
    await TooltipHelper.positionTooltip(
      this.tooltip,
      targetElement,
      step.position
    );

    const cleanup = TooltipHelper.createAutoUpdate(
      this.tooltip,
      targetElement,
      step.position
    );

    (this.tooltip as any)._cleanup = cleanup;

    this.attachTooltipEvents();

    requestAnimationFrame(() => {
      this.tooltip?.classList.add("active");
    });
  }

  private attachTooltipEvents(): void {
    if (!this.tooltip) return;

    const nextBtn = this.tooltip.querySelector(".tour-next-btn") as HTMLButtonElement;
    const prevBtn = this.tooltip.querySelector(".tour-prev-btn") as HTMLButtonElement;
    const skipBtn = this.tooltip.querySelector(".tour-skip-btn") as HTMLButtonElement;
    const closeBtn = this.tooltip.querySelector(".tour-close-btn") as HTMLButtonElement;

    nextBtn?.addEventListener("click", () => this.next());
    prevBtn?.addEventListener("click", () => this.prev());
    skipBtn?.addEventListener("click", () => this.skip());
    closeBtn?.addEventListener("click", () => this.skip());

    this.keyboardHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") this.skip();
      if (e.key === "ArrowRight") this.next();
      if (e.key === "Enter") this.next();
      if (e.key === "ArrowLeft") this.prev();
    };

    document.addEventListener("keydown", this.keyboardHandler);
  }
}