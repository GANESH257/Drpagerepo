'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Doctor, Location } from '@/types';
import { saveDoctorProfile, loadDoctorProfile } from '@/lib/doctorStorage';
import { LocationCard } from './LocationCard';
import { LocationFormDialog } from './LocationFormDialog';

interface LocationsSectionProps {
  doctor: Doctor;
  onProfileUpdate: (doctor: Doctor) => void;
}

export function LocationsSection({ doctor: initialDoctor, onProfileUpdate }: LocationsSectionProps) {
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteLocation, setDeleteLocation] = useState<Location | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = loadDoctorProfile(doctor.id);
    if (saved) {
      setDoctor(saved);
    }
  }, [doctor.id]);

  const handleAddLocation = () => {
    setEditingLocation(null);
    setIsDialogOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const handleSaveLocation = (location: Location) => {
    setIsSaving(true);
    let updatedLocations: Location[];

    if (editingLocation) {
      // Update existing location
      updatedLocations = doctor.locations.map((loc) =>
        loc === editingLocation ? location : loc
      );
    } else {
      // Add new location
      updatedLocations = [...doctor.locations, location];
    }

    const updatedDoctor = { ...doctor, locations: updatedLocations };
    setDoctor(updatedDoctor);
    saveDoctorProfile(doctor.id, updatedDoctor);
    onProfileUpdate?.(updatedDoctor);
    setIsDialogOpen(false);
    setEditingLocation(null);
    setIsSaving(false);
  };

  const handleDeleteClick = (location: Location) => {
    setDeleteLocation(location);
  };

  const handleDeleteConfirm = () => {
    if (!deleteLocation) return;

    const updatedLocations = doctor.locations.filter((loc) => loc !== deleteLocation);
    const updatedDoctor = { ...doctor, locations: updatedLocations };
    setDoctor(updatedDoctor);
    saveDoctorProfile(doctor.id, updatedDoctor);
    onProfileUpdate?.(updatedDoctor);
    setDeleteLocation(null);
  };

  const handleSetPrimary = (location: Location) => {
    // Move primary location to first position
    const otherLocations = doctor.locations.filter((loc) => loc !== location);
    const updatedLocations = [location, ...otherLocations];
    const updatedDoctor = { ...doctor, locations: updatedLocations };
    setDoctor(updatedDoctor);
    saveDoctorProfile(doctor.id, updatedDoctor);
    onProfileUpdate?.(updatedDoctor);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark-blue">Manage Locations</h2>
          <p className="text-muted-foreground mt-2">
            Add or update your practice locations
          </p>
        </div>
        <Button onClick={handleAddLocation} variant="gradient">
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Locations List */}
      {doctor.locations.length === 0 ? (
        <Card className="card-vibrant">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No locations added yet.</p>
            <Button onClick={handleAddLocation} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {doctor.locations.map((location, index) => (
            <div key={index} className="relative">
              <LocationCard
                location={location}
                isPrimary={index === 0}
                onEdit={() => handleEditLocation(location)}
                onDelete={() => handleDeleteClick(location)}
              />
              {index !== 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-xs"
                  onClick={() => handleSetPrimary(location)}
                >
                  Set as Primary
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <LocationFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        location={editingLocation}
        onSave={handleSaveLocation}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLocation} onOpenChange={(open) => !open && setDeleteLocation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteLocation?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
