'use server';

import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: 'original-images' | 'generated-images',
  userId: string
): Promise<{ url: string; error: string | null }> {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    
    // Convert File to ArrayBuffer (needed for Supabase storage)
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return { url: '', error: error.message };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error in uploadFile function:', error);
    return { url: '', error: 'Failed to upload file' };
  }
}

/**
 * Upload a base64 image to Supabase Storage
 */
export async function uploadBase64Image(
  base64String: string,
  bucket: 'original-images' | 'generated-images',
  userId: string
): Promise<{ url: string; error: string | null }> {
  try {
    // Extract the MIME type and base64 data
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return { url: '', error: 'Invalid base64 string format' };
    }
    
    const contentType = matches[1];
    const base64Data = matches[2];
    const extension = contentType.split('/')[1];
    
    // Generate a unique file name
    const fileName = `${userId}/${uuidv4()}.${extension}`;
    
    // Convert base64 to Uint8Array
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, byteArray, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading base64 image:', error);
      return { url: '', error: error.message };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error in uploadBase64Image function:', error);
    return { url: '', error: 'Failed to upload image' };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  fileUrl: string,
  bucket: 'original-images' | 'generated-images'
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Extract the file path from the URL
    const url = new URL(fileUrl);
    const pathSegments = url.pathname.split('/');
    const fileName = pathSegments.slice(pathSegments.indexOf(bucket) + 1).join('/');
    
    // Delete from Supabase
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteFile function:', error);
    return { success: false, error: 'Failed to delete file' };
  }
} 