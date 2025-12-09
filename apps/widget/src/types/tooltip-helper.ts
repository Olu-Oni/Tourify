import {
  computePosition,
  flip,
  shift,
  offset,
  autoPlacement,
  inline,
  arrow,
  hide,
  type Placement,
  type Middleware,
  type ComputePositionConfig,
  type AutoPlacementOptions,
  type FlipOptions,
} from "@floating-ui/dom";
import { TooltipPosition } from "./index";

export class TooltipHelper {
 
  // Position tooltip relative to target element

  static async positionTooltip(
    tooltip: HTMLElement,
    targetElement: HTMLElement,
    preferredPosition: TooltipPosition = "auto"
  ): Promise<void> {
    // For center position on body or specific request
    if (preferredPosition === "center" || targetElement === document.body) {
      this.centerTooltipInViewport(tooltip);
      return;
    }

    try {
      // Configure middleware
      const middleware: Middleware[] = [
        offset(20), // Gap between tooltip and target
        inline(), // For better positioning with inline elements
      ];

      // Handle auto placement vs specific placement
      if (preferredPosition === "auto") {
        // Auto placement will try all sides and pick the best one
        middleware.push(
          autoPlacement({
            padding: 12,
            alignment: "start",
          })
        );
      } else {
        // For specific placement, use flip to find alternatives if needed
        middleware.push(
          flip({
            padding: 12,
          })
        );
      }

      // Always add shift to keep within viewport
      middleware.push(
        shift({
          padding: 12,
        })
      );

      // Add hide middleware to detect when tooltip is completely obscured
      middleware.push(
        hide({
          padding: 8,
        })
      );

      const { x, y, middlewareData, placement } = await computePosition(
        targetElement,
        tooltip,
        {
          placement:
            preferredPosition === "auto"
              ? "bottom"
              : this.convertPosition(preferredPosition),
          strategy: "fixed", // Fixed to viewport
          middleware,
        }
      );

      // Apply position
      Object.assign(tooltip.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
      });

      // Add data attribute for styling
      tooltip.dataset.placement = placement;

      // Handle visibility based on hide middleware
      if (middlewareData.hide?.referenceHidden) {
        tooltip.style.opacity = "0";
        tooltip.style.pointerEvents = "none";
      } else {
        tooltip.style.opacity = "";
        tooltip.style.pointerEvents = "";
      }
    } catch (error) {
      console.warn("Failed to position tooltip, using fallback:", error);
      this.simpleFallbackPosition(tooltip, targetElement);
    }
  }

  /**
   * Convert our position to Floating UI placement
   */
  private static convertPosition(position: TooltipPosition): Placement {
    const mapping: Record<string, Placement> = {
      top: "top",
      bottom: "bottom",
      left: "left",
      right: "right",
      "top-left": "top-start",
      "top-right": "top-end",
      "bottom-left": "bottom-start",
      "bottom-right": "bottom-end",
      center: "top", // Not used for center
      auto: "bottom", // Not used for auto
    };

    return mapping[position] || "bottom";
  }

  /**
   * Center tooltip in viewport
   */
  private static centerTooltipInViewport(tooltip: HTMLElement): void {
    // First make tooltip visible to measure it
    tooltip.style.position = "fixed";
    tooltip.style.visibility = "hidden";
    document.body.appendChild(tooltip);

    const rect = tooltip.getBoundingClientRect();

    // Calculate centered position
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = (viewportHeight - rect.height) / 2;
    let left = (viewportWidth - rect.width) / 2;

    // Apply with bounds checking
    const padding = 20;
    top = Math.max(
      padding,
      Math.min(top, viewportHeight - rect.height - padding)
    );
    left = Math.max(
      padding,
      Math.min(left, viewportWidth - rect.width - padding)
    );

    // Apply final position
    Object.assign(tooltip.style, {
      top: `${top}px`,
      left: `${left}px`,
      visibility: "visible",
    });

    tooltip.dataset.placement = "center";
  }

  /**
   * Simple fallback - just position below with bounds checking
   */
  private static simpleFallbackPosition(
    tooltip: HTMLElement,
    targetElement: HTMLElement
  ): void {
    const targetRect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Position below target
    let top = targetRect.bottom + 16;
    let left = targetRect.left + targetRect.width / 2;

    // First position to measure
    tooltip.style.position = "fixed";
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.visibility = "hidden";
    document.body.appendChild(tooltip);

    const tooltipRect = tooltip.getBoundingClientRect();

    // Adjust if doesn't fit below
    if (top + tooltipRect.height > viewportHeight - 20) {
      top = targetRect.top - tooltipRect.height - 16;
    }

    // Center horizontally but keep in bounds
    left = Math.max(
      20,
      Math.min(
        left - tooltipRect.width / 2,
        viewportWidth - tooltipRect.width - 20
      )
    );
    top = Math.max(20, Math.min(top, viewportHeight - tooltipRect.height - 20));

    // Apply final position
    Object.assign(tooltip.style, {
      left: `${left}px`,
      top: `${top}px`,
      visibility: "visible",
    });

    tooltip.dataset.placement = "bottom";
  }

  /**
   * Create auto-update for scroll/resize
   */
  static createAutoUpdate(
    tooltip: HTMLElement,
    targetElement: HTMLElement,
    position?: TooltipPosition
  ): () => void {
    let frameId: number;

    const update = async () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(async () => {
        try {
          await this.positionTooltip(tooltip, targetElement, position);
        } catch (error) {
          console.error("Auto-update failed:", error);
        }
      });
    };

    // Debounce updates
    let timeoutId: number;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(update, 50);
    };

    // Listen to events
    window.addEventListener("scroll", debouncedUpdate, { passive: true });
    window.addEventListener("resize", debouncedUpdate, { passive: true });

    // Also listen to scroll events on all parent elements
    const scrollableParents = this.findScrollableParents(targetElement);
    scrollableParents.forEach((el) => {
      el.addEventListener("scroll", debouncedUpdate, { passive: true });
    });

    // Initial update
    update();

    // Return cleanup function
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", debouncedUpdate);
      window.removeEventListener("resize", debouncedUpdate);

      scrollableParents.forEach((el) => {
        el.removeEventListener("scroll", debouncedUpdate);
      });
    };
  }

  /**
   * Find all scrollable parent elements
   */
  private static findScrollableParents(element: HTMLElement): HTMLElement[] {
    const parents: HTMLElement[] = [];
    let current = element.parentElement;

    while (current) {
      const style = window.getComputedStyle(current);
      const overflow = style.overflow + style.overflowX + style.overflowY;

      if (overflow.includes("auto") || overflow.includes("scroll")) {
        parents.push(current);
      }

      current = current.parentElement;
    }

    return parents;
  }

  /**
   * Alternative: Simple version without complex middleware
   * Just uses autoPlacement for everything (simplest approach)
   */
  static async simplePositionTooltip(
    tooltip: HTMLElement,
    targetElement: HTMLElement,
    preferredPosition: TooltipPosition = "auto"
  ): Promise<void> {
    if (preferredPosition === "center" || targetElement === document.body) {
      this.centerTooltipInViewport(tooltip);
      return;
    }

    try {
      const { x, y, placement } = await computePosition(
        targetElement,
        tooltip,
        {
          // Let autoPlacement handle everything
          placement: "bottom", // Default, will be overridden by autoPlacement
          strategy: "fixed",
          middleware: [
            offset(16),
            inline(),
            autoPlacement({
              padding: 12,
              alignment: "start",
            }),
            shift({ padding: 12 }),
          ],
        }
      );

      Object.assign(tooltip.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
      });

      tooltip.dataset.placement = placement;
    } catch (error) {
      console.warn("Positioning failed:", error);
      this.simpleFallbackPosition(tooltip, targetElement);
    }
  }
}
