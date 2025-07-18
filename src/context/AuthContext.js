import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();
const NotificationContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function NotificationProvider({ children }) {
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  return (
    <NotificationContext.Provider value={{ unreadNotificationCount, setUnreadNotificationCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
} 