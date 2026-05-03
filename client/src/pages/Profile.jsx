import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import api from '../api';
import { 
  Mail, Phone, ShieldCheck, LogOut, LayoutDashboard, 
  ShoppingBag, Clock, CheckCircle2, Truck, XCircle, PackageOpen,
  Pencil, Check, X
} from 'lucide-react';

const Profile = () => {
  useDocumentTitle('DelFarm | Личный кабинет');
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Стейты для Инлайн Редактирования телефона
  const[isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const[isSavingPhone, setIsSavingPhone] = useState(false);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const response = await api.get('/orders/my-orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (user) fetchMyOrders();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Логика сохранения нового телефона
  const handleSavePhone = async () => {
    if (!newPhone.trim()) {
      toast.error('Номер телефона не может быть пустым');
      return;
    }

    setIsSavingPhone(true);
    try {
      const response = await api.put('/auth/profile', { phone_number: newPhone });
      
      updateUser(response.data.user);
      
      toast.success('Номер телефона успешно обновлен!');
      setIsEditingPhone(false);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при обновлении профиля');
    } finally {
      setIsSavingPhone(false);
    }
  };

  const startEditingPhone = () => {
    setNewPhone(user.phone_number || '');
    setIsEditingPhone(true);
  };

  if (!user) return null;

  const roleName = user.role === 'farmer' ? 'Фермер-партнер' : user.role === 'admin' ? 'Администратор' : 'Клиент';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_payment':
      case 'paid':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit"><Clock size={14}/> В обработке</span>;
      case 'confirmed':
        return <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit"><PackageOpen size={14}/> В сборке</span>;
      case 'delivering':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit"><Truck size={14}/> В доставке</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit"><CheckCircle2 size={14}/> Выполнен</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit"><XCircle size={14}/> Отменен</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold w-fit">Неизвестно</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('ru-RU', options).format(new Date(dateString));
  };

  return (
    <div className="py-10 font-sans flex-grow">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* ДАННЫЕ ПРОФИЛЯ */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
          <div className="bg-emerald-600 px-8 py-10 text-white flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-bold border-2 border-white/40 shadow-inner z-10">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="z-10">
              <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
              <div className="inline-flex items-center gap-1.5 bg-emerald-700/50 px-3 py-1 rounded-full text-sm font-medium">
                <ShieldCheck size={16} />
                {roleName}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <Mail size={16} /> Email
                </span>
                <p className="text-lg font-medium text-slate-800">{user.email}</p>
              </div>
              
              {/* БЛОК С ТЕЛЕФОНОМ И ИНЛАЙН РЕДАКТИРОВАНИЕМ */}
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <Phone size={16} /> Телефон
                </span>
                
                {isEditingPhone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="tel"
                      autoFocus
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500 w-full max-w-[200px] transition-all"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+37529..."
                      disabled={isSavingPhone}
                    />
                    <button 
                      onClick={handleSavePhone}
                      disabled={isSavingPhone}
                      className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => setIsEditingPhone(false)}
                      disabled={isSavingPhone}
                      className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group mt-1">
                    <p className="text-lg font-medium text-slate-800">
                      {user.phone_number || <span className="text-slate-400 italic">Не указан</span>}
                    </p>
                    <button 
                      onClick={startEditingPhone}
                      className="p-1.5 text-slate-300 hover:bg-slate-100 hover:text-emerald-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Редактировать номер"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
              {user.role === 'farmer' && (
                <Link to="/farmer/dashboard" className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl font-bold hover:bg-emerald-100 transition-colors">
                  <LayoutDashboard size={20} /> Панель управления фермы
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/farms" className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-4 rounded-2xl font-bold hover:bg-indigo-100 transition-colors">
                  <LayoutDashboard size={20} /> Панель Администратора
                </Link>
              )}
              <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-red-500 px-6 py-4 rounded-2xl font-bold hover:bg-red-50 transition-colors border border-slate-100 hover:border-red-100">
                <LogOut size={20} /> Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>

        {/* ИСТОРИЯ ЗАКАЗОВ */}
        <div className="mb-6 flex items-center gap-3 ml-2">
          <div className="w-10 h-10 bg-slate-200/50 text-slate-700 rounded-xl flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Моя история заказов</h2>
        </div>

        {loadingOrders ? (
          <div className="space-y-6">
            {[1, 2].map(i => <div key={i} className="bg-white h-48 rounded-[2rem] animate-pulse shadow-sm border border-slate-100"></div>)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Вы еще ничего не заказывали</h3>
            <p className="text-slate-500 mb-6">Самое время попробовать свежие фермерские продукты!</p>
            <Link to="/" className="inline-block bg-emerald-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.order_id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="bg-slate-50/50 p-6 md:px-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-400">Заказ №{order.order_id}</span>
                    <p className="font-bold text-slate-900 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="p-6 md:px-8 space-y-4">
                  {order.Order_Items?.map(item => (
                    <div key={item.order_item_id} className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                        <img 
                          src={item.Product?.image_url || `https://placehold.co/100?text=${encodeURIComponent(item.Product?.name || 'Товар')}`} 
                          alt={item.Product?.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight mb-1">
                          {item.Product?.name || 'Удаленный товар'}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-500 font-medium">
                          {item.quantity} {item.Product?.unit} <span className="mx-1 text-slate-300">×</span> {item.price_per_unit} BYN
                        </p>
                      </div>
                      <div className="font-bold text-slate-900 text-sm md:text-base">
                        {(parseFloat(item.price_per_unit) * item.quantity).toFixed(2)} <span className="text-xs text-slate-400 font-medium">BYN</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50/30 p-6 md:px-8 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Итоговая сумма:</span>
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {order.total_price} <span className="text-sm font-medium text-emerald-600/70">BYN</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;