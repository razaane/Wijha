'use client';

import { useState } from 'react';
import Header from './Header';
import FeedGrid from './FeedGrid';

export type Category = 'all' | 'stays' | 'events' | 'experiences';

export default function LandingClient() {
    const [activeCategory, setActiveCategory] = useState<Category>('all');

    return (
        <div className="flex flex-col font-sans w-full bg-white dark:bg-[#0a0a0a]">
            <Header activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
            <main className="flex-1 w-full">
                <FeedGrid activeCategory={activeCategory} />
            </main>
        </div>
    );
}
