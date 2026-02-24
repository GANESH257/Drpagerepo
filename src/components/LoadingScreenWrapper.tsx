'use client';

import { useState } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { SmoothScrollWrapper } from './SmoothScrollWrapper';

export function LoadingScreenWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleLoadingComplete = () => setIsLoading(false);

  return (
    <>
      {isLoading && (
        <LoadingScreen
          onExitStart={() => setHasLoaded(true)}
          onComplete={handleLoadingComplete}
        />
      )}
      <div
        className={`loading-page-content ${hasLoaded ? 'loading-page-content-ready' : 'loading-page-content-pending'} ${isLoading ? 'pointer-events-none' : ''}`}
      >
        <SmoothScrollWrapper>
          {children}
        </SmoothScrollWrapper>
      </div>
    </>
  );
}
