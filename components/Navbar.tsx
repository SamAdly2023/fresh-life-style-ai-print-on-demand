
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { AppRoute } from '../types';

const Navbar: React.FC = () => {
  const { user, login, logout, cart } = useApp();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: AppRoute.HOME },
    { name: 'Gallery', path: AppRoute.GALLERY },
    { name: 'Create', path: AppRoute.CREATE },
  ];

  if (user) {
      navLinks.push({ name: 'Dashboard', path: AppRoute.DASHBOARD });
  }

  if (user?.isAdmin) {
    navLinks.push({ name: 'Admin', path: AppRoute.ADMIN });
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col">
              <span className="logo-font text-3xl font-black tracking-tighter text-black uppercase -mb-2">Fresh Life</span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 self-end">Style.com</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-green-600 ${
                  location.pathname === link.path ? 'text-green-600' : 'text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to={AppRoute.CHECKOUT} className="relative p-2 text-gray-700 hover:text-green-600 transition-colors">
              <i className="fa-solid fa-cart-shopping text-xl"></i>
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Admin Switch for specific user */}
                {(user.isAdmin || user.email === 'samadly728@gmail.com') && (
                  <div className="hidden lg:flex bg-gray-100 rounded-full p-1 border border-gray-200">
                     <Link 
                       to={AppRoute.DASHBOARD} 
                       className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${location.pathname.includes('/admin') ? 'text-gray-400 hover:text-black' : 'bg-white shadow-sm text-black'}`}
                       title="Client View"
                     >
                       Client
                     </Link>
                     <Link 
                       to={AppRoute.ADMIN} 
                       className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${location.pathname.includes('/admin') ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-black'}`}
                       title="Admin View"
                     >
                       Admin
                     </Link>
                  </div>
                )}

                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-gray-200" />
                <button onClick={logout} className="text-sm font-bold text-gray-500 hover:text-black">Sign Out</button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="flex items-center space-x-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-md"
              >
                <i className="fa-brands fa-google"></i>
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 p-2">
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="block text-lg font-bold text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between px-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                <button onClick={logout} className="text-sm font-bold text-gray-500">Sign Out</button>
              </div>
            ) : (
              <button onClick={login} className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-xl w-full justify-center">
                <i className="fa-brands fa-google"></i>
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
