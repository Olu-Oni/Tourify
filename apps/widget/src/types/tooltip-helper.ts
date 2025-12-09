import {
  computePosition,
  autoPlacement,
  shift,
  offset,
  inline,
} from "@floating-ui/dom";
import { TooltipPosition } from "./index";

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
      targetRect.width > viewportWidth/2 || 
      targetRect.height > viewportHeight;

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
          autoPlacement({ padding: 12 }),
          shift({ padding: 15 }),
        ],
      });

      Object.assign(tooltip.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
      });

      tooltip.dataset.placement = placement;
    } catch (error) {
      console.warn("Positioning failed:", error);
      this.fallbackPosition(tooltip, targetElement);
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