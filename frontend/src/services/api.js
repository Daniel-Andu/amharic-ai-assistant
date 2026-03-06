import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
};

// Chat API
export const chatAPI = {
    startConversation: (language = 'am') => api.post('/chat/start', { language }),
    sendMessage: (data) => api.post('/chat/message', data),
    getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
    endConversation: (sessionId) => api.post(`/chat/end/${sessionId}`),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getTopQuestions: (params) => api.get('/dashboard/top-questions', { params }),
    getConversations: (params) => api.get('/dashboard/conversations', { params }),
    getConversationDetails: (id) => api.get(`/dashboard/conversations/${id}`),
};

// Knowledge API
export const knowledgeAPI = {
    uploadDocument: (formData) => api.post('/knowledge/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getDocuments: (params) => api.get('/knowledge/documents', { params }),
    deleteDocument: (id) => api.delete(`/knowledge/documents/${id}`),

    createFAQ: (data) => api.post('/knowledge/faqs', data),
    getFAQs: (params) => api.get('/knowledge/faqs', { params }),
    updateFAQ: (id, data) => api.put(`/knowledge/faqs/${id}`, data),
    deleteFAQ: (id) => api.delete(`/knowledge/faqs/${id}`),
};

export default api;
