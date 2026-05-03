import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, Image as ImageIcon, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const CATEGORIES =[
  { id: 1, name: 'Овощи' }, { id: 2, name: 'Фрукты' }, 
  { id: 3, name: 'Молочные продукты' }, { id: 4, name: 'Мясо' }, 
  { id: 5, name: 'Зелень' }, { id: 6, name: 'Яйца' }
];

const Products = () => {
  useDocumentTitle('DelFarm Pro | Мои товары');
  
  const[products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const[searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', unit: 'кг', stock_quantity: '', category_id: 1, image_url: ''
  });

  const[editingStockId, setEditingStockId] = useState(null);
  const [editStockValue, setEditStockValue] = useState('');

  const fetchMyProducts = async () => {
    try {
      const response = await api.get('/farmer/products');
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        toast.error('Время сессии истекло, пожалуйста, войдите заново');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Профиль фермы не найден');
      } else {
        toast.error('Ошибка загрузки товаров');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  },[]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = stockFilter === 'all' 
        ? true 
        : stockFilter === 'in_stock' ? p.stock_quantity > 0 : p.stock_quantity === 0;
      return matchesSearch && matchesStock;
    });
  }, [products, searchQuery, stockFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await api.delete(`/farmer/products/${id}`);
        setProducts(products.filter(p => p.product_id !== id));
        toast.success('Товар удален');
      } catch (error) {
        console.error(error);
        toast.error('Ошибка при удалении');
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const formattedPrice = formData.price.toString().replace(',', '.');
    
    if (isNaN(parseFloat(formattedPrice))) {
      toast.error('Неверный формат цены');
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formattedPrice).toFixed(2),
      category_id: parseInt(formData.category_id, 10),
      stock_quantity: parseInt(formData.stock_quantity, 10) || 0
    };

    try {
      await api.post('/farmer/products', payload);
      toast.success('Товар успешно добавлен!');
      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: '', unit: 'кг', stock_quantity: '', category_id: 1, image_url: '' });
      fetchMyProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Ошибка при добавлении товара');
    }
  };

  const startEditingStock = (product) => {
    setEditingStockId(product.product_id);
    setEditStockValue(product.stock_quantity);
  };

  const handleStockKeyDown = async (e, productId) => {
    if (e.key === 'Escape') setEditingStockId(null);
    if (e.key === 'Enter') {
      try {
        const newStock = parseInt(editStockValue, 10);
        if (isNaN(newStock) || newStock < 0) {
          toast.error('Введите корректное число');
          return;
        }
        await api.put(`/farmer/products/${productId}`, { stock_quantity: newStock });
        setProducts(products.map(p => p.product_id === productId ? { ...p, stock_quantity: newStock } : p));
        setEditingStockId(null);
        toast.success('Остаток обновлен');
      } catch (error) {
        console.error(error);
        toast.error('Ошибка обновления остатка');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-sans relative w-full">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Мои товары</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          <Plus size={20} /> Добавить новый товар
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Поиск по названию..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
        </div>

        <select 
          className="w-full md:w-auto px-6 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium cursor-pointer"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="all">Все товары</option>
          <option value="in_stock">В наличии</option>
          <option value="out_of_stock">Нет в наличии</option>
        </select>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400">Загрузка...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white py-16 rounded-[2rem] border border-slate-100 text-center shadow-sm">
          <p className="text-lg text-slate-500">Товары не найдены</p>
        </div>
      ) : (
        <>
          {/* ТАБЛИЦА ДЛЯ ПК (lg и выше) */}
          <div className="hidden lg:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm">
                    <th className="py-4 px-4 font-semibold w-16">Фото</th>
                    <th className="py-4 px-4 font-semibold">Название</th>
                    <th className="py-4 px-4 font-semibold">Категория</th>
                    <th className="py-4 px-4 font-semibold">Цена</th>
                    <th className="py-4 px-4 font-semibold">Остаток</th>
                    <th className="py-4 px-4 font-semibold text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={`desk-${product.product_id}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img 
                            src={product.image_url || `https://placehold.co/100?text=${encodeURIComponent(product.name)}`} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 whitespace-normal break-words max-w-xs leading-snug">
                        {product.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap">
                          {product.Category?.name || 'Без категории'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 whitespace-nowrap">
                        {product.price} BYN <span className="text-slate-400 text-xs font-normal">/ {product.unit}</span>
                      </td>
                      <td className="py-3 px-4">
                        {editingStockId === product.product_id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" autoFocus
                              className="w-20 px-2 py-1 border-2 border-emerald-500 rounded-lg outline-none font-bold text-slate-800"
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(e.target.value)}
                              onKeyDown={(e) => handleStockKeyDown(e, product.product_id)}
                              onBlur={() => setEditingStockId(null)}
                            />
                            <Check size={16} className="text-emerald-500" />
                          </div>
                        ) : (
                          <div 
                            onClick={() => startEditingStock(product)}
                            className={`cursor-pointer px-3 py-1.5 rounded-lg inline-block font-bold border border-transparent hover:border-slate-300 hover:bg-white transition-all whitespace-nowrap ${
                              product.stock_quantity > 0 ? 'text-slate-800 bg-slate-100' : 'text-red-600 bg-red-50'
                            }`}
                            title="Нажмите, чтобы изменить (Enter для сохранения)"
                          >
                            {product.stock_quantity} шт.
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDelete(product.product_id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* КАРТОЧКИ ДЛЯ МОБИЛЬНЫХ И ПЛАНШЕТОВ (До lg) */}
          <div className="lg:hidden flex flex-col gap-4 w-full">
            {filteredProducts.map((product) => (
              <div key={`mob-${product.product_id}`} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col w-full">
                
                {/* Шапка: Фото и Имя */}
                <div className="flex items-start gap-4 border-b border-slate-50 pb-4 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img 
                      src={product.image_url || `https://placehold.co/100?text=${encodeURIComponent(product.name)}`} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 leading-snug whitespace-normal break-words">{product.name}</h3>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold mt-1 w-fit">
                      {product.Category?.name || 'Без категории'}
                    </span>
                  </div>
                </div>

                {/* Центр: Цена и Остаток */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Цена</div>
                    <div className="font-black text-emerald-600 text-lg">{product.price} <span className="text-xs font-medium text-slate-400">BYN / {product.unit}</span></div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">На складе</div>
                    {editingStockId === product.product_id ? (
                      <div className="flex items-center justify-end gap-1">
                        <input 
                          type="number" autoFocus
                          className="w-16 px-1.5 py-1 border-2 border-emerald-500 rounded outline-none font-bold text-slate-800 text-sm"
                          value={editStockValue}
                          onChange={(e) => setEditStockValue(e.target.value)}
                          onKeyDown={(e) => handleStockKeyDown(e, product.product_id)}
                          onBlur={() => setEditingStockId(null)}
                        />
                        
                        <button onClick={() => handleStockKeyDown({key: 'Enter'}, product.product_id)} className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors">
                           <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => startEditingStock(product)}
                        className={`cursor-pointer px-2.5 py-1 rounded-lg inline-block font-bold border border-transparent hover:border-slate-300 transition-all text-sm ${
                          product.stock_quantity > 0 ? 'text-slate-800 bg-slate-100' : 'text-red-600 bg-red-50'
                        }`}
                      >
                        {product.stock_quantity} шт. <Edit size={12} className="inline ml-1 opacity-50" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Подвал: Действия */}
                <div className="flex justify-end pt-3 border-t border-slate-50">
                  <button 
                    onClick={() => handleDelete(product.product_id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} /> Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
            <div className="p-6 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Новый товар</h2>
              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Название товара</label>
                  <input type="text" required className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Категория</label>
                    <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Ед. измерения</label>
                    <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                      <option value="кг">Килограммы (кг)</option><option value="л">Литры (л)</option><option value="шт">Штуки (шт)</option><option value="уп">Упаковки (уп)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Цена (BYN)</label>
                    <input type="text" required placeholder="Например: 5,50" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Остаток на складе</label>
                    <input type="number" required min="0" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1 flex items-center gap-2"><ImageIcon size={16}/> Прямая ссылка на фото</label>
                  <input type="url" placeholder="https://images.unsplash.com/..." className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Описание</label>
                  <textarea rows="3" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 rounded-2xl transition-all shadow-lg active:scale-95">Создать товар</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;