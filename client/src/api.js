import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Добавление Interceptor для запросов
api.interceptors.request.use(
  (config) => {
    // Получение токена из localStorage
    const token = localStorage.getItem('farmfood_token');
    
    // Если токен есть, он добавляется в заголовок Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Функции API
export const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке товаров:", error);
    throw error;
  }
};

export default api;