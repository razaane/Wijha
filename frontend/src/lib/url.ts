export function getApiUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Remove trailing slash from base and leading slash from path
    const base = baseUrl.replace(/\/$/, '');
    const safePath = path.replace(/^\//, '');
    return `${base}/${safePath}`;
}

export function getStorageUrl(path: string | undefined | null): string {
    if (!path) return '';
    // If it's already an absolute URL, return it
    if (path.startsWith('http')) {
        // Fix for Laravel returning http://localhost without port 8000
        if (path.startsWith('http://localhost/')) {
            return path.replace('http://localhost/', 'http://localhost:8000/');
        }
        return path;
    }
    
    // Default to the main backend URL, fallback to localhost
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
                   (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : 'http://localhost:8000');
                   
    const base = baseUrl.replace(/\/$/, '');
    const safePath = path.replace(/^\//, '');
    
    // Spatie media library typically stores files in /storage/
    if (!safePath.startsWith('storage/')) {
        return `${base}/storage/${safePath}`;
    }
    
    return `${base}/${safePath}`;
}

export function getGoogleAuthUrl(): string {
    return getApiUrl('/api/v1/auth/google/redirect');
}
