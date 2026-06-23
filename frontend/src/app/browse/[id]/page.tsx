import ListingClient from './ListingClient';

export default function ListingPage({ params }: { params: { id: string } }) {
    return <ListingClient id={params.id} />;
}
