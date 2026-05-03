import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Cart = ({ cartItems, removeFromCart, updateQuantity }) => {
  useDocumentTitle('DelFarm | Корзина');

  // --- Логика вычисления сумм ---
  const itemsTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCost = itemsTotal > 0 && itemsTotal < 50 ? 5 : 0;
  const finalTotal = itemsTotal + deliveryCost;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-6 py-32 text-center max-w-2xl">
        <div className="bg-white rounded-[3rem] p-12 shadow-xl shadow-slate-100 border border-slate-50">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Корзина пуста</h2>
          <p className="text-slate-500 mb-8 text-lg">Добавьте свежие фермерские продукты, чтобы начать заказ.</p>
          <Link to="/" className="inline-block bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 font-sans">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-10 tracking-tight">Ваша корзина</h1>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Левая колонка: Список товаров */}
          <div className="flex-grow space-y-6">
            {cartItems.map((item) => (
              <div key={item.product_id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 items-center hover:shadow-md transition-shadow">
                {/* Фото */}
                <div className="w-full sm:w-32 h-32 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden relative">
                  <img 
                    src={item.image_url || `https://placehold.co/150?text=${encodeURIComponent(item.name)}`} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Инфо */}
                <div className="flex-grow w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl leading-tight mb-1">{item.name}</h3>
                      <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0">
                        {item.Farm?.farm_name}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-slate-300 hover:text-red-500 transition p-2 hidden sm:block"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                    {/* Контролирование количества */}
                    <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-200">
                      <button onClick={() => updateQuantity(item.product_id, -1)} className="w-10 h-10 flex items-center justify-center font-bold text-slate-500 hover:bg-white hover:text-slate-900 rounded-xl transition">-</button>
                      <span className="w-10 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1)} className="w-10 h-10 flex items-center justify-center font-bold text-slate-500 hover:bg-white hover:text-slate-900 rounded-xl transition">+</button>
                    </div>

                    {/* Цена */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{(item.price * item.quantity).toFixed(2)} BYN</p>
                      <p className="text-sm text-slate-400">{item.price} BYN / {item.unit}</p>
                    </div>
                  </div>
                  
                  {/* Кнопка удалить для мобильных */}
                  <button 
                      onClick={() => removeFromCart(item.product_id)}
                      className="mt-4 text-red-500 text-sm font-medium sm:hidden"
                  >
                    Удалить товар
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Правая колонка: Сводка (Sticky) */}
          <div className="lg:w-[24rem] flex-shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 sticky top-28 border border-slate-50">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Ваш заказ</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 font-medium text-lg">
                  <span>Стоимость товаров:</span>
                  <span className="text-slate-800">{itemsTotal.toFixed(2)} BYN</span>
                </div>
                
                <div className="flex justify-between text-slate-500 font-medium text-lg">
                  <span>Доставка:</span>
                  {deliveryCost === 0 ? (
                    <span className="text-emerald-600 font-semibold">Бесплатно</span>
                  ) : (
                    <span className="text-slate-800">{deliveryCost.toFixed(2)} BYN</span>
                  )}
                </div>
              </div>

              <hr className="border-slate-100 mb-8" />

              <div className="flex justify-between items-center mb-10">
                <span className="text-xl font-bold text-slate-900">Итого к оплате:</span>
                <span className="text-3xl font-extrabold text-slate-900">{finalTotal.toFixed(2)} BYN</span>
              </div>

              <Link to="/checkout" className="block w-full text-center bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 active:scale-95">
                Перейти к оформлению
              </Link>
              
              {deliveryCost > 0 && (
                <p className="text-center text-sm text-slate-400 mt-4">
                  Добавьте товаров еще на <span className="font-bold text-emerald-500">{(50 - itemsTotal).toFixed(2)} BYN</span> для бесплатной доставки!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;