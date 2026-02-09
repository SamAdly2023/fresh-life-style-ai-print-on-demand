
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
    if (!this.hasApiKey) {
      console.error("No valid API key configured");
      return null;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: {
          parts: [
            { text: `Create a high-quality graphic design suitable for printing on a t-shirt. Style: Artistic, modern, and clean. Topic: ${prompt}. The design should be centered and look great on a flat background.` }
          ]
        },
        config: {
          responseModalities: ["IMAGE", "TEXT"],
        }
      });

      clearTimeout(timeoutId);

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      console.error("No image data in response:", response);
      return null;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error("Gemini API request timed out after 60 seconds");
      } else {
        console.error("Gemini Image Generation Error:", error);
      }
      return null;
    }
  }
}

export const geminiService = new GeminiService();
