'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Shield, Users, FileCheck, Settings, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateAdminCredentials, setAdminSession } from '@/lib/adminSession';
import { useDarkMode } from '@/lib/useDarkMode';

export default function AdminLoginPage() {
  const router = useRouter();
  const { getHomeLink } = useDarkMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [homeLink, setHomeLink] = useState<string>('/');

  useEffect(() => {
    setHomeLink(getHomeLink());
  }, [getHomeLink]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!validateAdminCredentials(email, password)) {
      setError('Invalid email or password');
      return;
    }

    setIsSubmitting(true);

    // Set session first
    setAdminSession(email);

    // Small delay to ensure localStorage is written
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Redirect to admin dashboard (use replace to avoid back button issues)
    router.replace('/admin');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-32 md:pt-36 pb-12 lg:pb-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Left: Description */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#0F5FA8] mb-4">
                Admin Portal
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Manage approval requests, practices, plans, and policies for the Alliance of Independent Physicians.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: FileCheck,
                  title: 'Approval Requests (V2)',
                  description: 'Review and manage all approval requests with multi-party workflows (Admin + Practice Admin)',
                },
                {
                  icon: Building2,
                  title: 'Practice Management',
                  description: 'Manage practices, locations, insurance, and doctor rosters',
                },
                {
                  icon: Users,
                  title: 'Manage Membership Plans',
                  description: 'Edit pricing, features, and plan configurations',
                },
                {
                  icon: Settings,
                  title: 'Update Policies',
                  description: 'Maintain organization policies and documentation',
                },
                {
                  icon: Shield,
                  title: 'Secure Access',
                  description: 'Protected admin-only access with secure authentication',
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#0F5FA8]/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-[#0F5FA8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0F5FA8] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Login Card */}
          <div className="lg:w-1/2 flex items-center">
            <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#0F5FA8]">
                  Sign In
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your admin credentials to access the portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@aip.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full border-gray-300 focus:ring-[#0F5FA8] focus:border-[#0F5FA8]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full pr-10 border-gray-300 focus:ring-[#0F5FA8] focus:border-[#0F5FA8]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#0F5FA8] hover:bg-[#1a6bb8] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href={homeLink}
                    className="text-sm text-[#0F5FA8] hover:text-[#1a6bb8] hover:underline inline-flex items-center gap-1"
                  >
                    ← Back to site
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
