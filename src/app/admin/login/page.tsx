'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Shield, Users, FileCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateAdminCredentials, setAdminSession } from '@/lib/adminSession';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="min-h-screen skin-benefits-enhanced">
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-12 lg:pb-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Left: Description */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-brand-dark-blue mb-4">
                Admin Portal
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Manage membership requests, plans, and policies for the Alliance of Independent Physicians.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: FileCheck,
                  title: 'Review Membership Requests',
                  description: 'Approve or reject physician membership applications',
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
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-brand-teal" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-dark-blue mb-1">
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
            <Card className="w-full card-vibrant">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-brand-dark-blue">
                  Sign In
                </CardTitle>
                <CardDescription>
                  Enter your admin credentials to access the portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@aip.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10"
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
                    variant="gradient"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t">
                  <Link
                    href="/"
                    className="text-sm text-brand-teal hover:text-brand-dark-blue hover:underline inline-flex items-center gap-1"
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
