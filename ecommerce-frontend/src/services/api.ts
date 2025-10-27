import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id: number) => api.get(`/products/${id}`),
  search: (query: string) => api.get(`/products/search?q=${query}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data: { product_id: number; quantity: number }) =>
    api.post('/cart', data),
  updateCartItem: (id: number, data: { quantity: number }) =>
    api.put(`/cart/${id}`, data),
  removeFromCart: (id: number) => api.delete(`/cart/${id}`),
};

// Orders API
export const ordersAPI = {
  createOrder: (data: { shipping_address: string }) =>
    api.post('/orders', data),
  getUserOrders: () => api.get('/orders'),
  getOrderById: (id: number) => api.get(`/orders/${id}`),
};

export default api;
