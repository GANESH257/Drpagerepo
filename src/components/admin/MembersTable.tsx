'use client';

import { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { getAllDoctorsArray, deleteDoctor as deleteDoctorAPI } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { getAllPracticesForAdmin } from '@/lib/adminHelpers';
import { toast } from '@/lib/toast';
import { Doctor } from '@/types';
import { Practice } from '@/types/practice';
import { MemberEditDialog } from './MemberEditDialog';
import { CreateDoctorDialog } from './CreateDoctorDialog';
import { Plus } from 'lucide-react';

export function MembersTable() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [zipFilter, setZipFilter] = useState<string>('all');
  const [practiceFilter, setPracticeFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [credentialsFilter, setCredentialsFilter] = useState<string>('all');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  useEffect(() => {
    loadDoctors();
    loadPractices();
  }, []);

  const loadDoctors = async () => {
    try {
      const token = getToken();
      const list = token ? await getAllDoctorsArray(token) : [];
      setDoctors(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadPractices = async () => {
    try {
      const allPractices = await getAllPracticesForAdmin();
      setPractices(allPractices);
    } catch (error) {
      console.error('Error loading practices:', error);
    }
  };

  // Extract unique filter options from doctors
  const filterOptions = useMemo(() => {
    const states = new Set<string>();
    const zips = new Set<string>();
    const specialties = new Set<string>();
    const credentials = new Set<string>();

    doctors.forEach((doctor) => {
      // Extract states and zips from locations
      doctor.locations?.forEach((location) => {
        if (location.state) states.add(location.state);
        if (location.zip) zips.add(location.zip);
      });

      // Extract specialty and credentials
      if (doctor.specialty) specialties.add(doctor.specialty);
      if (doctor.credentials) credentials.add(doctor.credentials);
    });

    return {
      states: Array.from(states).sort(),
      zips: Array.from(zips).sort(),
      specialties: Array.from(specialties).sort(),
      credentials: Array.from(credentials).sort(),
    };
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let filtered = [...doctors];

    // State filter
    if (stateFilter !== 'all') {
      filtered = filtered.filter((doctor) =>
        doctor.locations?.some((loc) => loc.state === stateFilter)
      );
    }

    // Zip filter
    if (zipFilter !== 'all') {
      filtered = filtered.filter((doctor) =>
        doctor.locations?.some((loc) => loc.zip === zipFilter)
      );
    }

    // Practice filter
    if (practiceFilter !== 'all') {
      filtered = filtered.filter((doctor) => doctor.practiceId === practiceFilter);
    }

    // Specialty filter
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter((doctor) => doctor.specialty === specialtyFilter);
    }

    // Credentials filter
    if (credentialsFilter !== 'all') {
      filtered = filtered.filter((doctor) => doctor.credentials === credentialsFilter);
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doctor) => {
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
    }

    return filtered;
  }, [doctors, searchQuery, stateFilter, zipFilter, practiceFilter, specialtyFilter, credentialsFilter]);

  const hasActiveFilters = 
    stateFilter !== 'all' ||
    zipFilter !== 'all' ||
    practiceFilter !== 'all' ||
    specialtyFilter !== 'all' ||
    credentialsFilter !== 'all' ||
    searchQuery.trim() !== '';

  const clearFilters = () => {
    setStateFilter('all');
    setZipFilter('all');
    setPracticeFilter('all');
    setSpecialtyFilter('all');
    setCredentialsFilter('all');
    setSearchQuery('');
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;
    const token = getToken();
    if (!token) {
      toast.error('Authentication required');
      return;
    }
    try {
      await deleteDoctorAPI(doctorToDelete.id, token);
      toast.success('Doctor removed');
      await loadDoctors();
      setIsDeleteDialogOpen(false);
      setDoctorToDelete(null);
    } catch (err) {
      console.error('Delete doctor failed:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete doctor');
    }
  };

  const handleSave = () => {
    loadDoctors();
    setIsEditDialogOpen(false);
    setEditingDoctor(null);
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSave = () => {
    loadDoctors();
    setIsCreateDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <Button onClick={handleCreate} className="bg-brand-dark-blue hover:bg-brand-dark-blue/90">
            <Plus className="h-4 w-4 mr-2" />
            Create New Doctor
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
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

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters:</span>
            </div>

            {/* State Filter */}
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {filterOptions.states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Zip Filter */}
            <Select value={zipFilter} onValueChange={setZipFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Zip Code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zip Codes</SelectItem>
                {filterOptions.zips.map((zip) => (
                  <SelectItem key={zip} value={zip}>
                    {zip}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Practice Filter */}
            <Select value={practiceFilter} onValueChange={setPracticeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Practice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Practices</SelectItem>
                {practices.map((practice) => (
                  <SelectItem key={practice.id} value={practice.id}>
                    {practice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Specialty Filter */}
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {filterOptions.specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Credentials Filter */}
            <Select value={credentialsFilter} onValueChange={setCredentialsFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Credentials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Credentials</SelectItem>
                {filterOptions.credentials.map((cred) => (
                  <SelectItem key={cred} value={cred}>
                    {cred}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Badge */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {stateFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  State: {stateFilter}
                </Badge>
              )}
              {zipFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Zip: {zipFilter}
                </Badge>
              )}
              {practiceFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Practice: {practices.find(p => p.id === practiceFilter)?.name || practiceFilter}
                </Badge>
              )}
              {specialtyFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Specialty: {specialtyFilter}
                </Badge>
              )}
              {credentialsFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Credentials: {credentialsFilter}
                </Badge>
              )}
            </div>
          )}
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
                      {hasActiveFilters 
                        ? 'No doctors found matching your filters.' 
                        : 'No doctors found.'}
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

      {/* Create Dialog */}
      <CreateDoctorDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateSave}
      />

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
