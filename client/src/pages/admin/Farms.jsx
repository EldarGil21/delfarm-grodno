import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldAlert, CheckCircle, XCircle, Store, Mail, Phone, Clock } from 'lucide-react';
import api from '../../api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const AdminFarms = () => {
  useDocumentTitle('DelFarm Admin | Заявки фермеров');
  const [farms, setFarms] = useState([]);
  const[loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingFarms = async () => {
      try {
        const response = await api.get('/admin/farms/pending');
        setFarms(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Ошибка при загрузке заявок фермеров');
      } finally {
        setLoading(false);
      }
    };
    fetchPendingFarms();
  },[]);

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/admin/farms/${id}/verify`, { status });
      setFarms(farms.filter(farm => farm.farm_id !== id));
      if (status === 'approved') {
        toast.success('Хозяйство успешно одобрено!');
      } else {
        toast.success('Заявка хозяйства отклонена.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при изменении статуса');
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-sans w-full">
      
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-100 text-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6 lg:w-7 lg:h-7" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Заявки на регистрацию</h1>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Загрузка заявок...</div>
      ) : farms.length === 0 ? (
        <div className="bg-white py-20 rounded-[2rem] shadow-sm border border-slate-100 text-center mx-2">
          <Store className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-800 mb-2">Новых заявок пока нет</p>
          <p className="text-slate-500">Все фермерские хозяйства проверены.</p>
        </div>
      ) : (
        <>
          {/* ТАБЛИЦА (Для десктопов lg+) */}
          <div className="hidden lg:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm">
                    <th className="py-4 px-6 font-semibold w-1/4">Название хозяйства</th>
                    <th className="py-4 px-6 font-semibold w-1/4">Владелец</th>
                    <th className="py-4 px-6 font-semibold w-1/3">Описание</th>
                    <th className="py-4 px-6 font-semibold text-right w-32">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {farms.map((farm) => (
                    <tr key={`desk-${farm.farm_id}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6 align-top">
                        <div className="font-bold text-slate-900 text-lg mb-1 whitespace-normal break-words">{farm.farm_name}</div>
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                          <Clock size={12}/> Ожидает
                        </span>
                      </td>
                      <td className="py-5 px-6 align-top min-w-0">
                        <div className="font-bold text-slate-800 mb-2 whitespace-normal break-words">{farm.User?.full_name}</div>
                        <div className="flex flex-col gap-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5"><Mail size={14}/> <span className="truncate">{farm.User?.email}</span></span>
                          <span className="flex items-center gap-1.5"><Phone size={14}/> {farm.User?.phone_number || 'Не указан'}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 align-top text-sm text-slate-600 leading-relaxed whitespace-normal break-words max-w-sm">
                        {farm.description || <span className="text-slate-400 italic">Описание отсутствует</span>}
                      </td>
                      <td className="py-5 px-6 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleVerify(farm.farm_id, 'approved')}
                            title="Одобрить заявку"
                            className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-emerald-200 active:scale-95"
                          >
                            <CheckCircle size={22} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleVerify(farm.farm_id, 'rejected')}
                            title="Отклонить заявку"
                            className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-red-200 active:scale-95"
                          >
                            <XCircle size={22} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* КАРТОЧКИ (Для мобильных и планшетов до lg) */}
          <div className="lg:hidden flex flex-col gap-4 w-full">
            {farms.map((farm) => (
              <div key={`mob-${farm.farm_id}`} className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col w-full">
                
                {/* Шапка карточки */}
                <div className="flex justify-between items-start gap-4 mb-4 border-b border-slate-50 pb-4">
                  <h3 className="font-bold text-slate-900 text-lg sm:text-xl leading-tight whitespace-normal break-words flex-1">
                    {farm.farm_name}
                  </h3>
                  <span className="shrink-0 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12}/> Ожидает
                  </span>
                </div>

                {/* Владелец */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                  <div className="font-bold text-slate-800 text-sm mb-2">{farm.User?.full_name}</div>
                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400 shrink-0"/> <span className="break-all">{farm.User?.email}</span></div>
                    <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400 shrink-0"/> <span>{farm.User?.phone_number || 'Не указан'}</span></div>
                  </div>
                </div>

                {/* Описание */}
                <div className="mb-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Описание:</span>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-normal break-words">
                    {farm.description || <span className="italic text-slate-400">Отсутствует</span>}
                  </p>
                </div>

                {/* Действия */}
                <div className="mt-auto border-t border-slate-50 pt-5 w-full flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => handleVerify(farm.farm_id, 'approved')}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-emerald-200"
                  >
                    <CheckCircle size={20} /> Одобрить
                  </button>
                  <button 
                    onClick={() => handleVerify(farm.farm_id, 'rejected')}
                    className="w-full py-3.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <XCircle size={20} /> Отклонить
                  </button>
                </div>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminFarms;