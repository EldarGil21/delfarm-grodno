import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Tractor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Register = () => {
  useDocumentTitle('DelFarm | Регистрация');
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    role: 'client',
    farm_name: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Изменение роли по клику на карточку
  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role, farm_name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Дополнительная валидация на фронтенде
    if (formData.role === 'farmer' && !formData.farm_name.trim()) {
      toast.error('Введите название вашего хозяйства');
      return;
    }

    setLoading(true);
    
    try {
      const newUserData = await register(formData);
      toast.success('Регистрация прошла успешно!');
      
      // редирект в зависимости от роли
      if (newUserData?.role === 'farmer') {
        toast.success('Заявка отправлена на модерацию', { icon: '⏳' });
        navigate('/farmer/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Ошибка при регистрации.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 font-sans flex items-center justify-center flex-grow">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 w-full max-w-lg border border-slate-50 mx-4">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Создать аккаунт</h1>
          <p className="text-slate-500">Присоединяйтесь к сообществу DelFarm</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* ВЫБОР РОЛИ (КЛИЕНТ ИЛИ ФЕРМЕР) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-600 mb-3 ml-1">Я регистрируюсь как:</label>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Карточка Клиента */}
              <button 
                type="button" 
                onClick={() => handleRoleSelect('client')}
                className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 border-2 ${
                  formData.role === 'client' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <ShoppingBag size={28} strokeWidth={formData.role === 'client' ? 2.5 : 1.5} />
                <span className="font-bold text-sm">Покупатель</span>
              </button>

              {/* Карточка Фермера */}
              <button 
                type="button" 
                onClick={() => handleRoleSelect('farmer')}
                className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 border-2 ${
                  formData.role === 'farmer' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <Tractor size={28} strokeWidth={formData.role === 'farmer' ? 2.5 : 1.5} />
                <span className="font-bold text-sm">Фермер</span>
              </button>

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* ПОЛЯ ФОРМЫ */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Имя и Фамилия</label>
            <input 
              type="text" 
              name="full_name"
              required
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800"
              placeholder="Иван Иванов"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          {/* Условный рендеринг: Показывается только если роль "Фермер" */}
          {formData.role === 'farmer' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-emerald-700 mb-2 ml-1">Название вашего хозяйства *</label>
              <input 
                type="text" 
                name="farm_name"
                required={formData.role === 'farmer'}
                className="w-full px-5 py-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800 placeholder:text-emerald-700/40"
                placeholder="Ферма 'Зеленый Луг'"
                value={formData.farm_name}
                onChange={handleChange}
              />
              <p className="text-xs text-slate-400 mt-2 ml-1">Это название увидят покупатели в каталоге.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Телефон</label>
            <input 
              type="tel" 
              name="phone_number"
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800"
              placeholder="+375290000000"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Email</label>
            <input 
              type="email" 
              name="email"
              required
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Пароль</label>
            <input 
              type="password" 
              name="password"
              required
              minLength="6"
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800"
              placeholder="Минимум 6 символов"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center
              ${loading ? 'bg-emerald-400 text-emerald-100 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}
            `}
          >
            {loading ? 'Создание...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-8 text-sm">
          Уже есть аккаунт? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;