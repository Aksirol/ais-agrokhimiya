import { useState } from 'react';
import axios from 'axios';

// Описуємо, що наша сторінка приймає функцію onLogin від головного App
interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Відправляємо запит на наш новий API авторизації
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      // Якщо успішно, передаємо токен і дані користувача нагору в App.tsx
      onLogin(response.data.token, response.data.user);
      
    } catch (err: any) {
      // Якщо сервер повернув помилку (наприклад, 401 Невірний пароль)
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Помилка підключення до сервера');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        {/* Логотип і заголовок */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-agro-dark rounded-lg flex items-center justify-center text-white text-2xl mb-3 shadow-sm">
            💧
          </div>
          <h1 className="text-2xl font-bold text-gray-800">АІС "Агрохімія"</h1>
          <p className="text-gray-500 text-sm mt-1">Вхід у систему</p>
        </div>

        {/* Повідомлення про помилку */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-agro-light focus:border-transparent"
              placeholder="ivan@agro.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-agro-light focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-2.5 rounded-md text-white font-medium mt-2 transition-colors ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-agro-dark hover:bg-opacity-90'
            }`}
          >
            {isLoading ? 'Перевірка...' : 'Увійти'}
          </button>
        </form>

      </div>
    </div>
  );
}