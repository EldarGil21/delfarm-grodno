import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingCart, PackageX, Users, 
  Bell, CheckCircle2, Clock, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api';

const Dashboard = () => {
  useDocumentTitle('DelFarm Pro | Дашборд');
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/farmer/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Ошибка загрузки дашборда:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  },[]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_payment':
      case 'paid': return <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit"><Clock size={14}/> Новые</span>;
      case 'delivering': return <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit"><AlertCircle size={14}/> В доставке</span>;
      case 'completed': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit"><CheckCircle2 size={14}/> Выполнен</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit">Отменен</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold w-fit">Неизвестно</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse w-full">
        <div className="h-10 bg-slate-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="bg-white h-32 rounded-[2rem] shadow-sm"></div>)}
        </div>
        <div className="bg-white h-96 rounded-[2rem] shadow-sm mt-8"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans w-full">
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          Добро пожаловать, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm md:text-base text-slate-500">Вот что происходит с вашим хозяйством сегодня.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        <div className="bg-white p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4">
            <ShoppingCart size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs md:text-sm font-semibold mb-1">Новые заказы</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">{stats?.newOrdersCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-sky-50 text-sky-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4">
            <TrendingUp size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs md:text-sm font-semibold mb-1">Выручка (выполнено)</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">{stats?.totalRevenue || '0.00'} <span className="text-sm md:text-lg text-slate-400 font-medium">BYN</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4">
            <Users size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs md:text-sm font-semibold mb-1">Активные клиенты</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">{stats?.activeClientsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 text-red-500 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4">
            <PackageX size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs md:text-sm font-semibold mb-1">Товаров нет в наличии</p>
            <h3 className="text-2xl md:text-3xl font-black text-red-500">{stats?.outOfStockCount || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 w-full">
        
        <div className="xl:col-span-2 bg-white rounded-3xl md:rounded-[2rem] shadow-sm border border-slate-100 p-5 md:p-8 w-full">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Последние заказы</h2>
          </div>
          
          {/* Десктоп таблица (от lg) */}
          <div className="hidden lg:block overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-sm">
                  <th className="px-4 py-3 font-semibold w-24">№ Заказа</th>
                  <th className="px-4 py-3 font-semibold">Дата</th>
                  <th className="px-4 py-3 font-semibold">Клиент</th>
                  <th className="px-4 py-3 font-semibold text-center w-32">Статус</th>
                  <th className="px-4 py-3 font-semibold text-right w-32">Сумма</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={`desk-${order.order_id}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-slate-900 align-middle">#{order.order_id}</td>
                      <td className="px-4 py-4 text-slate-500 font-medium align-middle">{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                      <td className="px-4 py-4 font-bold text-slate-700 align-middle">{order.client_name}</td>
                      <td className="px-4 py-4 align-middle flex justify-center">{getStatusBadge(order.status)}</td>
                      <td className="px-4 py-4 font-black text-emerald-600 text-right align-middle">{order.farm_total.toFixed(2)} <span className="text-xs text-slate-400 font-medium">BYN</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="py-10 text-center text-slate-400">Заказов пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Мобильные карточки (до lg) */}
          <div className="lg:hidden flex flex-col gap-4 mt-2 w-full">
            {stats?.recentOrders?.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={`mob-${order.order_id}`} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-200/60 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Заказ</span>
                      <span className="text-lg font-black text-slate-900 leading-none">#{order.order_id}</span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs text-slate-400 font-medium mb-0.5">{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
                      <span className="text-base font-bold text-slate-800 whitespace-normal break-words overflow-wrap-normal leading-tight">{order.client_name}</span>
                    </div>
                    <span className="text-xl font-extrabold text-emerald-600 shrink-0 whitespace-nowrap mt-1">
                      {order.farm_total.toFixed(2)} <span className="text-xs font-medium text-slate-500">BYN</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm">Заказов пока нет</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl md:rounded-[2rem] shadow-sm border border-slate-100 p-5 md:p-8 flex flex-col w-full h-fit">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="text-amber-500" size={20} />
              Уведомления
            </h2>
          </div>

          <div className="space-y-3 flex-grow">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-800 font-bold mb-1">Добро пожаловать в DelFarm Pro!</p>
              <p className="text-xs text-slate-500 leading-relaxed">Ваша панель управления успешно активирована.</p>
            </div>
            
            {stats?.outOfStockCount > 0 && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-sm text-red-800 font-bold mb-1">Закончились товары ({stats.outOfStockCount} шт.)</p>
                <p className="text-xs text-red-600 leading-relaxed">Срочно пополните остатки в разделе "Мои товары", чтобы не терять продажи.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;