import React, { useState, useEffect } from 'react';
import { Leaf, Heart, ShieldCheck, Tractor, Loader2 } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import api from '../api';

const FarmersInfo = () => {
  useDocumentTitle('DelFarm | О фермерах');

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка списка одобренных хозяйств
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await api.get('/farmer/public-list');
        setFarms(response.data);
      } catch (error) {
        console.error('Ошибка загрузки фермеров:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  },[]);

  return (
    <div className="py-12 font-sans flex-grow">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Секция Миссии (Статичная) */}
        <section className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100 mb-16 text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Наша миссия
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Проект <span className="font-bold text-slate-800">DelFarm</span> создан для того, чтобы сократить путь продуктов от грядки до вашего стола. Мы лично знакомимся с каждым фермером Гродненской области, чтобы гарантировать вам высочайшее качество, экологичность и превосходный вкус.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-slate-50">
            <div className="flex flex-col items-center text-center">
              <ShieldCheck className="text-emerald-500 mb-3" size={32} />
              <h3 className="font-bold text-slate-800 text-lg mb-2">Строгий отбор</h3>
              <p className="text-slate-500 text-sm">Мы работаем только с проверенными хозяйствами.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Heart className="text-pink-500 mb-3" size={32} />
              <h3 className="font-bold text-slate-800 text-lg mb-2">С любовью к делу</h3>
              <p className="text-slate-500 text-sm">Продукты выращиваются с душой и заботой о природе.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Leaf className="text-emerald-500 mb-3" size={32} />
              <h3 className="font-bold text-slate-800 text-lg mb-2">100% Эко</h3>
              <p className="text-slate-500 text-sm">Никаких вредных пестицидов и консервантов.</p>
            </div>
          </div>
        </section>

        {/* Секция Партнеров (Динамическая) */}
        <section>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10 text-center">Наши партнеры</h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
          ) : farms.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-12 text-center shadow-sm border border-slate-100 max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tractor size={40} />
              </div>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Мы активно работаем над привлечением лучших фермерских хозяйств Гродно. Скоро здесь будет много интересного!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {farms.map(farm => (
                <div key={farm.farm_id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 group flex flex-col">
                  
                  {/* Изображение фермы */}
                  <div className="h-64 overflow-hidden relative bg-slate-100">
                    <img 
                      src={farm.logo_url || `https://placehold.co/800x600/f1f5f9/94a3b8?text=${encodeURIComponent(farm.farm_name)}`} 
                      alt={farm.farm_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent"></div>
                    <div className="absolute bottom-5 left-6 right-6 text-white">
                      <h3 className="text-2xl font-bold leading-tight mb-1 whitespace-normal break-words">{farm.farm_name}</h3>
                      <p className="text-sm font-medium text-emerald-300 flex items-center gap-1.5">
                        {farm.User?.full_name}
                      </p>
                    </div>
                  </div>
                  
                  {/* Описание */}
                  <div className="p-8 flex-grow flex flex-col">
                    <p className="text-slate-600 leading-relaxed whitespace-normal break-words">
                      {farm.description || <span className="italic text-slate-400">Информация о хозяйстве скоро появится...</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default FarmersInfo;