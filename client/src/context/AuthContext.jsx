import React, { createContext, useState, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('farmfood_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem('farmfood_token', token);
    localStorage.setItem('farmfood_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (userDataInput) => {
    // userDataInput теперь содержит role и farm_name!
    const response = await api.post('/auth/register', userDataInput);
    const { token, user: newUserData } = response.data;

    localStorage.setItem('farmfood_token', token);
    localStorage.setItem('farmfood_user', JSON.stringify(newUserData));
    setUser(newUserData);
    return newUserData;
  };

  const logout = () => {
    localStorage.removeItem('farmfood_token');
    localStorage.removeItem('farmfood_user');
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('farmfood_user', JSON.stringify(updatedUser));
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};