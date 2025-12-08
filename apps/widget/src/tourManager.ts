// tour-manager.ts - Manages tour flow and UI
import type {
  TourData,
  TourConfig,
  TourStep,
  TooltipPosition,
  ITourManager,
  IAnalytics,
  TourProgress,
} from "./types/index";

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

  // Event handlers
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(tourData: TourData, config: TourConfig, analytics: IAnalytics) {
    this.tourData = tourData;
    this.config = config;
    this.analytics = analytics;

    // Load progress from localStorage
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
    if (this.currentStep < this.tourData.steps.length -1) {
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
    this.analytics.track("tour_completed", {
      tourId: this.tourData.id,
      totalSteps: this.tourData.steps.length,
    });

    // Show completion message
    this.showCompletionMessage();

    // Clear progress
    localStorage.removeItem(`tour_progress_${this.tourData.id}`);

    // setTimeout(() => {
    //   this.stop();
    // }, 3000);
  }

  private showStep(stepIndex: number): void {
    const step = this.tourData.steps[stepIndex];

    // Remove existing tooltip
    this.removeTooltip();

    // Find target element
    let targetElement = document.querySelector(step.target) as HTMLElement;

    // If target not found, use body
    if (!targetElement) {
      targetElement = document.body;
      console.warn(`Target element "${step.target}" not found`);
    }

    // Scroll element into view
    this.scrollToElement(targetElement);

    // Create spotlight effect
    this.createSpotlight(targetElement);

    // Create and position tooltip
    void this.createTooltip(step, targetElement, stepIndex);

    // Track step view
    this.analytics.track("step_viewed", {
      stepId: step.id,
      stepNumber: stepIndex + 1,
    });
  }

  private createOverlay(): void {
    this.overlay = document.createElement("div");
    this.overlay.className = "tour-overlay";
    document.body.appendChild(this.overlay);

    // Trigger reflow for animation
    void this.overlay.offsetWidth;

    // Fade in
    requestAnimationFrame(() => {
      this.overlay?.classList.add("active");
    });
  }

  private createSpotlight(targetElement: HTMLElement): void {
    // Remove existing spotlight
    if (this.spotlight) {
      this.spotlight.remove();
    }

    const rect = targetElement.getBoundingClientRect();

    this.spotlight = document.createElement("div");
    this.spotlight.className = "tour-spotlight";
    this.spotlight.style.top = `${rect.top}px`;
    this.spotlight.style.left = `${rect.left}px`;
    this.spotlight.style.width = `${rect.width + 20}px`;
    this.spotlight.style.height = `${rect.height + 20}px`;

    document.body.appendChild(this.spotlight);
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
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }

  private removeTooltip(): void {
    if (this.tooltip) {
      // Cleanup auto-update listeners
      const cleanup = (this.tooltip as any)._cleanup;
      if (cleanup) cleanup();

      this.tooltip.remove();
      this.tooltip = null;
    }
    if (this.spotlight) {
      this.spotlight.remove();
      this.spotlight = null;
    }
  }

  private cleanup(): void {
    this.removeTooltip();

    if (this.overlay) {
      this.overlay.classList.remove("active");
      setTimeout(() => {
        this.overlay?.remove();
        this.overlay = null;
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
          <h3>${step.title}</h3>
          <button class="tour-close-btn" aria-label="Close tour">×</button>
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
            <button class="tour-btn tour-btn-secondary tour-skip-btn">Skip Tour</button>
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

    //Floating UI
    const { TooltipHelper } = await import("./types/tooltip-helper");
    await TooltipHelper.positionTooltip(
      this.tooltip,
      targetElement,
      step.position
    );

    // Set up auto-update on scroll/resize
    const cleanup = TooltipHelper.createAutoUpdate(
      this.tooltip,
      targetElement,
      step.position
    );

    // Store cleanup function
    (this.tooltip as any)._cleanup = cleanup;

    // Add event listeners
    this.attachTooltipEvents();

    // Animate in
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
    const skipBtn = this.tooltip.querySelector(
      ".tour-skip-btn"
    ) as HTMLButtonElement;
    const closeBtn = this.tooltip.querySelector(
      ".tour-close-btn"
    ) as HTMLButtonElement;

    nextBtn?.addEventListener("click", () => this.next());
    prevBtn?.addEventListener("click", () => this.prev());
    skipBtn?.addEventListener("click", () => this.skip());
    closeBtn?.addEventListener("click", () => this.skip());

    // Keyboard navigation
    this.keyboardHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") this.skip();
      if (e.key === "ArrowRight") this.next();
      if (e.key === "Enter") this.next();
      if (e.key === "ArrowLeft") this.prev();
    };

    document.addEventListener("keydown", this.keyboardHandler);
  }

  private showCompletionMessage(): void {
  this.removeTooltip();

  const completion = document.createElement("div");
  completion.className = "tour-completion";
  completion.innerHTML = `
    <div class="tour-completion-content">
      <div class="tour-tooltip-header">
        <button class="tour-close-btn" aria-label="Close tour">×</button>
      </div>
      <div class="tour-completion-icon">🎉</div>
      <h2>Tour Complete!</h2>
      <p>You're all set to get started.</p>
    </div>
  `;

  document.body.appendChild(completion);

  // Add close button handler
  const closeBtn = completion.querySelector('.tour-close-btn');
  closeBtn?.addEventListener('click', () => {
    completion.remove();
    this.stop();
  });

  // Animate in
  requestAnimationFrame(() => {
    completion.classList.add("active");
  });

  setTimeout(() => {
    completion.remove();
    this.stop();
  }, 3000);
}
}
