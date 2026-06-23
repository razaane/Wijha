import axios from 'axios';
import Cookies from 'js-cookie';

// Base API URL pointing to the Laravel Backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// We no longer need to manually attach the token because it's stored securely
// in an HttpOnly cookie that the browser attaches automatically due to withCredentials: true

// Intercept responses to handle global errors like 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                Cookies.remove('is_logged_in');
                // Optional: redirect to login
            }
        }
        return Promise.reject(error);
    }
);
