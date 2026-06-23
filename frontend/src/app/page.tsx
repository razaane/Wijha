import { Metadata } from 'next';
import LandingClient from '@/components/landing/LandingClient';

export const metadata: Metadata = {
  title: 'Wijha | Home',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col font-sans">
      <LandingClient />
    </div>
  );
}
