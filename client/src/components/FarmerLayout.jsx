import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  LogOut, 
  Store, 
  Sprout, 
  Menu, 
  X,
  User,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const FarmerLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [farmStatus, setFarmStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/farmer/dashboard');
        setFarmStatus(response.data.farmStatus);
      } catch (error) {
        console.error('Ошибка проверки статуса:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  
  useEffect(() => {
    setIsMobileOpen(prev => (prev ? false : prev));
  }, [location.pathname]); 

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      isActive
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  const isApproved = farmStatus === 'approved';

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden flex-col md:flex-row">
      
      {/* МОБИЛЬНАЯ ШАПКА */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 h-16 flex-shrink-0 z-30">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Sprout size={20} className="text-emerald-500" />
          <span className="font-bold text-slate-800">DelFarm Pro</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-red-500"><LogOut size={20} /></button>
      </header>

      {/* ОВЕРЛЕЙ */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* САЙДБАР */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2 text-white">
            <Sprout size={24} className="text-emerald-500" />
            <span className="text-xl font-bold tracking-tight">DelFarm <span className="text-emerald-500 text-xs">Pro</span></span>
          </Link>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-500"><X size={24} /></button>
        </div>

        <div className="px-6 py-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-500 border border-slate-700">
            <User size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Фермер</p>
            <p className="text-white font-medium truncate text-sm">{user?.name}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {isApproved && (
            <>
              <NavLink to="/farmer/dashboard" className={navLinkClass} end>
                <LayoutDashboard size={20} />
                <span>Дашборд</span>
              </NavLink>
              <NavLink to="/farmer/products" className={navLinkClass}>
                <Package size={20} />
                <span>Мои товары</span>
              </NavLink>
              <NavLink to="/farmer/orders" className={navLinkClass}>
                <ShoppingBag size={20} />
                <span>Заказы</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900/50 mt-auto">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Store size={20} />
            <span className="font-medium text-sm">В магазин</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
            <LogOut size={20} />
            <span className="font-medium text-sm">Выйти</span>
          </button>
        </div>
      </aside>

      {/* КОНТЕНТ */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        {isApproved ? (
          <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto min-h-full">
            <Outlet />
          </div>
        ) : (
          <div className="flex-1 h-full flex items-center justify-center p-8">
            <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-xl">
               <h2 className="text-2xl font-bold text-slate-900 mb-2">
                 {farmStatus === 'pending' ? 'Заявка на модерации' : 'В доступе отказано'}
               </h2>
               <p className="text-slate-500">
                 {farmStatus === 'pending' 
                   ? 'Пожалуйста, дождитесь проверки данных администратором.' 
                   : 'Обратитесь в поддержку для уточнения причин.'}
               </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmerLayout;