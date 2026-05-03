import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

// Контекст и защита
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import FarmerRoute from './components/FarmerRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';

// Общие компоненты
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Страницы Клиента
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import FarmersInfo from './pages/FarmersInfo';
import DeliveryInfo from './pages/DeliveryInfo';

// Страницы Фермера
import FarmerLayout from './components/FarmerLayout';
import Dashboard from './pages/farmer/Dashboard';
import Products from './pages/farmer/Products';
import Orders from './pages/farmer/Orders';

// Страницы Администратора
import AdminLayout from './components/AdminLayout';
import AdminFarms from './pages/admin/Farms';
import AdminReviews from './pages/admin/Reviews';

const ClientLayout = ({ cartCount }) => (
  <div className="min-h-screen flex flex-col font-sans">
    <Navbar cartCount={cartCount} />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AppContent = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // 1. ЗАГРУЗКА: Срабатывает только при смене пользователя
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && user.id) {
        const savedCart = localStorage.getItem(`farmfood_cart_${user.id}`);
        setCartItems(savedCart ? JSON.parse(savedCart) :[]);
      } else {
        // Если зашел гость или пользователь вышел — просто очищается стейт (localStorage старого юзера не затрагивается)
        setCartItems([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  // 2. Функция синхронного сохранения
  const saveCart = (newCartItems) => {
    setCartItems(newCartItems); 
    if (user && user.id) {
      // Сразу же сохраняется в localStorage под правильным ключом
      localStorage.setItem(`farmfood_cart_${user.id}`, JSON.stringify(newCartItems));
    }
  };

  // --- Функции управления корзиной (используется saveCart) ---
  const addToCart = (product, quantity = 1) => {
    toast.success(`${product.name} добавлен в корзину`);
    
    const existingItem = cartItems.find((item) => item.product_id === product.product_id);
    let newItems;
    
    if (existingItem) {
      newItems = cartItems.map((item) =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems =[...cartItems, { ...product, quantity }];
    }
    
    saveCart(newItems);
  };

  const removeFromCart = (productId) => {
    const newItems = cartItems.filter((item) => item.product_id !== productId);
    saveCart(newItems);
    toast.error('Товар удален из корзины');
  };

  const updateQuantity = (productId, delta) => {
    const newItems = cartItems.map((item) => {
      if (item.product_id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]); // Очистка корзины после успешного оформления заказа
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      <ScrollToTop />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: { background: '#333', color: '#fff', borderRadius: '10px' },
          success: { style: { background: '#10B981' } },
          error: { style: { background: '#EF4444' } },
        }}
      />

      <Routes>
        <Route element={<ClientLayout cartCount={cartCount} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/farmers" element={<FarmersInfo />} />
          <Route path="/delivery" element={<DeliveryInfo />} />
          
          <Route path="/cart" element={<ProtectedRoute><Cart cartItems={cartItems} removeFromCart={removeFromCart} updateQuantity={updateQuantity} /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout cartItems={cartItems} clearCart={clearCart} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>

        <Route path="/farmer" element={<FarmerRoute><FarmerLayout /></FarmerRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="farms" replace />} />
          <Route path="farms" element={<AdminFarms />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;