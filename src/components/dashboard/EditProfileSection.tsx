'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Save, RotateCcw, Info, Upload, ChevronRight, ChevronLeft, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Doctor } from '@/types';
import { cn } from '@/lib/utils';
import { saveDoctorProfile, loadDoctorProfile, saveDoctorProfileToAPI } from '@/lib/doctorStorage';
import { getAdminSession } from '@/lib/adminSession';
import { createApprovalRequest, getApprovalRequests } from '@/lib/api/approval-requests';
import { Badge } from '@/components/ui/badge';
import { departments } from '@/data/departments';
import { TagInput } from './TagInput';
import { EditableList } from './EditableList';
import { CredentialItemForm } from '@/components/shared/CredentialItemForm';
import { toCertificationItems } from '@/lib/utils/credentialUtils';
import { CertificationItem } from '@/types';
import { uploadImage, getUploadFullUrl } from '@/lib/api/upload';

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

function ProfileImageUpload({
  doctor,
  updateField,
}: {
  doctor: Doctor;
  updateField: (k: keyof Doctor, v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgSrc = doctor.image
    ? doctor.image.startsWith('http')
      ? doctor.image
      : getUploadFullUrl(doctor.image)
    : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadImage(file);
      updateField('image', getUploadFullUrl(path));
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Profile Image</Label>
      <div className="flex flex-col gap-4">
        {imgSrc && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 group">
            <Image
              src={imgSrc}
              alt={doctor.fullName}
              fill
              className="object-cover"
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => updateField('image', '')}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : imgSrc ? 'Change image' : 'Upload image'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, or WebP. Max 5 MB. Shown on your profile and directory listings.
        </p>
      </div>
    </div>
  );
}

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<'admin' | 'practice_admin' | null>(null);
  const [originalDoctor, setOriginalDoctor] = useState<Doctor>(initialDoctor);
  const [tipsCollapsed, setTipsCollapsed] = useState(false);
  const [hasPendingProfileEdit, setHasPendingProfileEdit] = useState(false);

  useEffect(() => {
    // Load from localStorage if available
    async function load() {
      const saved = await loadDoctorProfile(doctor.id);
      if (saved) {
        setDoctor(saved);
        setOriginalDoctor(saved);
      }
    }
    load();
  }, [doctor.id]);

  // Check for pending profile-edit approval: refetch when doctor.id loads and when user switches back to this tab
  const doctorIdRef = useRef(doctor.id);
  doctorIdRef.current = doctor.id;

  const fetchPendingProfileEdit = useCallback(() => {
    if (getAdminSession() || !doctorIdRef.current) {
      setHasPendingProfileEdit(false);
      return;
    }
    const did = doctorIdRef.current;
    getApprovalRequests({ status: 'pending' })
      .then((requests) => {
        const pending = requests.some(
          (r) =>
            r.target_doctor_id === did &&
            (r.type === 'doctor_profile_edit' || r.type === 'practice_admin_profile_edit') &&
            ((r.type === 'practice_admin_profile_edit' && r.admin_status === 'pending') ||
              (r.type === 'doctor_profile_edit' && (r.practice_admin_status ?? 'pending') === 'pending'))
        );
        setHasPendingProfileEdit(pending);
      })
      .catch(() => setHasPendingProfileEdit(false));
  }, []);

  useEffect(() => {
    if (getAdminSession() || !doctor.id) {
      setHasPendingProfileEdit(false);
      return;
    }
    fetchPendingProfileEdit();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchPendingProfileEdit();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [doctor.id, fetchPendingProfileEdit]);

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

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSubmitError(null);
    setApprovalMessage(null);

    const profilePayload = {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      fullName: doctor.fullName,
      credentials: doctor.credentials,
      specialty: doctor.specialty,
      profileImageUrl: doctor.image,
      bio: doctor.bio,
      about: doctor.about,
      phone: doctor.phone,
      website: doctor.website,
      medicalSchool: doctor.medicalSchool,
      residency: doctor.residency,
      internship: doctor.internship,
      boardCertifications: doctor.boardCertifications ?? [],
      hospitalPrivileges: doctor.hospitalPrivileges ?? [],
      statesLicensedIn: doctor.statesLicensedIn ?? [],
      npi: doctor.npi,
      badgesAwards: doctor.badgesAwards ?? [],
    };

    try {
      // Admin: direct save (no approval)
      if (getAdminSession()) {
        const updated = await saveDoctorProfileToAPI(doctor.id, doctor);
        if (updated) {
          setDoctor(updated);
          setOriginalDoctor(updated);
          onProfileUpdate?.(updated);
          setIsSaving(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          return;
        }
        await saveDoctorProfile(doctor.id, doctor);
        onProfileUpdate?.(doctor);
        setOriginalDoctor(doctor);
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return;
      }

      // Practice admin: submit for admin approval
      if (doctor.roleInPractice === 'practice_admin') {
        await createApprovalRequest({
          type: 'practice_admin_profile_edit',
          target_doctor_id: doctor.id,
          payload: { doctorId: doctor.id, doctor: profilePayload },
        });
        setSaveSuccess(true);
        setApprovalMessage('admin');
        setHasPendingProfileEdit(true);
        setTimeout(() => { setSaveSuccess(false); setApprovalMessage(null); }, 5000);
        setIsSaving(false);
        return;
      }

      // Doctor: submit for practice admin approval
      await createApprovalRequest({
        type: 'doctor_profile_edit',
        practice_id: doctor.practiceId ?? undefined,
        target_doctor_id: doctor.id,
        payload: { doctorId: doctor.id, doctor: profilePayload },
      });
      setSaveSuccess(true);
      setApprovalMessage('practice_admin');
      setHasPendingProfileEdit(true);
      setTimeout(() => { setSaveSuccess(false); setApprovalMessage(null); }, 5000);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSubmitError((error as Error).message);
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setDoctor(originalDoctor);
    setErrors({});
    setSubmitError(null);
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
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-3xl font-bold text-brand-dark-blue">Edit Profile</h2>
          {hasPendingProfileEdit && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
              Pending approval
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          Update your professional information and credentials
        </p>
        {hasPendingProfileEdit && (
          <p className="text-sm text-amber-700 mt-1 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            You have pending profile changes awaiting approval. The form below shows your current
            live profile. Submitting again will update the pending request instead of creating a new
            one.
          </p>
        )}
      </div>

      {/* Save/Reset Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          {saveSuccess && (
            <span className="text-sm text-green-600">
              {approvalMessage === 'admin'
                ? 'Submitted for admin approval. Changes will apply once approved.'
                : approvalMessage === 'practice_admin'
                  ? 'Submitted for practice admin approval. Changes will apply once approved.'
                  : 'Profile saved successfully!'}
            </span>
          )}
          {submitError && (
            <span className="text-sm text-destructive">{submitError}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving} variant="portal-primary">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className={cn(
        'grid gap-6 grid-cols-1 transition-all duration-200',
        tipsCollapsed ? 'lg:grid-cols-[1fr_3rem]' : 'lg:grid-cols-3'
      )}>
        {/* Main Form - widens when tips collapsed */}
        <div className={cn('space-y-6 min-w-0', !tipsCollapsed && 'lg:col-span-2')}>
          <Tabs defaultValue="basic" className="space-y-4">
            {/* Compact profile summary (reference: aip-doctor-portal-ui Edit Profile header) */}
            <div className="glass-card p-4 flex items-center gap-4 border-b border-border rounded-b-none">
              {doctor.image ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0">
                  <Image
                    src={doctor.image.startsWith('http') ? doctor.image : getUploadFullUrl(doctor.image)}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm flex-shrink-0">
                  {(doctor.firstName?.[0] ?? '') + (doctor.lastName?.[0] ?? '')}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-sm truncate">
                  {doctor.fullName || [doctor.firstName, doctor.lastName].filter(Boolean).join(' ')}
                  {doctor.credentials && <span className="font-normal text-muted-foreground"> · {doctor.credentials}</span>}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {[doctor.specialty, doctor.practiceName || (doctor.hospitalPrivileges && doctor.hospitalPrivileges[0])].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 bg-gray-100 p-1">
              <TabsTrigger value="basic" className="data-[state=active]:bg-white">Basic Info</TabsTrigger>
              <TabsTrigger value="bio" className="data-[state=active]:bg-white">Biography</TabsTrigger>
              <TabsTrigger value="credentials" className="data-[state=active]:bg-white">Credentials</TabsTrigger>
              <TabsTrigger value="status" className="data-[state=active]:bg-white">Status & Settings</TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="basic" className="mt-4">
              <Card className="glass-card card-vibrant">
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                  <CardDescription>Name, specialty, profile image, and primary office hours</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4 doctor-portal-form">
                  {/* Profile Image */}
                  <ProfileImageUpload doctor={doctor} updateField={updateField} />

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={doctor.firstName ?? ''}
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
                        value={doctor.lastName ?? ''}
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
                      value={doctor.fullName ?? ''}
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
                      value={doctor.credentials ?? ''}
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
                      value={doctor.specialty ?? ''}
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
                      value={doctor.locations?.[0]?.hours || ''}
                      onChange={(e) => {
                        const base = doctor.locations ?? [];
                        const updatedLocations = [...base];
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Biography */}
            <TabsContent value="bio" className="mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Biography</CardTitle>
                  <CardDescription>Short bio, detailed about, and links</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4 doctor-portal-form">
                  <div className="space-y-2">
                    <Label htmlFor="bio">
                      Short Bio <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="bio"
                      value={doctor.bio ?? ''}
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

                  <div className="space-y-2">
                    <Label htmlFor="website">Personal/Practice Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      value={doctor.website || ''}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://example.com"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your personal or practice website URL. This will be displayed prominently on your public profile.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bookingUrl">Direct Booking/Contact Page URL (Optional)</Label>
                    <Input
                      id="bookingUrl"
                      type="url"
                      value={doctor.bookingUrl || ''}
                      onChange={(e) => updateField('bookingUrl', e.target.value)}
                      placeholder="https://example.com/contact"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Direct link to your booking or contact page. A "Book Directly" button will appear on your profile when set.
                    </p>
                  </div>
                </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Professional Credentials */}
            <TabsContent value="credentials" className="mt-4">
              <Card className="glass-card card-vibrant">
                <CardHeader>
                  <CardTitle className="text-lg">Professional Credentials</CardTitle>
                  <CardDescription>Education, certifications, and privileges</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4 doctor-portal-form">
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

                  <CredentialItemForm
                    items={toCertificationItems(doctor.boardCertifications)}
                    onChange={(items: CertificationItem[]) => updateField('boardCertifications', items)}
                    label="Board Certifications"
                    addButtonLabel="Add Certification"
                  />

                  <Separator />

                  <CredentialItemForm
                    items={doctor.badgesAwards || []}
                    onChange={(items: CertificationItem[]) => updateField('badgesAwards', items)}
                    label="Badges & Awards"
                    addButtonLabel="Add Badge or Award"
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Status & Settings */}
            <TabsContent value="status" className="mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Status & Settings</CardTitle>
                  <CardDescription>New patients and profile visibility</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4 doctor-portal-form">
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Helper Panel - collapsible; minimizes to narrow strip on the right */}
        <div className={cn('transition-all duration-200', tipsCollapsed ? 'w-12 shrink-0' : 'lg:col-span-1')}>
          <Card className="glass-card sticky top-24 card-vibrant overflow-hidden w-full min-w-[3rem]">
            <CardHeader className="p-3">
              <div className="flex items-center justify-between gap-2">
                {!tipsCollapsed && (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <Info className="h-5 w-5 text-brand-teal shrink-0" />
                      <CardTitle className="text-lg truncate">Profile Tips</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTipsCollapsed(true)}
                      className="shrink-0 h-8 w-8"
                      aria-label="Collapse tips"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {tipsCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTipsCollapsed(false)}
                    className="h-8 w-8 mx-auto"
                    aria-label="Expand tips"
                    title="Profile Tips"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            {!tipsCollapsed && (
              <CardContent className="space-y-4 text-sm pt-0">
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
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
