// AI Image Generation Service - Uses Pollinations.ai (free, no API key needed)

export class GeminiService {
  constructor() {
    console.log('AI Image Generation service initialized (using Pollinations.ai - free, no API key)');
  }

  isConfigured(): boolean {
    return true;
  }

  async generateDesign(prompt: string): Promise<string | null> {
    console.log("User prompt:", prompt);

    // Add formatting for t-shirt design
    const imagePrompt = `${prompt}, high quality graphic design, centered composition, solid white background, suitable for t-shirt printing, digital art, vibrant colors`;

    console.log("Generating image with Pollinations.ai...");
    
    try {
      const result = await this.generateWithPollinations(imagePrompt);
      if (result) {
        console.log("Image generated successfully");
        return result;
      }
      console.error("Image generation returned no result");
      return null;
    } catch (error) {
      console.error("Image generation failed:", error);
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
