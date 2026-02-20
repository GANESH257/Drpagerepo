'use client';

import { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Search, Plus, Building2 } from 'lucide-react';
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
import { Practice } from '@/types/practice';
import { getAllPracticesForAdmin } from '@/lib/adminHelpers';
import { deletePractice, restorePractice, getDeletedPracticeIds } from '@/lib/storage/practiceStorage';
import { PracticeEditDialog } from './PracticeEditDialog';
import { CreatePracticeDialog } from './CreatePracticeDialog';
import { getDoctorsByPractice } from '@/lib/adminHelpers';

export function PracticesTable() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [practiceToDelete, setPracticeToDelete] = useState<Practice | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    loadPractices();
  }, []);

  const loadPractices = () => {
    const allPractices = getAllPracticesForAdmin();
    setPractices(allPractices);
  };

  const deletedIds = useMemo(() => {
    return getDeletedPracticeIds();
  }, [practices]);

  const filteredPractices = useMemo(() => {
    let filtered = practices;

    // Filter by deleted status
    if (showDeleted) {
      filtered = practices.filter(p => deletedIds.includes(p.id));
    } else {
      filtered = practices.filter(p => !deletedIds.includes(p.id));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((practice) => {
        const name = practice.name.toLowerCase();
        const city = practice.address?.city?.toLowerCase() || '';
        const state = practice.address?.state?.toLowerCase() || '';
        const description = practice.description?.toLowerCase() || '';
        return (
          name.includes(query) ||
          city.includes(query) ||
          state.includes(query) ||
          description.includes(query)
        );
      });
    }

    return filtered;
  }, [practices, searchQuery, showDeleted, deletedIds]);

  const handleEdit = (practice: Practice) => {
    setEditingPractice(practice);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (practice: Practice) => {
    setPracticeToDelete(practice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!practiceToDelete) return;
    deletePractice(practiceToDelete.id);
    loadPractices();
    setIsDeleteDialogOpen(false);
    setPracticeToDelete(null);
  };

  const handleRestore = (practiceId: string) => {
    restorePractice(practiceId);
    loadPractices();
  };

  const handleSave = () => {
    loadPractices();
    setIsEditDialogOpen(false);
    setEditingPractice(null);
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSave = () => {
    loadPractices();
    setIsCreateDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <Button onClick={handleCreate} className="bg-brand-dark-blue hover:bg-brand-dark-blue/90">
            <Plus className="h-4 w-4 mr-2" />
            Create New Practice
          </Button>
          <Button
            onClick={() => setShowDeleted(!showDeleted)}
            variant={showDeleted ? 'default' : 'outline'}
            size="sm"
          >
            {showDeleted ? 'Show Active' : 'Show Deleted'}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, state, or description..."
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-brand-dark-blue">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-brand-dark-blue">Doctors</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-brand-dark-blue">Specialties</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-brand-dark-blue">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-brand-dark-blue">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPractices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      {searchQuery ? 'No practices found matching your search.' : `No ${showDeleted ? 'deleted' : 'active'} practices found.`}
                    </td>
                  </tr>
                ) : (
                  filteredPractices.map((practice) => {
                    const doctors = getDoctorsByPractice(practice.id);
                    const isDeleted = deletedIds.includes(practice.id);
                    
                    return (
                      <tr
                        key={practice.id}
                        className="border-t hover:bg-accent/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div className="font-medium text-brand-dark-blue">
                              {practice.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {practice.address ? (
                            <div>
                              <div>{practice.address.city}, {practice.address.state}</div>
                              <div className="text-xs text-muted-foreground">{practice.address.zip}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {practice.specialties?.slice(0, 2).map((spec, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {practice.specialties && practice.specialties.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{practice.specialties.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isDeleted ? (
                            <Badge variant="destructive">Deleted</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {isDeleted ? (
                              <Button
                                onClick={() => handleRestore(practice.id)}
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                              >
                                Restore
                              </Button>
                            ) : (
                              <>
                                <Button
                                  onClick={() => handleEdit(practice)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(practice)}
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredPractices.length} of {practices.length} {showDeleted ? 'deleted' : 'active'} practices
        </div>
      </div>

      {/* Edit Dialog */}
      {editingPractice && (
        <PracticeEditDialog
          practice={editingPractice}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSave}
        />
      )}

      {/* Create Dialog */}
      <CreatePracticeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Practice?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {practiceToDelete?.name} from the network?
              This will hide it from the directory, but doctors assigned to this practice will remain.
              You can restore it later if needed.
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
