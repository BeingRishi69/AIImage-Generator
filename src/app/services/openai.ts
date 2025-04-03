import OpenAI from 'openai';

// Initialize OpenAI client
// In a production environment, you should use environment variables for API keys
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // For client-side use (in production, use server API routes)
});

/**
 * Generates a product photoshoot image based on a description and reference image
 */
export async function generateImage(file: File, prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    return response.data[0].url || '';
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}

/**
 * Edits a previously generated image based on user instructions
 * while maintaining the context of the original product
 */
export async function editImage(
  imageUrl: string, 
  instructions: string, 
  productDescription: string
): Promise<string> {
  try {
    // For editing, we'll use DALL-E 3 to generate a new image but keep the product context
    const prompt = `Create a professional product photoshoot of the following product: ${productDescription}.
    Apply the following edit: ${instructions}
    
    IMPORTANT INSTRUCTIONS:
    1. Keep the same product as the main subject
    2. Only modify the aspects mentioned in the edit request
    3. Make sure the product is clearly visible and is the main focus of the image
    4. Maintain high quality, professional studio lighting unless specifically asked to change it
    5. The image should look like a premium commercial product photograph`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    return response.data[0].url || '';
  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("Failed to edit image");
  }
} 