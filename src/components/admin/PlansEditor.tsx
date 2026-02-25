'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { MembershipPlan } from '@/types';
import { 
  getMembershipPlans as getMembershipPlansAPI,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
} from '@/lib/api/membership-plans';
import { 
  transformMembershipPlansFromAPI,
  transformMembershipPlanToAPI,
} from '@/lib/api/membership-plans-transform';
import { Check, X } from 'lucide-react';

export function PlansEditor() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<MembershipPlan | null>(null);
  const [formData, setFormData] = useState<Partial<MembershipPlan>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiPlans = await getMembershipPlansAPI();
      const transformedPlans = transformMembershipPlansFromAPI(apiPlans);
      setPlans(transformedPlans);
    } catch (err) {
      console.error('Error loading membership plans:', err);
      setError('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      id: plan.id,
      name: plan.name,
      badge: plan.badge,
      pricing: { ...plan.pricing },
      description: plan.description,
      features: [...plan.features],
      ctaLabel: plan.ctaLabel,
      ctaHref: plan.ctaHref,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setFormData({
      id: `plan-${Date.now()}`,
      name: '',
      badge: undefined,
      pricing: { monthly: 0, annual: 0 },
      description: '',
      features: [],
      ctaLabel: 'Choose Plan',
      ctaHref: '/join-us',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (plan: MembershipPlan) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;
    try {
      setSaving(true);
      await deleteMembershipPlan(planToDelete.id);
      await loadPlans(); // Reload from API
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (err) {
      console.error('Error deleting membership plan:', err);
      alert('Failed to delete membership plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.id || !formData.name) return;

    try {
      setSaving(true);
      setError(null);

      const planData: MembershipPlan = {
        id: formData.id,
        name: formData.name,
        badge: formData.badge,
        pricing: formData.pricing || { monthly: 0, annual: 0 },
        description: formData.description,
        features: formData.features || [],
        ctaLabel: formData.ctaLabel || 'Choose Plan',
        ctaHref: formData.ctaHref || '/join-us',
      };

      const apiData = transformMembershipPlanToAPI(planData);

      // Ensure features is an array before sending
      if (apiData.features && !Array.isArray(apiData.features)) {
        apiData.features = [apiData.features];
      }

      if (editingPlan) {
        await updateMembershipPlan(editingPlan.id, apiData);
      } else {
        // For create, ensure we have all required fields
        if (!apiData.id || !apiData.name || apiData.monthly_price === undefined || apiData.annual_price === undefined) {
          throw new Error('Please fill in all required fields (ID, Name, Monthly Price, Annual Price)');
        }
        await createMembershipPlan({
          ...apiData,
          active: true,
        } as any);
      }

      await loadPlans(); // Reload from API
      setIsDialogOpen(false);
      setEditingPlan(null);
      setFormData({});
      setError(null);
    } catch (err) {
      console.error('Error saving membership plan:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save membership plan. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...(formData.features || []), ''],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...(formData.features || [])];
    features[index] = value;
    setFormData({ ...formData, features });
  };

  const removeFeature = (index: number) => {
    const features = formData.features?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, features });
  };

  const renderPlanCard = (plan: MembershipPlan) => {
    const monthlyPrice =
      typeof plan.pricing.monthly === 'number'
        ? `$${plan.pricing.monthly}`
        : plan.pricing.monthly;
    const annualPrice =
      typeof plan.pricing.annual === 'number'
        ? `$${plan.pricing.annual}`
        : plan.pricing.annual;

    return (
      <div key={plan.id} className="glass-card relative overflow-hidden">
        {plan.badge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="text-white border-0" style={{ background: 'var(--aip-teal)' }}>
              {plan.badge}
            </Badge>
          </div>
        )}
        <div className="p-6 space-y-4">
          <div>
            <h3
              className="text-xl font-bold text-foreground"
              style={{ color: 'var(--aip-teal)' }}
            >
              {plan.name}
            </h3>
            {plan.description && (
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Monthly</div>
              <div className="text-xl font-bold">{monthlyPrice}/mo</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Annual</div>
              <div className="text-xl font-bold">{annualPrice}/yr</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">
                Features ({Array.isArray(plan.features) ? plan.features.length : 0})
              </div>
              <ul className="space-y-1 text-sm">
                {Array.isArray(plan.features) && plan.features.length > 0 ? (
                  <>
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check
                          className="h-4 w-4 shrink-0 mt-0.5"
                          style={{ color: 'var(--aip-teal)' }}
                        />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-muted-foreground">
                        +{plan.features.length - 3} more
                      </li>
                    )}
                  </>
                ) : (
                  <li className="text-muted-foreground text-sm">No features listed</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0 flex gap-2">
          <Button
            onClick={() => handleEdit(plan)}
            variant="outline"
            className="flex-1 border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => handleDelete(plan)} variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Manage plan pricing, features, and visibility
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="text-white border-0" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Plan
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
            <p className="text-muted-foreground">Loading membership plans...</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(renderPlanCard)}
        </div>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Plan' : 'Add New Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update plan details below' : 'Create a new membership plan'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Basic"
                />
              </div>
              <div>
                <Label htmlFor="badge">Badge (Optional)</Label>
                <Input
                  id="badge"
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value || undefined })}
                  placeholder="Most Popular"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Plan description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly">Monthly Price</Label>
                <Input
                  id="monthly"
                  type="text"
                  value={formData.pricing?.monthly || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = parseFloat(val);
                    setFormData({
                      ...formData,
                      pricing: {
                        ...formData.pricing!,
                        monthly: isNaN(num) ? val : num,
                      },
                    });
                  }}
                  placeholder="99 or Contact us"
                />
              </div>
              <div>
                <Label htmlFor="annual">Annual Price</Label>
                <Input
                  id="annual"
                  type="text"
                  value={formData.pricing?.annual || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = parseFloat(val);
                    setFormData({
                      ...formData,
                      pricing: {
                        ...formData.pricing!,
                        annual: isNaN(num) ? val : num,
                      },
                    });
                  }}
                  placeholder="990 or Contact us"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Features</Label>
                <Button
                  type="button"
                  onClick={addFeature}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
              <div className="space-y-2">
                {formData.features?.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Feature description..."
                    />
                    <Button
                      type="button"
                      onClick={() => removeFeature(index)}
                      variant="ghost"
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!formData.features || formData.features.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No features added. Click "Add Feature" to add one.
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="text-white border-0" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }} disabled={!formData.name}>
              Save Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
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
