import Link from 'next/link';
import { Search, MapPin, Calendar, Users, Compass, Globe, Home, Map, Briefcase } from 'lucide-react';
import { Metadata } from 'next';
import HomeFeeds from '@/components/landing/HomeFeeds';

export const metadata: Metadata = {
  title: 'Wijha | Home',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col font-sans">
      
      {/* Clean Navigation Bar */}
      <nav className="w-full bg-white dark:bg-[#0a0a0a] border-b border-neutral-100 dark:border-neutral-800 flex flex-col items-center pt-6 pb-8 px-4 sm:px-8">
        
        {/* Top Row: Logo, Categories, User Actions */}
        <div className="w-full max-w-7xl flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <Compass size={32} className="text-[#FF385C]" />
                <span className="text-2xl font-bold tracking-tight text-[#FF385C] hidden md:block">Wijha</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <Link href="#" className="flex flex-col items-center gap-1 group">
                    <Globe size={24} className="text-neutral-900 dark:text-white" />
                    <span className="text-sm font-bold text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white pb-1">All</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-1 group opacity-60 hover:opacity-100 transition-opacity">
                    <Home size={24} className="text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white" />
                    <span className="text-sm font-bold text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white pb-1">Homes</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-1 group opacity-60 hover:opacity-100 transition-opacity">
                    <Map size={24} className="text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white" />
                    <span className="text-sm font-bold text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white pb-1">Experiences</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-1 group opacity-60 hover:opacity-100 transition-opacity">
                    <Briefcase size={24} className="text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white" />
                    <span className="text-sm font-bold text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white pb-1">Services</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/host/onboarding" className="text-sm font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2 rounded-full transition-colors hidden lg:block">
                    Switch to hosting
                </Link>
                <Link href="/login" className="flex items-center gap-3 border border-neutral-300 dark:border-neutral-700 rounded-full p-1 pl-3 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-neutral-900">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentColor', strokeWidth: 3, overflow: 'visible' }} className="text-neutral-500 dark:text-neutral-400"><g fill="none" fillRule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg>
                    <div className="w-8 h-8 rounded-full bg-neutral-500 flex items-center justify-center text-white overflow-hidden">
                        <Users size={16} />
                    </div>
                </Link>
            </div>
        </div>

        {/* Search Glass Container */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 py-2 px-4 rounded-full flex flex-col md:flex-row items-center max-w-4xl w-full shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center px-6 md:border-r border-neutral-300 dark:border-neutral-700 w-full md:w-1/3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <div className="flex flex-col text-left w-full">
              <span className="text-[11px] font-extrabold text-neutral-900 dark:text-white">Where</span>
              <input type="text" placeholder="Search destinations" className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-500 text-sm w-full truncate" />
            </div>
          </div>

          <div className="hidden md:flex items-center px-6 md:border-r border-neutral-300 dark:border-neutral-700 w-full md:w-1/3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <div className="flex flex-col text-left w-full">
              <span className="text-[11px] font-extrabold text-neutral-900 dark:text-white">When</span>
              <input type="text" placeholder="Add dates" className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-500 text-sm w-full truncate" />
            </div>
          </div>

          <div className="hidden md:flex items-center pl-6 pr-2 w-full md:w-1/3 justify-between py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-extrabold text-neutral-900 dark:text-white">Who</span>
              <input type="text" placeholder="Add guests" className="bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-500 text-sm w-full truncate" />
            </div>
            <div className="bg-[#FF385C] hover:bg-[#D70466] text-white p-3.5 rounded-full flex items-center justify-center transition-colors ml-2 shrink-0">
              <Search size={18} strokeWidth={3} />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full">
        <HomeFeeds />
      </main>

    </div>
  );
}
