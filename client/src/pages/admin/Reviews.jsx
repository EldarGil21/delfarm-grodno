import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquare, Trash2, Star, User } from 'lucide-react';
import api from '../../api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const AdminReviews = () => {
  useDocumentTitle('DelFarm Admin | Модерация отзывов');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('/admin/reviews');
        setReviews(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Ошибка при загрузке отзывов');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  },[]);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот отзыв навсегда?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(reviews.filter(r => r.review_id !== id));
      toast.success('Отзыв успешно удален!');
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при удалении отзыва');
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('ru-RU', options).format(new Date(dateString));
  };

  return (
    <div className="max-w-7xl mx-auto font-sans w-full">
      
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-100 text-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0">
          <MessageSquare className="w-6 h-6 lg:w-7 lg:h-7" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Модерация отзывов</h1>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Загрузка отзывов...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white py-20 rounded-[2rem] shadow-sm border border-slate-100 text-center mx-2">
          <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-800 mb-2">Платформа пока без отзывов</p>
        </div>
      ) : (
        <>
          {/* ТАБЛИЦА (Для десктопов lg+) */}
          <div className="hidden lg:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm">
                    <th className="py-4 px-6 font-semibold w-1/5">Товар</th>
                    <th className="py-4 px-6 font-semibold w-48">Автор / Дата</th>
                    <th className="py-4 px-6 font-semibold w-32">Оценка</th>
                    <th className="py-4 px-6 font-semibold">Текст отзыва</th>
                    <th className="py-4 px-6 font-semibold text-right w-24">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={`desk-${review.review_id}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6 align-top">
                        <div className="font-bold text-slate-900 leading-tight whitespace-normal break-words">
                          {review.Product?.name || <span className="text-red-400 italic">Товар удален</span>}
                        </div>
                      </td>
                      <td className="py-5 px-6 align-top">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 whitespace-normal break-words">
                          <User size={14} className="text-slate-400 shrink-0" />
                          <span>{review.User?.full_name || 'Удаленный польз.'}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {formatDate(review.created_at)}
                        </div>
                      </td>
                      <td className="py-5 px-6 align-top">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={16} className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                          ))}
                        </div>
                      </td>
                      <td className="py-5 px-6 align-top text-sm text-slate-600 leading-relaxed whitespace-normal break-words max-w-md">
                        {review.comment ? (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">{review.comment}</div>
                        ) : (
                          <span className="text-slate-400 italic">Без комментария</span>
                        )}
                      </td>
                      <td className="py-5 px-6 align-top text-right">
                        <button 
                          onClick={() => handleDelete(review.review_id)}
                          className="p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all active:scale-95"
                        >
                          <Trash2 size={20} strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* КАРТОЧКИ (Для мобильных и планшетов до lg) */}
          <div className="lg:hidden flex flex-col gap-4 w-full">
            {reviews.map((review) => (
              <div key={`mob-${review.review_id}`} className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col w-full">
                
                <div className="flex justify-between items-start gap-4 mb-4 border-b border-slate-50 pb-3">
                  <div className="font-bold text-slate-900 text-lg leading-tight whitespace-normal break-words flex-1">
                    {review.Product?.name || <span className="text-red-400 italic">Товар удален</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium shrink-0 text-right mt-1">
                    {formatDate(review.created_at)}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="font-bold text-slate-800 flex items-center gap-2 whitespace-normal break-words text-sm">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                      <User size={14} />
                    </div>
                    <span>{review.User?.full_name || 'Удаленный польз.'}</span>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={14} className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  {review.comment ? (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-600 whitespace-normal break-words leading-relaxed">
                      {review.comment}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 italic px-2">Без комментария</span>
                  )}
                </div>

                <div className="mt-auto border-t border-slate-50 pt-4 w-full flex">
                  <button 
                    onClick={() => handleDelete(review.review_id)}
                    className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-100"
                  >
                    <Trash2 size={18} /> Удалить отзыв
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

export default AdminReviews;