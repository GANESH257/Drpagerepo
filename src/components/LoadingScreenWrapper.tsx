'use client';

import { useState } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { SmoothScrollWrapper } from './SmoothScrollWrapper';

export function LoadingScreenWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Small delay before showing content for smooth transition
    setTimeout(() => {
      setHasLoaded(true);
    }, 300);
  };

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div 
        className={`transition-opacity duration-700 ease-out ${
          isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ 
          visibility: isLoading ? 'hidden' : 'visible',
          transition: 'opacity 0.7s ease-out, visibility 0.7s ease-out'
        }}
      >
        <SmoothScrollWrapper>
          {children}
        </SmoothScrollWrapper>
      </div>
    </>
  );
}
