import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, ShoppingBasket, Sprout, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchProducts } from '../api';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Home = ({ addToCart }) => {
  useDocumentTitle('DelFarm | Каталог фермерской продукции');

  const[products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedFarmer, setSelectedFarmer] = useState('all');
  const[sortOption, setSortOption] = useState('popular');

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  },[]);

  useEffect(() => {
    if (!loading) {
      const savedPosition = sessionStorage.getItem('homeScrollPosition');
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition, 10));
      }
    }
  }, [loading]);

  useEffect(() => {
    return () => {
      sessionStorage.setItem('homeScrollPosition', window.scrollY);
    };
  }, []);

  const categories = useMemo(() => {
    return['Все', ...new Set(products.map(p => p.Category?.name).filter(Boolean))];
  }, [products]);

  const farmers = useMemo(() => {
    return['Все фермеры', ...new Set(products.map(p => p.Farm?.farm_name).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.Farm?.farm_name.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'Все') {
      result = result.filter(p => p.Category?.name === selectedCategory);
    }

    if (selectedFarmer !== 'all') {
      result = result.filter(p => p.Farm?.farm_name === selectedFarmer);
    }

    switch (sortOption) {
      case 'cheap':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'expensive':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.product_id - a.product_id);
        break;
    }

    return result;
  },[products, searchQuery, selectedCategory, selectedFarmer, sortOption]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Пожалуйста, войдите в систему');
      navigate('/login');
    } else {
      addToCart(product);
    }
  };

  return (
    <div className="min-h-screen font-sans w-full overflow-x-hidden">
      
      {/* --- HERO Секция --- */}
      <section className="bg-white pt-8 pb-10 md:pt-12 md:pb-16 px-4 md:px-6 rounded-b-[2rem] md:rounded-b-[3rem] shadow-sm mb-8 md:mb-12 border-b border-slate-100">
        <div className="container mx-auto max-w-6xl w-full">
          
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 md:mb-4 tracking-tight leading-tight">
              Свежие продукты <br className="hidden md:block"/> от местных фермеров
            </h1>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto px-2">
              Натуральный вкус, честные цены и поддержка локального производителя.
            </p>
          </div>

          {/* Строка поиска (Адаптивная) */}
          <div className="relative w-full max-w-2xl mx-auto mb-6 md:mb-8 shadow-xl shadow-slate-200/60 rounded-2xl transition-transform hover:scale-[1.01]">
            <input 
              type="text" 
              placeholder="Найти молоко, сыр, овощи..." 
              className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-3.5 md:py-4 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-base md:text-lg outline-none transition-all placeholder:text-slate-400 text-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 md:left-5 top-4 md:top-5 text-emerald-500 w-5 h-5 md:w-6 md:h-6" />
          </div>

          {/* Панель фильтров: Колонка на мобилках, строка на десктопе */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6 w-full">
            
            {/* 1. Категории */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 w-full lg:w-auto">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 border ${
                    selectedCategory === cat 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 2. Дополнительные фильтры (Selects) */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-auto">
              {/* Выбор фермера */}
              <div className="relative w-full sm:w-auto sm:min-w-[200px] group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Sprout size={18} />
                </div>
                <select 
                  className="w-full pl-10 pr-10 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer transition-all hover:border-emerald-300 truncate"
                  value={selectedFarmer}
                  onChange={(e) => setSelectedFarmer(e.target.value)}
                >
                  <option value="all">Все фермеры</option>
                  {farmers.filter(f => f !== 'Все фермеры').map(farmer => (
                    <option key={farmer} value={farmer}>{farmer}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>

              {/* Сортировка */}
              <div className="relative w-full sm:w-auto sm:min-w-[200px] group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <ArrowUpDown size={18} />
                </div>
                <select 
                  className="w-full pl-10 pr-10 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer transition-all hover:border-emerald-300"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="popular">По популярности</option>
                  <option value="cheap">Сначала дешевле</option>
                  <option value="expensive">Сначала дороже</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- СЕТКА ТОВАРОВ --- */}
      <main className="container mx-auto px-4 md:px-6 pb-20 w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8 px-1 md:px-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBasket className="text-emerald-600" size={24} />
            Каталог
          </h2>
          <span className="text-slate-500 text-xs md:text-sm bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm w-fit">
            Найдено: <span className="font-bold text-slate-800">{filteredProducts.length}</span>
          </span>
        </div>

        {loading ? (
          /* Адаптивный Скелетон: 1 колонка -> 2 -> 3 -> 4 */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white h-[22rem] md:h-[26rem] rounded-2xl md:rounded-3xl animate-pulse shadow-sm border border-slate-100"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center bg-white rounded-2xl md:rounded-[2.5rem] border border-dashed border-slate-200 mx-1 md:mx-2 px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <Filter className="text-slate-300 w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Ничего не найдено</h3>
            <p className="text-sm md:text-base text-slate-500 max-w-md mb-6 md:mb-8">
              Мы не нашли товаров, соответствующих вашим фильтрам. Попробуйте изменить категорию или поисковый запрос.
            </p>
            <button 
              onClick={() => {
                setSearchQuery(''); 
                setSelectedCategory('Все');
                setSelectedFarmer('all');
              }} 
              className="px-5 py-2.5 md:px-6 md:py-3 bg-emerald-50 text-emerald-700 text-sm md:text-base font-bold rounded-xl hover:bg-emerald-100 transition-colors w-full sm:w-auto"
            >
              Сбросить все фильтры
            </button>
          </div>
        ) : (
          /* Адаптивная Сетка: 1 колонка мобильные, 2 планшеты, 3/4 десктоп */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <Link 
                to={`/product/${product.product_id}`} 
                key={product.product_id} 
                className="group bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 border border-slate-100 hover:border-emerald-200 flex flex-col h-full relative"
              >
                <div className="aspect-square bg-slate-50 rounded-xl md:rounded-2xl overflow-hidden relative mb-3 md:mb-4">
                  <img 
                    src={product.image_url || `https://placehold.co/400x400/f1f5f9/94a3b8?text=${encodeURIComponent(product.name)}`} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-bold rounded-md md:rounded-lg text-slate-700 shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {product.Category?.name}
                  </span>
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="mb-1.5 md:mb-2 flex items-center gap-2">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-emerald-700">
                      {product.Farm?.farm_name.charAt(0)}
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wide truncate">
                      {product.Farm?.farm_name}
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between pt-3 md:pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] md:text-xs font-medium">Цена за {product.unit}</span>
                      <span className="text-lg md:text-xl font-extrabold text-slate-900">{product.price} <span className="text-xs md:text-sm font-normal text-slate-500">BYN</span></span>
                    </div>
                    
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-slate-50 text-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-emerald-200 active:scale-95 group/btn"
                    >
                      <ShoppingBasket className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover/btn:-translate-y-0.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;