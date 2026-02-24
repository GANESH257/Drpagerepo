'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { GoogleAuthButton } from './GoogleAuthButton';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

export function AuthCard() {
  const [activeTab, setActiveTab] = useState('signin');

  return (
    <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="space-y-1 pb-4 p-6">
        <CardTitle className="text-2xl md:text-3xl font-bold text-center text-[#0F5FA8]">
          {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-center text-base text-gray-600">
          {activeTab === 'signin'
            ? 'Sign in to your doctor account'
            : 'Join our network of independent physicians'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-dark-blue data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-dark-blue data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-6">
            <GoogleAuthButton />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <SignInForm onSuccess={() => setActiveTab('signin')} />
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <GoogleAuthButton />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <SignUpForm
              onSuccess={() => setActiveTab('signin')}
              onSwitchToSignIn={() => setActiveTab('signin')}
            />
          </TabsContent>
        </Tabs>
        <p className="text-xs text-gray-500 text-center mt-4">
          Your information is secure and protected. We respect your privacy.
        </p>
      </CardContent>
    </Card>
  );
}
