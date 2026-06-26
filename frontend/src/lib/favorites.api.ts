import { api } from './api';

export const getFavoriteIds = async (): Promise<number[]> => {
    const response = await api.get('/listings/favorites/ids');
    return response.data.data;
};

export const getFavorites = async (): Promise<any[]> => {
    const response = await api.get('/listings/favorites');
    return response.data.data;
};

export const toggleFavorite = async (listingId: number): Promise<{ is_favorited: boolean }> => {
    const response = await api.post(`/listings/${listingId}/favorite`);
    return response.data;
};
