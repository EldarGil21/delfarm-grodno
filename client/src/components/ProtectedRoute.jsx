import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Перенаправление на логин, сохраняя историю (чтобы вернуть пользователя обратно после входа)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если авторизован — происходит рендеринг защищенного компонента
  return children;
};

export default ProtectedRoute;