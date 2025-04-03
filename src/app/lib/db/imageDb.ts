'use server';

import { supabase } from '@/app/lib/supabase';

export interface GeneratedImage {
  id: string;
  project_id?: string;
  user_id: string;
  original_image_url?: string;
  generated_image_url: string;
  prompt: string;
  width: number;
  height: number;
  created_at: string;
  metadata?: any;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

/**
 * Get all user's projects
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }
  
  return data as Project[];
}

/**
 * Create a new project
 */
export async function createProject(projectData: {
  name: string;
  description?: string;
  user_id: string;
}): Promise<Project | null> {
  const newProject = {
    name: projectData.name,
    description: projectData.description || '',
    user_id: projectData.user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_archived: false,
  };
  
  const { data, error } = await supabase
    .from('projects')
    .insert(newProject)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating project:', error);
    return null;
  }
  
  return data as Project;
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  
  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }
  
  return data as Project;
}

/**
 * Save a generated image
 */
export async function saveGeneratedImage(imageData: {
  project_id?: string;
  user_id: string;
  original_image_url?: string;
  generated_image_url: string;
  prompt: string;
  width: number;
  height: number;
  metadata?: any;
}): Promise<GeneratedImage | null> {
  const newImage = {
    project_id: imageData.project_id,
    user_id: imageData.user_id,
    original_image_url: imageData.original_image_url,
    generated_image_url: imageData.generated_image_url,
    prompt: imageData.prompt,
    width: imageData.width,
    height: imageData.height,
    created_at: new Date().toISOString(),
    metadata: imageData.metadata || {}
  };
  
  const { data, error } = await supabase
    .from('generated_images')
    .insert(newImage)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving generated image:', error);
    return null;
  }
  
  return data as GeneratedImage;
}

/**
 * Get images for a project
 */
export async function getProjectImages(projectId: string): Promise<GeneratedImage[]> {
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching project images:', error);
    return [];
  }
  
  return data as GeneratedImage[];
}

/**
 * Get all user's images
 */
export async function getUserImages(userId: string): Promise<GeneratedImage[]> {
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user images:', error);
    return [];
  }
  
  return data as GeneratedImage[];
}

/**
 * Save edit history
 */
export async function saveImageEdit(editData: {
  image_id: string;
  user_id: string;
  edit_prompt: string;
  previous_version_url: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('edit_history')
    .insert({
      image_id: editData.image_id,
      user_id: editData.user_id,
      edit_prompt: editData.edit_prompt,
      previous_version_url: editData.previous_version_url,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error saving edit history:', error);
    return false;
  }
  
  return true;
}

/**
 * Get edit history for an image
 */
export async function getImageEditHistory(imageId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('edit_history')
    .select('*')
    .eq('image_id', imageId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching edit history:', error);
    return [];
  }
  
  return data;
}

/**
 * Record usage
 */
export async function recordUsage(usageData: {
  user_id: string;
  operation_type: string;
  credits_used: number;
  request_details?: any;
}): Promise<boolean> {
  const { error } = await supabase
    .from('usage_records')
    .insert({
      user_id: usageData.user_id,
      operation_type: usageData.operation_type,
      credits_used: usageData.credits_used,
      created_at: new Date().toISOString(),
      request_details: usageData.request_details || {},
      status: 'completed'
    });
  
  if (error) {
    console.error('Error recording usage:', error);
    return false;
  }
  
  return true;
} 