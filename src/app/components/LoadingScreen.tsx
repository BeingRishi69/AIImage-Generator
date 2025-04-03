'use client';
import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Generating Image</h3>
          <p className="text-gray-600 text-center">
            Please wait while we create your professional product image...
          </p>
        </div>
      </div>
    </div>
  );
} 