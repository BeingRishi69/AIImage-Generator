import React from 'react';
import { FiDownload, FiEdit3, FiShare2, FiCopy, FiCheck } from 'react-icons/fi';

interface GeneratedImageProps {
  imageUrl: string | null;
  isLoading: boolean;
  onEditRequest: () => void;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ 
  imageUrl, 
  isLoading,
  onEditRequest 
}) => {
  const [isCopied, setIsCopied] = React.useState(false);
  
  const handleShareClick = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'ai-product-photoshoot.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-xl font-medium text-gray-700">Creating your product photoshoot...</p>
        <p className="mt-2 text-gray-500">This may take a few moments</p>
      </div>
    );
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt="AI-generated product photoshoot" 
          className="w-full h-auto object-cover"
        />
        
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={handleDownload}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md hover:bg-white transition-colors"
            title="Download image"
          >
            <FiDownload className="text-gray-700" />
          </button>
          
          <button 
            onClick={handleShareClick}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md hover:bg-white transition-colors"
            title={isCopied ? "Link copied!" : "Copy link"}
          >
            {isCopied ? <FiCheck className="text-green-500" /> : <FiCopy className="text-gray-700" />}
          </button>
        </div>
      </div>
      
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your AI Product Photoshoot</h2>
        <p className="text-gray-600 mb-6">
          Your professional product image is ready. Use the edit button below to make specific changes or refinements.
        </p>
        
        <button
          onClick={onEditRequest}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg hover:opacity-90 transition-opacity text-lg font-medium"
        >
          <FiEdit3 size={20} />
          <span>Edit with AI</span>
        </button>
        
        <div className="mt-6 bg-pink-50 rounded-lg p-4 border border-pink-100">
          <h3 className="font-medium text-gray-700 mb-2">Pro Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-pink-500 font-bold">•</span>
              <span>Try specific editing requests like "Make the background blue" or "Add more shadows"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-500 font-bold">•</span>
              <span>Request style changes such as "Make it look more minimalist" or "Create a vintage style"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-500 font-bold">•</span>
              <span>Ask for lighting adjustments like "Add dramatic lighting" or "Make the lighting softer"</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeneratedImage; 