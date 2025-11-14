import axios from 'axios';

// La URL base puede venir de la variable de entorno o usar localhost
const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api';

const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Timeout de 15 segundos
});

// Interceptor para añadir el token JWT a cada petición
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta globalmente
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Error desconocido';
    
    // Si es error 401, limpiar token
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt');
      console.warn('Token inválido o expirado');
    }
    
    console.error('Error en respuesta:', message);
    return Promise.reject(error.response?.data || error);
  }
);

export default http;