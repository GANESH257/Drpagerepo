'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Save, RotateCcw, Info, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Doctor } from '@/types';
import { saveDoctorProfile, loadDoctorProfile } from '@/lib/doctorStorage';
import { departments } from '@/data/departments';
import { TagInput } from './TagInput';
import { EditableList } from './EditableList';

interface EditProfileSectionProps {
  doctor: Doctor;
  onProfileUpdate: (doctor: Doctor) => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const CREDENTIALS_OPTIONS = ['M.D.', 'D.O.', 'D.P.M.', 'D.D.S.', 'D.M.D.', 'N.P.', 'P.A.'];

const COMMON_CERTIFICATIONS = [
  'American Board of Internal Medicine',
  'American Board of Family Medicine',
  'American Board of Surgery',
  'American Board of Pediatrics',
  'American Board of Psychiatry and Neurology',
  'American Board of Dermatology',
  'American Board of Obstetrics and Gynecology',
  'American Board of Orthopaedic Surgery',
  'American Board of Radiology',
  'American Board of Anesthesiology',
];

export function EditProfileSection({ doctor: initialDoctor, onProfileUpdate }: EditProfileSectionProps) {
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [errors, setErrors] = useState<Partial<Record<keyof Doctor, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [originalDoctor, setOriginalDoctor] = useState<Doctor>(initialDoctor);

  useEffect(() => {
    // Load from localStorage if available
    const saved = loadDoctorProfile(doctor.id);
    if (saved) {
      setDoctor(saved);
      setOriginalDoctor(saved);
    }
  }, [doctor.id]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Doctor, string>> = {};

    if (!doctor.specialty.trim()) {
      newErrors.specialty = 'Specialty is required';
    }
    if (!doctor.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }
    if (!doctor.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    // Save to localStorage
    saveDoctorProfile(doctor.id, doctor);

    // Update parent if callback provided
    onProfileUpdate?.(doctor);
    setOriginalDoctor(doctor);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setDoctor(originalDoctor);
    setErrors({});
  };

  const updateField = useCallback(<K extends keyof Doctor>(field: K, value: Doctor[K]) => {
    setDoctor((prevDoctor) => ({ ...prevDoctor, [field]: value }));
    setErrors((prevErrors) => {
      if (prevErrors[field]) {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      }
      return prevErrors;
    });
  }, []);

  const handleAcceptsNewPatientsChange = useCallback((checked: boolean) => {
    updateField('acceptsNewPatients', checked);
  }, [updateField]);

  const handleFeaturedChange = useCallback((checked: boolean) => {
    updateField('featured', checked);
  }, [updateField]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-dark-blue">Edit Profile</h2>
        <p className="text-muted-foreground mt-2">
          Update your professional information and credentials
        </p>
      </div>

      {/* Save/Reset Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-sm text-green-600">Profile saved successfully!</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving} variant="gradient">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Accordion type="multiple" defaultValue={['basic', 'bio', 'credentials', 'status']} className="space-y-4">
            {/* Basic Info */}
            <AccordionItem value="basic" className="card-vibrant rounded-lg px-4">
              <AccordionTrigger>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {/* Profile Image */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image</Label>
                    <div className="flex flex-col gap-4">
                      {doctor.image && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={doctor.image}
                            alt={doctor.fullName}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              // Hide image on error
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="image"
                          type="url"
                          value={doctor.image || ''}
                          onChange={(e) => updateField('image', e.target.value)}
                          placeholder="https://example.com/image.jpg or /path/to/image.jpg"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter a URL or path to your profile image. This will be displayed on your profile page and directory listings.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={doctor.firstName}
                        onChange={(e) => {
                          updateField('firstName', e.target.value);
                          // Auto-update fullName
                          updateField('fullName', `${e.target.value} ${doctor.lastName}, ${doctor.credentials}`);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={doctor.lastName}
                        onChange={(e) => {
                          updateField('lastName', e.target.value);
                          // Auto-update fullName
                          updateField('fullName', `${doctor.firstName} ${e.target.value}, ${doctor.credentials}`);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={doctor.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="credentials">Credentials</Label>
                    <Select
                      value={doctor.credentials}
                      onValueChange={(value) => {
                        updateField('credentials', value);
                        // Auto-update fullName
                        const nameParts = doctor.fullName.split(',');
                        updateField('fullName', `${nameParts[0]}, ${value}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credentials" />
                      </SelectTrigger>
                      <SelectContent>
                        {CREDENTIALS_OPTIONS.map((cred) => (
                          <SelectItem key={cred} value={cred}>
                            {cred}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialty">
                      Primary Specialty <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={doctor.specialty}
                      onValueChange={(value) => updateField('specialty', value)}
                    >
                      <SelectTrigger aria-invalid={!!errors.specialty} className={errors.specialty ? 'border-destructive' : ''}>
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
                      <p className="text-sm text-destructive" role="alert">
                        {errors.specialty}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialties">Additional Specialties</Label>
                    <TagInput
                      tags={doctor.specialties || []}
                      onTagsChange={(tags) => updateField('specialties', tags)}
                      placeholder="Add specialties..."
                      suggestions={departments.map((d) => d.name)}
                    />
                  </div>

                  <Separator />

                  {/* Primary Location Office Hours */}
                  <div className="space-y-2">
                    <Label htmlFor="primaryLocationHours">Primary Location Office Hours</Label>
                    <Input
                      id="primaryLocationHours"
                      value={doctor.locations[0]?.hours || ''}
                      onChange={(e) => {
                        const updatedLocations = [...doctor.locations];
                        if (updatedLocations.length === 0) {
                          // Create a default primary location if none exists
                          updatedLocations.push({
                            name: 'Main Office',
                            address: '',
                            city: '',
                            state: '',
                            zip: '',
                            phone: '',
                            hours: e.target.value,
                          });
                        } else {
                          updatedLocations[0] = {
                            ...updatedLocations[0],
                            hours: e.target.value,
                          };
                        }
                        setDoctor((prevDoctor) => ({ ...prevDoctor, locations: updatedLocations }));
                      }}
                      placeholder="e.g., Mon-Fri: 9:00 AM - 5:00 PM, Sat-Sun: Closed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Office hours for your primary practice location. This will be displayed on your profile page.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Bio & About */}
            <AccordionItem value="bio" className="border rounded-lg px-4">
              <AccordionTrigger>
                <CardTitle className="text-lg">Biography</CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">
                      Short Bio <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="bio"
                      value={doctor.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="A brief professional biography (2-3 sentences)"
                      rows={4}
                      aria-invalid={!!errors.bio}
                      aria-describedby={errors.bio ? 'bio-error' : undefined}
                      className={errors.bio ? 'border-destructive' : ''}
                    />
                    {errors.bio && (
                      <p id="bio-error" className="text-sm text-destructive" role="alert">
                        {errors.bio}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about">Detailed About (Optional)</Label>
                    <Textarea
                      id="about"
                      value={doctor.about || ''}
                      onChange={(e) => updateField('about', e.target.value)}
                      placeholder="A longer, detailed biography for your profile page"
                      rows={8}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Credentials */}
            <AccordionItem value="credentials" className="card-vibrant rounded-lg px-4">
              <AccordionTrigger>
                <CardTitle className="text-lg">Professional Credentials</CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalSchool">Medical School</Label>
                    <Input
                      id="medicalSchool"
                      value={doctor.medicalSchool || ''}
                      onChange={(e) => updateField('medicalSchool', e.target.value)}
                      placeholder="e.g., Harvard Medical School"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="internship">Internship</Label>
                    <Input
                      id="internship"
                      value={doctor.internship || ''}
                      onChange={(e) => updateField('internship', e.target.value)}
                      placeholder="e.g., Massachusetts General Hospital"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="residency">Residency</Label>
                    <Input
                      id="residency"
                      value={doctor.residency || ''}
                      onChange={(e) => updateField('residency', e.target.value)}
                      placeholder="e.g., Cedars-Sinai Medical Center"
                    />
                  </div>

                  <Separator />

                  <EditableList
                    items={doctor.boardCertifications || []}
                    onItemsChange={(items) => updateField('boardCertifications', items)}
                    label="Board Certifications"
                    placeholder="e.g., American Board of Internal Medicine"
                    addButtonLabel="Add Certification"
                  />

                  <Separator />

                  <EditableList
                    items={doctor.hospitalPrivileges || []}
                    onItemsChange={(items) => updateField('hospitalPrivileges', items)}
                    label="Hospital Privileges"
                    placeholder="e.g., Cedars-Sinai Medical Center"
                    addButtonLabel="Add Hospital"
                  />

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="statesLicensedIn">States Licensed In</Label>
                    <TagInput
                      tags={doctor.statesLicensedIn || []}
                      onTagsChange={(tags) => updateField('statesLicensedIn', tags)}
                      placeholder="Add state codes (e.g., CA, NY)"
                      suggestions={US_STATES}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Status Flags */}
            <AccordionItem value="status" className="border rounded-lg px-4">
              <AccordionTrigger>
                <CardTitle className="text-lg">Status & Settings</CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="acceptsNewPatients">Accepts New Patients</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new patients to request appointments
                      </p>
                    </div>
                    <Switch
                      id="acceptsNewPatients"
                      checked={doctor.acceptsNewPatients}
                      onCheckedChange={handleAcceptsNewPatientsChange}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="verified">Verified Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Your verification status (managed by admin)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doctor.verified ? (
                        <span className="text-sm text-green-600 font-medium">Verified</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Pending</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="featured">Featured Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Display prominently on the directory (optional)
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={doctor.featured}
                      onCheckedChange={handleFeaturedChange}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Helper Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 card-vibrant">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-brand-teal" />
                <CardTitle className="text-lg">Profile Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Writing Your Bio</h4>
                <p className="text-muted-foreground">
                  Keep your short bio concise (2-3 sentences) highlighting your expertise and approach to patient care.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Board Certifications</h4>
                <p className="text-muted-foreground">
                  List all current board certifications. This helps patients verify your credentials.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Specialties</h4>
                <p className="text-muted-foreground">
                  Your primary specialty is required. Additional specialties help patients find you when searching.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Profile Completion</h4>
                <p className="text-muted-foreground">
                  Complete profiles with all information filled out tend to receive more appointment requests.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
