import {
  computePosition,
  shift,
  offset,
  inline,
  flip,
  limitShift, // Import limitShift
} from "@floating-ui/dom";
import { TooltipPosition } from "./types/index";

export class TooltipHelper {
  static async positionTooltip(
    tooltip: HTMLElement,
    targetElement: HTMLElement,
    preferredPosition: TooltipPosition = "auto"
  ): Promise<void> {
    // Center positioning
    if (preferredPosition === "center" || targetElement === document.body) {
      this.centerTooltip(tooltip);
      return;
    }

    // Check if target element (spotlight) is larger than viewport
    const targetRect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const targetLargerThanViewport = 
      targetRect.width > viewportWidth/2 && 
      targetRect.height > viewportHeight/2;

    // If target is larger than viewport, center the tooltip
    if (targetLargerThanViewport) {
      this.centerTooltip(tooltip, 200);
      return;
    }

    try {
      const { x, y, placement } = await computePosition(targetElement, tooltip, {
        placement: "bottom",
        strategy: "fixed",
        middleware: [
          offset(16),
          inline(),
          flip({
            fallbackAxisSideDirection: 'start',
            padding: 12,
          }),
          shift({ 
            padding: 15,
            boundary: 'clippingAncestors',
            crossAxis: true,
            limiter: limitShift({
              offset:50,
            }),
          }),
        ],
      });

      Object.assign(tooltip.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        maxHeight: "", // Remove any constraints
        maxWidth: "",  // Remove any constraints
        overflow: "visible",
      });

      tooltip.dataset.placement = placement;

      // Final boundary check
      this.ensureWithinViewport(tooltip);
    } catch (error) {
      console.warn("Positioning failed:", error);
      this.fallbackPosition(tooltip, targetElement);
    }
  }

  private static ensureWithinViewport(tooltip: HTMLElement): void {
    const rect = tooltip.getBoundingClientRect();
    const padding = 15;
    
    let left = parseFloat(tooltip.style.left);
    let top = parseFloat(tooltip.style.top);
    
    // Adjust horizontally if overflowing
    if (rect.left < padding) {
      left = padding;
    } else if (rect.right > window.innerWidth - padding) {
      left = window.innerWidth - rect.width - padding;
    }
    
    // Adjust vertically if overflowing
    if (rect.top < padding) {
      top = padding;
    } else if (rect.bottom > window.innerHeight - padding) {
      top = window.innerHeight - rect.height - padding;
    }
    
    // Only update if adjustments were needed
    if (left !== parseFloat(tooltip.style.left) || top !== parseFloat(tooltip.style.top)) {
      Object.assign(tooltip.style, {
        left: `${left}px`,
        top: `${top}px`,
      });
    }
  }


  private static centerTooltip(tooltip: HTMLElement, offset: number = 0): void {
    tooltip.style.position = "fixed";
    tooltip.style.visibility = "hidden";
    document.body.appendChild(tooltip);

    const rect = tooltip.getBoundingClientRect();
    const padding = 20;

    const top = Math.max(
      padding,
      Math.min((window.innerHeight - rect.height) / 2, window.innerHeight - rect.height - padding)
    );
    const left = Math.max(
      padding,
      Math.min((window.innerWidth - rect.width) / 2, window.innerWidth - rect.width - padding)
    );

    Object.assign(tooltip.style, {
      top: `${top + offset}px`,
      left: `${left + offset/2}px`,
      visibility: "visible",
    });

    tooltip.dataset.placement = "center";
  }

  private static fallbackPosition(tooltip: HTMLElement, targetElement: HTMLElement): void {
    const targetRect = targetElement.getBoundingClientRect();
    const padding = 20;

    tooltip.style.position = "fixed";
    tooltip.style.visibility = "hidden";
    document.body.appendChild(tooltip);

    const tooltipRect = tooltip.getBoundingClientRect();

    // Position below or above target
    let top = targetRect.bottom + 16;
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = targetRect.top - tooltipRect.height - 16;
    }

    // Center horizontally with bounds
    const left = Math.max(
      padding,
      Math.min(
        targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
        window.innerWidth - tooltipRect.width - padding
      )
    );

    Object.assign(tooltip.style, {
      left: `${left}px`,
      top: `${Math.max(padding, top)}px`,
      visibility: "visible",
    });

    tooltip.dataset.placement = "bottom";
  }

  static createAutoUpdate(
    tooltip: HTMLElement,
    targetElement: HTMLElement,
    position?: TooltipPosition
  ): () => void {
    let frameId: number;
    let timeoutId: number;

    const update = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          this.positionTooltip(tooltip, targetElement, position);
        });
      }, 50);
    };

    window.addEventListener("scroll", update, { passive: true, capture: true });
    window.addEventListener("resize", update, { passive: true });

    update(); // Initial position

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }
}