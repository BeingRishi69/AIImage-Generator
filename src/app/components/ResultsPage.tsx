import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiFolder, FiImage } from 'react-icons/fi';
import ChatInterface from './ChatInterface';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  messages: Message[];
  currentImageUrl?: string;
}

interface ResultsPageProps {
  initialImageUrl: string;
  onSendMessage: (message: string) => Promise<string>;
  productDescription: string;
  onGoBack: () => void;
  isGenerating: boolean;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ 
  initialImageUrl, 
  onSendMessage,
  productDescription,
  onGoBack,
  isGenerating
}) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('aiProjects');
    if (savedProjects) {
      try {
        return JSON.parse(savedProjects);
      } catch (e) {
        console.error('Error parsing saved projects:', e);
      }
    }
    
    // Create default project if none exists
    const defaultProject = {
      id: `project-${Date.now()}`,
      name: 'First Project',
      createdAt: new Date().toISOString(),
      messages: [],
      currentImageUrl: initialImageUrl
    };
    
    return [defaultProject];
  });
  
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the current active project
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  
  useEffect(() => {
    localStorage.setItem('aiProjects', JSON.stringify(projects));
  }, [projects]);
  
  // When initialImageUrl changes, update the current project's image
  useEffect(() => {
    if (initialImageUrl && activeProject) {
      // Only update if this is a new project with no messages yet
      if (activeProject.messages.length === 0) {
        const updatedProjects = projects.map(project => 
          project.id === activeProject.id
            ? { ...project, currentImageUrl: initialImageUrl }
            : project
        );
        setProjects(updatedProjects);
        
        // Add initial AI message with the generated image
        handleAddMessage({
          role: 'assistant',
          content: `I've created this image based on your description: "${productDescription}"`,
          imageUrl: initialImageUrl
        });
      }
    }
  }, [initialImageUrl, activeProject?.id]);
  
  const handleSendMessage = async (content: string) => {
    if (!activeProject || isLoading) return;
    
    // Add user message
    handleAddMessage({
      role: 'user',
      content
    });
    
    setIsLoading(true);
    
    try {
      // Send to API and get new image URL
      const newImageUrl = await onSendMessage(content);
      
      // Update current image
      const updatedProjects = projects.map(project => 
        project.id === activeProject.id
          ? { ...project, currentImageUrl: newImageUrl }
          : project
      );
      setProjects(updatedProjects);
      
      // Add AI response with new image
      handleAddMessage({
        role: 'assistant',
        content: 'I\'ve updated your image with the requested changes.',
        imageUrl: newImageUrl
      });
      
    } catch (error) {
      console.error('Error getting updated image:', error);
      
      // Add error message
      handleAddMessage({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddMessage = (message: Message) => {
    if (!activeProject) return;
    
    const updatedProjects = projects.map(project => {
      if (project.id === activeProject.id) {
        return {
          ...project,
          messages: [...project.messages, message]
        };
      }
      return project;
    });
    
    setProjects(updatedProjects);
  };
  
  const handleCreateProject = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: `Project ${projects.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [],
      currentImageUrl: initialImageUrl
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setActiveProjectId(newProject.id);
  };
  
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
  };
  
  const handleDeleteProject = (projectId: string) => {
    if (projects.length === 1) {
      alert('You cannot delete your only project.');
      return;
    }
    
    const confirmed = window.confirm('Are you sure you want to delete this project?');
    if (!confirmed) return;
    
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    
    // If we're deleting the active project, select another one
    if (projectId === activeProjectId) {
      setActiveProjectId(updatedProjects[0].id);
    }
  };
  
  const handleEditProjectName = (projectId: string, currentName: string) => {
    setEditingProjectId(projectId);
    setEditingName(currentName);
  };
  
  const handleSaveProjectName = (projectId: string) => {
    if (!editingName.trim()) {
      setEditingProjectId(null);
      setEditingName('');
      return;
    }
    
    const updatedProjects = projects.map(project => 
      project.id === projectId
        ? { ...project, name: editingName.trim() }
        : project
    );
    
    setProjects(updatedProjects);
    setEditingProjectId(null);
    setEditingName('');
  };
  
  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingName('');
  };
  
  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };
  
  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Projects Sidebar */}
      <div className="w-64 border-r border-purple-100 bg-white flex flex-col">
        <div className="p-4 border-b border-purple-100 bg-purple-50">
          <h2 className="text-lg font-semibold text-purple-800">Your Projects</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-purple-100">
            {projects.map(project => (
              <li key={project.id}>
                {editingProjectId === project.id ? (
                  <div className="p-2 flex items-center">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-purple-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleSaveProjectName(project.id)}
                      className="p-1 text-purple-600 hover:text-purple-800 ml-1"
                      title="Save"
                    >
                      <FiSave size={16} />
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="p-1 text-gray-600 hover:text-gray-800 ml-1"
                      title="Cancel"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`p-3 flex items-center cursor-pointer ${
                      activeProjectId === project.id 
                        ? 'bg-purple-100 text-purple-900' 
                        : 'hover:bg-purple-50 text-gray-800'
                    }`}
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <FiFolder 
                      className={`mr-2 ${
                        activeProjectId === project.id 
                          ? 'text-purple-700' 
                          : 'text-gray-500'
                      }`} 
                    />
                    <span className="flex-1 truncate">{project.name}</span>
                    <div className="flex">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProjectName(project.id, project.name);
                        }}
                        className="p-1 text-gray-500 hover:text-purple-700"
                        title="Rename"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="p-1 text-gray-500 hover:text-purple-700 ml-1"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-3 border-t border-purple-100">
          <button 
            onClick={handleCreateProject}
            className="w-full py-2 px-3 bg-white border border-purple-300 text-purple-700 rounded-lg flex items-center justify-center hover:bg-purple-50 transition-colors font-medium"
          >
            <FiPlus className="mr-1" /> New Project
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-purple-100 flex items-center">
          <button 
            onClick={onGoBack}
            className="text-purple-700 hover:text-purple-900 p-1 rounded-full hover:bg-purple-50"
            title="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="ml-3 text-xl font-semibold text-purple-800">
            {activeProject?.name}
          </h1>
        </div>
        
        {/* Chat area with current image */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            {/* Chat Interface Component */}
            <ChatInterface 
              messages={activeProject?.messages || []}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              currentImage={activeProject?.currentImageUrl}
              onPromptClick={handlePromptClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 