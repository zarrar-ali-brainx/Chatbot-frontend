import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, ChatRequest, ChatMessage, Document } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data as AuthResponse;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data as AuthResponse;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const chatService = {
  sendGeneralMessage: async (data: ChatRequest) => {
    const response = await api.post('/chat/general', data);
    return response.data;
  },

  sendRagMessage: async (data: ChatRequest) => {
    const response = await api.post('/chat/rag', data);
    return response.data;
  },

  getSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },

  getSessionMessages: async (sessionId: number) => {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },
};

export const documentService = {
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/docs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/docs');
    return response.data;
  },

  deleteDocument: async (documentId: number) => {
    const response = await api.delete(`/docs/${documentId}`);
    return response.data;
  },
};

export default api;
