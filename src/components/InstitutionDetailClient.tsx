'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getInstitutionBySlug, getInstitutionDoctors } from '@/lib/institutionStorage';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { DoctorCard } from '@/components/DoctorCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Globe, Users, Filter } from 'lucide-react';
import { Institution, Doctor } from '@/types';

interface InstitutionDetailClientProps {
  slug: string;
}

export function InstitutionDetailClient({ slug }: InstitutionDetailClientProps) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      const inst = getInstitutionBySlug(slug);
      if (!inst) {
        return;
      }
      setInstitution(inst);

      try {
        const token = getToken();
        const allDocs = await getAllDoctorsArray(token ?? undefined);
        setAllDoctors(allDocs);
        const institutionDoctors = getInstitutionDoctors(inst.id, allDocs);
        setDoctors(institutionDoctors);
      } catch {
        setAllDoctors([]);
        setDoctors([]);
      }
    }
    loadData();
  }, [slug]);

  // Get unique specialties from doctors
  const specialties = useMemo(() => {
    const specSet = new Set<string>();
    doctors.forEach((doctor) => {
      if (doctor.specialty) specSet.add(doctor.specialty);
      if (doctor.specialties) {
        doctor.specialties.forEach((spec) => specSet.add(spec));
      }
    });
    return Array.from(specSet).sort();
  }, [doctors]);

  // Filter doctors by specialty and search query
  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      result = result.filter((doctor) => {
        if (doctor.specialty === selectedSpecialty) return true;
        if (doctor.specialties?.includes(selectedSpecialty)) return true;
        return false;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((doctor) => {
        const fullName = doctor.fullName.toLowerCase();
        const firstName = doctor.firstName.toLowerCase();
        const lastName = doctor.lastName.toLowerCase();
        return (
          fullName.includes(query) ||
          firstName.includes(query) ||
          lastName.includes(query)
        );
      });
    }

    return result;
  }, [doctors, selectedSpecialty, searchQuery]);

  if (!institution) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <p className="text-brand-dark-blue text-lg">Loading practice details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-teal/20 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {institution.name}
              </h1>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-white/90">
                  <MapPin className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      {institution.address.line1}
                      {institution.address.line2 && `, ${institution.address.line2}`}
                    </p>
                    <p className="text-sm text-white/80">
                      {institution.address.city}, {institution.address.state} {institution.address.zip}
                    </p>
                  </div>
                </div>
                
                {institution.phone && (
                  <div className="flex items-center text-white/90">
                    <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                    <a href={`tel:${institution.phone}`} className="hover:text-white transition-colors">
                      {institution.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Specialty Tags */}
              {institution.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {institution.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {institution.phone && (
                  <Button
                    asChild
                    variant="default"
                    className="bg-white text-brand-dark-blue hover:bg-white/90"
                  >
                    <a href={`tel:${institution.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </a>
                  </Button>
                )}
                {institution.website && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/30 text-white bg-white/10 hover:bg-white/20"
                  >
                    <a href={institution.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-brand-dark-blue mb-4">About</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {institution.description}
              </p>
            </CardContent>
          </Card>

          {/* Doctors Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-brand-dark-blue mb-2 flex items-center gap-2">
                  <Users className="h-8 w-8 text-brand-teal" />
                  Our Physicians
                </h2>
                <p className="text-gray-600">
                  {doctors.length} {doctors.length === 1 ? 'physician' : 'physicians'} at this practice
                </p>
              </div>
            </div>

            {/* Specialty Filter */}
            {specialties.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Filter by Specialty
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSpecialty('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSpecialty === 'all'
                        ? 'bg-brand-teal text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {specialties.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => setSelectedSpecialty(specialty)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSpecialty === specialty
                          ? 'bg-brand-teal text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>

            {/* Doctor Cards */}
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-600">
                  {searchQuery || selectedSpecialty !== 'all'
                    ? 'No doctors match your filters.'
                    : 'No doctors found at this practice.'}
                </p>
                {(searchQuery || selectedSpecialty !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSpecialty('all');
                    }}
                    className="mt-4 text-brand-teal font-bold hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
