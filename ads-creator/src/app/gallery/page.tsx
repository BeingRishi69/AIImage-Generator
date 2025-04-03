'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../components/Header';
import { FiDownload, FiExternalLink, FiTrash2 } from 'react-icons/fi';

interface ProjectImage {
  id: string;
  imageUrl: string;
  projectName: string;
  createdAt: string;
}

export default function Gallery() {
  const { data: session } = useSession();
  const [images, setImages] = useState<ProjectImage[]>([]);
  
  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('aiProjects');
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        
        // Extract all images from projects
        const allImages: ProjectImage[] = [];
        
        projects.forEach((project: any) => {
          if (project.currentImageUrl) {
            allImages.push({
              id: `${project.id}-current`,
              imageUrl: project.currentImageUrl,
              projectName: project.name,
              createdAt: project.createdAt
            });
          }
          
          // Add images from messages
          project.messages.forEach((message: any, index: number) => {
            if (message.imageUrl) {
              allImages.push({
                id: `${project.id}-msg-${index}`,
                imageUrl: message.imageUrl,
                projectName: project.name,
                createdAt: project.createdAt
              });
            }
          });
        });
        
        // Sort by creation date (newest first)
        allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Remove duplicates based on imageUrl
        const uniqueImages = allImages.filter((image, index, self) => 
          index === self.findIndex((t) => t.imageUrl === image.imageUrl)
        );
        
        setImages(uniqueImages);
      } catch (error) {
        console.error('Error parsing saved projects:', error);
      }
    }
  }, []);
  
  const downloadImage = (imageUrl: string, projectName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Gallery</h1>
          <p className="text-gray-600">All your AI-generated product images in one place.</p>
          
          {session?.user && (
            <p className="mt-2 text-purple-600">
              Welcome back, {session.user.name || 'User'}!
            </p>
          )}
        </div>
        
        {images.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No images yet</h2>
            <p className="text-gray-600 mb-6">
              Your gallery is empty. Start creating amazing product photoshoots to fill it up!
            </p>
            <a 
              href="/"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg inline-block transition-colors"
            >
              Create Your First Image
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative aspect-square">
                  <img 
                    src={image.imageUrl} 
                    alt={`Product from ${image.projectName}`} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => downloadImage(image.imageUrl, image.projectName)}
                      className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-purple-600 transition-colors"
                      title="Download image"
                    >
                      <FiDownload size={16} />
                    </button>
                    <a
                      href={image.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-purple-600 transition-colors"
                      title="Open in new tab"
                    >
                      <FiExternalLink size={16} />
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-1 truncate">{image.projectName}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 