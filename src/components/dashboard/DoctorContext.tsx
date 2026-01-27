'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Doctor } from '@/types';

interface DoctorContextType {
  doctor: Doctor;
  updateDoctor: (doctor: Doctor) => void;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export function DoctorProvider({
  doctor: initialDoctor,
  children,
  onUpdate,
}: {
  doctor: Doctor;
  children: ReactNode;
  onUpdate: (doctor: Doctor) => void;
}) {
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);

  // Sync with prop changes
  useEffect(() => {
    setDoctor(initialDoctor);
  }, [initialDoctor]);

  // Memoize updateDoctor to prevent infinite loops
  const updateDoctor = useCallback((updatedDoctor: Doctor) => {
    setDoctor(updatedDoctor);
    onUpdate(updatedDoctor);
  }, [onUpdate]);

  return (
    <DoctorContext.Provider value={{ doctor, updateDoctor }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctorContext() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctorContext must be used within DoctorProvider');
  }
  return context;
}
