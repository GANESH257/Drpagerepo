'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { OrgPolicy, getOrgPolicies, saveOrgPolicies, resetOrgPolicies } from '@/lib/adminStorage';

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
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<OrgPolicy | null>(null);
  const [formData, setFormData] = useState<Partial<OrgPolicy>>({});

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = () => {
    const loadedPolicies = getOrgPolicies();
    setPolicies(loadedPolicies);
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

  const confirmDelete = () => {
    if (!policyToDelete) return;
    const updated = policies.filter((p) => p.id !== policyToDelete.id);
    setPolicies(updated);
    saveOrgPolicies(updated);
    setIsDeleteDialogOpen(false);
    setPolicyToDelete(null);
  };

  const handleSave = () => {
    if (!formData.id || !formData.title || !formData.category || !formData.body) return;

    const policyData: OrgPolicy = {
      id: formData.id,
      category: formData.category,
      title: formData.title,
      body: formData.body,
    };

    if (editingPolicy) {
      const updated = policies.map((p) => (p.id === editingPolicy.id ? policyData : p));
      setPolicies(updated);
      saveOrgPolicies(updated);
    } else {
      const updated = [...policies, policyData];
      setPolicies(updated);
      saveOrgPolicies(updated);
    }

    setIsDialogOpen(false);
    setEditingPolicy(null);
    setFormData({});
  };

  const handleReset = () => {
    resetOrgPolicies();
    loadPolicies();
    setIsResetDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-brand-dark-blue">Organization Policies</h3>
            <p className="text-sm text-muted-foreground">
              Manage organization policies grouped by category
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsResetDialogOpen(true)} variant="outline">
              Reset to Defaults
            </Button>
            <Button onClick={handleAdd} variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              Add Policy
            </Button>
          </div>
        </div>

        {/* Policies by Category */}
        <Accordion type="multiple" defaultValue={POLICY_CATEGORIES} className="space-y-4">
          {POLICY_CATEGORIES.map((category) => {
            const categoryPolicies = policiesByCategory[category] || [];
            return (
              <AccordionItem key={category} value={category} className="card-vibrant rounded-lg px-4 border-none">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg text-brand-dark-blue">{category}</span>
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
                        <Card key={policy.id} className="border-2">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{policy.title}</CardTitle>
                                <CardDescription className="mt-2 whitespace-pre-wrap">
                                  {policy.body}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  onClick={() => handleEdit(policy)}
                                  variant="outline"
                                  size="sm"
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
                          </CardHeader>
                        </Card>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="gradient"
              disabled={!formData.title || !formData.category || !formData.body}
            >
              Save Policy
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
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all custom policy changes and restore the default policies. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-brand-teal hover:bg-brand-teal/90">
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
