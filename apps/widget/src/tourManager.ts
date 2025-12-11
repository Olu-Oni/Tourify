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
  public isActive: boolean = false;
  private siteKey: string;

  // UI Elements
  private overlay: HTMLElement | null = null;
  private tooltip: HTMLElement | null = null;
  private spotlight: HTMLElement | null = null;
  private avatarContainer: HTMLElement | null = null;

  // Event handlers
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private scrollPreventHandler: ((e: Event) => void) | null = null;

  // Cleanup functions
  private cleanupFunctions: (() => void)[] = [];

  constructor(
    tourData: TourData,
    config: TourConfig,
    analytics: IAnalytics,
    siteKey: string
  ) {
    this.tourData = tourData;
    this.config = config;
    this.analytics = analytics;
    this.siteKey = siteKey;
    this.loadProgress();
  }

  start(): void {
    if (this.isActive) return;

    // Check if tour was already completed (site-specific)
    const isCompleted = localStorage.getItem(
      `tour_completed_${this.tourData.id}_${this.siteKey}`
    );
    if (isCompleted === "true") {
      console.log(
        "Tour already completed. To restart, clear localStorage or use TourWidget.restart()"
      );
      return;
    }

    // Check if tour was already skipped (site-specific)
    const isSkipped = localStorage.getItem(
      `tour_skipped_${this.tourData.id}_${this.siteKey}`
    );
    if (isSkipped === "true") {
      console.log(
        "Tour was skipped. To restart, clear localStorage or use TourWidget.restart()"
      );
      return;
    }

    this.isActive = true;
    this.createOverlay();
    this.showStep(this.currentStep);
    this.analytics.track("tour_started", { tourId: this.tourData.id });
  }

  restart(): void {
    // Clear all flags and progress (site-specific)
    localStorage.removeItem(
      `tour_completed_${this.tourData.id}_${this.siteKey}`
    );
    localStorage.removeItem(`tour_skipped_${this.tourData.id}_${this.siteKey}`);
    localStorage.removeItem(
      `tour_progress_${this.tourData.id}_${this.siteKey}`
    );
    this.currentStep = 0;
    this.start();
  }

  async stop(): Promise<void> {
    if (!this.isActive) return;

    this.isActive = false;
    await this.cleanup();
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
    // Show confirmation modal
    this.showSkipConfirmation();
  }

  private confirmSkip(): void {
    this.analytics.track("tour_skipped", {
      tourId: this.tourData.id,
      atStep: this.currentStep + 1,
      totalSteps: this.tourData.steps.length,
      completedSteps: this.currentStep,
    });

    // Mark tour as SKIPPED (site-specific)
    localStorage.setItem(
      `tour_skipped_${this.tourData.id}_${this.siteKey}`,
      "true"
    );

    void this.stop();
  }

  complete(): void {
    // Get the mini avatar from tooltip before cleanup
    const miniAvatar = this.tooltip ? (this.tooltip as any)._miniAvatar : null;

    // Run celebration animation if avatar exists
    if (miniAvatar && typeof miniAvatar.run === "function") {
      miniAvatar.run();
    }

    this.analytics.track("tour_completed", {
      tourId: this.tourData.id,
      totalSteps: this.tourData.steps.length,
      completedSteps: this.currentStep + 1,
    });

    // Mark as COMPLETED (site-specific)
    localStorage.setItem(
      `tour_completed_${this.tourData.id}_${this.siteKey}`,
      "true"
    );
    localStorage.removeItem(
      `tour_progress_${this.tourData.id}_${this.siteKey}`
    );

    // End tour after celebration animation
    setTimeout(() => {
      void this.stop();
    }, 1500);
  }

  private showSkipConfirmation(): void {
    // Check if we're at the last step - if so, just complete the tour
    if (this.currentStep === this.tourData.steps.length - 1) {
      console.log(
        "✅ At last step - completing tour instead of showing skip confirmation"
      );
      this.complete();
      return;
    }

    // Create modal backdrop
    const modal = document.createElement("div");
    modal.className = "tour-skip-modal";
    modal.innerHTML = `
    <div class="tour-skip-modal-backdrop"></div>
    <div class="tour-skip-modal-content">
      <div class="tour-skip-modal-icon">🤔</div>
      <h3>Skip This Tour?</h3>
      <p>You're on step ${this.currentStep + 1} of ${
      this.tourData.steps.length
    }. Are you sure you want to skip the rest of the tour?</p>
      <div class="tour-skip-modal-actions">
        <button class="tour-btn tour-btn-secondary tour-skip-cancel">Continue Tour</button>
        <button class="tour-btn tour-btn-danger tour-skip-confirm">Yes, Skip</button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add("active");
    });

    // Add event listeners
    const cancelBtn = modal.querySelector(
      ".tour-skip-cancel"
    ) as HTMLButtonElement;
    const confirmBtn = modal.querySelector(
      ".tour-skip-confirm"
    ) as HTMLButtonElement;

    const closeModal = () => {
      modal.classList.remove("active");
      setTimeout(() => {
        modal.remove();
      }, 300);
    };

    cancelBtn?.addEventListener("click", closeModal);

    confirmBtn?.addEventListener("click", () => {
      closeModal();
      setTimeout(() => {
        this.confirmSkip();
      }, 300);
    });

    // Close on backdrop click
    const backdrop = modal.querySelector(".tour-skip-modal-backdrop");
    backdrop?.addEventListener("click", closeModal);

    // Close on Escape key
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);
  }

  private async showStep(stepIndex: number): Promise<void> {
    const step = this.tourData.steps[stepIndex];

    // Clean up previous tooltip
    await this.removeTooltip();

    let targetElement = document.querySelector(step.target) as HTMLElement;

    if (!targetElement) {
      targetElement = document.body;
      console.warn(`Target element "${step.target}" not found`);
    }

    this.createSpotlight(targetElement);
    this.scrollToElement(targetElement);
    await this.createTooltip(step, targetElement, stepIndex);

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
    document.addEventListener(
      "DOMMouseScroll",
      this.scrollPreventHandler,
      options
    );
    document.addEventListener("touchmove", this.scrollPreventHandler, options);
    document.addEventListener("keydown", this.preventKeyboardScroll, options);

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  private preventKeyboardScroll(e: KeyboardEvent): void {
    const scrollKeys = [
      " ",
      "PageUp",
      "PageDown",
      "End",
      "Home",
      "ArrowUp",
      "ArrowDown",
    ];

    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  }

  private enableScroll(): void {
    if (this.scrollPreventHandler) {
      const options = { capture: true };

      document.removeEventListener("wheel", this.scrollPreventHandler, options);
      document.removeEventListener(
        "mousewheel",
        this.scrollPreventHandler,
        options
      );
      document.removeEventListener(
        "DOMMouseScroll",
        this.scrollPreventHandler,
        options
      );
      document.removeEventListener(
        "touchmove",
        this.scrollPreventHandler,
        options
      );
      document.removeEventListener(
        "keydown",
        this.preventKeyboardScroll,
        options
      );

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

    const cleanup = () => {
      window.removeEventListener("resize", updateHandler);
      window.removeEventListener("scroll", updateHandler);
    };

    this.cleanupFunctions.push(cleanup);
  }

  private saveProgress(): void {
    const progress: TourProgress = { currentStep: this.currentStep };
    // Use siteKey to make progress site-specific
    const storageKey = `tour_progress_${this.tourData.id}_${this.siteKey}`;
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }

  private loadProgress(): void {
    try {
      const storageKey = `tour_progress_${this.tourData.id}_${this.siteKey}`;
      const saved = localStorage.getItem(storageKey);
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
    if (!this.tooltip) return;

    // Remove keyboard event listener first
    this.removeTooltipEvents();

    // Clean up mini avatar
    const miniAvatar = (this.tooltip as any)._miniAvatar;
    if (miniAvatar && typeof miniAvatar.destroy === "function") {
      try {
        miniAvatar.destroy();
      } catch (error) {
        console.error("Error destroying avatar:", error);
      }
    }

    // Fade out animation
    this.tooltip.classList.remove("active");
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Remove from DOM
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.remove();
    }
    this.tooltip = null;
  }

  private removeTooltipEvents(): void {
    if (this.keyboardHandler) {
      document.removeEventListener("keydown", this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  private async cleanup(): Promise<void> {
    // Remove tooltip first (includes its cleanup)
    await this.removeTooltip();

    // Remove keyboard events
    this.removeTooltipEvents();

    // Execute all cleanup functions (spotlight listeners, etc)
    this.cleanupFunctions.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    });
    this.cleanupFunctions = [];

    // Clean up avatar container if exists
    if (this.avatarContainer) {
      this.avatarContainer.style.opacity = "0";
      this.avatarContainer.style.transform = "scale(0.8)";
      setTimeout(() => {
        if (this.avatarContainer && this.avatarContainer.parentNode) {
          this.avatarContainer.remove();
        }
        this.avatarContainer = null;
      }, 300);
    }

    // Remove spotlight
    if (this.spotlight) {
      this.spotlight.remove();
      this.spotlight = null;
    }

    // Remove overlay last
    if (this.overlay) {
      this.overlay.classList.remove("active");
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (this.overlay && this.overlay.parentNode) {
        this.overlay.remove();
      }
      this.overlay = null;

      // Re-enable scrolling
      this.enableScroll();
    }
  }

  private async createTooltip(
    step: TourStep,
    targetElement: HTMLElement,
    stepIndex: number
  ): Promise<void> {
    // Ensure previous tooltip is fully removed
    await new Promise((resolve) => setTimeout(resolve, 50));

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

    await new Promise((resolve) => requestAnimationFrame(resolve));

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
          avatarContainer.innerHTML = "👋";
          avatarContainer.classList.add("avatar-fallback");
        }
      }
    }

    const { TooltipHelper } = await import("./tooltip-helper");

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

    this.cleanupFunctions.push(cleanup);

    this.attachTooltipEvents();

    requestAnimationFrame(() => {
      this.tooltip?.classList.add("active");
    });
  }

  private attachTooltipEvents(): void {
    if (!this.tooltip) return;

    const nextBtn = this.tooltip.querySelector(
      ".tour-next-btn"
    ) as HTMLButtonElement;
    const prevBtn = this.tooltip.querySelector(
      ".tour-prev-btn"
    ) as HTMLButtonElement;
    const closeBtn = this.tooltip.querySelector(
      ".tour-close-btn"
    ) as HTMLButtonElement;

    // Use arrow functions to preserve 'this' context
    const handleNext = () => this.next();
    const handlePrev = () => this.prev();
    const handleClose = () => this.skip();

    nextBtn?.addEventListener("click", handleNext);
    prevBtn?.addEventListener("click", handlePrev);
    closeBtn?.addEventListener("click", handleClose);

    this.keyboardHandler = (e: KeyboardEvent) => {
      if (!this.isActive) return;

      if (e.key === "Escape") this.skip();
      else if (e.key === "ArrowRight") this.next();
      else if (e.key === "Enter") this.next();
      else if (e.key === "ArrowLeft") this.prev();
    };

    document.addEventListener("keydown", this.keyboardHandler);
  }
}
