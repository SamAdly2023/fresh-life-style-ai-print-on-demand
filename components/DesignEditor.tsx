
import React, { useState } from 'react';
import { COLORS, SIZES } from '../constants';
import { useApp } from '../App';

interface DesignEditorProps {
  initialImageUrl?: string;
  initialDesignId?: string;
}

const DesignEditor: React.FC<DesignEditorProps> = ({ initialImageUrl, initialDesignId }) => {
  const { addToCart } = useApp();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [designUrl, setDesignUrl] = useState(initialImageUrl || '');
  const [designId, setDesignId] = useState(initialDesignId || undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddToCart = () => {
    if (!designUrl) return;

    addToCart({
      id: '',
      productId: 'p1', // Default Premium Tee
      designId: designId,
      customDesignUrl: designUrl,
      quantity: 1,
      size: selectedSize,
      color: selectedColor.name
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesignUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto py-8">
      {/* Visualizer */}
      <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner group">
        {/* T-Shirt SVG Mockup */}
        <svg
          viewBox="0 0 400 450"
          className="w-[85%] h-[85%] transition-transform duration-500 group-hover:scale-105"
          style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))' }}
        >
          {/* T-Shirt Shape */}
          <path
            d="M100 60 L60 80 L20 140 L60 160 L80 130 L80 400 L320 400 L320 130 L340 160 L380 140 L340 80 L300 60 L260 80 C240 100 160 100 140 80 L100 60 Z"
            fill={selectedColor.hex}
            stroke="#ddd"
            strokeWidth="2"
          />
          {/* Collar */}
          <ellipse cx="200" cy="75" rx="60" ry="20" fill={selectedColor.hex} stroke="#ccc" strokeWidth="1" />
          <ellipse cx="200" cy="75" rx="45" ry="15" fill="#f5f5f5" stroke="#ddd" strokeWidth="1" />
        </svg>

        {/* Design Overlay - Centered on T-Shirt (lower position) */}
        {designUrl && (
          <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[28%] aspect-square pointer-events-none">
            <img
              src={designUrl}
              alt="Design"
              className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-100"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
          </div>
        )}

        {!designUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <i className="fa-solid fa-cloud-arrow-up text-4xl mb-4"></i>
            <p className="font-medium">Upload or generate a design</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-black mb-2 tracking-tight">Customize Your Style</h1>
          <p className="text-gray-500">Premium 100% Cotton. Designed by you, printed by us.</p>
        </div>

        {/* Color Selection */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Select Color</h3>
          <div className="flex flex-wrap gap-4">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c)}
                className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 ${selectedColor.name === c.name ? 'border-black scale-110 shadow-lg' : 'border-transparent'
                  }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Select Size</h3>
          <div className="flex gap-3">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`w-12 h-12 rounded-xl border-2 font-bold transition-all ${selectedSize === s
                    ? 'bg-black text-white border-black shadow-lg scale-105'
                    : 'bg-white text-black border-gray-100 hover:border-black'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Button */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Or Upload Own Art</h3>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <i className="fa-solid fa-upload text-gray-500"></i>
            </div>
            <span className="text-sm font-semibold text-gray-600 group-hover:text-black transition-colors underline underline-offset-4">Browse local files</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="pt-6 space-y-4">
          <button
            onClick={handleAddToCart}
            disabled={!designUrl}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-3 ${!designUrl
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isSuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-black text-white hover:bg-gray-800 shadow-xl active:scale-95'
              }`}
          >
            {isSuccess ? (
              <>
                <i className="fa-solid fa-circle-check"></i>
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cart-plus"></i>
                <span>Add to Cart — $29.99</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-400">
            <i className="fa-solid fa-truck-fast mr-1"></i> Free shipping on orders over $75
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignEditor;
