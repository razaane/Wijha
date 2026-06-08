import Link from 'next/link';
import { Search, MapPin, Calendar, Users, Compass } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-8 py-6 text-white">
        <div className="flex items-center gap-2">
          <Compass size={28} className="text-amber-500" />
          <span className="text-2xl font-bold tracking-tight">Wijha</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/destinations" className="hover:text-amber-400 transition-colors">Destinations</Link>
          <Link href="/stays" className="hover:text-amber-400 transition-colors">Stays</Link>
          <Link href="/experiences" className="hover:text-amber-400 transition-colors">Experiences</Link>
          <Link href="/events" className="hover:text-amber-400 transition-colors">Events</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold hover:text-amber-400 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-amber-500/30">
            Create Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative h-screen min-h-[700px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2000&auto=format&fit=crop" 
            alt="Beautiful Moroccan Architecture" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 w-full max-w-5xl mt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg mb-6 leading-tight">
            Discover the Heart <br /> of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">MENA Region</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-200 mb-12 max-w-2xl mx-auto drop-shadow-md">
            Your all-in-one platform for unforgettable accommodations, rich local experiences, transport, and vibrant events.
          </p>

          {/* Search Glass Container */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 md:p-3 rounded-full flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto shadow-2xl">
            
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-full flex-1 w-full hover:bg-white/10 transition">
              <MapPin className="text-amber-400" size={20} />
              <div className="flex flex-col text-left">
                <span className="text-xs text-neutral-300 font-medium">Location</span>
                <input type="text" placeholder="Where are you going?" className="bg-transparent text-white focus:outline-none placeholder:text-neutral-400 text-sm font-semibold w-full" />
              </div>
            </div>

            <div className="hidden md:block w-px h-10 bg-white/20"></div>

            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-full flex-1 w-full hover:bg-white/10 transition">
              <Calendar className="text-amber-400" size={20} />
              <div className="flex flex-col text-left">
                <span className="text-xs text-neutral-300 font-medium">Dates</span>
                <input type="text" placeholder="Add dates" className="bg-transparent text-white focus:outline-none placeholder:text-neutral-400 text-sm font-semibold w-full" />
              </div>
            </div>

            <div className="hidden md:block w-px h-10 bg-white/20"></div>

            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-full flex-1 w-full hover:bg-white/10 transition">
              <Users className="text-amber-400" size={20} />
              <div className="flex flex-col text-left">
                <span className="text-xs text-neutral-300 font-medium">Travelers</span>
                <input type="text" placeholder="Add guests" className="bg-transparent text-white focus:outline-none placeholder:text-neutral-400 text-sm font-semibold w-full" />
              </div>
            </div>

            <button className="bg-amber-500 hover:bg-amber-400 text-white p-4 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg w-full md:w-auto mt-2 md:mt-0">
              <Search size={24} />
            </button>
            
          </div>
        </div>
      </main>

    </div>
  );
}
