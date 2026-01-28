'use client';

import { useState, useEffect, useCallback } from 'react';
import { Doctor } from '@/types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardMobileSidebar } from './DashboardMobileSidebar';
import { DashboardFooter } from './DashboardFooter';
import { DoctorProvider } from './DoctorContext';

interface DashboardLayoutProps {
  doctor: Doctor;
  children: React.ReactNode;
  onProfileUpdate?: (doctor: Doctor) => void;
}

export function DashboardLayout({ doctor, children, onProfileUpdate }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(doctor);

  // Sync doctor prop with state when it changes
  useEffect(() => {
    setCurrentDoctor(doctor);
  }, [doctor]);

  const handleProfileUpdate = useCallback((updatedDoctor: Doctor) => {
    setCurrentDoctor(updatedDoctor);
    onProfileUpdate?.(updatedDoctor);
  }, [onProfileUpdate]);

  return (
    <DoctorProvider doctor={currentDoctor} onUpdate={handleProfileUpdate}>
      <div className="min-h-screen skin-benefits-enhanced flex flex-col">
        <DashboardHeader 
          doctor={currentDoctor} 
          onMenuClick={() => setMobileSidebarOpen(true)} 
        />
        <DashboardSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <DashboardMobileSidebar
          open={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
        />
        <main
          className={`
            transition-all duration-300 flex-1
            lg:ml-64
            ${sidebarCollapsed ? 'lg:ml-16' : ''}
            pt-32 md:pt-36
          `}
        >
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
        <DashboardFooter sidebarCollapsed={sidebarCollapsed} />
      </div>
    </DoctorProvider>
  );
}
