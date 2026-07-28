import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = 'api_base_url';
const DEFAULT_API_URL = 'https://tester-hermes.boxd.sh/api';

let apiInstance = null;

// ساختن یک instance جدید با آدرس جدید
async function createApiClient(baseURL) {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 15000,
  });

  // اضافه کردن توکن به هر درخواست
  instance.interceptors.request.use(
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
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

// گرفتن instance (با cache)
export async function getApi() {
  if (apiInstance) return apiInstance;

  const savedUrl = await AsyncStorage.getItem(API_URL_KEY);
  const baseURL = savedUrl || DEFAULT_API_URL;
  
  apiInstance = await createApiClient(baseURL);
  return apiInstance;
}

// تغییر آدرس و بازسازی instance
export async function setApiBaseUrl(newUrl) {
  await AsyncStorage.setItem(API_URL_KEY, newUrl);
  apiInstance = await createApiClient(newUrl);
  return apiInstance;
}

// گرفتن آدرس ذخیره شده
export async function getApiBaseUrl() {
  return await AsyncStorage.getItem(API_URL_KEY);
}

// ===== Auth =====
export const authAPI = {
  login: async (n_code, password) => {
    const api = await getApi();
    return api.post('/login', { n_code, password });
  },
  getUser: async () => {
    const api = await getApi();
    return api.get('/user');
  },
};

// ===== Units =====
export const unitsAPI = {
  list: async (page = 1) => {
    const api = await getApi();
    return api.get('/units', { params: { page } });
  },
  // Get all units (for tree building) - uses large per_page
  all: async () => {
    const api = await getApi();
    return api.get('/units', { params: { per_page: 200 } });
  },
  get: async (id) => {
    const api = await getApi();
    return api.get(`/units/${id}`);
  },
  create: async (data) => {
    const api = await getApi();
    return api.post('/units', data);
  },
  update: async (id, data) => {
    const api = await getApi();
    return api.put(`/units/${id}`, data);
  },
  delete: async (id) => {
    const api = await getApi();
    return api.delete(`/units/${id}`);
  },
};

// ===== Tickets =====
export const ticketsAPI = {
  list: async (params = {}) => {
    const api = await getApi();
    return api.get('/tickets', { params });
  },
  get: async (id) => {
    const api = await getApi();
    return api.get(`/tickets/${id}`);
  },
  create: async (data) => {
    const api = await getApi();
    return api.post('/tickets', data);
  },
  update: async (id, data) => {
    const api = await getApi();
    return api.put(`/tickets/${id}`, data);
  },
  delete: async (id) => {
    const api = await getApi();
    return api.delete(`/tickets/${id}`);
  },
  assign: async (id, userId) => {
    const api = await getApi();
    return api.post(`/tickets/${id}/assign`, { user_id: userId });
  },
  accept: async (id) => {
    const api = await getApi();
    return api.post(`/tickets/${id}/accept`);
  },
  complete: async (id) => {
    const api = await getApi();
    return api.post(`/tickets/${id}/complete`);
  },
};

// ===== Todos =====
export const todosAPI = {
  list: async (params = {}) => {
    const api = await getApi();
    return api.get('/todos', { params });
  },
  get: async (id) => {
    const api = await getApi();
    return api.get(`/todos/${id}`);
  },
  create: async (data) => {
    const api = await getApi();
    return api.post('/todos', data);
  },
  update: async (id, data) => {
    const api = await getApi();
    return api.put(`/todos/${id}`, data);
  },
  delete: async (id) => {
    const api = await getApi();
    return api.delete(`/todos/${id}`);
  },
  toggleComplete: async (id) => {
    const api = await getApi();
    return api.post(`/todos/${id}/toggle-complete`);
  },
};

// ===== Reports =====
export const reportsAPI = {
  units: async () => {
    const api = await getApi();
    return api.get('/reports/units');
  },
  todos: async () => {
    const api = await getApi();
    return api.get('/reports/todos');
  },
  tickets: async () => {
    const api = await getApi();
    return api.get('/reports/tickets');
  },
};

// ===== Hardware =====
export const hardwareAPI = {
  list: async (params = {}) => {
    const api = await getApi();
    return api.get('/hardware', { params });
  },
  get: async (id) => {
    const api = await getApi();
    return api.get(`/hardware/${id}`);
  },
  create: async (data) => {
    const api = await getApi();
    return api.post('/hardware', data);
  },
  update: async (id, data) => {
    const api = await getApi();
    return api.put(`/hardware/${id}`, data);
  },
  remove: async (id) => {
    const api = await getApi();
    return api.delete(`/hardware/${id}`);
  },
};

// ===== AI Chat =====
export const aiChatAPI = {
  send: async (message) => {
    const api = await getApi();
    return api.post('/ai/hardware', { message });
  },
};

export default getApi;