import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiDownload, FiCopy, FiLoader, FiCheck } from 'react-icons/fi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading?: boolean;
  onSendMessage: (message: string) => void;
  onPromptClick?: (prompt: string) => void;
  currentImage?: string;
}

const suggestedPrompts = [
  "Make the background pure white",
  "Add more dramatic lighting to the product",
  "Show the product from a different angle",
  "Make the product colors more vibrant",
  "Add a subtle shadow beneath the product"
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading = false, 
  onSendMessage,
  onPromptClick,
  currentImage 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const handlePromptClick = (prompt: string) => {
    if (onPromptClick) {
      onPromptClick(prompt);
    }
  };
  
  const copyToClipboard = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      setCopiedStates({...copiedStates, [imageUrl]: true});
      setTimeout(() => {
        setCopiedStates({...copiedStates, [imageUrl]: false});
      }, 2000);
    });
  };
  
  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'ai-product-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-md">
              <h3 className="text-xl font-semibold text-purple-800">Welcome to AI Product Photoshoot</h3>
              <p className="text-gray-600">
                Your professional AI product images will appear here. Use the suggestions below or type your own instructions to edit the image.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 shadow-sm
                  ${message.role === 'user' 
                    ? 'bg-purple-100 text-gray-800' 
                    : 'bg-white border border-purple-100 text-gray-800'
                  }`}
              >
                <div className="text-sm">{message.content}</div>
                
                {message.imageUrl && (
                  <div className="mt-3 relative">
                    <img 
                      src={message.imageUrl} 
                      alt="Generated product" 
                      className="rounded-md shadow-sm max-h-[300px] object-contain"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button 
                        onClick={() => copyToClipboard(message.imageUrl!)}
                        className="p-1.5 bg-white rounded-full shadow-md text-purple-600 hover:text-purple-800 transition-colors"
                        title="Copy image URL"
                      >
                        {copiedStates[message.imageUrl!] ? <FiCheck size={16} /> : <FiCopy size={16} />}
                      </button>
                      <button 
                        onClick={() => downloadImage(message.imageUrl!)}
                        className="p-1.5 bg-white rounded-full shadow-md text-purple-600 hover:text-purple-800 transition-colors"
                        title="Download image"
                      >
                        <FiDownload size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-purple-100 rounded-lg p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <FiLoader className="animate-spin text-purple-600" />
                <span className="text-gray-600">AI is working...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <div className="mb-3">
            <p className="text-sm font-medium text-purple-700 mb-2">Try these suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-sm transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t border-purple-100 p-3">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your instructions to edit the image..."
            className="flex-1 border border-purple-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`px-4 rounded-lg flex items-center justify-center transition-colors
              ${inputValue.trim() && !isLoading 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface; 