import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ImageResponse = {
  success: boolean;
  generatedImageUrl?: string;
  error?: string;
};

export async function generateProductImage(file: File, productDescription: string): Promise<ImageResponse> {
  try {
    if (!productDescription) {
      return {
        success: false,
        error: 'Please provide a product description'
      };
    }
    
    // Convert file to base64
    const base64Image = await fileToBase64(file);
    
    // Create AI prompt template
    const aiPromptTemplate = `Create a professional product photoshoot of the following product: ${productDescription}. 
      Use beautiful lighting, soft shadows, and a clean background. 
      Make the product stand out with high quality studio lighting and professional styling. 
      The image should look like a premium commercial product photograph.
      IMPORTANT: Make sure the product is clearly visible and is the main focus of the image.`;

    // Generate image using DALL-E-3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: aiPromptTemplate,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const generatedImageUrl = response.data[0].url;
    
    if (!generatedImageUrl) {
      return {
        success: false,
        error: 'No image was generated'
      };
    }

    return {
      success: true,
      generatedImageUrl
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during image generation'
    };
  }
}

export async function editProductImage(imageUrl: string, prompt: string): Promise<ImageResponse> {
  try {
    if (!prompt || !imageUrl) {
      return {
        success: false,
        error: 'Please provide both an image and edit instructions'
      };
    }

    // Use DALL-E-3 to generate a new image based on the prompt and reference image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Using this product image as reference, ${prompt}. Maintain the same product but apply the requested changes.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const generatedImageUrl = response.data[0].url;
    
    if (!generatedImageUrl) {
      return {
        success: false,
        error: 'No image was generated'
      };
    }

    return {
      success: true,
      generatedImageUrl
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during image editing'
    };
  }
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
} 