import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Users, MessageSquare, LogOut, ExternalLink, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const[isMobileOpen, setIsMobileOpen] = useState(false);

  // 1. Асинхронное закрытие меню при смене страницы
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(prev => (prev ? false : prev));
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // 2. Блокировка скролла страницы при открытом мобильном меню
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
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden flex-col lg:flex-row">
      
      
      {/* МОБИЛЬНАЯ ШАПКА (Видна только до lg) */}
      
      <header className="lg:hidden flex items-center justify-between bg-slate-900 text-white border-b border-slate-800 px-4 h-16 flex-shrink-0 z-30">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
        >
          <Menu size={26} />
        </button>
        
        <div className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-indigo-400" />
          <span className="font-bold tracking-tight text-lg">Admin Panel</span>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={22} />
        </button>
      </header>

      
      {/* ОВЕРЛЕЙ (Затемнение фона на мобилках) */}
      
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      
      {/* САЙДБАР (Выезжает на моб, статичен на ПК) */}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 shadow-2xl transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <Link to="/admin/farms" className="flex items-center gap-2 text-white group">
            <div className="bg-indigo-500 p-1.5 rounded-lg group-hover:bg-indigo-400 transition-colors">
              <ShieldAlert size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">DelFarm <span className="text-indigo-500 text-xs uppercase ml-1">Admin</span></span>
          </Link>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-slate-500 hover:text-white p-1">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 border border-slate-700">
            <User size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Администратор</p>
            <p className="text-white font-medium truncate text-sm">{user?.name}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavLink to="/admin/farms" className={navLinkClass}>
            <Users size={20} />
            <span>Заявки фермеров</span>
          </NavLink>
          <NavLink to="/admin/reviews" className={navLinkClass}>
            <MessageSquare size={20} />
            <span>Модерация отзывов</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900/50 mt-auto">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ExternalLink size={20} />
            <span className="font-medium text-sm">На сайт</span>
          </Link>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Выйти</span>
          </button>
        </div>

      </aside>

      
      {/* ОСНОВНОЙ КОНТЕНТ */}
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 w-full">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;