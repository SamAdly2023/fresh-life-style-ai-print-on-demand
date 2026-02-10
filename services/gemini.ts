
// AI Image Generation Service - Uses Gemini for prompt enhancement + Grok/Pollinations for image generation

export class GeminiService {
  private grokApiKey: string;
  private geminiApiKey: string;
  private hasGrokKey: boolean;
  private hasGeminiKey: boolean;

  constructor() {
    // Check for Grok/xAI API key
    this.grokApiKey = import.meta.env.VITE_XAI_API_KEY ||
      import.meta.env.VITE_GROK_API_KEY ||
      '';

    // Check for Gemini API key (for prompt enhancement)
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    this.hasGrokKey = !!this.grokApiKey && this.grokApiKey.length > 10;
    this.hasGeminiKey = !!this.geminiApiKey && this.geminiApiKey.length > 10;

    console.log(`AI Service initialized - Gemini prompt enhancement: ${this.hasGeminiKey ? 'ON' : 'OFF'}, Grok image gen: ${this.hasGrokKey ? 'ON' : 'OFF (using Pollinations)'}`);
  }

  isConfigured(): boolean {
    // Always return true - we have Pollinations.ai as fallback
    return true;
  }

  async generateDesign(prompt: string): Promise<string | null> {
    // Step 1: Enhance the prompt using Gemini (if available)
    let enhancedPrompt: string;

    if (this.hasGeminiKey) {
      console.log("Original prompt:", prompt);
      enhancedPrompt = await this.enhancePromptWithGemini(prompt);
      console.log("Enhanced prompt:", enhancedPrompt);
    } else {
      // Fallback to basic enhancement
      enhancedPrompt = `Create a standalone graphic design artwork on a plain transparent or white background. The design should be: ${prompt}. Style: High resolution, clean edges, centered composition, suitable for print-on-demand t-shirt printing. NO t-shirt mockup, NO clothing, just the design artwork itself, isolated on a clean background.`;
    }

    // Step 2: Generate image with enhanced prompt
    if (this.hasGrokKey) {
      try {
        const result = await this.generateWithGrok(enhancedPrompt);
        if (result) return result;
      } catch (error) {
        console.error("Grok API failed, falling back to Pollinations:", error);
      }
    }

    // Fallback to Pollinations.ai (free, no API key required)
    return this.generateWithPollinations(enhancedPrompt);
  }

  private async enhancePromptWithGemini(simplePrompt: string): Promise<string> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert prompt engineer for AI image generation. Convert this simple idea into a detailed, professional image generation prompt optimized for creating t-shirt designs.

User's simple idea: "${simplePrompt}"

Requirements for the enhanced prompt:
- Create a standalone graphic design artwork
- Plain transparent or white background (NO t-shirt mockup, NO clothing in the image)
- High resolution, clean edges, centered composition
- Suitable for print-on-demand t-shirt printing
- Include specific art style, colors, mood, and visual details
- Keep it under 200 words

Respond with ONLY the enhanced prompt, no explanations or formatting.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300
          }
        })
      });

      if (!response.ok) {
        console.error("Gemini prompt enhancement failed:", response.status);
        return this.getBasicEnhancedPrompt(simplePrompt);
      }

      const data = await response.json();
      const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (enhancedText) {
        return enhancedText.trim();
      }

      return this.getBasicEnhancedPrompt(simplePrompt);
    } catch (error) {
      console.error("Gemini enhancement error:", error);
      return this.getBasicEnhancedPrompt(simplePrompt);
    }
  }

  private getBasicEnhancedPrompt(prompt: string): string {
    return `Create a standalone graphic design artwork on a plain transparent or white background. The design should be: ${prompt}. Style: High resolution, clean edges, centered composition, suitable for print-on-demand t-shirt printing. NO t-shirt mockup, NO clothing, just the design artwork itself, isolated on a clean background.`;
  }

  private async generateWithGrok(prompt: string): Promise<string | null> {
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.grokApiKey}`
      },
      body: JSON.stringify({
        model: 'grok-2-image',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();

    if (data.data && data.data[0]?.b64_json) {
      return `data:image/png;base64,${data.data[0].b64_json}`;
    }

    if (data.data && data.data[0]?.url) {
      // If URL is returned instead of base64, fetch and convert
      const imgResponse = await fetch(data.data[0].url);
      const blob = await imgResponse.blob();
      return this.blobToBase64(blob);
    }

    console.error("No image in Grok response:", data);
    return null;
  }

  private async generateWithPollinations(prompt: string): Promise<string | null> {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

      const response = await fetch(imageUrl);

      if (!response.ok) {
        console.error("Pollinations failed:", response.status, response.statusText);
        return null;
      }

      const blob = await response.blob();
      return this.blobToBase64(blob);
    } catch (error: any) {
      console.error("Pollinations error:", error?.message || error);
      return null;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const geminiService = new GeminiService();
