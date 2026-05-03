import React from 'react';
import { Truck, Clock, CreditCard, MapPin, CheckCircle2 } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const DeliveryInfo = () => {
  useDocumentTitle('DelFarm | Доставка и оплата');

  return (
    <div className="py-12 font-sans flex-grow">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Доставка и оплата
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Мы стараемся сделать процесс покупки максимально прозрачным и удобным. Ознакомьтесь с нашими правилами работы по городу Гродно.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Блок: Условия доставки */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex-shrink-0 flex items-center justify-center">
              <Truck size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Условия доставки</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Доставка осуществляется курьерами нашей платформы в специальных термосумках, что гарантирует сохранность температурного режима для молочных и мясных продуктов.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <MapPin className="text-emerald-500" size={20} /> Зона доставки: <span className="font-bold">г. Гродно (в пределах города)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-emerald-500" size={20} /> Стоимость доставки: <span className="font-bold">Бесплатно при заказе от 50 BYN</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-emerald-500" size={20} /> Базовая стоимость: <span className="font-bold">5 BYN (для заказов до 50 BYN)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* БЛОК: График работы */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex-shrink-0 flex items-center justify-center">
              <Clock size={32} />
            </div>
            <div className="w-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">График формирования заказов</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Поскольку фермерские продукты собираются специально под ваш заказ, мы работаем по следующему графику:
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100">
                <ul className="space-y-5 text-slate-700">
                  
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 text-xl font-bold mt-[-2px]">•</span>
                    <span className="leading-relaxed font-medium">
                      При заказе <b className="text-slate-900">до 12:00</b> — возможна доставка сегодня вечером (18:00 - 22:00).
                    </span>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 text-xl font-bold mt-[-2px]">•</span>
                    <div>
                      <span className="leading-relaxed font-medium block mb-2">
                        При заказе <b className="text-slate-900">после 12:00</b> — доставка осуществляется на следующий день в выбранный вами интервал:
                      </span>
                      <ul className="ml-2 space-y-2 mt-3">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          <span className="w-16 font-bold text-slate-600">Утро:</span> 
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm shadow-sm font-bold">10:00 - 14:00</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          <span className="w-16 font-bold text-slate-600">День:</span> 
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm shadow-sm font-bold">14:00 - 18:00</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          <span className="w-16 font-bold text-slate-600">Вечер:</span> 
                          <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm shadow-sm font-bold">18:00 - 22:00</span>
                        </li>
                      </ul>
                    </div>
                  </li>

                </ul>
              </div>
            </div>
          </div>

          {/* Блок: Оплата */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0 flex items-center justify-center">
              <CreditCard size={32} />
            </div>
            <div className="w-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Способы оплаты</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Оплата производится при получении и проверке заказа.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                  <h3 className="font-bold text-slate-800 mb-1 text-lg">Наличными курьеру</h3>
                  <p className="text-sm text-slate-500 font-medium">Оплата наличными средствами при передаче пакетов.</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                  <h3 className="font-bold text-slate-800 mb-1 text-lg">Картой курьеру</h3>
                  <p className="text-sm text-slate-500 font-medium">У курьера всегда при себе терминал для банковских карт.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;