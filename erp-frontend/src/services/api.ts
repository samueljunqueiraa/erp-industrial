import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// --- 1. CARTEIRO ---
api.interceptors.request.use((config) => {
  
  const token = localStorage.getItem('erp_token') || localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn(`[API] Atenção: Enviando requisição sem token para ${config.url}`);
  }
  return config;

}, (error) => {
  return Promise.reject(error);
});

// --- 2. SEGURANÇA ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(`[ERRO API] Status: ${status} na URL: ${url}`);

    return Promise.reject(error);
  }
);