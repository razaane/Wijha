import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: any;
    }
}

window.Pusher = Pusher;

const echoInstance = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'your-pusher-app-key',
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'mt1',
    forceTLS: true,
    authEndpoint: 'http://localhost:8000/api/v1/broadcasting/auth', // Standard Laravel echo auth endpoint
    auth: {
        headers: {
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('wijha_token') || '' : ''}`,
            Accept: 'application/json',
        },
    },
});

export default echoInstance;
