import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.tsx'


// Налаштовуємо базову URL-адресу для всіх запитів
axios.defaults.baseURL = 'http://localhost:5000';

// Створюємо перехоплювач запитів (Interceptor)
axios.interceptors.request.use((config) => {
  // Дістаємо токен з пам'яті браузера
  const token = localStorage.getItem('agro_token');
  
  // Якщо токен є, додаємо його до заголовків
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Додатково: обробка помилок (якщо токен "протух", викидаємо користувача)
axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    // Очищаємо дані й перезавантажуємо сторінку, щоб App.tsx показав Login
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    window.location.href = '/'; 
  }
  return Promise.reject(error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)