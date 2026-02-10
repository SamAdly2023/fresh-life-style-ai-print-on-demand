
import React, { useState } from 'react';
import { COLORS, SIZES, generateProductName } from '../constants';
import { useApp } from '../App';
import { api } from '../services/api';

interface DesignEditorProps {
  initialImageUrl?: string;
  initialDesignId?: string;
}

const DesignEditor: React.FC<DesignEditorProps> = ({ initialImageUrl, initialDesignId }) => {
  const { addToCart, user } = useApp();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [designUrl, setDesignUrl] = useState(initialImageUrl || '');
  const [designId, setDesignId] = useState(initialDesignId || undefined);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageDataUrl = event.target?.result as string;
        setDesignUrl(imageDataUrl);

        // Save uploaded design to database
        try {
          const newDesign = await api.createDesign({
            imageUrl: imageDataUrl,
            name: generateProductName(),
            author: user?.name || 'Anonymous Creator',
            isAI: false // User uploaded, not AI generated
          });
          setDesignId(newDesign.id);
          console.log("Uploaded design saved to gallery:", newDesign.id);
        } catch (error) {
          console.error("Failed to save uploaded design:", error);
          // Design can still be used even if save fails
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
        console.error("Failed to read file");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto py-8">
      {/* Visualizer */}
      <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner group">
        {designUrl ? (
          /* Show the generated/uploaded image directly */
          <img
            src={designUrl}
            alt="Your Design"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-4"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))' }}
          />
        ) : (
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
              {isUploading ? (
                <i className="fa-solid fa-circle-notch animate-spin text-gray-500"></i>
              ) : (
                <i className="fa-solid fa-upload text-gray-500"></i>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-600 group-hover:text-black transition-colors underline underline-offset-4">
              {isUploading ? 'Saving...' : 'Browse local files'}
            </span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
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
