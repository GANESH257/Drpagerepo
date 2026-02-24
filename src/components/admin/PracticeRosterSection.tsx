'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Crown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Doctor } from '@/types';
import { Practice } from '@/types/practice';
import { getDoctorsByPractice, assignPracticeAdminRole } from '@/lib/adminHelpers';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { updatePractice as updatePracticeAPI } from '@/lib/api/practices';
import { updateDoctor } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { getAllPracticesForAdmin } from '@/lib/adminHelpers';
import { toast } from '@/lib/toast';

interface PracticeRosterSectionProps {
  practiceId: string;
}

export function PracticeRosterSection({ practiceId }: PracticeRosterSectionProps) {
  const [practiceDoctors, setPracticeDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [practice, setPractice] = useState<Practice | null>(null);
  const [selectedDoctorToAdd, setSelectedDoctorToAdd] = useState<string>('');
  const [doctorToRemove, setDoctorToRemove] = useState<Doctor | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [doctorToPromote, setDoctorToPromote] = useState<Doctor | null>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [practiceId]);

  const loadData = async () => {
    try {
      const token = getToken();
      const [practiceDoctorsList, allDoctorsRaw, practices] = await Promise.all([
        getDoctorsByPractice(practiceId),
        token ? getAllDoctorsArray(token) : Promise.resolve([]),
        getAllPracticesForAdmin()
      ]);
      const allDoctorsList = Array.isArray(allDoctorsRaw) ? allDoctorsRaw : [];
      const foundPractice = practices.find(p => p.id === practiceId);
      setPracticeDoctors(practiceDoctorsList);
      setAllDoctors(allDoctorsList);
      setPractice(foundPractice || null);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Get doctors not in any practice or in a different practice
  const availableDoctors = allDoctors.filter(d => 
    !d.practiceId || d.practiceId !== practiceId
  );

  const currentPracticeAdmin = practiceDoctors.find(d => d.roleInPractice === 'practice_admin');

  const handleAddDoctor = async () => {
    if (!selectedDoctorToAdd || !practice) return;
    const doctor = allDoctors.find(d => d.id === selectedDoctorToAdd);
    if (!doctor) return;
    const token = getToken();
    if (!token) return;
    try {
      await updateDoctor(selectedDoctorToAdd, { practiceId, roleInPractice: 'doctor' }, token);
      const doctorIds = (practice.doctorIds || []).includes(selectedDoctorToAdd)
        ? practice.doctorIds
        : [...(practice.doctorIds || []), selectedDoctorToAdd];
      try {
        await updatePracticeAPI(practiceId, { doctor_ids: doctorIds } as any, token);
      } catch {
        // Backend may not support doctor_ids on practice; doctor update is enough if backend derives roster
        undefined;
      }
      toast.success(`Added ${doctor.fullName} to practice`);
      setSelectedDoctorToAdd('');
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to add doctor');
    }
  };

  const handleRemoveDoctor = (doctor: Doctor) => {
    setDoctorToRemove(doctor);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveDoctor = async () => {
    if (!doctorToRemove || !practice) return;
    const token = getToken();
    if (!token) return;
    try {
      await updateDoctor(doctorToRemove.id, { practiceId: undefined, roleInPractice: undefined }, token);
      const doctorIds = practice.doctorIds.filter(id => id !== doctorToRemove.id);
      try {
        await updatePracticeAPI(practiceId, { doctor_ids: doctorIds } as any, token);
      } catch {
        undefined;
      }
      toast.success(`Removed ${doctorToRemove.fullName} from practice`);
      setIsRemoveDialogOpen(false);
      setDoctorToRemove(null);
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to remove doctor');
    }
  };

  const handlePromoteToAdmin = (doctor: Doctor) => {
    setDoctorToPromote(doctor);
    setIsPromoteDialogOpen(true);
  };

  const confirmPromoteToAdmin = async () => {
    if (!doctorToPromote) return;

    try {
      const oldAdminId = currentPracticeAdmin?.id;
      await assignPracticeAdminRole(practiceId, doctorToPromote.id, oldAdminId);
      toast.success(`${doctorToPromote.fullName} is now Practice Admin`);
      setIsPromoteDialogOpen(false);
      setDoctorToPromote(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign Practice Admin');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-brand-dark-blue flex items-center gap-2">
            <Users className="h-5 w-5" />
            Practice Roster ({practiceDoctors.length} doctor{practiceDoctors.length !== 1 ? 's' : ''})
          </h3>
        </div>

        {/* Add Doctor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add Doctor to Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select value={selectedDoctorToAdd} onValueChange={setSelectedDoctorToAdd}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a doctor to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDoctors.length === 0 ? (
                    <SelectItem value="none" disabled>No available doctors</SelectItem>
                  ) : (
                    availableDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.fullName} {doctor.practiceId && doctor.practiceId !== practiceId && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Currently in another practice)
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddDoctor}
                disabled={!selectedDoctorToAdd}
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        <div className="space-y-2">
          {practiceDoctors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No doctors in this practice yet.
            </div>
          ) : (
            practiceDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{doctor.fullName}</span>
                        {doctor.roleInPractice === 'practice_admin' && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Practice Admin
                          </Badge>
                        )}
                        {doctor.email && (
                          <span className="text-sm text-muted-foreground">
                            ({doctor.email})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {doctor.specialty}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {doctor.roleInPractice !== 'practice_admin' && (
                        <Button
                          onClick={() => handlePromoteToAdmin(doctor)}
                          variant="outline"
                          size="sm"
                        >
                          <Crown className="h-4 w-4 mr-1" />
                          Make Admin
                        </Button>
                      )}
                      <Button
                        onClick={() => handleRemoveDoctor(doctor)}
                        variant="destructive"
                        size="sm"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Remove Doctor Confirmation */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Doctor from Practice?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {doctorToRemove?.fullName} from this practice?
              {doctorToRemove?.roleInPractice === 'practice_admin' && (
                <div className="mt-2 flex items-start gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">
                    This doctor is the Practice Admin. Removing them will leave the practice without an admin.
                    Consider promoting another doctor first.
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveDoctor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote to Admin Confirmation */}
      <AlertDialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Practice Admin Role?</AlertDialogTitle>
            <AlertDialogDescription>
              {currentPracticeAdmin ? (
                <>
                  This will transfer the Practice Admin role from {currentPracticeAdmin.fullName} to {doctorToPromote?.fullName}.
                  The previous Practice Admin will become a regular doctor.
                </>
              ) : (
                <>
                  Assign {doctorToPromote?.fullName} as Practice Admin for this practice?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPromoteToAdmin}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
