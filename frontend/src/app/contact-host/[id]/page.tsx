import ContactHostClient from './ContactHostClient';

export default async function ContactHostPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <ContactHostClient id={resolvedParams.id} />;
}
