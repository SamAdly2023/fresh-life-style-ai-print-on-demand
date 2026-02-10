// AI Image Generation Service - Uses xAI Grok with Pollinations.ai fallback
// Includes Gemini prompt enhancement for better image generation

const XAI_API_KEY = import.meta.env.VITE_XAI_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export class GeminiService {
  constructor() {
    const services = [];
    if (XAI_API_KEY) services.push('xAI Grok');
    if (GEMINI_API_KEY) services.push('Gemini enhancement');
    services.push('Pollinations.ai fallback');
    console.log(`AI Image Generation service initialized (${services.join(', ')})`);
  }

  isConfigured(): boolean {
    return true; // Always configured - Pollinations works without key
  }

  async generateDesign(prompt: string): Promise<string | null> {
    console.log("User prompt:", prompt);

    // Enhance prompt with Gemini if available
    let enhancedPrompt = prompt;
    if (GEMINI_API_KEY) {
      console.log("Enhancing prompt with Gemini...");
      try {
        enhancedPrompt = await this.enhancePromptWithGemini(prompt);
        console.log("Enhanced prompt:", enhancedPrompt);
      } catch (error) {
        console.warn("Gemini enhancement failed, using original prompt:", error);
      }
    }

    // Add formatting for t-shirt design
    const imagePrompt = `${enhancedPrompt}, high quality graphic design, centered composition, solid white background, suitable for t-shirt printing, digital art, vibrant colors`;

    // Try Grok first if API key is available
    if (XAI_API_KEY) {
      console.log("Generating image with xAI Grok...");
      try {
        const result = await this.generateWithGrok(imagePrompt);
        if (result) {
          console.log("Grok image generated successfully");
          return result;
        }
      } catch (error) {
        console.error("Grok generation failed, falling back to Pollinations:", error);
      }
    }

    // Fallback to Pollinations
    console.log("Generating image with Pollinations.ai...");
    try {
      const result = await this.generateWithPollinations(imagePrompt);
      if (result) {
        console.log("Pollinations image generated successfully");
        return result;
      }
      console.error("Image generation returned no result");
      return null;
    } catch (error) {
      console.error("Image generation failed:", error);
      return null;
    }
  }

  private async enhancePromptWithGemini(userPrompt: string): Promise<string> {
    const systemPrompt = `You are a creative t-shirt design prompt enhancer. Take the user's simple idea and transform it into a detailed, vivid prompt for AI image generation. Focus on:
- Visual style (illustration, minimalist, vintage, etc.)
- Color palette suggestions
- Composition and layout
- Artistic technique
Keep the enhanced prompt concise (under 100 words) and focused on visual elements only. Do not include any explanations, just output the enhanced prompt.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { text: `User's idea: ${userPrompt}` }
            ]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (enhanced && enhanced.trim()) {
      return enhanced.trim();
    }
    
    return userPrompt; // Return original if enhancement fails
  }

  private async generateWithGrok(prompt: string): Promise<string | null> {
    try {
      const response = await fetch('https://api.x.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'grok-imagine-image',
          response_format: 'b64_json',
          n: 1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Grok API error:", response.status, errorText);
        return null;
      }

      const data = await response.json();

      if (data.data && data.data[0] && data.data[0].b64_json) {
        // Return as data URL
        return `data:image/png;base64,${data.data[0].b64_json}`;
      }

      console.error("Unexpected Grok response format:", data);
      return null;
    } catch (error: any) {
      console.error("Grok error:", error?.message || error);
      return null;
    }
  }

  private async generateWithPollinations(prompt: string): Promise<string | null> {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Date.now();
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;

      console.log("Fetching from Pollinations...");

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
