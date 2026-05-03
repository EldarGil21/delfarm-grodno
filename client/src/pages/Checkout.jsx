import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const generateDeliverySlots = () => {
  const currentHour = new Date().getHours();
  const slots =[];
  
  // Если сейчас до 12:00, добавляется вечерняя доставка на сегодня
  if (currentHour < 12) {
    slots.push('Сегодня, 18:00 - 22:00');
  }
  
  // Завтрашние слоты доступны всегда
  slots.push('Завтра, 10:00 - 14:00');
  slots.push('Завтра, 14:00 - 18:00');
  slots.push('Завтра, 18:00 - 22:00');
  
  return slots;
};

const Checkout = ({ cartItems, clearCart }) => {
  useDocumentTitle('DelFarm | Оформление заказа');
  const navigate = useNavigate();

  // Логика вычисления сумм
  const itemsTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCost = itemsTotal >= 50 ? 0 : 5;
  const finalTotal = itemsTotal + deliveryCost;

  // Генерирация слотов один раз при загрузке компонента
  const availableSlots = generateDeliverySlots();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    time: availableSlots[0]
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors,[e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Имя обязательно для заполнения';
    if (!formData.address.trim()) newErrors.address = 'Укажите адрес доставки';

    const phoneRegex = /^\+375\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Формат: +375XXXXXXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Ваша корзина пуста!');
      return;
    }

    if (!validateForm()) {
      toast.error('Пожалуйста, проверьте правильность заполнения полей');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        totalPrice: finalTotal, 
        deliveryAddress: formData.address,
        deliveryTime: formData.time,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await api.post('/orders', payload);
      
      setSuccess(true);
      clearCart();
      toast.success('Заказ успешно оформлен!');

      setTimeout(() => {
        navigate('/');
      }, 4000);

    } catch (error) {
      console.error('Ошибка оформления:', error);
      toast.error('Ошибка при создании заказа. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-20 flex items-center justify-center flex-grow">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-lg mx-4 border border-emerald-50 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Заказ принят!</h2>
          <p className="text-slate-500 text-lg mb-6">Мы свяжемся с вами по телефону <b>{formData.phone}</b> для подтверждения.</p>
          <button onClick={() => navigate('/')} className="text-emerald-600 font-bold hover:underline">Вернуться в каталог</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <div className="py-32 flex-grow text-center text-slate-500 text-lg font-medium">Корзина пуста. Добавьте товары из каталога.</div>;
  }

  return (
    <div className="py-12 font-sans flex-grow">
      <div className="container mx-auto px-6 max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 ml-2">Оформление заказа</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* ЛЕВАЯ КОЛОНКА: ФОРМА */}
          <div className="flex-grow">
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
              
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-sm">1</span>
                  Контактные данные
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 ml-1">Ваше имя</label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Иван Иванов"
                      className={`w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 outline-none transition-all ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:ring-2 focus:ring-emerald-500'}`}
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 ml-1">Номер телефона</label>
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="+375291234567"
                      className={`w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 outline-none transition-all ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:ring-2 focus:ring-emerald-500'}`}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-sm">2</span>
                  Доставка
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 ml-1">Адрес доставки</label>
                    <input 
                      type="text" 
                      name="address"
                      placeholder="г. Гродно, ул. Советская 1, кв 10"
                      className={`w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 outline-none transition-all ${errors.address ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:ring-2 focus:ring-emerald-500'}`}
                      value={formData.address}
                      onChange={handleChange}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 ml-1">Время доставки</label>
                    <select 
                      name="time"
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.time}
                      onChange={handleChange}
                    >
                      {/* Динамический рендер доступных слотов времени */}
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* ПРАВАЯ КОЛОНКА: СВОДКА */}
          <div className="lg:w-[24rem] flex-shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 sticky top-28 border border-slate-50">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Ваш заказ</h2>
              
              <div className="mb-6 max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {cartItems.map(item => (
                  <div key={item.product_id} className="flex justify-between items-start text-sm">
                    <span className="text-slate-600 truncate pr-2 w-2/3 leading-tight">{item.name} <span className="text-slate-400 ml-1">x{item.quantity}</span></span>
                    <span className="font-medium text-slate-900 shrink-0">{(item.price * item.quantity).toFixed(2)} BYN</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-6 mb-8 space-y-3">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Стоимость товаров:</span>
                  <span className="text-slate-800">{itemsTotal.toFixed(2)} BYN</span>
                </div>
                
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Доставка:</span>
                  {deliveryCost === 0 ? (
                    <span className="text-emerald-600 font-semibold">Бесплатно</span>
                  ) : (
                    <span className="text-slate-800">{deliveryCost.toFixed(2)} BYN</span>
                  )}
                </div>
              </div>

              <hr className="border-slate-100 mb-6" />
              
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-slate-900">К оплате:</span>
                <span className="text-2xl font-extrabold text-emerald-600">{finalTotal.toFixed(2)} BYN</span>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
                  ${loading 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                  }`}
              >
                {loading ? 'Обработка...' : 'Подтвердить заказ'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;