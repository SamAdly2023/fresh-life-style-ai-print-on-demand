
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;
  private hasApiKey: boolean;

  constructor() {
    // Check for API key from various sources
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY ||
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.API_KEY) ||
      '';

    this.hasApiKey = !!apiKey && apiKey !== 'your_gemini_api_key_here';
    this.ai = new GoogleGenAI({ apiKey });

    if (!this.hasApiKey) {
      console.warn('Gemini API key not configured. AI generation will use demo mode.');
    }
  }

  isConfigured(): boolean {
    return this.hasApiKey;
  }

  async generateDesign(prompt: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `Create a high-quality graphic design suitable for printing on a t-shirt. Style: Artistic, modern, and clean. Topic: ${prompt}. The design should be centered and look great on a flat background.` }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Gemini Image Generation Error:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
