
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoute, Design } from '../types';
import { useApp } from '../App';
import { api } from '../services/api';

const Gallery: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);

  useEffect(() => {
    if (!user) {
        navigate(AppRoute.HOME);
    } else {
        api.getDesigns()
           .then(data => setDesigns(data))
           .catch(error => console.error("Failed to fetch designs", error));
    }
  }, [user, navigate]);

  if (!user) return null;

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {designs.map((design) => (
            <div key={design.id} className="group relative">
               <div className="aspect-square rounded-[2rem] overflow-hidden bg-gray-50 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                 <img 
                   src={design.imageUrl} 
                   alt={design.name} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Link 
                      to={AppRoute.CREATE}
                      state={{ selectedDesign: design }}
                      className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform"
                    >
                      Use Design
                    </Link>
                 </div>
               </div>
               <h3 className="font-bold text-lg">{design.name}</h3>
               <p className="text-gray-400 text-sm">By {design.author}</p>
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
