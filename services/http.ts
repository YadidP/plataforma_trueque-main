import axios from 'axios';

// The backend API is expected to be running on localhost:3000 as per the Docker setup.
const API_URL = 'http://localhost:3000';

const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    return Promise.reject(error);
  }
);

// Opcional: Interceptor para manejar errores de respuesta globalmente
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aquí se podría manejar el refresco de token si la API devuelve 401
    // o redirigir a login, etc.
    return Promise.reject(error.response?.data?.message || error.message);
  }
);


export default http;