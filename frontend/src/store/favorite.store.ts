import { create } from 'zustand';

interface FavoriteState {
    favoriteIds: number[];
    setFavorites: (ids: number[]) => void;
    addFavorite: (id: number) => void;
    removeFavorite: (id: number) => void;
    hasFavorite: (id: number) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
    favoriteIds: [],
    setFavorites: (ids) => set({ favoriteIds: ids }),
    addFavorite: (id) => set((state) => ({ 
        favoriteIds: [...state.favoriteIds.filter(fId => fId !== id), id] 
    })),
    removeFavorite: (id) => set((state) => ({ 
        favoriteIds: state.favoriteIds.filter(fId => fId !== id) 
    })),
    hasFavorite: (id) => get().favoriteIds.includes(id),
}));
