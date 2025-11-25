import axios from 'axios';

const API_URL = '/api';  // Relativa: Vite proxy redirige a backend:3000/api

const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true, // Permite enviar/recibir cookies para sesiones
});

// Interceptores de JWT eliminados para simplificación.
// Ahora usamos sesiones basadas en cookies.


export default http;