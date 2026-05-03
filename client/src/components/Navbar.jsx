import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Settings, User, ShoppingCart, Leaf, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ cartCount }) => {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const[isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  
  const settingsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const burgerBtnRef = useRef(null);

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      closeAllMenus();
    }, 0);
    return () => clearTimeout(timer);
  },[location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
        burgerBtnRef.current && !burgerBtnRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  },[]);

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? '110%' : '100%';
  }, [largeText]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('contrast-125', 'saturate-150');
    } else {
      document.body.classList.remove('contrast-125', 'saturate-150');
    }
  },[highContrast]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-emerald-100/50 transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-6 h-20 flex items-center justify-between relative">
        
        {/* ЛЕВАЯ ЧАСТЬ (Бургер / Лого ПК) */}
        <div className="flex items-center w-1/5 lg:w-1/3 shrink-0">
          <button 
            ref={burgerBtnRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-emerald-600 transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
          </button>

          <Link to="/" className="hidden lg:flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Leaf size={24} strokeWidth={2} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">
              DelFarm
            </span>
          </Link>
        </div>

        {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ */}
        <div className="flex items-center justify-center flex-1 mx-1 lg:mx-4 min-w-0">
          <Link to="/" onClick={closeAllMenus} className="lg:hidden flex items-center justify-center gap-2 group w-full">
            <div className="w-9 h-9 shrink-0 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
              <Leaf size={20} strokeWidth={2.5} />
            </div>
            <span className="hidden sm:block text-xl font-bold text-slate-800 tracking-tight">
              DelFarm
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-10 bg-slate-100/50 px-8 py-2.5 rounded-full border border-white/50 shadow-inner">
            <Link to="/" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap normal-case">Каталог</Link>
            <Link to="/farmers" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap normal-case">О фермерах</Link>
            <Link to="/delivery" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap normal-case">Доставка и оплата</Link>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ (Иконки) */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 w-auto lg:w-1/3 shrink-0">
          
          <div className="relative flex items-center" ref={settingsRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-full transition-all duration-300 ${isSettingsOpen ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-600'}`}
            >
              <Settings size={24} strokeWidth={1.5} className={isSettingsOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
            </button>

            {isSettingsOpen && (
              <div className="absolute top-12 right-[-40px] sm:right-0 w-[11rem] sm:w-64 max-w-[85vw] bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-[60]">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-50 uppercase tracking-wider">Интерфейс</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Крупный текст</span>
                    <input type="checkbox" className="hidden" checked={largeText} onChange={() => setLargeText(!largeText)} />
                    <div className={`w-9 h-5 rounded-full flex items-center p-1 transition-colors ${largeText ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${largeText ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Контраст</span>
                    <input type="checkbox" className="hidden" checked={highContrast} onChange={() => setHighContrast(!highContrast)} />
                    <div className={`w-9 h-5 rounded-full flex items-center p-1 transition-colors ${highContrast ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${highContrast ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <Link to="/profile" className="flex items-center gap-2 p-1.5 rounded-full bg-slate-50 border border-slate-100 hover:bg-emerald-50 shrink-0 transition-colors">
              <div className="bg-white p-1 rounded-full text-emerald-600 shadow-sm">
                 <User size={20} strokeWidth={2} />
              </div>
              <span className="text-sm font-bold text-slate-700 hidden xl:block truncate max-w-[80px]">
                {user?.name?.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="px-6 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-extrabold text-sm shrink-0 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
            >
              Войти
            </Link>
          )}

          {isLoggedIn && (
            <Link to="/cart" className="relative p-2.5 rounded-full text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all shrink-0 group">
              <ShoppingCart size={24} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white shadow-md animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* МОБИЛЬНОЕ МЕНЮ И ОВЕРЛЕЙ */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-x-0 top-20 bottom-0 bg-black/40 z-40 lg:hidden animate-in fade-in duration-300" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            
            <div 
              ref={mobileMenuRef}
              className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl shadow-2xl border-b border-emerald-100 z-50 lg:hidden animate-in slide-in-from-top-1 duration-200 pb-4"
            >
              <div className="flex flex-col px-4 pt-4 gap-2">
                <Link to="/" onClick={closeAllMenus} className="p-4 bg-slate-50 rounded-xl text-base font-bold text-slate-800 hover:bg-emerald-50 transition-colors normal-case">
                  Каталог
                </Link>
                <Link to="/farmers" onClick={closeAllMenus} className="p-4 bg-slate-50 rounded-xl text-base font-bold text-slate-800 hover:bg-emerald-50 transition-colors normal-case">
                  О фермерах
                </Link>
                <Link to="/delivery" onClick={closeAllMenus} className="p-4 bg-slate-50 rounded-xl text-base font-bold text-slate-800 hover:bg-emerald-50 transition-colors normal-case">
                  Доставка и оплата
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </nav>
  );
};

export default Navbar;