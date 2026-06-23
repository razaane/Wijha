import { Metadata } from 'next';
import HomeFeeds from '@/components/landing/HomeFeeds';
import Header from '@/components/landing/Header';

export const metadata: Metadata = {
  title: 'Wijha | Home',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex flex-col font-sans">
      
      <Header />

      <main className="flex-1 w-full">
        <HomeFeeds />
      </main>

    </div>
  );
}
