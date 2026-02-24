'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setAdminSession } from '@/lib/adminSession';
import { login } from '@/lib/api/auth';
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

    setIsSubmitting(true);

    try {
      // Call API to authenticate and get JWT token
      const response = await login(email, password);
      
      // Store JWT token for API calls
      if (typeof window !== 'undefined') {
        localStorage.setItem('aip_doctor_token', response.token);
        localStorage.setItem('aip_doctor_user', JSON.stringify(response.user));
      }

      // Set admin session for UI checks
      setAdminSession(email);

      // Redirect to admin dashboard (use replace to avoid back button issues)
      router.replace('/admin');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="glass-card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Sign In</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your admin credentials to access the portal
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@aip.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-input focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pr-10 rounded-lg border border-input focus:ring-2 focus:ring-ring"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-white border-0"
              style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <Link
              href={homeLink}
              className="text-sm hover:underline inline-flex items-center gap-1"
              style={{ color: 'var(--aip-teal)' }}
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
