
// AI Image Generation Service - Supports Grok (xAI) API

export class GeminiService {
  private apiKey: string;
  private hasApiKey: boolean;

  constructor() {
    // Check for Grok/xAI API key
    this.apiKey = import.meta.env.VITE_XAI_API_KEY ||
      import.meta.env.VITE_GROK_API_KEY ||
      '';

    this.hasApiKey = !!this.apiKey && this.apiKey.length > 10;

    if (this.hasApiKey) {
      console.log('AI Image Generation service initialized (using Grok/xAI)');
    } else {
      console.log('AI Image Generation service initialized (using Pollinations.ai fallback)');
    }
  }

  isConfigured(): boolean {
    // Always return true - we have Pollinations.ai as fallback
    return true;
  }

  async generateDesign(prompt: string): Promise<string | null> {
    const enhancedPrompt = `High-quality t-shirt graphic design, artistic, modern, clean, centered composition, suitable for printing: ${prompt}`;

    // Try Grok API first if configured
    if (this.hasApiKey) {
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

  private async generateWithGrok(prompt: string): Promise<string | null> {
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
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
