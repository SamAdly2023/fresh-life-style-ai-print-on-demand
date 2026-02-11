
import React from 'react';
import { Link } from 'react-router-dom';
import { AppRoute } from '../types';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex flex-col mb-8">
              <span className="logo-font text-4xl font-black tracking-tighter text-white uppercase -mb-2">Fresh Life</span>
              <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-green-500 self-end">Style.com</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering individual expression through high-quality print-on-demand fashion and cutting-edge artificial intelligence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-black transition-all">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-black transition-all">
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-black transition-all">
                <i className="fa-brands fa-tiktok"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black uppercase tracking-tighter mb-8 text-green-500">Explore</h4>
            <ul className="space-y-4 text-gray-400 font-bold text-sm">
              <li><Link to={AppRoute.GALLERY} className="hover:text-white transition-colors uppercase">Artist Gallery</Link></li>
              <li><Link to={AppRoute.CREATE} className="hover:text-white transition-colors uppercase">AI Creator</Link></li>
              <li><Link to={AppRoute.HOME} className="hover:text-white transition-colors uppercase">Trending</Link></li>
              <li><Link to={AppRoute.HOME} className="hover:text-white transition-colors uppercase">Bulk Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black uppercase tracking-tighter mb-8 text-green-500">Support</h4>
            <ul className="space-y-4 text-gray-400 font-bold text-sm">
              <li><a href="#" className="hover:text-white transition-colors uppercase">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors uppercase">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-white transition-colors uppercase">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors uppercase">Size Guide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black uppercase tracking-tighter mb-8 text-green-500">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-6 font-bold">Get fresh drops and AI tips in your inbox.</p>
            <div className="flex bg-gray-900 rounded-full p-1 border border-gray-800 focus-within:border-green-500 transition-all">
              <input type="email" placeholder="Email address" className="bg-transparent border-none outline-none px-4 flex-grow text-sm" />
              <button className="bg-white text-black px-6 py-2 rounded-full text-xs font-black uppercase hover:bg-green-500 transition-all">JOIN</button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-[10px] font-black tracking-widest uppercase mb-4 md:mb-0">
            &copy; 2026 FRESH LIFE STYLE. ALL RIGHTS RESERVED. POWERED BY GEMINI AI.
          </p>
          <div className="flex space-x-6 text-[10px] font-black tracking-widest uppercase text-gray-600">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
