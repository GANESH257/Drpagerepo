'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Doctor, Insurance, ConditionServiceRow } from '@/types';
import { saveDoctorProfile, loadDoctorProfile, saveDoctorProfileToAPI } from '@/lib/doctorStorage';
import { getAdminSession } from '@/lib/adminSession';
import { createApprovalRequest, getApprovalRequests } from '@/lib/api/approval-requests';

interface InsuranceSectionProps {
  doctor: Doctor;
  onProfileUpdate?: (doctor: Doctor) => void;
}

/** Four options always shown with Yes/No toggle (same as practice). */
const FIXED_INSURANCE_OPTIONS: { name: string; slug: string }[] = [
  { name: 'Public', slug: 'public' },
  { name: 'Medicare', slug: 'medicare' },
  { name: 'Medicaid', slug: 'medicaid' },
  { name: 'Cash pay', slug: 'cashpay' },
];

const COMMON_INSURANCE_PROVIDERS = [
  'Aetna PPO',
  'Aetna',
  'BCBS PPO',
  'Blue Cross Blue Shield',
  'Cigna PPO',
  'Cigna',
  'United Healthcare',
  'Medicare',
  'Medicaid',
  'Humana Gold Plus',
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

  // Track which condition rows and service cells are actively being edited.
  // Without this, typing a single character converts the <Input> to a <span>
  // because the conditional `row.condition.trim() ? <span> : <Input>` fires on
  // every keystroke re-render.
  const [editingConditionIndex, setEditingConditionIndex] = useState<number | null>(null);
  const [editingServiceKey, setEditingServiceKey] = useState<string | null>(null);

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

  /** Insurance list without the 4 fixed options (for "other" display and add/remove). */
  const otherInsurance = insurance.filter(
    (i) => !FIXED_INSURANCE_OPTIONS.some((f) => f.slug === i.slug || f.name.toLowerCase() === (i.name ?? '').toLowerCase())
  );

  const setInsuranceToggled = (opt: { name: string; slug: string }, checked: boolean) => {
    if (checked) {
      if (!insurance.some((i) => i.slug === opt.slug || (i.name ?? '').toLowerCase() === opt.name.toLowerCase())) {
        setDoctor({ ...doctor, insurance: [...insurance, { name: opt.name, slug: opt.slug }] });
      }
    } else {
      setDoctor({
        ...doctor,
        insurance: insurance.filter((i) => i.slug !== opt.slug && (i.name ?? '').toLowerCase() !== opt.name.toLowerCase()),
      });
    }
  };

  const submitInsuranceState = async (updatedDoctor: Doctor) => {
    setSubmitError(null);
    setSubmitMessage(null);
    if (getAdminSession()) {
      const updated = await saveDoctorProfileToAPI(doctor.id, updatedDoctor);
      if (updated) {
        setDoctor(updated);
        onProfileUpdate?.(updated);
      } else {
        await saveDoctorProfile(doctor.id, updatedDoctor);
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
    // Put the new row into edit mode immediately
    setEditingConditionIndex(next.length - 1);
  };

  const removeConditionRow = (index: number) => {
    const next = (doctor.conditionServices ?? conditionServices).filter((_, i) => i !== index);
    const updatedDoctor = { ...doctor, conditionServices: next.length ? next : [] };
    setDoctor(updatedDoctor);
  };

  const addServiceToRow = (rowIndex: number) => {
    const rows = doctor.conditionServices ?? conditionServices;
    const row = rows[rowIndex] ?? EMPTY_ROW;
    const nextServices = [...row.services, ''];
    const nextRows = [...rows];
    nextRows[rowIndex] = { ...row, services: nextServices };
    const updatedDoctor = { ...doctor, conditionServices: nextRows };
    setDoctor(updatedDoctor);
    // Put the new service cell into edit mode immediately
    setEditingServiceKey(`${rowIndex}-${nextServices.length - 1}`);
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
    <div className="space-y-8 max-w-4xl doctor-portal-form">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Services & Insurance</h1>
          {hasPendingInsuranceEdit && (
            <span className="rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-medium border border-amber-200">
              Pending approval
            </span>
          )}
        </div>
        {hasPendingInsuranceEdit && (
          <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            You have pending insurance/services changes awaiting approval. Edit below and click &quot;Save Changes&quot; to submit updates.
          </p>
        )}
        {submitMessage && (
          <p className="text-xs text-green-700 mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {submitMessage}
          </p>
        )}
        {submitError && (
          <p className="text-xs text-red-700 mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {submitError}
          </p>
        )}
      </div>

      {/* Section 1: Conditions Treated & Procedures Offered */}
      <section>
        <h2 className="text-lg font-bold text-gray-900">Conditions Treated & Procedures Offered</h2>
        <p className="text-sm text-gray-600 mt-0.5">
          Select conditions you treat. For each condition, choose the specific procedures and treatments you offer.
        </p>
        <div className="mt-4 space-y-5">
          {(doctor.conditionServices ?? conditionServices).length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No conditions added yet.</p>
          ) : (
            (doctor.conditionServices ?? conditionServices).map((row, rowIndex) => {
              const isEditingCondition =
                editingConditionIndex === rowIndex || !row.condition.trim();

              return (
                <div key={rowIndex} className="border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                    {isEditingCondition ? (
                      <Input
                        autoFocus={editingConditionIndex === rowIndex}
                        placeholder="e.g. Coronary Artery Disease"
                        value={row.condition}
                        onChange={(e) =>
                          updateConditionServiceRow(rowIndex, { ...row, condition: e.target.value })
                        }
                        onFocus={() => setEditingConditionIndex(rowIndex)}
                        onBlur={() => {
                          if (row.condition.trim()) setEditingConditionIndex(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (row.condition.trim()) setEditingConditionIndex(null);
                          }
                        }}
                        className="h-8 flex-1 max-w-xs text-sm border-gray-200"
                      />
                    ) : (
                      <button
                        type="button"
                        className="font-semibold text-gray-900 hover:underline hover:text-[var(--aip-teal)] text-left"
                        onClick={() => setEditingConditionIndex(rowIndex)}
                        title="Click to edit"
                      >
                        {row.condition}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeConditionRow(rowIndex)}
                      className="ml-auto rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      aria-label="Remove condition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pl-7">
                    {(row.services.length === 0 ? [''] : row.services).map((svc, svcIndex) => {
                      const serviceKey = `${rowIndex}-${svcIndex}`;
                      const isEditingService =
                        editingServiceKey === serviceKey || !svc.trim();

                      return isEditingService ? (
                        <div key={svcIndex} className="inline-flex items-center gap-1">
                          <Input
                            autoFocus={editingServiceKey === serviceKey}
                            placeholder="Add treatment..."
                            value={svc}
                            onChange={(e) =>
                              updateServiceInRow(rowIndex, svcIndex, e.target.value)
                            }
                            onFocus={() => setEditingServiceKey(serviceKey)}
                            onBlur={() => {
                              if (svc.trim()) setEditingServiceKey(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (e.currentTarget.value.trim()) {
                                  setEditingServiceKey(null);
                                  addServiceToRow(rowIndex);
                                }
                              }
                              if (e.key === 'Escape') {
                                setEditingServiceKey(null);
                              }
                            }}
                            className="h-8 w-36 text-sm border-gray-200 rounded-lg"
                          />
                        </div>
                      ) : (
                        <span
                          key={svcIndex}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-sm text-gray-800"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <button
                            type="button"
                            className="hover:underline"
                            onClick={() => setEditingServiceKey(serviceKey)}
                            title="Click to edit"
                          >
                            {svc}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeServiceFromRow(rowIndex, svcIndex)}
                            className="rounded p-0.5 hover:bg-emerald-200/50 text-gray-500 hover:text-red-600"
                            aria-label={`Remove ${svc}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => addServiceToRow(rowIndex)}
                      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-2.5 py-1 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Suggest Treatment
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <button
          type="button"
          onClick={addConditionRow}
          className="mt-4 text-sm font-medium text-[var(--aip-teal)] hover:underline"
        >
          + Add Condition or Suggest New
        </button>
      </section>

      {/* Section 2: Accepted Insurance Plans */}
      <section>
        <h2 className="text-lg font-bold text-gray-900">Accepted Insurance Plans</h2>
        <div className="mt-4 space-y-4">
          {/* Four options always shown with Yes/No toggle */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Practice insurances and policies</p>
            {FIXED_INSURANCE_OPTIONS.map((opt) => {
              const isOn = insurance.some((i) => i.slug === opt.slug || (i.name ?? '').toLowerCase() === opt.name.toLowerCase());
              return (
                <div key={opt.slug} className="flex items-center justify-between py-1">
                  <Label htmlFor={`ins-${opt.slug}`} className="font-medium text-gray-900">{opt.name}</Label>
                  <Switch
                    id={`ins-${opt.slug}`}
                    checked={isOn}
                    onCheckedChange={(checked) => setInsuranceToggled(opt, checked)}
                  />
                </div>
              );
            })}
          </div>

          {/* Other plans: list + add */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Other insurance plans</p>
            <div className="flex flex-wrap items-center gap-2">
              {otherInsurance.length === 0 && (
                <p className="text-sm text-gray-500">No other plans added.</p>
              )}
              {otherInsurance.map((ins) => (
                <span
                  key={ins.slug}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-sm text-gray-800"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  {ins.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveInsurance(ins)}
                    className="rounded p-0.5 hover:bg-emerald-200/50 text-gray-500 hover:text-red-600"
                    aria-label={`Remove ${ins.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 mt-2 w-full">
                <Select value={newInsuranceName} onValueChange={setNewInsuranceName}>
                  <SelectTrigger className="h-9 w-[180px] text-sm rounded-lg border-gray-200">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_INSURANCE_PROVIDERS.filter(
                      (provider) =>
                        !insurance.some((ins) => ins.name.toLowerCase() === provider.toLowerCase())
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
                  className="h-9 w-40 text-sm rounded-lg border-gray-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInsurance();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddInsurance}
                  disabled={!newInsuranceName.trim() || isSaving}
                  className="h-9 rounded-lg bg-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Save Changes */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={handleSaveChanges}
          className="rounded-lg bg-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/90 text-white"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
