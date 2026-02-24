'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrgPolicy } from '@/lib/adminStorage';
import { getPolicies, createPolicy, updatePolicy, deletePolicy, Policy } from '@/lib/api/policies';

const POLICY_CATEGORIES = [
  'Governance',
  'Compliance',
  'Operations',
  'Membership',
  'Privacy',
];

export function PoliciesEditor() {
  const [policies, setPolicies] = useState<OrgPolicy[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<OrgPolicy | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<OrgPolicy | null>(null);
  const [formData, setFormData] = useState<Partial<OrgPolicy>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiPolicies = await getPolicies();
      // Transform API format to frontend format (they're the same, but ensure type safety)
      const transformedPolicies: OrgPolicy[] = apiPolicies.map(p => ({
        id: p.id,
        category: p.category,
        title: p.title,
        body: p.body,
      }));
      setPolicies(transformedPolicies);
    } catch (err) {
      console.error('Error loading policies:', err);
      setError('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const policiesByCategory = policies.reduce((acc, policy) => {
    if (!acc[policy.category]) {
      acc[policy.category] = [];
    }
    acc[policy.category].push(policy);
    return acc;
  }, {} as Record<string, OrgPolicy[]>);

  const handleEdit = (policy: OrgPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      id: policy.id,
      category: policy.category,
      title: policy.title,
      body: policy.body,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPolicy(null);
    setFormData({
      id: `policy-${Date.now()}`,
      category: 'Governance',
      title: '',
      body: '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (policy: OrgPolicy) => {
    setPolicyToDelete(policy);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!policyToDelete) return;
    try {
      setSaving(true);
      await deletePolicy(policyToDelete.id);
      await loadPolicies(); // Reload from API
      setIsDeleteDialogOpen(false);
      setPolicyToDelete(null);
    } catch (err) {
      console.error('Error deleting policy:', err);
      alert('Failed to delete policy. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.id || !formData.title || !formData.category || !formData.body) return;

    try {
      setSaving(true);
      setError(null);

      const policyData: Policy = {
        id: formData.id,
        category: formData.category!,
        title: formData.title!,
        body: formData.body!,
      };

      if (editingPolicy) {
        await updatePolicy(editingPolicy.id, policyData);
      } else {
        await createPolicy(policyData);
      }

      await loadPolicies(); // Reload from API
      setIsDialogOpen(false);
      setEditingPolicy(null);
      setFormData({});
    } catch (err) {
      console.error('Error saving policy:', err);
      setError('Failed to save policy. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Organization Policies</h3>
            <p className="text-sm text-muted-foreground">
              Manage organization policies grouped by category
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="text-white border-0" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Add Policy
            </Button>
          </div>
        </div>

        {error && (
          <div className="glass-card p-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {loading && (
          <div className="glass-card p-6">
            <p className="text-muted-foreground">Loading policies...</p>
          </div>
        )}

        {/* Policies by Category */}
        <Accordion type="multiple" defaultValue={POLICY_CATEGORIES} className="space-y-4">
          {POLICY_CATEGORIES.map((category) => {
            const categoryPolicies = policiesByCategory[category] || [];
            return (
              <AccordionItem key={category} value={category} className="glass-card rounded-lg px-4 border border-border">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg text-foreground" style={{ color: 'var(--aip-teal)' }}>{category}</span>
                    <Badge variant="outline">{categoryPolicies.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {categoryPolicies.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">
                        No policies in this category yet.
                      </p>
                    ) : (
                      categoryPolicies.map((policy) => (
                        <div key={policy.id} className="glass-card p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-foreground">{policy.title}</h4>
                              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                {policy.body}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => handleEdit(policy)}
                                variant="outline"
                                size="sm"
                                className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(policy)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? 'Edit Policy' : 'Add New Policy'}
            </DialogTitle>
            <DialogDescription>
              {editingPolicy ? 'Update policy details below' : 'Create a new organization policy'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Policy title..."
              />
            </div>

            <div>
              <Label htmlFor="body">Body Text *</Label>
              <Textarea
                id="body"
                value={formData.body || ''}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Policy content..."
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use line breaks to format paragraphs. Text will preserve formatting.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="text-white border-0"
              style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
              disabled={!formData.title || !formData.category || !formData.body || saving}
            >
              {saving ? 'Saving...' : 'Save Policy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{policyToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
