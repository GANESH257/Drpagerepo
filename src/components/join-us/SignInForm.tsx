'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { findDoctorByEmail } from '@/lib/doctorStorage';
import { checkPassword } from '@/lib/passwordUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DUMMY_PASSWORD = 'AIP@12345';

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const router = useRouter();
  const { setSession } = useDoctorSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if email matches a doctor record (for demo purposes)
    const doctor = findDoctorByEmail(email);
    
    if (!doctor) {
      setGeneralError('Access is available after your membership is approved. Please submit a join request if you haven\'t already.');
      setIsSubmitting(false);
      return;
    }

    // Check password (first check hashed passwords, then fallback to default)
    const isValidPassword = await checkPassword(email, password);
    
    if (isValidPassword) {
      // Only allow sign-in for existing approved doctors (demo mode)
      const emailToUse = doctor.email || email;
      setSession(emailToUse);
      onSuccess?.();
      router.push('/doctor/dashboard');
    } else {
      // Show message about approval requirement
      setGeneralError('Invalid email or password. Please check your credentials and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={() => validateEmail(email)}
            placeholder="doctor@aip.com"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-error' : undefined}
            className={emailError ? 'border-destructive' : ''}
          />
          {emailError && (
            <p
              id="email-error"
              className="text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              {emailError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <div className="relative">
            <Input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              placeholder="Enter your password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className={passwordError ? 'border-destructive pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p
              id="password-error"
              className="text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              {passwordError}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label
              htmlFor="remember-me"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <button
            type="button"
            onClick={() => setShowForgotPasswordDialog(true)}
            className="text-sm text-brand-teal hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* General Error */}
        {generalError && (
          <div
            className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
            role="alert"
            aria-live="polite"
          >
            {generalError}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-brand-teal hover:bg-brand-teal/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              Password reset functionality will be available in Phase 2. For now, please use the demo credentials or contact support.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
