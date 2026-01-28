'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { departments } from '@/data/departments';
import { OnboardingDraft } from '@/types';

interface OnboardingBasicDetailsFormProps {
  initialData?: OnboardingDraft['basicDetails'];
  onContinue: (data: OnboardingDraft['basicDetails']) => void;
}

const credentials = ['M.D.', 'D.O.', 'D.P.M.', 'N.P.', 'P.A.', 'Other'];

export function OnboardingBasicDetailsForm({
  initialData,
  onContinue,
}: OnboardingBasicDetailsFormProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [selectedCredentials, setSelectedCredentials] = useState(
    initialData?.credentials || ''
  );
  const [specialty, setSpecialty] = useState(initialData?.specialty || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || '');
  const [zip, setZip] = useState(initialData?.zip || '');
  const [acceptsNewPatients, setAcceptsNewPatients] = useState(
    initialData?.acceptsNewPatients ?? true
  );
  const [bio, setBio] = useState(initialData?.bio || '');
  const [medicalSchool, setMedicalSchool] = useState(
    initialData?.medicalSchool || ''
  );
  const [residency, setResidency] = useState(initialData?.residency || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!selectedCredentials) newErrors.credentials = 'Credentials are required';
    if (!specialty) newErrors.specialty = 'Primary specialty is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!bio.trim()) newErrors.bio = 'Bio is required';
    if (bio.trim().length < 20)
      newErrors.bio = 'Bio must be at least 20 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onContinue({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      credentials: selectedCredentials,
      specialty,
      phone: phone.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      acceptsNewPatients,
      bio: bio.trim(),
      medicalSchool: medicalSchool.trim() || undefined,
      residency: residency.trim() || undefined,
      specialties: specialty ? [specialty] : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) setErrors({ ...errors, firstName: '' });
            }}
            placeholder="John"
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (errors.lastName) setErrors({ ...errors, lastName: '' });
            }}
            placeholder="Doe"
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Credentials & Specialty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <p className="text-sm text-destructive">{errors.credentials}</p>
          )}
        </div>

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
            <p className="text-sm text-destructive">{errors.specialty}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number <span className="text-destructive">*</span>
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
          className={errors.phone ? 'border-destructive' : ''}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      {/* Practice Location */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Practice Location</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className={errors.city ? 'border-destructive' : ''}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
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
              className={errors.state ? 'border-destructive' : ''}
            />
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">
              ZIP Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="zip"
              value={zip}
              onChange={(e) => {
                setZip(e.target.value);
                if (errors.zip) setErrors({ ...errors, zip: '' });
              }}
              placeholder="90001"
              className={errors.zip ? 'border-destructive' : ''}
            />
            {errors.zip && (
              <p className="text-sm text-destructive">{errors.zip}</p>
            )}
          </div>
        </div>
      </div>

      {/* Accepts New Patients */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="acceptsNewPatients" className="text-base">
            Accepting New Patients
          </Label>
          <p className="text-sm text-muted-foreground">
            Toggle this if you're currently accepting new patients
          </p>
        </div>
        <Switch
          id="acceptsNewPatients"
          checked={acceptsNewPatients}
          onCheckedChange={setAcceptsNewPatients}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">
          Professional Bio <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
            if (errors.bio) setErrors({ ...errors, bio: '' });
          }}
          placeholder="Brief professional biography (1-2 sentences)"
          rows={3}
          className={errors.bio ? 'border-destructive' : ''}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum 20 characters. This will appear on your public profile.
        </p>
      </div>

      {/* Optional: Medical School & Residency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="medicalSchool">Medical School (Optional)</Label>
          <Input
            id="medicalSchool"
            value={medicalSchool}
            onChange={(e) => setMedicalSchool(e.target.value)}
            placeholder="University of California, Los Angeles School of Medicine"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="residency">Residency (Optional)</Label>
          <Input
            id="residency"
            value={residency}
            onChange={(e) => setResidency(e.target.value)}
            placeholder="Cedars-Sinai Medical Center"
          />
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-brand-teal hover:bg-brand-teal/90">
          Continue to Plan Selection
        </Button>
      </div>
    </form>
  );
}