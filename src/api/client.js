import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ آدرس API سرور خودت رو اینجا بذار
const BASE_URL = 'http://10.0.2.2:8000/api'; // اندروید امولاتور
// const BASE_URL = 'http://localhost:8000/api'; // iOS امولاتور
// const BASE_URL = 'https://your-domain.com/api'; // سرور واقعی

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// اضافه کردن توکن به هر درخواست
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// مدیریت خطاهای 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const authAPI = {
  login: (n_code, password) =>
    api.post('/login', { n_code, password }),
  getUser: () =>
    api.get('/user'),
};

// ===== Units =====
export const unitsAPI = {
  list: (page = 1) =>
    api.get('/units', { params: { page } }),
  get: (id) =>
    api.get(`/units/${id}`),
  create: (data) =>
    api.post('/units', data),
  update: (id, data) =>
    api.put(`/units/${id}`, data),
  delete: (id) =>
    api.delete(`/units/${id}`),
};

// ===== Tickets =====
export const ticketsAPI = {
  list: (params = {}) =>
    api.get('/tickets', { params }),
  get: (id) =>
    api.get(`/tickets/${id}`),
  create: (data) =>
    api.post('/tickets', data),
  update: (id, data) =>
    api.put(`/tickets/${id}`, data),
  delete: (id) =>
    api.delete(`/tickets/${id}`),
  assign: (id, userId) =>
    api.post(`/tickets/${id}/assign`, { user_id: userId }),
  accept: (id) =>
    api.post(`/tickets/${id}/accept`),
  complete: (id) =>
    api.post(`/tickets/${id}/complete`),
};

// ===== Todos =====
export const todosAPI = {
  list: (params = {}) =>
    api.get('/todos', { params }),
  get: (id) =>
    api.get(`/todos/${id}`),
  create: (data) =>
    api.post('/todos', data),
  update: (id, data) =>
    api.put(`/todos/${id}`, data),
  delete: (id) =>
    api.delete(`/todos/${id}`),
  toggleComplete: (id) =>
    api.post(`/todos/${id}/toggle-complete`),
};

// ===== Reports =====
export const reportsAPI = {
  units: () =>
    api.get('/reports/units'),
  todos: () =>
    api.get('/reports/todos'),
  tickets: () =>
    api.get('/reports/tickets'),
};

export default api;
