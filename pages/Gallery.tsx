
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoute, Design } from '../types';
import { useApp } from '../App';
import { api } from '../services/api';
import { GALLERY_DESIGNS } from '../constants';

const Gallery: React.FC = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>(GALLERY_DESIGNS);

  useEffect(() => {
    api.getDesigns()
      .then(data => {
        // Use API data if available, otherwise keep local designs
        if (data && data.length > 0) {
          setDesigns(data);
        }
      })
      .catch(error => {
        console.error("Failed to fetch designs, using local images", error);
        // Keep using GALLERY_DESIGNS (already set as default)
      });
  }, []);

  const handleOrder = (design: Design) => {
    if (user) {
      navigate(AppRoute.CREATE, { state: { selectedDesign: design } });
    } else {
      login();
    }
  };

  return (
    <div className="bg-white min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Community Gallery</h1>
            <p className="text-gray-500">Pick a design and customize it to make it your own.</p>
          </div>
          <div className="mt-6 md:mt-0 flex space-x-4">
            <button className="px-6 py-3 rounded-full bg-black text-white text-sm font-bold">All Styles</button>
            <button className="px-6 py-3 rounded-full bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200">Trending</button>
            <button className="px-6 py-3 rounded-full bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200">Recent</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="group bg-white rounded-[2rem] p-3 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-50 hover:border-gray-100">
              {/* Image Container with T-Shirt Mockup */}
              <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-gray-100 mb-4 relative flex items-center justify-center">
                {/* T-Shirt SVG Background */}
                <svg
                  viewBox="0 0 400 450"
                  className="w-[90%] h-[90%] transition-transform duration-500 group-hover:scale-105"
                >
                  <path
                    d="M100 60 L60 80 L20 140 L60 160 L80 130 L80 400 L320 400 L320 130 L340 160 L380 140 L340 80 L300 60 L260 80 C240 100 160 100 140 80 L100 60 Z"
                    fill="#FFFFFF"
                    stroke="#e5e5e5"
                    strokeWidth="2"
                  />
                  <ellipse cx="200" cy="75" rx="60" ry="20" fill="#FFFFFF" stroke="#e5e5e5" strokeWidth="1" />
                  <ellipse cx="200" cy="75" rx="45" ry="15" fill="#f9f9f9" stroke="#eee" strokeWidth="1" />
                </svg>
                {/* Design on T-Shirt */}
                <img
                  src={design.imageUrl}
                  alt={design.name}
                  className="absolute top-[22%] left-1/2 -translate-x-1/2 w-[28%] h-auto object-contain transition-transform duration-500 group-hover:scale-110"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
                {design.isAI && (
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-white/10">
                    <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> AI Art
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-[1.5rem]"></div>
              </div>

              {/* Product Info */}
              <div className="px-2 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-base leading-tight text-gray-900 line-clamp-1 pr-2" title={design.name}>
                    {design.name}
                  </h3>
                  <span className="font-black text-base whitespace-nowrap">$32.99</span>
                </div>

                {/* Stats & Author */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {design.author.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate max-w-[80px]">{design.author}</p>
                  </div>
                  <div className="flex items-center text-[10px] font-semibold text-gray-400 space-x-2">
                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                      <i className="fa-solid fa-layer-group mr-1 sm-icon"></i> T-Shirt
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleOrder(design)}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm group-hover:bg-green-500 group-hover:text-black transition-all duration-300"
                >
                  <span>Order Now</span>
                  <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 py-10 bg-black rounded-[3rem] px-12 flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Want your art featured?</h2>
            <p className="text-gray-400">Join our creator program and earn from every sale.</p>
          </div>
          <button className="bg-green-500 text-black px-8 py-4 rounded-full font-bold uppercase tracking-wide hover:bg-green-400 transition-colors">
            Apply as Creator
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
