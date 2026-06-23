import { Suspense } from 'react';
import BrowseClient from './BrowseClient';

export default function BrowsePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#0a0a0a]"></div>}>
            <BrowseClient />
        </Suspense>
    );
}
