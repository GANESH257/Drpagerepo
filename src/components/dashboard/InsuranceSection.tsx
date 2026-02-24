'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Doctor, Insurance, ConditionServiceRow } from '@/types';
import { saveDoctorProfile, loadDoctorProfile, saveDoctorProfileToAPI } from '@/lib/doctorStorage';
import { getAdminSession } from '@/lib/adminSession';
import { createApprovalRequest, getApprovalRequests } from '@/lib/api/approval-requests';

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

const EMPTY_ROW: ConditionServiceRow = { condition: '', services: [''] };

const PROFILE_INSURANCE_TYPES = ['doctor_insurance_edit', 'practice_admin_insurance_edit'];

export function InsuranceSection({ doctor: initialDoctor, onProfileUpdate }: InsuranceSectionProps) {
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [newInsuranceName, setNewInsuranceName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasPendingInsuranceEdit, setHasPendingInsuranceEdit] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const saved = await loadDoctorProfile(doctor.id);
      if (saved) {
        setDoctor(saved);
      }
    }
    load();
  }, [doctor.id]);

  // Check for pending insurance-edit: refetch when doctor.id loads and when user switches back to this tab
  const doctorIdRef = useRef(doctor.id);
  doctorIdRef.current = doctor.id;

  const fetchPendingInsuranceEdit = useCallback(() => {
    if (getAdminSession() || !doctorIdRef.current) {
      setHasPendingInsuranceEdit(false);
      return;
    }
    const did = doctorIdRef.current;
    getApprovalRequests({ status: 'pending' })
      .then((requests) => {
        const pending = requests.some(
          (r) =>
            r.target_doctor_id === did &&
            PROFILE_INSURANCE_TYPES.includes(r.type) &&
            ((r.type === 'practice_admin_insurance_edit' && r.admin_status === 'pending') ||
              (r.type === 'doctor_insurance_edit' && (r.practice_admin_status ?? 'pending') === 'pending'))
        );
        setHasPendingInsuranceEdit(pending);
      })
      .catch(() => setHasPendingInsuranceEdit(false));
  }, []);

  useEffect(() => {
    if (getAdminSession() || !doctor.id) {
      setHasPendingInsuranceEdit(false);
      return;
    }
    fetchPendingInsuranceEdit();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchPendingInsuranceEdit();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [doctor.id, fetchPendingInsuranceEdit]);

  const insurance = doctor.insurance ?? [];

  const submitInsuranceState = async (updatedDoctor: Doctor) => {
    setSubmitError(null);
    setSubmitMessage(null);
    if (getAdminSession()) {
      const updated = await saveDoctorProfileToAPI(doctor.id, updatedDoctor);
      if (updated) {
        setDoctor(updated);
        onProfileUpdate?.(updated);
      } else {
        saveDoctorProfile(doctor.id, updatedDoctor);
        onProfileUpdate?.(updatedDoctor);
      }
      return;
    }
    try {
      const payload = {
        doctorId: doctor.id,
        insurance: updatedDoctor.insurance ?? [],
        conditionServices: updatedDoctor.conditionServices ?? [],
        conditionsAndServices: updatedDoctor.conditionsAndServices ?? [],
      };
      if (doctor.roleInPractice === 'practice_admin') {
        await createApprovalRequest({
          type: 'practice_admin_insurance_edit',
          target_doctor_id: doctor.id,
          payload,
        });
        setSubmitMessage('Submitted for admin approval. Changes will apply once approved.');
      } else {
        await createApprovalRequest({
          type: 'doctor_insurance_edit',
          practice_id: doctor.practiceId ?? undefined,
          target_doctor_id: doctor.id,
          payload,
        });
        setSubmitMessage('Submitted for practice admin approval. Changes will apply once approved.');
      }
      setHasPendingInsuranceEdit(true);
      setTimeout(() => setSubmitMessage(null), 5000);
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  };

  const handleAddInsurance = () => {
    if (!newInsuranceName.trim()) return;
    const slug = newInsuranceName.trim().toLowerCase().replace(/\s+/g, '-');
    const newInsurance: Insurance = { name: newInsuranceName.trim(), slug };
    if (insurance.some((ins) => ins.name.toLowerCase() === newInsuranceName.trim().toLowerCase())) {
      return;
    }
    const updatedInsurance = [...insurance, newInsurance];
    setDoctor({ ...doctor, insurance: updatedInsurance });
    setNewInsuranceName('');
  };

  const handleRemoveInsurance = (insuranceToRemove: Insurance) => {
    const updatedInsurance = insurance.filter((ins) => ins.name !== insuranceToRemove.name);
    setDoctor({ ...doctor, insurance: updatedInsurance });
  };

  const conditionServices = doctor.conditionServices ?? (doctor.conditionsAndServices?.length ? doctor.conditionsAndServices.map((s) => ({ condition: s, services: [] as string[] })) : []);

  const updateConditionServiceRow = (index: number, row: ConditionServiceRow) => {
    const next = [...(doctor.conditionServices ?? conditionServices)];
    next[index] = row;
    const updatedDoctor = { ...doctor, conditionServices: next };
    setDoctor(updatedDoctor);
  };

  const addConditionRow = () => {
    const next = [...(doctor.conditionServices ?? conditionServices), { condition: '', services: [''] }];
    const updatedDoctor = { ...doctor, conditionServices: next };
    setDoctor(updatedDoctor);
  };

  const removeConditionRow = (index: number) => {
    const next = (doctor.conditionServices ?? conditionServices).filter((_, i) => i !== index);
    const updatedDoctor = { ...doctor, conditionServices: next.length ? next : [] };
    setDoctor(updatedDoctor);
  };

  const addServiceToRow = (rowIndex: number) => {
    const rows = doctor.conditionServices ?? conditionServices;
    const row = rows[rowIndex] ?? EMPTY_ROW;
    const nextRows = [...rows];
    nextRows[rowIndex] = { ...row, services: [...row.services, ''] };
    const updatedDoctor = { ...doctor, conditionServices: nextRows };
    setDoctor(updatedDoctor);
  };

  const updateServiceInRow = (rowIndex: number, serviceIndex: number, value: string) => {
    const rows = doctor.conditionServices ?? conditionServices;
    const row = rows[rowIndex] ?? EMPTY_ROW;
    const nextServices = [...row.services];
    nextServices[serviceIndex] = value;
    const nextRows = [...rows];
    nextRows[rowIndex] = { ...row, services: nextServices };
    const updatedDoctor = { ...doctor, conditionServices: nextRows };
    setDoctor(updatedDoctor);
  };

  const removeServiceFromRow = (rowIndex: number, serviceIndex: number) => {
    const rows = doctor.conditionServices ?? conditionServices;
    const row = rows[rowIndex] ?? EMPTY_ROW;
    const nextServices = row.services.filter((_, i) => i !== serviceIndex);
    const nextRows = [...rows];
    nextRows[rowIndex] = { ...row, services: nextServices.length ? nextServices : [''] };
    const updatedDoctor = { ...doctor, conditionServices: nextRows };
    setDoctor(updatedDoctor);
  };

  /** Single "Save Changes" — normalizes conditions then submits one approval request (or direct save for admin). */
  const handleSaveChanges = async () => {
    const rows = (doctor.conditionServices ?? conditionServices)
      .map((r) => ({ condition: r.condition.trim(), services: r.services.map((s) => s.trim()).filter(Boolean) }))
      .filter((r) => r.condition || r.services.length > 0);
    const updatedDoctor = {
      ...doctor,
      insurance: doctor.insurance ?? [],
      conditionServices: rows.length ? rows : [],
    };
    setDoctor(updatedDoctor);
    setIsSaving(true);
    try {
      await submitInsuranceState(updatedDoctor);
      if (getAdminSession()) onProfileUpdate?.(updatedDoctor);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-3xl font-bold text-brand-dark-blue">Insurance & Services</h2>
          {hasPendingInsuranceEdit && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
              Pending approval
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          View and manage accepted insurance plans and services offered
        </p>
        {hasPendingInsuranceEdit && (
          <p className="text-sm text-amber-700 mt-1 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            You have pending insurance/services changes awaiting approval. Edit the form as needed and click &quot;Save Changes&quot; below to submit one request with all your updates.
          </p>
        )}
        {submitMessage && (
          <p className="text-sm text-green-700 mt-1 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            {submitMessage}
          </p>
        )}
        {submitError && (
          <p className="text-sm text-destructive mt-1 bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {submitError}
          </p>
        )}
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
            <div className="space-y-2 pt-2 border-t">
              <label className="text-sm font-medium">Add Insurance Plan</label>
              <div className="flex gap-2">
                <Select value={newInsuranceName} onValueChange={setNewInsuranceName}>
                  <SelectTrigger className="flex-1">
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
                <Input
                  value={newInsuranceName}
                  onChange={(e) => setNewInsuranceName(e.target.value)}
                  placeholder="Or type custom name"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInsurance();
                    }
                  }}
                />
                <Button
                  onClick={handleAddInsurance}
                  disabled={!newInsuranceName.trim() || isSaving}
                  className="bg-brand-teal hover:bg-brand-teal/90"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions & Services — two columns: Condition | Treatments / Services */}
        <Card className="card-vibrant">
          <CardHeader>
            <CardTitle>Conditions & Services</CardTitle>
            <CardDescription>
              List the conditions you treat and the treatments or services you offer for each. Add one row per condition; use + to add multiple services for the same condition.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left font-medium p-3 w-[40%]">Condition</th>
                    <th className="text-left font-medium p-3">Treatments / Services</th>
                    <th className="w-10" aria-label="Remove row" />
                  </tr>
                </thead>
                <tbody>
                  {(doctor.conditionServices ?? conditionServices).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-muted-foreground text-center">
                        No conditions added yet. Click &quot;Add condition&quot; below.
                      </td>
                    </tr>
                  ) : (
                    (doctor.conditionServices ?? conditionServices).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b last:border-b-0 align-top">
                        <td className="p-2">
                          <Input
                            placeholder="e.g. Diabetes, Hypertension"
                            value={row.condition}
                            onChange={(e) => updateConditionServiceRow(rowIndex, { ...row, condition: e.target.value })}
                            className="h-9"
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {(row.services.length === 0 ? [''] : row.services).map((svc, svcIndex) => (
                              <div key={svcIndex} className="flex items-center gap-1">
                                <Input
                                  placeholder="Service or treatment"
                                  value={svc}
                                  onChange={(e) => updateServiceInRow(rowIndex, svcIndex, e.target.value)}
                                  className="h-8 w-40"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeServiceFromRow(rowIndex, svcIndex)}
                                  className="rounded-full p-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                  aria-label={`Remove service ${svcIndex + 1}`}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => addServiceToRow(rowIndex)}
                              aria-label="Add service for this condition"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeConditionRow(rowIndex)}
                            aria-label="Remove this condition row"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={addConditionRow} className="bg-brand-teal/10 border-brand-teal/30 text-brand-teal hover:bg-brand-teal/20">
                <Plus className="h-4 w-4 mr-1" />
                Add condition
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Single Save Changes — only this creates an approval request (or saves for admin). */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={isSaving}
          onClick={handleSaveChanges}
          className="bg-brand-teal hover:bg-brand-teal/90"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
