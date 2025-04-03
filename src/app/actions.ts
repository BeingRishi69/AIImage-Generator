'use server';

import { generateProductImage, editProductImage } from './lib/openai';

export async function generateImage(file: File, productDescription: string) {
  return await generateProductImage(file, productDescription);
}

export async function editImage(imageUrl: string, prompt: string) {
  return await editProductImage(imageUrl, prompt);
} 