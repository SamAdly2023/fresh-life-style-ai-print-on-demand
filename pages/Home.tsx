
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoute, Design } from '../types';
import { useApp } from '../App';
import { api } from '../services/api';
import { GALLERY_DESIGNS } from '../constants';

const Home: React.FC = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>(GALLERY_DESIGNS.slice(0, 4));

  useEffect(() => {
    api.getDesigns()
      .then(data => {
        // Use API data if available, otherwise keep local designs
        if (data && data.length > 0) {
          setDesigns(data.slice(0, 4));
        }
      })
      .catch(error => {
        console.error("Failed to fetch designs, using local images", error);
        // Keep using GALLERY_DESIGNS (already set as default)
      });
  }, []);

  const handleAuthAction = (route: string) => {
    if (user) {
      navigate(route);
    } else {
      login();
    }
  };

  const handleOrder = (design: Design) => {
    if (user) {
      navigate(AppRoute.CREATE, { state: { selectedDesign: design } });
    } else {
      login();
    }
  };

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center bg-black overflow-hidden">
        {/* Background Animation/Image */}
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=2000"
            alt="AI-powered custom t-shirt design studio background - Fresh Life Style print on demand"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-4 rounded-full bg-green-500 text-black font-bold text-xs uppercase tracking-[0.2em] mb-6">
              NEW: AI Generated Fashion
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tighter mb-8">
              DESIGN YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">FRESH LIFE</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-lg">
              The world's first print-on-demand platform powered by advanced AI. Dream it, generate it, wear it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleAuthAction(AppRoute.CREATE)}
                className="bg-white text-black px-10 py-5 rounded-full text-lg font-black tracking-tight hover:bg-green-500 transition-all text-center shadow-2xl hover:scale-105"
              >
                START CREATING
              </button>
              <button
                onClick={() => navigate(AppRoute.GALLERY)}
                className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-full text-lg font-black tracking-tight hover:bg-white/10 transition-all text-center"
              >
                BROWSE GALLERY
              </button>
            </div>
          </div>
        </div>

        {/* Floating T-Shirt Mockup */}
        <div className="hidden lg:block absolute right-[-10%] top-1/2 -translate-y-1/2 w-[50%] animate-pulse-slow">
          <img
            src="https://www.freeiconspng.com/uploads/t-shirt-png-t-shirt-png-image-32.png"
            alt="Custom AI-designed t-shirt mockup - create your unique design with Fresh Life Style"
            className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transform rotate-12"
            style={{ filter: 'brightness(0.9) contrast(1.1)' }}
            loading="eager"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="group">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-all">
                <i className="fa-solid fa-wand-magic-sparkles text-2xl"></i>
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">AI Generation</h3>
              <p className="text-gray-500 leading-relaxed">Simply describe your idea and our Gemini-powered AI will create a one-of-a-kind design in seconds.</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <i className="fa-solid fa-shirt text-2xl"></i>
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Premium Quality</h3>
              <p className="text-gray-500 leading-relaxed">We use the finest 100% ring-spun cotton and state-of-the-art DTG printing for vibrant, lasting results.</p>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <i className="fa-solid fa-bolt text-2xl"></i>
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Fast Turnaround</h3>
              <p className="text-gray-500 leading-relaxed">Orders are printed and shipped within 2-3 business days. Worldwide tracking included on every order.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Designs Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">Trending Designs</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Explore what the community is creating. Click any design to order it.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {designs.map((design) => (
              <div key={design.id} className="group bg-white rounded-[2rem] p-3 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100">
                {/* Image Container */}
                <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-gray-100 mb-4 relative">
                  <img
                    src={design.imageUrl}
                    alt={`${design.name} - AI-generated custom t-shirt design by ${design.author}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  {design.isAI && (
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-white/10">
                      <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> AI Art
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="px-2 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-base leading-tight text-gray-900 line-clamp-1 pr-2" title={design.name}>
                      {design.name}
                    </h3>
                    <span className="font-black text-base whitespace-nowrap">$32.99</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {design.author.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate">{design.author}</p>
                  </div>

                  <button
                    onClick={() => handleOrder(design)}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm group-hover:bg-green-500 group-hover:text-black transition-all duration-300"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate(AppRoute.GALLERY)}
              className="inline-block border-2 border-black text-black px-10 py-4 rounded-full font-bold uppercase tracking-tight hover:bg-black hover:text-white transition-all"
            >
              View Full Gallery
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tighter">Ready to wear your imagination?</h2>
          <button
            onClick={() => handleAuthAction(AppRoute.CREATE)}
            className="inline-block bg-black text-white px-12 py-6 rounded-full font-black text-xl hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1"
          >
            CREATE NOW
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
