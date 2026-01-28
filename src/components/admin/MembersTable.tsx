'use client';

import { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { getAllDoctors, deleteDoctor } from '@/lib/memberStorage';
import { Doctor } from '@/types';
import { MemberEditDialog } from './MemberEditDialog';

export function MembersTable() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = () => {
    const allDoctors = getAllDoctors();
    setDoctors(allDoctors);
  };

  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctors;

    const query = searchQuery.toLowerCase();
    return doctors.filter((doctor) => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      const email = doctor.email?.toLowerCase() || '';
      const specialty = doctor.specialty.toLowerCase();
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        specialty.includes(query) ||
        doctor.credentials.toLowerCase().includes(query)
      );
    });
  }, [doctors, searchQuery]);

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!doctorToDelete) return;
    deleteDoctor(doctorToDelete.id);
    loadDoctors();
    setIsDeleteDialogOpen(false);
    setDoctorToDelete(null);
  };

  const handleSave = () => {
    loadDoctors();
    setIsEditDialogOpen(false);
    setEditingDoctor(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, specialty, or credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-brand-dark-blue">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-brand-dark-blue">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-brand-dark-blue">Specialty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-brand-dark-blue">Credentials</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-brand-dark-blue">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-brand-dark-blue">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      {searchQuery ? 'No doctors found matching your search.' : 'No doctors found.'}
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="border-t hover:bg-accent/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-brand-dark-blue">
                          {doctor.firstName} {doctor.lastName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {doctor.email || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">{doctor.specialty}</td>
                      <td className="px-4 py-3 text-sm">{doctor.credentials}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {doctor.verified && (
                            <Badge variant="gradient">Verified</Badge>
                          )}
                          {doctor.featured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleEdit(doctor)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(doctor)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </div>
      </div>

      {/* Edit Dialog */}
      {editingDoctor && (
        <MemberEditDialog
          doctor={editingDoctor}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {doctorToDelete?.firstName} {doctorToDelete?.lastName} from the network?
              This will remove them from the doctor directory and they will no longer be able to access their dashboard.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
