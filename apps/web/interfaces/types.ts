export interface Step {
id: string;
title: string;
description: string;
targetSelector: string;
position: string;
}


export interface Tour {
id: string;
name: string;
description: string;
isActive: boolean;
steps: number;
views: number;
completions: number;
completionRate: number;
}

export interface NewTour {
  name: string;
  description: string;
  steps: Step[];
}

export interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  change: string;
}