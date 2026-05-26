import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const api = axios.create({
  baseURL: apiBaseUrl || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);
