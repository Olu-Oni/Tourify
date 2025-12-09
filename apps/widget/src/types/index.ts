// tour widget type defs
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';

export type TourTheme = 'light' | 'dark' | 'auto';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position?: TooltipPosition;
}

export interface TourData {
  id: string;
  name: string;
  steps: TourStep[];
}

export interface TourConfig {
  tourId: string;
  autoStart?: boolean;
  showAvatar?: boolean;
  theme?: TourTheme;
  apiUrl?: string;
}

export interface AnalyticsEvent {
  eventName: string;
  tourId: string;
  sessionId: string;
  timestamp: string;
  url: string;
  userAgent: string;
  [key: string]: any;
}

export interface TourProgress {
  currentStep: number;
}

export interface ITourManager {
  start(): void;
  stop(): void;
  next(): void;
  prev(): void;
  skip(): void;
  complete(): void;
}

export interface IAnalytics {
  track(eventName: string, data?: Record<string, any>): void;
  getEvents(): AnalyticsEvent[];
  clearEvents(): void;
}

export interface IAvatarManager {
  destroy(): void;
}

// Extending Window interface for global TourWidget
declare global {
  interface Window {
    TourWidget: any;
  }
}