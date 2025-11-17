import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Axios instance létrehozása
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Session cookie-khoz szükséges
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Basic Auth hozzáadása
api.interceptors.request.use(
    (config) => {
        const auth = localStorage.getItem('auth');
        if (auth) {
            config.headers.Authorization = `Basic ${auth}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - hibakezelés
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// API metódusok
export const authAPI = {
    register: (username, password, email) =>
        api.post('/api/auth/register', { username, password, email }),

    getCurrentUser: () => api.get('/api/auth/me'),

    // Basic Auth beállítása
    setAuth: (username, password) => {
        const token = btoa(`${username}:${password}`);
        localStorage.setItem('auth', token);
    },

    clearAuth: () => {
        localStorage.removeItem('auth');
    },
};

export const ideaAPI = {
    // Jóváhagyott ötletek (user és admin)
    getApproved: () => api.get('/api/ideas'),

    // Új ötlet beküldése
    submit: (title, description) =>
        api.post('/api/ideas', { title, description }),

    // Szavazás
    vote: (ideaId) => api.post(`/api/ideas/${ideaId}/vote`),

    // Admin: pending ötletek
    getPending: () => api.get('/api/ideas/pending'),

    // Admin: jóváhagyás
    approve: (ideaId) => api.post(`/api/ideas/${ideaId}/approve`),

    // Admin: törlés
    delete: (ideaId) => api.delete(`/api/ideas/${ideaId}`),
};

export default api;