'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Doctor, Insurance } from '@/types';
import { saveDoctorProfile, loadDoctorProfile } from '@/lib/doctorStorage';
import { TagInput } from './TagInput';

interface InsuranceSectionProps {
  doctor: Doctor;
  onProfileUpdate?: (doctor: Doctor) => void;
}

const COMMON_INSURANCE_PROVIDERS = [
  'Aetna',
  'Blue Cross Blue Shield',
  'Cigna',
  'UnitedHealthcare',
  'Medicare',
  'Medicaid',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'AARP',
  'Tricare',
  'Oscar Health',
];

const COMMON_CONDITIONS_SERVICES = [
  'General Health Consultation',
  'Preventive Care',
  'Chronic Disease Management',
  'Health Screenings',
  'Diagnostic Testing',
  'Treatment Planning',
  'Follow-up Care',
  'Medication Management',
  'Wellness Exams',
  'Vaccinations',
  'Health Education',
  'Referral Coordination',
];

export function InsuranceSection({ doctor: initialDoctor, onProfileUpdate }: InsuranceSectionProps) {
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [newInsuranceName, setNewInsuranceName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const saved = await loadDoctorProfile(doctor.id);
      if (saved) {
        setDoctor(saved);
      }
    }
    load();
  }, [doctor.id]);

  const insurance = doctor.insurance ?? [];

  const handleAddInsurance = () => {
    if (!newInsuranceName.trim()) return;

    const slug = newInsuranceName.toLowerCase().replace(/\s+/g, '-');
    const newInsurance: Insurance = {
      name: newInsuranceName.trim(),
      slug,
    };

    // Check if already exists
    if (insurance.some((ins) => ins.name.toLowerCase() === newInsuranceName.toLowerCase())) {
      return;
    }

    const updatedInsurance = [...insurance, newInsurance];
    const updatedDoctor = { ...doctor, insurance: updatedInsurance };
    setDoctor(updatedDoctor);
    saveDoctorProfile(doctor.id, updatedDoctor);
    onProfileUpdate?.(updatedDoctor);
    setNewInsuranceName('');
  };

  const handleRemoveInsurance = (insuranceToRemove: Insurance) => {
    const updatedInsurance = insurance.filter(
      (ins) => ins.name !== insuranceToRemove.name
    );
    const updatedDoctor = { ...doctor, insurance: updatedInsurance };
    setDoctor(updatedDoctor);
    saveDoctorProfile(doctor.id, updatedDoctor);
    onProfileUpdate?.(updatedDoctor);
  };

  const handleConditionsServicesChange = (items: string[]) => {
    const updatedDoctor = { ...doctor, conditionsAndServices: items };
    setDoctor(updatedDoctor);
    saveDoctorProfile(doctor.id, updatedDoctor);
    onProfileUpdate?.(updatedDoctor);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-dark-blue">Insurance & Services</h2>
        <p className="text-muted-foreground mt-2">
          View and manage accepted insurance plans and services offered
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accepted Insurance */}
        <Card className="card-vibrant">
          <CardHeader>
            <CardTitle>Accepted Insurance</CardTitle>
            <CardDescription>
              Only list plans you accept; patients may filter by insurance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Insurance */}
            {insurance.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {insurance.map((ins) => (
                  <Badge
                    key={ins.slug}
                    variant="colorful"
                    className="flex items-center gap-1 pr-1 text-sm py-1.5"
                  >
                    {ins.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveInsurance(ins)}
                      className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                      aria-label={`Remove ${ins.name}`}
                      data-scroll-speed="0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No insurance plans added yet.</p>
            )}

            {/* Add Insurance */}
            <div className="space-y-2 pt-2 border-t" data-scroll-exclude>
              <label className="text-sm font-medium">Add Insurance Plan</label>
              <div className="flex gap-2" data-scroll-exclude>
                <div data-scroll-exclude className="flex-1">
                  <Select value={newInsuranceName} onValueChange={setNewInsuranceName} data-scroll-exclude>
                    <SelectTrigger className="flex-1" data-scroll-speed="0" data-scroll-exclude>
                      <SelectValue placeholder="Select or type insurance name" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_INSURANCE_PROVIDERS.filter(
                        (provider) =>
                          !insurance.some(
                            (ins) => ins.name.toLowerCase() === provider.toLowerCase()
                          )
                      ).map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div data-scroll-exclude className="flex-1">
                  <Input
                    value={newInsuranceName}
                    onChange={(e) => setNewInsuranceName(e.target.value)}
                    placeholder="Or type custom name"
                    className="flex-1"
                    data-scroll-speed="0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInsurance();
                      }
                    }}
                  />
                </div>
                <div data-scroll-exclude>
                  <Button
                    onClick={handleAddInsurance}
                    disabled={!newInsuranceName.trim()}
                    className="bg-brand-teal hover:bg-brand-teal/90"
                    data-scroll-speed="0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions & Services */}
        <Card className="card-vibrant">
          <CardHeader>
            <CardTitle>Conditions & Services</CardTitle>
            <CardDescription>
              List the conditions you treat and services you offer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagInput
              tags={doctor.conditionsAndServices || []}
              onTagsChange={handleConditionsServicesChange}
              placeholder="Add conditions or services..."
              suggestions={COMMON_CONDITIONS_SERVICES}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
