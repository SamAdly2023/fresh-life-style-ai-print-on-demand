
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { User, CartItem, Product, Design, AppRoute } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Create from './pages/Create';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import { api } from './services/api';

interface AppContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  // Initialize user from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fresh_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [cart, setCart] = useState<CartItem[]>([]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const userData: User = {
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          avatar: userInfo.picture,
          isAdmin: false
        };

        // Sync with backend and get actual role (now returns properly mapped User object)
        const syncedUser = await api.syncUser(userData);
        
        setUser(syncedUser);
        localStorage.setItem('fresh_user', JSON.stringify(syncedUser));

      } catch (error) {
        console.error('Failed to fetch user info', error);
        alert('Login failed. Please check your connection or try again.');
      }
    },
    onError: errorResponse => console.log(errorResponse),
  });

  const login = () => googleLogin();

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fresh_user');
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider value={{ user, login, logout, cart, addToCart, removeFromCart, clearCart }}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path={AppRoute.HOME} element={<Home />} />
              <Route path={AppRoute.GALLERY} element={<Gallery />} />
              <Route path={AppRoute.CREATE} element={<Create />} />
              <Route path={AppRoute.CHECKOUT} element={<Checkout />} />
              <Route path={AppRoute.DASHBOARD} element={user ? <ClientDashboard /> : <Navigate to={AppRoute.HOME} />} />
              <Route path={AppRoute.ADMIN} element={user?.isAdmin ? <AdminDashboard /> : <Navigate to={AppRoute.HOME} />} />
              <Route path="*" element={<Navigate to={AppRoute.HOME} />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
