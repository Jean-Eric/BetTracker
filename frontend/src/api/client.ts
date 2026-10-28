import axios from 'axios';

// On utilise l'IP de votre PC pour que le téléphone puisse joindre l'API
export const api = axios.create({
  baseURL: 'http://192.168.0.245:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});
