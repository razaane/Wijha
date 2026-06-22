/**
 * Get the backend base URL (without /api/v1 suffix).
 * Single source of truth for the backend URL.
 */
function getBackendUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    // Strip /api/v1 suffix to get the pure backend URL
    return apiUrl.replace(/\/api\/v1\/?$/, '');
}

export function getStorageUrl(path: string | undefined | null): string {
    if (!path) return '';
    // If it's already an absolute URL, return it as-is
    if (path.startsWith('http')) {
        return path;
    }
    
    const base = getBackendUrl();
    const safePath = path.replace(/^\//, '');
    
    // Spatie media library typically stores files in /storage/
    if (!safePath.startsWith('storage/')) {
        return `${base}/storage/${safePath}`;
    }
    
    return `${base}/${safePath}`;
}

export function getGoogleAuthUrl(): string {
    return `${getBackendUrl()}/api/v1/auth/google/redirect`;
}
