// tooltip-helper.ts - Smart tooltip positioning with Floating UI
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';
import { TooltipPosition } from '.';

export class TooltipHelper {
//    Position tooltip relative to target element automatically
   
  static async positionTooltip(
    tooltip: HTMLElement,
    targetElement: HTMLElement,
    preferredPosition: TooltipPosition = 'auto'
  ): Promise<void> {
    // For center position, use fixed positioning
    if (preferredPosition === 'center') {
      this.centerTooltip(tooltip);
      return;
    }

    // Convert our position to Floating UI placement
    const placement = preferredPosition === 'auto' ? 'bottom' : preferredPosition;

    try {
      // Compute optimal position with Floating UI
      const { x, y, placement: finalPlacement } = await computePosition(
        targetElement,
        tooltip,
        {
          placement,
          middleware: [
            offset(12), // 12px gap between tooltip and target
            flip(), // Flip to opposite side if doesn't fit
            shift({ padding: 8 }), // Shift within viewport with 8px padding
          ],
        }
      );

      // Apply position
      Object.assign(tooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      // Add data attribute for styling (optional)
      tooltip.dataset.placement = finalPlacement;

    } catch (error) {
      console.warn('Failed to position tooltip, using fallback:', error);
      this.fallbackPosition(tooltip, targetElement);
    }
  }

  /**
   * Center tooltip in viewport
   */
  private static centerTooltip(tooltip: HTMLElement): void {
    const rect = tooltip.getBoundingClientRect();
    
    const top = (window.innerHeight - rect.height) / 2;
    const left = (window.innerWidth - rect.width) / 2;

    Object.assign(tooltip.style, {
      top: `${Math.max(20, top)}px`,
      left: `${Math.max(20, left)}px`,
    });
  }

  /**
   * Fallback positioning if Floating UI fails
   */
  private static fallbackPosition(tooltip: HTMLElement, targetElement: HTMLElement): void {
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // Try below target
    let top = targetRect.bottom + 12;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

    // Check if fits in viewport
    if (top + tooltipRect.height > window.innerHeight - 20) {
      // Position above instead
      top = targetRect.top - tooltipRect.height - 12;
    }

    // Keep within horizontal bounds
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipRect.width - 20));
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipRect.height - 20));

    Object.assign(tooltip.style, {
      top: `${top}px`,
      left: `${left}px`,
    });
  }

  /**
   * Update position on scroll/resize
   */
  static createAutoUpdate(
    tooltip: HTMLElement,
    targetElement: HTMLElement,
    position?: TooltipPosition
  ): () => void {
    const update = () => {
        this.positionTooltip(tooltip, targetElement, position)};

    // Update on scroll and resize
    // window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    // Return cleanup function
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }
}