import ListingClient from './ListingClient';

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <ListingClient id={resolvedParams.id} />;
}
