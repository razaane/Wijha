import { Metadata } from 'next';
import FavoritesClient from './FavoritesClient';

export const metadata: Metadata = {
    title: 'Your Favorites | Wijha',
    description: 'View and manage your saved properties and experiences on Wijha.',
};

export default function FavoritesPage() {
    return <FavoritesClient />;
}
