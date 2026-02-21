'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Practice } from '@/types/practice';
import { Doctor } from '@/types';
import { getPracticeBySlug, getDoctorsForPractice } from '@/lib/services/practiceDirectoryService';
import { DoctorMiniCard } from '@/components/public/practices/DoctorMiniCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GenericCTASection } from '@/components/GenericCTASection';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Users,
  Stethoscope,
  Shield,
  ExternalLink,
} from 'lucide-react';

interface PracticeProfileClientProps {
  slug: string;
}

/**
 * Derive specialties from doctors in a practice
 * Normalizes, deduplicates, and sorts specialties
 */
function deriveSpecialtiesFromDoctors(doctors: Doctor[]): string[] {
  const specialtiesSet = new Set<string>();
  
  doctors.forEach(doctor => {
    // Add primary specialty
    if (doctor.specialty && doctor.specialty.trim()) {
      specialtiesSet.add(doctor.specialty.trim());
    }
    // Add all specialties array
    if (doctor.specialties && Array.isArray(doctor.specialties)) {
      doctor.specialties.forEach(spec => {
        if (spec && spec.trim()) {
          specialtiesSet.add(spec.trim());
        }
      });
    }
  });
  
  // Return sorted array
  return Array.from(specialtiesSet).sort();
}

export function PracticeProfileClient({ slug }: PracticeProfileClientProps) {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [derivedSpecialties, setDerivedSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPracticeData() {
      // Load practice
      const practiceData = await getPracticeBySlug(slug);
      if (!practiceData) {
        setLoading(false);
        return;
      }

      setPractice(practiceData);

      // Load doctors for this practice
      const practiceDoctors = await getDoctorsForPractice(practiceData.id);
      setDoctors(practiceDoctors);

      // Derive specialties from doctors
      const specialties = practiceDoctors.length > 0
        ? deriveSpecialtiesFromDoctors(practiceDoctors)
        : (practiceData.specialties || []); // Fallback to practice.specialties
      setDerivedSpecialties(specialties);

      setLoading(false);
    }
    loadPracticeData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <p className="text-brand-dark-blue text-lg">Loading practice details...</p>
        </div>
      </div>
    );
  }

  if (!practice) {
    notFound();
  }

  // Build Google Maps URL
  const addressString = `${practice.address.line1}, ${practice.address.city}, ${practice.address.state} ${practice.address.zip}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue-alt to-brand-dark-blue/90 text-white">
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{practice.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-lg mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>
                  {practice.address.city}, {practice.address.state}
                </span>
                {practice.locations && practice.locations.length > 1 && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
                    {practice.locations.length} Locations
                  </Badge>
                )}
              </div>
              {doctors.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{doctors.length} {doctors.length === 1 ? 'Doctor' : 'Doctors'}</span>
                </div>
              )}
            </div>
            
            {/* Specialties in Hero */}
            {(derivedSpecialties.length > 0 || (practice.specialties && practice.specialties.length > 0)) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {(derivedSpecialties.length > 0 ? derivedSpecialties : practice.specialties || []).slice(0, 5).map((specialty) => (
                    <Badge 
                      key={specialty} 
                      variant="secondary" 
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm"
                    >
                      {specialty}
                    </Badge>
                  ))}
                  {(derivedSpecialties.length > 0 ? derivedSpecialties : practice.specialties || []).length > 5 && (
                    <Badge 
                      variant="secondary" 
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm"
                    >
                      +{(derivedSpecialties.length > 0 ? derivedSpecialties : practice.specialties || []).length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              {practice.phone && (
                <Button asChild variant="secondary" size="lg" className="bg-white text-brand-dark-blue hover:bg-gray-100">
                  <a href={`tel:${practice.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </a>
                </Button>
              )}
              {practice.email && (
                <Button asChild variant="secondary" size="lg" className="bg-white text-brand-dark-blue hover:bg-gray-100">
                  <a href={`mailto:${practice.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
              )}
              {practice.website && (
                <Button asChild variant="secondary" size="lg" className="bg-white text-brand-dark-blue hover:bg-gray-100">
                  <a href={practice.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              {practice.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-brand-teal" />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{practice.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Locations Section */}
              {practice.locations && practice.locations.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-brand-teal" />
                        {practice.locations.length > 1 ? (
                          <span>Locations ({practice.locations.length})</span>
                        ) : (
                          <span>Location</span>
                        )}
                      </CardTitle>
                      {practice.locations.length > 1 && (
                        <Badge variant="secondary">{practice.locations.length} Locations</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {practice.locations.map((location, index) => (
                      <div key={location.id || index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                        {location.name && (
                          <h4 className="font-semibold text-lg text-gray-900 mb-3">{location.name}</h4>
                        )}
                        <div className="space-y-2">
                          <p className="text-gray-700">{location.address}</p>
                          <p className="text-gray-700">
                            {location.city}, {location.state} {location.zip}
                          </p>
                          {location.phone && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {location.phone}
                            </p>
                          )}
                          {location.hours && (
                            <p className="text-sm text-gray-600">{location.hours}</p>
                          )}
                          {location.lat && location.lng && (
                            <Button asChild variant="outline" size="sm" className="mt-2">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.address}, ${location.city}, ${location.state} ${location.zip}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                Get Directions
                                <ExternalLink className="h-3 w-3 ml-2" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Services */}
              {practice.services && practice.services.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-brand-teal" />
                      Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {practice.services.map((service) => (
                        <Badge key={service} variant="outline" className="text-sm">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Insurance */}
              {practice.insurance && practice.insurance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-brand-teal" />
                      Accepted Insurance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {practice.insurance.map((ins) => (
                        <Badge key={ins.slug} variant="secondary" className="text-sm">
                          {ins.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Doctor Roster */}
              {doctors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-brand-teal" />
                      Our Doctors ({doctors.length})
                    </CardTitle>
                    <CardDescription>
                      Meet the physicians at {practice.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {doctors.map((doctor) => (
                        <DoctorMiniCard key={doctor.id} doctor={doctor} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {practice.phone && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Phone</p>
                      <a
                        href={`tel:${practice.phone}`}
                        className="text-brand-teal hover:underline flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        {practice.phone}
                      </a>
                    </div>
                  )}
                  {practice.email && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                      <a
                        href={`mailto:${practice.email}`}
                        className="text-brand-teal hover:underline flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        {practice.email}
                      </a>
                    </div>
                  )}
                  {practice.website && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Website</p>
                      <a
                        href={practice.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-teal hover:underline flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Address</p>
                    <p className="text-sm text-gray-600">
                      {practice.address.line1}
                      {practice.address.line2 && `, ${practice.address.line2}`}
                      <br />
                      {practice.address.city}, {practice.address.state} {practice.address.zip}
                    </p>
                  </div>
                  {derivedSpecialties.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {derivedSpecialties.slice(0, 5).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {derivedSpecialties.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{derivedSpecialties.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : practice.specialties && practice.specialties.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {practice.specialties.slice(0, 5).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {practice.specialties.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{practice.specialties.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Specialties</p>
                      <p className="text-sm text-gray-500">Specialties not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <GenericCTASection />
        </div>
      </div>
    </div>
  );
}
