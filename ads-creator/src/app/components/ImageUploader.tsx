'use client';
import React, { useState, useRef, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { FiUpload, FiInfo } from 'react-icons/fi';
import Link from 'next/link';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onDescriptionChange: (description: string) => void;
}

export default function ImageUploader({ onImageUpload, onDescriptionChange }: ImageUploaderProps) {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    onDescriptionChange(e.target.value);
  };

  const handleSubmit = () => {
    if (file && description.trim()) {
      onImageUpload(file);
    } else if (!file) {
      alert('Please upload a product image first');
    } else {
      alert('Please provide a product description');
    }
  };

  if (status === 'loading') {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <FiInfo className="mx-auto text-4xl text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Sign in to Generate Images</h2>
        <p className="text-gray-600 mb-6">You need to sign in to access the AI Product Studio</p>
        <Link 
          href="/auth/signin" 
          className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Product Studio</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Upload a Product Image</h2>
          
          <div
            className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isHovering 
                ? 'border-purple-400 bg-purple-50' 
                : preview 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleOpenFileDialog}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {preview ? (
              <div className="h-full w-full p-3 flex flex-col items-center">
                <div className="relative h-full w-full">
                  <img 
                    src={preview} 
                    alt="Product preview" 
                    className="h-full w-full object-contain rounded-lg" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 rounded-lg transition-opacity">
                    <span className="text-white font-medium">Change Image</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <FiUpload className="text-3xl text-gray-400 mb-3" />
                <p className="text-gray-600 text-center max-w-xs">
                  Drag & drop a product image here, or click to browse
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Supports JPG, PNG, WEBP up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Describe Your Product</h2>
          
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 h-44 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe your product in detail. For example: A minimalist white ceramic coffee mug with a matte finish and bamboo handle."
            value={description}
            onChange={handleDescriptionChange}
          ></textarea>
          
          <p className="text-gray-500 text-sm mt-2">
            Be specific about materials, colors, style, and features
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            file && description.trim()
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={!file || !description.trim()}
        >
          Generate Product Image
        </button>
      </div>
    </div>
  );
} 