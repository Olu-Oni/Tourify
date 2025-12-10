'use client'
import React, { createContext, useContext } from 'react';
import type { Tour } from '../interfaces/types';
import { useTours } from '../hooks/useTours';


interface ToursContextValue {
tours: Tour[];
createTour: (t: Omit<Tour, 'id'>) => Promise<Tour | void>;
updateTour: (id: string, updates: Partial<Tour>) => Promise<void>;
deleteTour: (id: string) => Promise<void>;
setTours: (t: Tour[]) => void;
}


const ToursContext = createContext<ToursContextValue | undefined>(undefined);


export const ToursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const { tours, createTour, updateTour, deleteTour, setTours } = useTours([]);


return (
<ToursContext.Provider value={{ tours, createTour, updateTour, deleteTour, setTours }}>
{children}
</ToursContext.Provider>
);
};


export function useToursContext() {
const ctx = useContext(ToursContext);
if (!ctx) throw new Error('useToursContext must be used within ToursProvider');
return ctx;
}