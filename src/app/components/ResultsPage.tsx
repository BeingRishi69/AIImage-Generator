'use client';
import React, { useState, useRef } from 'react';
import { 
  FiArrowLeft, FiDownload, FiImage, 
  FiSend, FiShare2, FiPlus 
} from 'react-icons/fi';
import Link from 'next/link';

interface ResultsPageProps {
  initialImageUrl: string;
  onSendMessage: (message: string) => void;
  productDescription: string;
  onGoBack: () => void;
  isGenerating: boolean;
}

export default function ResultsPage({
  initialImageUrl,
  onSendMessage,
  productDescription,
  onGoBack,
  isGenerating
}: ResultsPageProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [editMessage, setEditMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{type: 'user' | 'system', message: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditSubmit = async () => {
    if (!editMessage.trim() || isGenerating) return;
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, { type: 'user', message: editMessage }]);
    
    // Add a placeholder system message
    setChatHistory(prev => [...prev, { type: 'system', message: 'Applying edits...' }]);
    
    // Clear input
    setEditMessage('');
    
    // Scroll to bottom
    setTimeout(scrollToBottom, 100);
    
    try {
      await onSendMessage(editMessage);
      
      // Replace the placeholder with success message
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { 
          type: 'system', 
          message: 'Edits applied successfully!' 
        };
        return newHistory;
      });
    } catch (error) {
      // Replace the placeholder with error message
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { 
          type: 'system', 
          message: 'Failed to apply edits. Please try again.' 
        };
        return newHistory;
      });
    }
    
    // Scroll to bottom again after updating messages
    setTimeout(scrollToBottom, 100);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'product-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToGallery = () => {
    // We'll implement this functionality later
    alert('Add to gallery feature coming soon');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        {/* Left column: Image and options */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onGoBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="mr-1" />
              <span>Back</span>
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                title="Download Image"
              >
                <FiDownload />
              </button>
              <button
                onClick={handleAddToGallery}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                title="Add to Gallery"
              >
                <FiPlus />
              </button>
              <Link 
                href={`/gallery`}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                title="View Gallery"
              >
                <FiImage />
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center h-[450px]">
            <img 
              src={imageUrl} 
              alt="Generated product" 
              className="max-h-full max-w-full object-contain rounded"
            />
          </div>
          
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">Product Description</h3>
            <p className="text-gray-700">{productDescription}</p>
          </div>
        </div>
        
        {/* Right column: Chat interface */}
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg text-gray-900">Edit Instructions</h3>
            <p className="text-gray-600 text-sm">
              Describe how you want to modify the image and we'll generate an updated version.
              Each edit costs 3 credits.
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 max-h-[400px]">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
                <FiSend className="text-3xl mb-3 text-gray-300" />
                <p className="mb-2">No edits yet</p>
                <p className="text-sm text-gray-400">
                  Send an instruction below to edit the image
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-3/4 p-3 rounded-lg ${
                        chat.type === 'user' 
                          ? 'bg-purple-100 text-purple-900' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {chat.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-center">
              <input
                type="text"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                placeholder="Describe your desired changes..."
                className="flex-1 border border-gray-300 rounded-l-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                disabled={isGenerating}
              />
              <button
                onClick={handleEditSubmit}
                disabled={!editMessage.trim() || isGenerating}
                className={`p-2.5 rounded-r-lg flex items-center justify-center ${
                  !editMessage.trim() || isGenerating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 