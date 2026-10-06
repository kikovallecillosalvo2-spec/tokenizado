import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tokenizado_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Error de red inesperado';
    const status = error.response?.status;
    return Promise.reject({ message, status, data: error.response?.data });
  }
);

export async function getHealth() {
  const { data } = await api.get('/health');
  return data;
}

export async function getUsers() {
  const { data } = await api.get('/users');
  return data;
}

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/users', { name, email, password });
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function updateName(name) {
  const { data } = await api.patch('/users/name', { name });
  return data;
}

export { api, API_URL };
