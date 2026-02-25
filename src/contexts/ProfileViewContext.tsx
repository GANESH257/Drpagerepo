'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { Doctor } from '@/types';
import { ProfileViewModal, type ProfileViewInput } from '@/components/shared/ProfileViewModal';

interface ProfileViewContextValue {
  /** Open the profile modal for the given doctor (by id, slug, or full doctor). */
  openProfile: (input: ProfileViewInput) => void;
  closeProfile: () => void;
}

const ProfileViewContext = createContext<ProfileViewContextValue | null>(null);

export function useProfileView(): ProfileViewContextValue {
  const ctx = useContext(ProfileViewContext);
  if (!ctx) {
    throw new Error('useProfileView must be used within ProfileViewProvider');
  }
  return ctx;
}

/** Optional hook: returns context or null so callers can use modal only when provider is present (e.g. in portal). */
export function useProfileViewOptional(): ProfileViewContextValue | null {
  return useContext(ProfileViewContext);
}

interface ProfileViewProviderProps {
  children: React.ReactNode;
  /** When true, if openProfile is called with { doctor }, skip refetch and use that object. */
  skipRefetchWhenDoctorPassed?: boolean;
}

export function ProfileViewProvider({
  children,
  skipRefetchWhenDoctorPassed = true,
}: ProfileViewProviderProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<ProfileViewInput | null>(null);

  const openProfile = useCallback((next: ProfileViewInput) => {
    setInput(next);
    setOpen(true);
  }, []);

  const closeProfile = useCallback(() => {
    setOpen(false);
    setInput(null);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    if (!next) closeProfile();
    else setOpen(true);
  }, [closeProfile]);

  return (
    <ProfileViewContext.Provider value={{ openProfile, closeProfile }}>
      {children}
      <ProfileViewModal
        open={open}
        onOpenChange={handleOpenChange}
        input={input}
        skipRefetch={skipRefetchWhenDoctorPassed}
      />
    </ProfileViewContext.Provider>
  );
}
