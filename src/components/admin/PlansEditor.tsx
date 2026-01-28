'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getMembershipPlans, saveMembershipPlans, resetMembershipPlans } from '@/lib/adminStorage';
import { Check, X } from 'lucide-react';

export function PlansEditor() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<MembershipPlan | null>(null);
  const [formData, setFormData] = useState<Partial<MembershipPlan>>({});

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    const loadedPlans = getMembershipPlans();
    setPlans(loadedPlans);
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

  const confirmDelete = () => {
    if (!planToDelete) return;
    const updated = plans.filter((p) => p.id !== planToDelete.id);
    setPlans(updated);
    saveMembershipPlans(updated);
    setIsDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

  const handleSave = () => {
    if (!formData.id || !formData.name) return;

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

    if (editingPlan) {
      const updated = plans.map((p) => (p.id === editingPlan.id ? planData : p));
      setPlans(updated);
      saveMembershipPlans(updated);
    } else {
      const updated = [...plans, planData];
      setPlans(updated);
      saveMembershipPlans(updated);
    }

    setIsDialogOpen(false);
    setEditingPlan(null);
    setFormData({});
  };

  const handleReset = () => {
    resetMembershipPlans();
    loadPlans();
    setIsResetDialogOpen(false);
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

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-brand-dark-blue">Membership Plans</h3>
            <p className="text-sm text-muted-foreground">
              Manage plan pricing, features, and visibility
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsResetDialogOpen(true)} variant="outline">
              Reset to Defaults
            </Button>
            <Button onClick={handleAdd} variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              Add New Plan
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const monthlyPrice = typeof plan.pricing.monthly === 'number' 
              ? `$${plan.pricing.monthly}` 
              : plan.pricing.monthly;
            const annualPrice = typeof plan.pricing.annual === 'number' 
              ? `$${plan.pricing.annual}` 
              : plan.pricing.annual;

            return (
              <Card key={plan.id} className="card-vibrant">
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-brand-teal text-white">{plan.badge}</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-brand-dark-blue">
                    {plan.name}
                  </CardTitle>
                  {plan.description && (
                    <CardDescription>{plan.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Monthly</div>
                    <div className="text-2xl font-bold">{monthlyPrice}/mo</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Annual</div>
                    <div className="text-2xl font-bold">{annualPrice}/yr</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Features ({plan.features.length})</div>
                    <ul className="space-y-1 text-sm">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-muted-foreground">
                          +{plan.features.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(plan)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(plan)}
                    variant="destructive"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="gradient" disabled={!formData.name}>
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
              This will clear all custom plan changes and restore the default plans. This action cannot be undone.
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
