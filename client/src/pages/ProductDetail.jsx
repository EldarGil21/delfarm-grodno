import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Star, MessageSquare, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Стейты для формы отзыва
  const [rating, setRating] = useState(5);
  const[comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useDocumentTitle(product ? `DelFarm | ${product.name}` : 'DelFarm | Загрузка...');

  
  const loadProduct = useCallback(async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
      toast.error('Не удалось загрузить товар');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);


  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error('Пожалуйста, войдите в систему');
      navigate('/login');
    } else {
      addToCart(product, quantity);
    }
  };

  // Отправка отзыва
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Пожалуйста, напишите комментарий');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        product_id: product.product_id,
        rating,
        comment
      });
      toast.success('Спасибо! Ваш отзыв опубликован.');
      setComment('');
      setRating(5);
      loadProduct();
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при отправке отзыва');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Вспомогательная функция для форматирования даты
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('ru-RU', options).format(new Date(dateString));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-slate-500">Товар не найден</div>;

  // Высчитывание среднего рейтинга
  const avgRating = product.Reviews && product.Reviews.length > 0
    ? (product.Reviews.reduce((acc, r) => acc + r.rating, 0) / product.Reviews.length).toFixed(1)
    : null;

  return (
    <div className="font-sans pb-20">
      <main className="container mx-auto px-6 py-10 max-w-6xl">
        
        <nav className="flex items-center text-sm text-slate-400 mb-8 font-medium">
          <Link to="/" className="hover:text-emerald-600 transition">Каталог</Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="hover:text-emerald-600 cursor-pointer">{product.Category?.name}</span>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-slate-800">{product.name}</span>
        </nav>

        {/* --- ОСНОВНОЙ БЛОК ТОВАРА --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Фото */}
            <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden relative group border border-slate-100">
              <img 
                 src={product.image_url || `https://placehold.co/800x800/f1f5f9/334155?text=${encodeURIComponent(product.name)}`}
                 alt={product.name}
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Инфо */}
            <div className="flex flex-col justify-center">
              
              {/* Фермер */}
              <div className="flex items-center gap-3 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-100/50">
                <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold">
                  {product.Farm?.farm_name.charAt(0)}
                </div>
                <span className="text-emerald-800 font-bold text-sm">
                  {product.Farm?.farm_name}
                </span>
                <ShieldCheck size={16} className="text-emerald-600" />
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Рейтинг (Звезды) под названием */}
              {avgRating && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-yellow-400">
                    <Star className="fill-yellow-400" size={20} />
                  </div>
                  <span className="font-bold text-slate-700 text-lg">{avgRating}</span>
                  <span className="text-slate-400 text-sm">({product.Reviews.length} отзывов)</span>
                </div>
              )}

              <div className="text-3xl font-extrabold text-emerald-600 mb-8 flex items-end gap-2">
                {product.price} <span className="text-xl text-slate-400 font-medium mb-1 tracking-normal">BYN / {product.unit}</span>
              </div>

              <div className="prose prose-slate text-slate-500 mb-10 leading-relaxed text-lg">
                <p>{product.description || "Натуральный фермерский продукт высшего качества. Выращен с любовью и заботой о вашем здоровье."}</p>
              </div>

              {/* Контролы покупки */}
              <div className="flex flex-col sm:flex-row gap-6 border-t border-slate-100 pt-10">
                
                <div className="flex items-center bg-slate-50 rounded-2xl p-1 w-fit border border-slate-200">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="w-14 h-14 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-xl"
                  >-</button>
                  <span className="w-12 text-center font-bold text-slate-900 text-xl">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="w-14 h-14 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-xl"
                  >+</button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  В корзину
                  <span className="bg-emerald-500 px-3 py-1 rounded-xl text-sm border border-emerald-400">
                    {(product.price * quantity).toFixed(2)} BYN
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* --- СИСТЕМА ОТЗЫВОВ --- */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Отзывы покупателей</h2>
          </div>

          <div className="space-y-8">
            
            {/* ФОРМА ОСТАВЛЕНИЯ ОТЗЫВА */}
            {isLoggedIn && user?.role === 'client' ? (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-emerald-100/50">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Оставить свой отзыв</h3>
                <form onSubmit={handleReviewSubmit}>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-slate-500 font-medium mr-2">Оценка:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          onClick={() => setRating(star)}
                          className={`cursor-pointer w-8 h-8 transition-all hover:scale-110 active:scale-95 ${
                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  <textarea 
                    rows="3" 
                    placeholder="Напишите, что вы думаете об этом продукте..."
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-slate-700 mb-4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>

                  <button 
                    type="submit"
                    disabled={submittingReview}
                    className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md ${
                      submittingReview ? 'bg-slate-300' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300 active:scale-95'
                    }`}
                  >
                    {submittingReview ? 'Отправка...' : 'Опубликовать'}
                  </button>
                </form>
              </div>
            ) : !isLoggedIn ? (
              <div className="bg-slate-100 p-6 rounded-2xl text-center border border-slate-200">
                <p className="text-slate-500">
                  <Link to="/login" className="text-emerald-600 font-bold hover:underline">Войдите в систему</Link>, чтобы оставить отзыв.
                </p>
              </div>
            ) : null}

            {/* СПИСОК ОТЗЫВОВ */}
            {product.Reviews && product.Reviews.length > 0 ? (
              <div className="space-y-4">
                {product.Reviews.map(review => (
                  <div key={review.review_id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                          {review.User?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{review.User?.full_name}</p>
                          <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      
                      {/* Оценка в звездах */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={16}
                            className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-200">
                <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Отзывов пока нет</h3>
                <p className="text-slate-500">Будьте первым, кто поделится впечатлениями!</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;