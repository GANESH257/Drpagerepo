'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  MapPin,
  CreditCard,
  Calendar,
  Users,
  LogOut,
} from 'lucide-react';
import { useDoctorSession } from '@/lib/useDoctorSession';

interface DoctorDashboardShellProps {
  email: string;
}

const actionCards = [
  {
    icon: User,
    title: 'Edit Profile',
    description: 'Update your professional information and credentials',
    comingSoon: true,
  },
  {
    icon: MapPin,
    title: 'Manage Locations',
    description: 'Add or update your practice locations',
    comingSoon: true,
  },
  {
    icon: CreditCard,
    title: 'Insurance & Services',
    description: 'Manage accepted insurance plans and services offered',
    comingSoon: true,
  },
  {
    icon: Calendar,
    title: 'Appointment Requests',
    description: 'View and manage patient appointment requests',
    comingSoon: true,
  },
  {
    icon: Users,
    title: 'Referrals',
    description: 'Track referrals from other physicians in the network',
    comingSoon: true,
  },
];

export function DoctorDashboardShell({ email }: DoctorDashboardShellProps) {
  const router = useRouter();
  const { clearSession } = useDoctorSession();

  const handleLogout = () => {
    clearSession();
    router.push('/join-us');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 pb-12 md:pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 md:mb-12 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-dark-blue mb-2 md:mb-3">
              Doctor Dashboard
            </h1>
            <p className="text-lg text-gray-700">
              Welcome, <span className="font-semibold text-brand-dark-blue">{email}</span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-brand-teal/10">
                      <Icon className="h-5 w-5 text-brand-teal" />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {card.comingSoon && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                      Coming Soon
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Banner */}
        <Card className="mt-8 bg-brand-teal/5 border-brand-teal/20">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This is a demo dashboard. Full functionality including profile
              management, appointment requests, and referrals will be available in Phase 2.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
