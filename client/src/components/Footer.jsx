import React from 'react';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-200 text-stone-600 py-6 mt-auto border-t border-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Левая часть: Копирайт */}
          <div className="text-sm text-center md:text-left">
            DelFarm © 2026. Все права защищены.
          </div>

          {/* Центральная часть: Адрес и Телефон */}
          <div className="text-sm text-center flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <span>г. Гродно, ул. Репина, 43</span>
            <span className="hidden sm:inline text-stone-400">|</span>
            <span>+375 (29) 850-05-90</span>
          </div>

          {/* Правая часть: Иконки соцсетей */}
          <div className="flex space-x-4">
            <a href="#" className="hover:text-emerald-600 transition-colors" title="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors" title="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors" title="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors" title="Youtube">
              <Youtube size={20} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;