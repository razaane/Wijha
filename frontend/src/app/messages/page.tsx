import { Metadata } from 'next';
import MessagesClient from './MessagesClient';

export const metadata: Metadata = {
    title: 'Messages | Wijha',
    description: 'Communicate with hosts and guests on Wijha.',
};

export default function MessagesPage() {
    return <MessagesClient />;
}
