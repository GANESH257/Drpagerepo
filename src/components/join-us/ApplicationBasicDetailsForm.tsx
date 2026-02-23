'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { departments } from '@/data/departments';
import { ApplicationDraft } from '@/types';
import { getJoinEmail } from '@/lib/joinRequestStorage';
import { PracticeSelectionSection, PracticeSelection } from '@/components/join-us/PracticeSelectionSection';
import { useSearchParams } from 'next/navigation';
import { getPracticeInvitationById } from '@/lib/storage/invitationStorage';

interface ApplicationBasicDetailsFormProps {
  initialData?: ApplicationDraft['basicDetails'];
  onContinue: (data: ApplicationDraft['basicDetails']) => void;
}

const credentials = ['M.D.', 'D.O.', 'D.P.M.', 'D.D.S.', 'D.M.D.', 'N.P.', 'P.A.', 'Other'];

export function ApplicationBasicDetailsForm({
  initialData,
  onContinue,
}: ApplicationBasicDetailsFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [selectedCredentials, setSelectedCredentials] = useState(
    initialData?.credentials || ''
  );
  const [specialty, setSpecialty] = useState(initialData?.specialty || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || '');
  const [npi, setNpi] = useState(initialData?.npi || '');
  const [practiceName, setPracticeName] = useState(initialData?.practiceName || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [messageToAdmin, setMessageToAdmin] = useState(initialData?.messageToAdmin || '');
  const [practiceSelection, setPracticeSelection] = useState<PracticeSelection | null>(
    initialData?.practiceSelection || null
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load email from localStorage on mount if not provided
  useEffect(() => {
    if (!email) {
      const savedEmail = getJoinEmail();
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [email]);

  // Check for invitation token in URL
  const searchParams = useSearchParams();
  const [preselectedPracticeId, setPreselectedPracticeId] = useState<string | undefined>();

  useEffect(() => {
    const invitationId = searchParams?.get('invitation');
    if (invitationId && typeof window !== 'undefined') {
      // Try to get invitation from storage
      const invitation = getPracticeInvitationById(invitationId);
      if (invitation && invitation.status === 'sent' && invitation.practiceId) {
        setPreselectedPracticeId(invitation.practiceId);
        // Pre-select existing practice
        setPracticeSelection({ type: 'existing', practiceId: invitation.practiceId });
      }
    }
  }, [searchParams]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!selectedCredentials) newErrors.credentials = 'Credentials are required';
    if (!specialty) newErrors.specialty = 'Primary specialty is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!npi.trim()) newErrors.npi = 'NPI (National Provider Identifier) is required';
    else if (!/^\d{10}$/.test(npi.replace(/\s/g, ''))) newErrors.npi = 'NPI must be exactly 10 digits';
    if (!practiceSelection) {
      newErrors.practiceSelection = 'Please select or create a practice';
    } else if (practiceSelection.type === 'new' && !practiceSelection.practiceName.trim()) {
      newErrors.practiceSelection = 'Practice name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onContinue({
      fullName: fullName.trim(),
      credentials: selectedCredentials,
      specialty,
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      state: state.trim(),
      npi: npi.replace(/\s/g, '').trim(),
      practiceName: practiceName.trim() || undefined,
      website: website.trim() || undefined,
      messageToAdmin: messageToAdmin.trim() || undefined,
      practiceSelection: practiceSelection || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors({ ...errors, fullName: '' });
          }}
          placeholder="Dr. John Smith"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          className={errors.fullName ? 'border-destructive' : ''}
        />
        {errors.fullName && (
          <p id="fullName-error" className="text-sm text-destructive" role="alert">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Credentials */}
      <div className="space-y-2">
        <Label htmlFor="credentials">
          Credentials <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedCredentials}
          onValueChange={(value) => {
            setSelectedCredentials(value);
            if (errors.credentials) setErrors({ ...errors, credentials: '' });
          }}
        >
          <SelectTrigger
            id="credentials"
            aria-invalid={!!errors.credentials}
            className={errors.credentials ? 'border-destructive' : ''}
          >
            <SelectValue placeholder="Select credentials" />
          </SelectTrigger>
          <SelectContent>
            {credentials.map((cred) => (
              <SelectItem key={cred} value={cred}>
                {cred}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.credentials && (
          <p id="credentials-error" className="text-sm text-destructive" role="alert">
            {errors.credentials}
          </p>
        )}
      </div>

      {/* Primary Specialty */}
      <div className="space-y-2">
        <Label htmlFor="specialty">
          Primary Specialty <span className="text-destructive">*</span>
        </Label>
        <Select
          value={specialty}
          onValueChange={(value) => {
            setSpecialty(value);
            if (errors.specialty) setErrors({ ...errors, specialty: '' });
          }}
        >
          <SelectTrigger
            id="specialty"
            aria-invalid={!!errors.specialty}
            className={errors.specialty ? 'border-destructive' : ''}
          >
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.slug} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.specialty && (
          <p id="specialty-error" className="text-sm text-destructive" role="alert">
            {errors.specialty}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          placeholder="your.email@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors({ ...errors, phone: '' });
          }}
          placeholder="(555) 123-4567"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className={errors.phone ? 'border-destructive' : ''}
        />
        {errors.phone && (
          <p id="phone-error" className="text-sm text-destructive" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      {/* City and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              if (errors.city) setErrors({ ...errors, city: '' });
            }}
            placeholder="Los Angeles"
            aria-invalid={!!errors.city}
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p id="city-error" className="text-sm text-destructive" role="alert">
              {errors.city}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">
            State <span className="text-destructive">*</span>
          </Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => {
              setState(e.target.value.toUpperCase());
              if (errors.state) setErrors({ ...errors, state: '' });
            }}
            placeholder="CA"
            maxLength={2}
            aria-invalid={!!errors.state}
            className={errors.state ? 'border-destructive' : ''}
          />
          {errors.state && (
            <p id="state-error" className="text-sm text-destructive" role="alert">
              {errors.state}
            </p>
          )}
        </div>
      </div>

      {/* NPI - National Provider Identifier */}
      <div className="space-y-2">
        <Label htmlFor="npi">
          NPI (National Provider Identifier) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="npi"
          type="text"
          inputMode="numeric"
          maxLength={14}
          value={npi}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 10);
            setNpi(v);
            if (errors.npi) setErrors({ ...errors, npi: '' });
          }}
          placeholder="10-digit NPI number"
          aria-invalid={!!errors.npi}
          aria-describedby={errors.npi ? 'npi-error' : undefined}
          className={errors.npi ? 'border-destructive' : ''}
        />
        <p className="text-xs text-muted-foreground">
          Your unique 10-digit NPI issued by CMS. Used for identity verification.
        </p>
        {errors.npi && (
          <p id="npi-error" className="text-sm text-destructive" role="alert">
            {errors.npi}
          </p>
        )}
      </div>

      {/* Practice Selection */}
      <PracticeSelectionSection
        value={practiceSelection || undefined}
        onChange={useCallback((selection) => {
          setPracticeSelection(selection);
          setErrors((prev) => {
            if (prev.practiceSelection) {
              const { practiceSelection: _, ...rest } = prev;
              return rest;
            }
            return prev;
          });
        }, [])}
        disabled={false}
        preselectedPracticeId={preselectedPracticeId}
      />
      {errors.practiceSelection && (
        <p className="text-sm text-destructive" role="alert">
          {errors.practiceSelection}
        </p>
      )}

      {/* Message to Admin (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="messageToAdmin">Message to Admin (Optional)</Label>
        <Textarea
          id="messageToAdmin"
          value={messageToAdmin}
          onChange={(e) => setMessageToAdmin(e.target.value)}
          placeholder="Why do you want to join? (Optional)"
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Tell us about yourself and why you're interested in joining the network.
        </p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-brand-teal hover:bg-brand-teal/90"
        >
          Continue to Plan Selection
        </Button>
      </div>
    </form>
  );
}
