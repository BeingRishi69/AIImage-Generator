'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultsPage from './components/ResultsPage';
import { generateProductImage, editProductImage } from './lib/openai';
import LoadingScreen from './components/LoadingScreen';
import { useRouter } from 'next/navigation';
import { getUserCredits, useCredits } from './lib/db/creditsDb';
import Link from 'next/link';
import { FiCreditCard, FiAlertCircle } from 'react-icons/fi';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'upload' | 'results'>('upload');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [productDescription, setProductDescription] = useState('');
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cost per generation
  const CREDITS_PER_GENERATION = 3;

  // Fetch user's credits
  useEffect(() => {
    async function fetchCredits() {
      if (session?.user?.id) {
        try {
          const credits = await getUserCredits(session.user.id as string);
          setUserCredits(credits);
        } catch (error) {
          console.error('Error fetching user credits:', error);
        }
      }
    }

    if (status === 'authenticated') {
      fetchCredits();
    }
  }, [status, session]);

  const handleImageUpload = async (file: File) => {
    if (!session?.user?.id) {
      setErrorMessage('You must be signed in to generate images.');
      return;
    }

    if (userCredits !== null && userCredits < CREDITS_PER_GENERATION) {
      setErrorMessage(`You need at least ${CREDITS_PER_GENERATION} credits to generate an image. Please purchase more credits.`);
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    
    try {
      const result = await generateProductImage(file, productDescription);
      
      if (result.success && result.generatedImageUrl) {
        setGeneratedImageUrl(result.generatedImageUrl);
        setCurrentStep('results');
        
        // Use credits
        if (session?.user?.id) {
          await useCredits(
            session.user.id as string,
            CREDITS_PER_GENERATION,
            'Image generation'
          );
          
          // Update credit count
          const updatedCredits = await getUserCredits(session.user.id as string);
          setUserCredits(updatedCredits);
        }
      } else {
        setErrorMessage(result.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setErrorMessage('An error occurred while generating the image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSendMessage = async (message: string) => {
    if (!session?.user?.id) {
      setErrorMessage('You must be signed in to edit images.');
      return;
    }

    if (userCredits !== null && userCredits < CREDITS_PER_GENERATION) {
      setErrorMessage(`You need at least ${CREDITS_PER_GENERATION} credits to edit this image. Please purchase more credits.`);
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    
    try {
      const result = await editProductImage(generatedImageUrl as string, message);
      
      if (result.success && result.generatedImageUrl) {
        setGeneratedImageUrl(result.generatedImageUrl);
        
        // Use credits
        if (session?.user?.id) {
          await useCredits(
            session.user.id as string,
            CREDITS_PER_GENERATION,
            'Image editing'
          );
          
          // Update credit count
          const updatedCredits = await getUserCredits(session.user.id as string);
          setUserCredits(updatedCredits);
        }
      } else {
        setErrorMessage(result.error || 'Failed to edit image');
      }
    } catch (error) {
      console.error('Error editing image:', error);
      setErrorMessage('An error occurred while editing the image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoBack = () => {
    setCurrentStep('upload');
    setGeneratedImageUrl(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {status === 'authenticated' && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 mb-3 sm:mb-0">AI Product Studio</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg">
                <FiCreditCard className="mr-1.5" />
                <span className="font-medium">{userCredits !== null ? userCredits : '...'} Credits</span>
              </div>
              
              <Link
                href="/credits"
                className="flex items-center justify-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg"
              >
                Buy Credits
              </Link>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-red-700">{errorMessage}</p>
              {userCredits !== null && userCredits < CREDITS_PER_GENERATION && (
                <div className="mt-2">
                  <Link
                    href="/credits"
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Purchase Credits
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'upload' && (
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            onDescriptionChange={setProductDescription} 
          />
        )}
        
        {currentStep === 'results' && generatedImageUrl && (
          <ResultsPage 
            initialImageUrl={generatedImageUrl} 
            onSendMessage={handleSendMessage}
            productDescription={productDescription}
            onGoBack={handleGoBack}
            isGenerating={isGenerating}
          />
        )}
        
        {isGenerating && <LoadingScreen />}
      </div>
    </main>
  );
}
