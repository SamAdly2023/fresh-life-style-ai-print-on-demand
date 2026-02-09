
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DesignEditor from '../components/DesignEditor';
import { geminiService } from '../services/gemini';
import { api } from '../services/api';
import { useApp } from '../App';
import { AppRoute } from '../types';
import { GALLERY_DESIGNS } from '../constants';

// Local product images for demo mode
const LOCAL_DEMO_IMAGES = GALLERY_DESIGNS.map(d => d.imageUrl);

const Create: React.FC = () => {
  const { user, addToCart, login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | undefined>(undefined);
  const [generatedDesignId, setGeneratedDesignId] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<'selection' | 'editor'>('selection');

  useEffect(() => {
    if (location.state?.selectedDesign) {
      setGeneratedImage(location.state.selectedDesign.imageUrl);
      setGeneratedDesignId(location.state.selectedDesign.id);
      setMode('editor');
    }
  }, [location.state]);

  useEffect(() => {
    if (!user) {
      // If accessed directly, redirect to home or trigger login
      // Since we can't easily trigger login from here without user interaction context sometimes,
      // we'll redirect to home where they can click the button to login.
      navigate(AppRoute.HOME);
    }
  }, [user, navigate]);

  if (!user) return null; // Or a loading spinner/message

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      if (!geminiService.isConfigured()) {
        console.warn("No Gemini API Key found. Using Demo Mock.");

        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Use a random local product image for demo
        const randomIndex = Math.floor(Math.random() * LOCAL_DEMO_IMAGES.length);
        const mockImage = LOCAL_DEMO_IMAGES[randomIndex];

        setGeneratedImage(mockImage);

        // Auto-save Demo Design to Gallery too (if desired)
        try {
          const newDesign = await api.createDesign({
            imageUrl: mockImage,
            name: prompt,
            author: user?.name || 'Anonymous Creator',
            isAI: true
          });
          setGeneratedDesignId(newDesign.id);
          console.log("Demo design saved to gallery");
        } catch (err) {
          console.error("Failed to save demo design:", err);
        }

        setMode('editor');
        setIsGenerating(false);

        alert("NOTE: You are in DEMO MODE (No API Key).\nUsing a random stock photo instead of AI generation.\n\nTo enable AI: Add VITE_GEMINI_API_KEY to your .env file.");
        return;
      }

      const result = await geminiService.generateDesign(prompt);
      if (result) {
        setGeneratedImage(result);

        let designId = undefined;
        try {
          // Auto-save to Gallery
          const newDesign = await api.createDesign({
            imageUrl: result,
            name: prompt,
            author: user?.name || 'Anonymous Creator',
            isAI: true
          });
          designId = newDesign.id;
          setGeneratedDesignId(designId);
        } catch (error) {
          console.error("Error saving to gallery:", error);
          // Don't block the user flow if saving fails
        }

        // setMode('editor') handles the transition to customization
        setMode('editor');
      } else {
        alert("AI Generation failed. The model might be overloaded or the prompt is invalid.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (mode === 'editor') {
    return (
      <div className="min-h-screen bg-white px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setMode('selection')}
            className="mb-8 flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back to Selection
          </button>
          <DesignEditor initialImageUrl={generatedImage} initialDesignId={generatedDesignId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">Start Your Creation</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Choose how you want to design your fresh apparel. Select from our AI generator, your own files, or our curated gallery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* AI Generator Card */}
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 flex flex-col h-full group hover:-translate-y-2 transition-all duration-300">
            <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-green-200">
              <i className="fa-solid fa-wand-magic-sparkles text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase">AI Generator</h2>
            <p className="text-gray-500 mb-8 flex-grow">Use the power of Gemini AI to create unique artwork from simple text descriptions.</p>

            <div className="space-y-4">
              <textarea
                placeholder="e.g. A cyberpunk samurai in neon Tokyo..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${isGenerating || !prompt.trim()
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-green-500 text-black hover:bg-green-400 active:scale-95'
                  }`}
              >
                {isGenerating ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-sparkles"></i>
                )}
                <span>{isGenerating ? 'Generating...' : 'Generate Art'}</span>
              </button>
            </div>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 flex flex-col h-full group hover:-translate-y-2 transition-all duration-300">
            <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
              <i className="fa-solid fa-upload text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase">Upload Design</h2>
            <p className="text-gray-500 mb-8 flex-grow">Already have your own masterpiece? Upload your image file and place it on our products.</p>
            <button
              onClick={() => setMode('editor')}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-all active:scale-95 mt-auto"
            >
              <i className="fa-solid fa-folder-open"></i>
              <span>Browse Files</span>
            </button>
          </div>

          {/* Gallery Card */}
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 flex flex-col h-full group hover:-translate-y-2 transition-all duration-300">
            <div className="w-20 h-20 bg-purple-500 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-purple-200">
              <i className="fa-solid fa-images text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase">Artist Gallery</h2>
            <p className="text-gray-500 mb-8 flex-grow">Browse hundreds of pre-made designs created by our community and top artists.</p>
            <button
              onClick={() => setMode('editor')}
              className="w-full py-4 bg-gray-100 text-black rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all active:scale-95 mt-auto"
            >
              <i className="fa-solid fa-compass"></i>
              <span>Explore Designs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
