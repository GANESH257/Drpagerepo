'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Doctor } from '@/types';
import { doctors } from '@/data/doctors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookingModal } from '@/components/BookingModal';
import { GenericCTASection } from '@/components/GenericCTASection';
import { DoctorCard } from '@/components/DoctorCard';
import { getInstitutionById } from '@/lib/institutionStorage';
import { getActorFromSession, canSendReferral } from '@/lib/services/permissionService';
import { getContactCard } from '@/lib/services/visibilityService';
import { createReferral } from '@/lib/services/referralEngine';
import { practices } from '@/data/practices';
import { getCreatedPractices, mergePractices } from '@/lib/storage/practiceStorage';
import { getPracticeById } from '@/lib/services/practiceDirectoryService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import {
  CheckCircle2,
  MapPin,
  Phone,
  Calendar,
  ExternalLink,
  GraduationCap,
  Building2,
  Award,
  Briefcase,
  Clock,
  Building,
  Send,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DoctorProfileProps {
  doctor: Doctor;
}

export function DoctorProfile({ doctor }: DoctorProfileProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [contactCard, setContactCard] = useState<any>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Referral form state
  const [referralForm, setReferralForm] = useState({
    patientInitials: '',
    patientAge: '',
    patientSex: '' as 'male' | 'female' | 'other' | '',
    condition: '',
    notes: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load contact card with visibility rules
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const actor = getActorFromSession();
      
      // Get practice (v2) or institution (v1 backward compatibility)
      let practice = null;
      if (doctor.practiceId) {
        practice = getPracticeById(doctor.practiceId);
      }
      
      // If no practice found, try to get institution for backward compatibility
      if (!practice && doctor.institutionId) {
        const institution = getInstitutionById(doctor.institutionId);
        if (institution) {
          // Convert institution to practice-like structure for visibility service
          practice = {
            id: institution.id,
            slug: institution.slug,
            name: institution.name,
            description: institution.description || '',
            phone: institution.phone,
            email: institution.email,
            website: institution.website,
            address: institution.address,
            locations: [],
            specialties: [],
            doctorIds: [],
            createdAt: '',
            updatedAt: '',
          };
        }
      }
      
      if (practice) {
        const card = getContactCard(actor, doctor, practice);
        setContactCard(card);
      }
    } catch (error) {
      console.error('Error loading contact card:', error);
    }
  }, [doctor]);

  // Generate realistic doctor image URL - use consistent seed based on name
  const generateDoctorImage = (doctor: Doctor): string => {
    if (doctor.image) return doctor.image;
    
    // Create a hash from doctor's name for consistent image
    let hash = 0;
    const name = doctor.fullName.toLowerCase();
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use hash to select from professional photo range (0-99)
    const photoId = Math.abs(hash % 100);
    
    // Use a professional medical photo service
    // Using randomuser.me portraits which look more professional and realistic
    const gender = Math.abs(hash) % 2 === 0 ? 'men' : 'women';
    return `https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`;
  };
  
  const imageUrl = generateDoctorImage(doctor);
  const fallbackImageUrl = `https://i.pravatar.cc/400?img=${Math.abs(doctor.id.charCodeAt(0) % 70)}`;

  // Get related doctors (same specialty, different doctor)
  const relatedDoctors = doctors
    .filter(
      (d) =>
        d.id !== doctor.id &&
        d.specialty === doctor.specialty &&
        d.verified
    )
    .slice(0, 3);

  // Get nearest 2 upcoming available slots, sorted by date and time
  const availableSlots = doctor.availability
    .filter((slot) => slot.available)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    })
    .slice(0, 2);

  // Compute practice once (reused in Practice and Institution sections)
  const practice = useMemo(() => {
    return doctor.practiceId ? getPracticeById(doctor.practiceId) : null;
  }, [doctor.practiceId]);

  return (
    <div ref={sectionRef} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 skin-tint overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Link
            href="/doctors"
            className="text-sm text-brand-dark-blue hover:text-brand-teal mb-6 inline-flex items-center gap-2 transition-colors focus-ring rounded-md px-1 -ml-1"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
            }}
          >
            ← Back to Directory
          </Link>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div 
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.3s, transform 0.7s ease-out 0.3s',
              }}
            >
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl lg:text-3xl font-bold text-brand-dark-blue">
                  {doctor.fullName}
                </h1>
                {doctor.verified && (
                  <Badge 
                    variant="secondary"
                    className="bg-brand-teal/10 text-brand-teal border border-brand-teal/20"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion ? 'scale(1)' : 'scale(0)',
                      transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.5s ease-out 0.5s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s',
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-lg md:text-xl text-muted-foreground mb-4">
                {doctor.specialty}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button 
                size="lg" 
                onClick={() => setBookingOpen(true)} 
                className="w-full md:w-auto bg-brand-teal hover:bg-brand-teal/90 text-white transition-all duration-200 hover:scale-105 shadow-lg animate-pulse-subtle"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.4s, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s',
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Request Appointment
              </Button>
              {doctor.bookingUrl && (
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="w-full md:w-auto border-2 border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue hover:text-white transition-all duration-200 hover:scale-105 shadow-md"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                    transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.5s, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s',
                  }}
                >
                  <a
                    href={doctor.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Book Directly
                  </a>
                </Button>
              )}
              {(() => {
                const actor = getActorFromSession();
                if (canSendReferral(actor) && actor.kind !== 'public') {
                  return (
                    <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
                      <DialogTrigger asChild>
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full md:w-auto border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200 hover:scale-105 shadow-md"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Referral
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Referral</DialogTitle>
                          <DialogDescription>
                            Send a referral to {doctor.fullName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="condition">Condition *</Label>
                            <Textarea
                              id="condition"
                              value={referralForm.condition}
                              onChange={(e) => setReferralForm({ ...referralForm, condition: e.target.value })}
                              placeholder="Describe the condition or reason for referral..."
                              required
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="patient-initials">Patient Initials</Label>
                              <Input
                                id="patient-initials"
                                value={referralForm.patientInitials}
                                onChange={(e) => setReferralForm({ ...referralForm, patientInitials: e.target.value })}
                                placeholder="ABC"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <Label htmlFor="patient-age">Age</Label>
                              <Input
                                id="patient-age"
                                type="number"
                                value={referralForm.patientAge}
                                onChange={(e) => setReferralForm({ ...referralForm, patientAge: e.target.value })}
                                placeholder="45"
                                min="0"
                                max="150"
                              />
                            </div>
                            <div>
                              <Label htmlFor="patient-sex">Sex</Label>
                              <Select
                                value={referralForm.patientSex}
                                onValueChange={(value) => setReferralForm({ ...referralForm, patientSex: value as any })}
                              >
                                <SelectTrigger id="patient-sex">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="referral-notes">Notes (optional)</Label>
                            <Textarea
                              id="referral-notes"
                              value={referralForm.notes}
                              onChange={(e) => setReferralForm({ ...referralForm, notes: e.target.value })}
                              placeholder="Additional notes about the referral..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowReferralDialog(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!referralForm.condition.trim()) {
                                toast.error('Please provide a condition');
                                return;
                              }
                              
                              try {
                                setIsSubmittingReferral(true);
                                const actor = getActorFromSession();
                                createReferral(actor, {
                                  toDoctorId: doctor.id,
                                  patient: {
                                    initials: referralForm.patientInitials || undefined,
                                    age: referralForm.patientAge ? parseInt(referralForm.patientAge) : undefined,
                                    sex: referralForm.patientSex || undefined,
                                  },
                                  condition: referralForm.condition,
                                  notes: referralForm.notes || undefined,
                                });
                                
                                toast.success('Referral sent successfully');
                                setShowReferralDialog(false);
                                setReferralForm({
                                  patientInitials: '',
                                  patientAge: '',
                                  patientSex: '',
                                  condition: '',
                                  notes: '',
                                });
                              } catch (error: any) {
                                toast.error(error.message || 'Failed to send referral');
                              } finally {
                                setIsSubmittingReferral(false);
                              }
                            }}
                            disabled={isSubmittingReferral || !referralForm.condition.trim()}
                          >
                            {isSubmittingReferral ? 'Sending...' : 'Send Referral'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 md:px-6 pb-16">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card 
              className="card-vibrant mt-8"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.5s, transform 0.7s ease-out 0.5s',
              }}
            >
              <CardHeader>
                <CardTitle className="text-brand-dark-blue">About</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {doctor.about || doctor.bio}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Practice Section (Primary) */}
            {(() => {
              // Practice is computed once at component level via useMemo
              // If practice exists, show Practice section
              if (practice) {
                return (
                  <>
                    <Card 
                      className="card-vibrant border-2 border-brand-teal/20"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                        transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.55s, transform 0.7s ease-out 0.55s',
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-brand-dark-blue flex items-center gap-2">
                          <Building className="h-5 w-5 text-brand-teal" />
                          Practice
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-brand-dark-blue mb-2">
                              {practice.name}
                            </h3>
                            <div className="space-y-2 text-muted-foreground">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p>{practice.address.line1}</p>
                                  {practice.address.line2 && <p>{practice.address.line2}</p>}
                                  <p>
                                    {practice.address.city}, {practice.address.state} {practice.address.zip}
                                  </p>
                                </div>
                              </div>
                              {contactCard && contactCard.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  <a 
                                    href={`tel:${contactCard.phone}`}
                                    className="hover:text-brand-teal transition-colors"
                                  >
                                    {contactCard.phone}
                                  </a>
                                  {contactCard.source === 'practice' && (
                                    <span className="text-xs text-gray-500">(Practice Contact)</span>
                                  )}
                                </div>
                              )}
                              {contactCard && contactCard.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 flex-shrink-0" />
                                  <a 
                                    href={`mailto:${contactCard.email}`}
                                    className="hover:text-brand-teal transition-colors"
                                  >
                                    {contactCard.email}
                                  </a>
                                  {contactCard.source === 'practice' && (
                                    <span className="text-xs text-gray-500">(Practice Contact)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {practice.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {practice.description.substring(0, 200)}
                              {practice.description.length > 200 ? '...' : ''}
                            </p>
                          )}
                          
                          <Button
                            asChild
                            variant="gradient"
                            className="w-full sm:w-auto"
                          >
                            <Link href={`/practices/${practice.slug}`}>
                              View Practice
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              }
              
              // If practiceId exists but practice not found, show warning
              if (doctor.practiceId && !practice) {
                return (
                  <>
                    <Alert 
                      variant="default"
                      className="bg-amber-50 border-amber-200 text-amber-800"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                        transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.55s, transform 0.7s ease-out 0.55s',
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        This doctor is linked to a practice that is not available in the directory.
                      </AlertDescription>
                    </Alert>
                  </>
                );
              }
              
              return null;
            })()}

            {/* Institution Section (Legacy Fallback) */}
            {(() => {
              // Practice is computed once at component level via useMemo
              // If practice exists, don't show Institution
              if (practice) {
                return null;
              }
              
              // Load institution for fallback
              let institution = null;
              if (doctor.institutionId) {
                institution = getInstitutionById(doctor.institutionId);
              }
              
              if (!institution) {
                // Show warning if practiceId is missing (legacy doctor)
                if (!doctor.practiceId) {
                  return (
                    <Alert 
                      variant="default"
                      className="bg-amber-50 border-amber-200 text-amber-800"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                        transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.55s, transform 0.7s ease-out 0.55s',
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        Legacy doctor record missing practice association.
                      </AlertDescription>
                    </Alert>
                  );
                }
                return null;
              }
              
              // Show Institution section with legacy label
              return (
                <Card 
                  className="card-vibrant border-2 border-gray-200"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                    transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.6s, transform 0.7s ease-out 0.6s',
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-gray-600 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      Institution (Legacy)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          {institution.name}
                        </h3>
                        <div className="space-y-2 text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p>{institution.address.line1}</p>
                              {institution.address.line2 && <p>{institution.address.line2}</p>}
                              <p>
                                {institution.address.city}, {institution.address.state} {institution.address.zip}
                              </p>
                            </div>
                          </div>
                          {contactCard && contactCard.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <a 
                                href={`tel:${contactCard.phone}`}
                                className="hover:text-brand-teal transition-colors"
                              >
                                {contactCard.phone}
                              </a>
                            </div>
                          )}
                          {contactCard && contactCard.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <a 
                                href={`mailto:${contactCard.email}`}
                                className="hover:text-brand-teal transition-colors"
                              >
                                {contactCard.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {institution.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {institution.description.substring(0, 200)}
                          {institution.description.length > 200 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Professional Credentials */}
            {(doctor.medicalSchool ||
              doctor.internship ||
              doctor.residency ||
              doctor.boardCertifications ||
              doctor.hospitalPrivileges ||
              doctor.statesLicensedIn) && (
              <Card 
                className="border-2 border-transparent bg-white hover:border-brand-teal/30 hover:shadow-lg transition-all duration-300 hover-lift"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.6s, transform 0.7s ease-out 0.6s',
                }}
              >
                <CardHeader>
                  <CardTitle className="text-brand-dark-blue">Professional Credentials</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Medical School */}
                    {doctor.medicalSchool && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-lg bg-brand-teal/10 transition-all duration-300 hover:bg-brand-teal/20 hover-scale">
                          <GraduationCap className="h-5 w-5 text-brand-teal" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-brand-dark-blue mb-1">
                            Medical School
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {doctor.medicalSchool}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Internship */}
                    {doctor.internship && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-lg bg-brand-teal/10">
                          <Building2 className="h-5 w-5 text-brand-teal" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-brand-dark-blue mb-1">
                            Internship
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {doctor.internship}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Residency */}
                    {doctor.residency && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-lg bg-brand-teal/10">
                          <Building2 className="h-5 w-5 text-brand-teal" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-brand-dark-blue mb-1">
                            Residency
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {doctor.residency}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Board Certifications */}
                    {doctor.boardCertifications &&
                      doctor.boardCertifications.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-2 rounded-lg bg-brand-teal/10">
                            <Award className="h-5 w-5 text-brand-teal" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-brand-dark-blue mb-2">
                              Board Certifications
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {doctor.boardCertifications.map((cert, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Hospital Privileges */}
                    {doctor.hospitalPrivileges &&
                      doctor.hospitalPrivileges.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-2 rounded-lg bg-brand-teal/10">
                            <Briefcase className="h-5 w-5 text-brand-teal" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-brand-dark-blue mb-2">
                              Hospital Privileges
                            </p>
                            <ul className="space-y-1">
                              {doctor.hospitalPrivileges.map((hospital, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-muted-foreground"
                                >
                                  • {hospital}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                    {/* States Licensed In */}
                    {doctor.statesLicensedIn &&
                      doctor.statesLicensedIn.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-2 rounded-lg bg-brand-teal/10">
                            <MapPin className="h-5 w-5 text-brand-teal" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-brand-dark-blue mb-2">
                              States Licensed In
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {doctor.statesLicensedIn.map((state, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {state}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {(doctor.specialties && doctor.specialties.length > 0) && (
              <Card 
                className="border-2 border-transparent bg-white hover:border-brand-teal/30 hover:shadow-lg transition-all duration-300 hover-lift"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.7s, transform 0.7s ease-out 0.7s',
                }}
              >
                <CardHeader>
                  <CardTitle className="text-brand-dark-blue">Specialties</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.map((spec, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-base py-1.5 px-3 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 hover:bg-brand-teal/20 transition-colors"
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conditions & Services */}
            {doctor.conditionsAndServices && doctor.conditionsAndServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Conditions & Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {doctor.conditionsAndServices.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Locations */}
            <Card 
              className="card-vibrant"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.8s, transform 0.7s ease-out 0.8s',
              }}
            >
              <CardHeader>
                <CardTitle className="text-brand-dark-blue">Locations</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {doctor.locations.map((location, index) => (
                    <div 
                      key={index} 
                      className="border-l-4 border-brand-teal pl-4 transition-all duration-300 hover:border-brand-teal/70 hover:pl-5"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-20px)',
                        transition: prefersReducedMotion
                          ? 'opacity 0.3s ease'
                          : `opacity 0.6s ease-out ${0.9 + index * 0.1}s, transform 0.6s ease-out ${0.9 + index * 0.1}s`,
                      }}
                    >
                      <h4 className="font-semibold mb-1 text-brand-dark-blue">{location.name}</h4>
                      <p className="text-muted-foreground">
                        {location.address}
                        <br />
                        {location.city}, {location.state} {location.zip}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        {contactCard && contactCard.phone && (
                          <a
                            href={`tel:${contactCard.phone}`}
                            className="text-sm text-brand-teal hover:text-brand-dark-blue transition-colors flex items-center gap-1 focus-ring rounded-md px-1 -ml-1"
                          >
                            <Phone className="h-4 w-4" />
                            {contactCard.phone}
                            {contactCard.source === 'practice' && (
                              <span className="text-xs text-gray-500 ml-1">(Practice)</span>
                            )}
                          </a>
                        )}
                        {contactCard && contactCard.email && (
                          <a
                            href={`mailto:${contactCard.email}`}
                            className="text-sm text-brand-teal hover:text-brand-dark-blue transition-colors flex items-center gap-1 focus-ring rounded-md px-1 -ml-1"
                          >
                            <Mail className="h-4 w-4" />
                            {contactCard.email}
                            {contactCard.source === 'practice' && (
                              <span className="text-xs text-gray-500 ml-1">(Practice)</span>
                            )}
                          </a>
                        )}
                        {location.directionsUrl && (
                          <a
                            href={location.directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-brand-teal hover:text-brand-dark-blue transition-colors flex items-center gap-1 focus-ring rounded-md px-1 -ml-1"
                          >
                            <MapPin className="h-4 w-4" />
                            Directions
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {location.hours && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Practice Hours:</strong> {location.hours}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Accepted Insurance */}
            <Card>
              <CardHeader>
                <CardTitle>Accepted Insurance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {doctor.insurance.map((ins) => (
                    <Badge key={ins.slug} variant="outline">
                      {ins.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Doctor Image - Sidebar */}
            <Card className="overflow-hidden">
              <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gray-100">
                <Image
                  src={imageError ? fallbackImageUrl : imageUrl}
                  alt={doctor.fullName}
                  fill
                  className="object-contain object-center"
                  unoptimized
                  onError={() => setImageError(true)}
                />
              </div>
              {/* Visit Personal Website - Prominent placement under image */}
              {doctor.website && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <a
                    href={doctor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-dark-blue hover:text-brand-teal border border-brand-teal/30 hover:border-brand-teal/50 rounded-lg transition-all duration-200 font-semibold text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Personal Website
                  </a>
                </div>
              )}
            </Card>

            {/* Booking Slots */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Available Appointments</CardTitle>
                <CardDescription className="text-sm">
                  Select a time slot to request an appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {availableSlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No available slots at this time. Please contact the office
                    directly.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-brand-teal/30 text-brand-dark-blue hover:bg-brand-teal hover:text-white transition-all duration-200 text-sm py-2 h-auto"
                        onClick={() => setBookingOpen(true)}
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-20px)',
                          transition: prefersReducedMotion
                            ? 'opacity 0.3s ease'
                            : `opacity 0.5s ease-out ${0.7 + index * 0.05}s, transform 0.5s ease-out ${0.7 + index * 0.05}s`,
                        }}
                      >
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        {new Date(slot.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-3 text-xs text-brand-teal hover:text-brand-dark-blue hover:bg-brand-teal/10"
                  onClick={() => setBookingOpen(true)}
                >
                  View All Times →
                </Button>
              </CardContent>
            </Card>

            {/* Office Hours */}
            {doctor.locations[0]?.hours && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-teal" />
                    Practice Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {doctor.locations[0].hours}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Info */}
            <Card 
              className="card-vibrant"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.7s, transform 0.7s ease-out 0.7s',
              }}
            >
              <CardHeader>
                <CardTitle className="text-brand-dark-blue">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div>
                  <p className="text-sm font-medium">Credentials</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.credentials}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Accepts New Patients</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.acceptsNewPatients ? 'Yes' : 'No'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <GenericCTASection />

        {/* Related Doctors */}
        {relatedDoctors.length > 0 && (
          <section className="mt-12 py-8 skin-paper rounded-xl">
            <h2 
              className="text-2xl md:text-3xl lg:text-3xl font-bold mb-6 text-brand-dark-blue"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 1.3s, transform 0.7s ease-out 1.3s',
              }}
            >
              Other {doctor.specialty} Doctors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedDoctors.map((relatedDoctor, index) => (
                <div
                  key={relatedDoctor.id}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion
                      ? 'translateY(0) scale(1)' 
                      : 'translateY(30px) scale(0.95)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${index * 100}ms`
                      : `opacity 0.7s ease-out ${1.4 + index * 0.1}s, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${1.4 + index * 0.1}s`,
                  }}
                >
                  <DoctorCard doctor={relatedDoctor} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        doctorName={doctor.fullName}
        slots={doctor.availability}
      />
    </div>
  );
}
