import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { api } from './api';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: any;
    }
}

let echoInstance: any = null;

if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    echoInstance = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'your-pusher-app-key',
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'mt1',
        forceTLS: true,
        authorizer: (channel: any, options: any) => {
            return {
                authorize: (socketId: string, callback: Function) => {
                    api.post('/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                    .then(response => {
                        callback(false, response.data);
                    })
                    .catch(error => {
                        callback(true, error);
                    });
                }
            };
        },
    });
}

export default echoInstance;
