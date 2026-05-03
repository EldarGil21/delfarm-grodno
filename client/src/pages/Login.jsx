import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Login = () => {
  useDocumentTitle('DelFarm | Вход');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Сохранение предыдущего маршрута (если клиент пытался зайти в корзину без авторизации)
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userData = await login(email, password);
      toast.success('Успешный вход!');
      
      // РЕДИРЕКТ НА ОСНОВЕ РОЛИ
      if (userData?.role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else if (userData?.role === 'admin') {
        navigate('/admin/farms', { replace: true });
      } else {
        navigate(from, { replace: true });
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Ошибка при входе. Проверьте данные.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 font-sans flex items-center justify-center flex-grow">
      <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 w-full max-w-md border border-slate-50 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">С возвращением!</h1>
          <p className="text-slate-500">Введите свои данные для входа</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Пароль</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center
              ${loading ? 'bg-emerald-400 text-emerald-100 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}
            `}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-8 text-sm">
          Нет аккаунта? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;