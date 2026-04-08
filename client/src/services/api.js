// ============================================
// AXIOS INSTANCE CONFIGURATION
// ============================================
// Centralized API client with interceptors

import axios from 'axios';

// Base axios instance create karo
const api = axios.create({
    baseURL: '/api',           // Vite proxy handle karega
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000             // 10 second timeout
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
// Har outgoing request mein JWT token automatically add karo
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
// Error responses handle karo
api.interceptors.response.use(
    (response) => {
        // Successful response - data return karo
        return response;
    },
    (error) => {
        // 401 Unauthorized - token expired/invalid
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;