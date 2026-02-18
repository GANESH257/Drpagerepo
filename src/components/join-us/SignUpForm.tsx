'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { saveJoinEmail } from '@/lib/joinRequestStorage';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
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
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (!agreeToTerms) {
      setTermsError('You must agree to the terms and conditions');
      return;
    }

    setTermsError('');

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Store email for application flow (no auto-login)
    saveJoinEmail(email);
    
    // Redirect to application form
    onSuccess?.();
    router.push('/join-us/application');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) validateEmail(e.target.value);
          }}
          onBlur={() => validateEmail(email)}
          placeholder="your.email@example.com"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'signup-email-error' : undefined}
          className={emailError ? 'border-destructive' : ''}
        />
        {emailError && (
          <p
            id="signup-email-error"
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
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) validatePassword(e.target.value);
              if (confirmPassword && confirmPasswordError) {
                validateConfirmPassword(confirmPassword, e.target.value);
              }
            }}
            onBlur={() => validatePassword(password)}
            placeholder="At least 8 characters"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? 'signup-password-error' : undefined}
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
            id="signup-password-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {passwordError}
          </p>
        )}
        {password && !passwordError && (
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
        <div className="relative">
          <Input
            id="signup-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmPasswordError) {
                validateConfirmPassword(e.target.value, password);
              }
            }}
            onBlur={() => validateConfirmPassword(confirmPassword, password)}
            placeholder="Re-enter your password"
            aria-invalid={!!confirmPasswordError}
            aria-describedby={
              confirmPasswordError ? 'signup-confirm-password-error' : undefined
            }
            className={confirmPasswordError ? 'border-destructive pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={
              showConfirmPassword ? 'Hide password' : 'Show password'
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {confirmPasswordError && (
          <p
            id="signup-confirm-password-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {confirmPasswordError}
          </p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agree-terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => {
              setAgreeToTerms(checked === true);
              if (termsError) setTermsError('');
            }}
            className="mt-1"
            aria-invalid={!!termsError}
          />
          <Label
            htmlFor="agree-terms"
            className="text-sm font-normal cursor-pointer leading-relaxed"
          >
            I agree to the terms and conditions and privacy policy
          </Label>
        </div>
        {termsError && (
          <p
            className="text-sm text-destructive ml-6"
            role="alert"
            aria-live="polite"
          >
            {termsError}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-[#0F5FA8] hover:bg-[#1a6bb8] text-white"
        disabled={isSubmitting || !agreeToTerms}
      >
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
