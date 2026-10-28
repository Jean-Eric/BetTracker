import axios from 'axios';

// On utilise l'URL de production si elle existe, sinon on garde le local
const baseURL = import.meta.env.VITE_API_URL || 'http://192.168.0.245:8000';

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
