import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Check, X, Truck, CheckCircle2, Clock, Inbox } from 'lucide-react';
import api from '../../api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const Orders = () => {
  useDocumentTitle('DelFarm Pro | Управление заказами');
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/farmer/orders');
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        toast.error('Время сессии истекло. Войдите заново.');
      } else {
        toast.error('Ошибка при загрузке заказов');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  },[]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/farmer/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (newStatus === 'confirmed') toast.success(`Заказ #${orderId} подтвержден!`);
      else if (newStatus === 'cancelled') toast.success(`Заказ #${orderId} отменен.`);
      else if (newStatus === 'delivering') toast.success(`Заказ #${orderId} передан в доставку.`);
      else if (newStatus === 'completed') toast.success(`Заказ #${orderId} успешно завершен!`);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при обновлении статуса');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      switch (activeTab) {
        case 'new': return['pending_payment', 'paid'].includes(order.status);
        case 'active': return['confirmed', 'delivering'].includes(order.status);
        case 'completed': return order.status === 'completed';
        case 'cancelled': return order.status === 'cancelled';
        default: return true;
      }
    });
  }, [orders, activeTab]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending_payment':
      case 'paid': return <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Новый</span>;
      case 'confirmed': return <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 w-fit"><Check size={12}/> В сборке</span>;
      case 'delivering': return <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12}/> В доставке</span>;
      case 'completed': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Выполнен</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 w-fit"><X size={12}/> Отменен</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold w-fit">Неизвестно</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('ru-RU', options).format(new Date(dateString));
  };

  return (
    <div className="max-w-7xl mx-auto font-sans w-full">
      
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center">
          <ShoppingBag size={20} className="md:w-6 md:h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Управление заказами</h1>
      </div>

      {/* Вкладки Grid на мобильных */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-start gap-2 mb-6 md:mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full">
        {[
          { id: 'new', label: 'Новые' },
          { id: 'active', label: 'В работе' },
          { id: 'completed', label: 'Выполненные' },
          { id: 'cancelled', label: 'Отмененные' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex justify-center whitespace-nowrap px-4 py-2.5 md:px-6 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 text-center ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ТАБЛИЦА ДЛЯ ДЕСКТОПА (Только для xl и выше) */}
      <div className="hidden xl:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden w-full">
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="py-4 px-4 font-semibold w-24">№ Заказа</th>
                <th className="py-4 px-4 font-semibold w-48">Клиент</th>
                <th className="py-4 px-4 font-semibold">Состав заказа</th>
                <th className="py-4 px-4 font-semibold w-32 text-right">Сумма</th>
                <th className="py-4 px-4 font-semibold w-40 text-center">Статус</th>
                <th className="py-4 px-4 font-semibold text-right w-48">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-16 text-center text-slate-400">Загрузка заказов...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="py-16 text-center text-slate-400">В этой категории пока нет заказов</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={`desk-${order.order_id}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 align-top">
                      <div className="font-black text-slate-900 text-lg mb-1">#{order.order_id}</div>
                      <div className="text-[11px] text-slate-400 font-medium leading-tight">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-slate-800 mb-1 leading-tight">{order.client_name}</div>
                      <div className="text-xs text-slate-500 font-medium">{order.client_phone}</div>
                    </td>
                    <td className="py-4 px-4 align-top min-w-[200px] max-w-xs whitespace-normal break-words">
                      <ul className="space-y-1.5">
                        {order.items.map(item => (
                          <li key={item.item_id} className="text-sm flex justify-between items-start gap-2">
                            <span className="text-slate-700 font-medium whitespace-normal break-words leading-tight">{item.name}</span>
                            <span className="text-slate-500 shrink-0 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                              {item.quantity} {item.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 px-4 align-top text-right">
                      <div className="font-extrabold text-emerald-600 text-lg">{order.farm_total} <span className="text-xs text-slate-400 font-medium">BYN</span></div>
                    </td>
                    <td className="py-4 px-4 align-top flex justify-center">{renderStatusBadge(order.status)}</td>
                    <td className="py-4 px-4 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        {['pending_payment', 'paid'].includes(order.status) && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleStatusChange(order.order_id, 'cancelled')} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100"><X size={18} strokeWidth={2.5} /></button>
                            <button onClick={() => handleStatusChange(order.order_id, 'confirmed')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all active:scale-95">Подтвердить</button>
                          </div>
                        )}
                        {order.status === 'confirmed' && (
                          <button onClick={() => handleStatusChange(order.order_id, 'delivering')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2">В доставку <Truck size={16} /></button>
                        )}
                        {order.status === 'delivering' && (
                          <button onClick={() => handleStatusChange(order.order_id, 'completed')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2">Завершить <CheckCircle2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* МОБИЛЬНЫЕ КАРТОЧКИ (До xl) */}
      <div className="xl:hidden flex flex-col gap-4 w-full">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Загрузка...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100">
            <Inbox className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500 text-sm font-medium">В этой категории пока нет заказов</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={`mob-${order.order_id}`} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col w-full">
              
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-4">
                <div>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Заказ</span>
                  <div className="text-xl md:text-2xl font-black text-slate-900 leading-none">#{order.order_id}</div>
                </div>
                {renderStatusBadge(order.status)}
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-start gap-2 text-sm md:text-base">
                  <span className="text-slate-500 shrink-0">Клиент:</span>
                  <span className="font-bold text-slate-800 whitespace-normal break-words overflow-wrap-normal text-right">{order.client_name}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-slate-500 shrink-0">Телефон:</span>
                  <span className="font-medium text-slate-800">{order.client_phone}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-slate-500 shrink-0">Дата:</span>
                  <span className="font-medium text-slate-800">{formatDate(order.created_at)}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 md:p-4 mb-5 space-y-2.5 border border-slate-100">
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Состав:</p>
                {order.items.map(item => (
                  <div key={item.item_id} className="flex justify-between items-start text-xs sm:text-sm gap-4">
                    <span className="text-slate-700 font-semibold whitespace-normal break-words leading-tight">{item.name}</span>
                    <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded shadow-sm shrink-0 border border-slate-100">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-6 px-1">
                <span className="font-bold text-slate-800 text-sm md:text-base uppercase tracking-wide">Сумма:</span>
                <span className="text-2xl md:text-3xl font-extrabold text-emerald-600">{order.farm_total} <span className="text-sm font-medium text-slate-500">BYN</span></span>
              </div>

              <div className="mt-auto border-t border-slate-50 pt-5 w-full">
                {['pending_payment', 'paid'].includes(order.status) && (
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button onClick={() => handleStatusChange(order.order_id, 'confirmed')} className="w-full py-4 md:py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-md shadow-emerald-200 text-base">Подтвердить заказ</button>
                    <button onClick={() => handleStatusChange(order.order_id, 'cancelled')} className="w-full py-4 md:py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold transition-all active:scale-95 border border-red-100 text-base">Отклонить</button>
                  </div>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => handleStatusChange(order.order_id, 'delivering')} className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-blue-200 text-base">Передать в доставку <Truck size={20} /></button>
                )}
                {order.status === 'delivering' && (
                  <button onClick={() => handleStatusChange(order.order_id, 'completed')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-emerald-200 text-base">Завершить заказ <CheckCircle2 size={20} /></button>
                )}
                {['completed', 'cancelled'].includes(order.status) && (
                  <div className="text-center py-4 text-sm font-semibold text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">Действия недоступны</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Orders;