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
    <Card className="w-full card-vibrant">
      <CardHeader className="space-y-1 pb-4 p-6">
        <CardTitle className="text-2xl md:text-3xl font-bold text-center text-brand-dark-blue">
          {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-center text-base">
          {activeTab === 'signin'
            ? 'Sign in to your doctor account'
            : 'Join our network of independent physicians'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
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
      </CardContent>
    </Card>
  );
}
