import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiImage, FiX, FiMessageSquare, FiEdit, FiZap, FiInfo } from 'react-icons/fi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatBoxProps {
  visible: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
}

const AiChatBox: React.FC<AiChatBoxProps> = ({ visible, onClose, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can help edit your product image. Describe the specific changes you\'d like to make. For example, "Change the background to white" or "Make the lighting more dramatic".' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Suggested prompts for quick selection
  const suggestedPrompts = [
    "Make the background white but keep the product",
    "Add soft shadows beneath the product",
    "Use more vibrant colors for the product",
    "Create a minimalist style but focus on the product"
  ];
  
  useEffect(() => {
    scrollToBottom();
    
    // Focus the input when the chat becomes visible
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, visible]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(inputValue);
  };
  
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    const userMessage = content.trim();
    setInputValue('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send to parent component for processing
      await onSendMessage(userMessage);
      
      // Add AI response
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'I\'ve updated your image based on your request! Is there anything else you\'d like to change?' 
        }
      ]);
    } catch (error) {
      // Handle error
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I had trouble processing that request. Please try again with a more specific instruction.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md md:max-w-lg h-[600px] max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center shadow-sm">
              <FiEdit className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">AI Image Editor</h3>
              <p className="text-xs text-gray-500">Powered by OpenAI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p><strong>Important:</strong> Be specific about what you want to change while keeping the product itself.</p>
              <p className="mt-1">Example: "Change the background to blue but keep the product the same"</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2 max-w-[85%] shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Suggested prompts */}
        <div className="p-3 border-t border-gray-100 gap-2 overflow-x-auto flex hide-scrollbar">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              disabled={isLoading}
              className="whitespace-nowrap py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm flex-shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Describe how to edit the image..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`p-3 rounded-full flex items-center justify-center ${
                !inputValue.trim() || isLoading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-sm'
              }`}
              title="Send message"
            >
              <FiSend size={18} />
            </button>
          </div>
          
          {!isLoading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 px-2">
              <FiZap size={14} className="text-yellow-500" />
              <span>Always mention to keep the product in your edits</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AiChatBox; 