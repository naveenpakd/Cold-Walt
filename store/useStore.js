import { create } from 'zustand';

export const useStore = create((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  priceRange: { min: 0, max: 100000 },
  setPriceRange: (range) => set({ priceRange: range }),
}));
