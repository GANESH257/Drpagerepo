'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { getDoctor } from '@/lib/api/doctors';
import { Doctor, ConditionServiceRow } from '@/types';
import { Save, Loader2, ArrowLeft, X, Plus, Check } from 'lucide-react';
import { loadDoctorProfile, saveDoctorProfile } from '@/lib/doctorStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const TIMEOUT_MS = 8000;

const FIXED_INSURANCE_OPTIONS: { name: string; slug: string }[] = [
  { name: 'Public', slug: 'public' },
  { name: 'Medicare', slug: 'medicare' },
  { name: 'Medicaid', slug: 'medicaid' },
  { name: 'Cash pay', slug: 'cashpay' },
];

const COMMON_INSURANCE_PROVIDERS = [
  'Aetna PPO', 'Aetna', 'BCBS PPO', 'Blue Cross Blue Shield', 'Cigna PPO', 'Cigna',
  'United Healthcare', 'Humana Gold Plus', 'Humana', 'Kaiser Permanente', 'Anthem',
  'AARP', 'Tricare', 'Oscar Health',
];

const EMPTY_ROW: ConditionServiceRow = { condition: '', services: [''] };

export default function OnboardProfilePage() {
  const router = useRouter();
  const { getToken, getUser } = useDoctorSession();
  const user = getUser();
  const doctorId = user?.doctorId;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editingConditionIndex, setEditingConditionIndex] = useState<number | null>(null);
  const [editingServiceKey, setEditingServiceKey] = useState<string | null>(null);
  const [newInsuranceName, setNewInsuranceName] = useState('');

  useEffect(() => {
    if (!doctorId) {
      router.push('/join-us');
      return;
    }
    const token = getToken();
    if (!token) {
      router.push('/join-us');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const loadWithTimeout = Promise.race([
      getDoctor(doctorId, token),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Load timed out')), TIMEOUT_MS)
      ),
    ]);
    loadWithTimeout
      .then((d) => {
        if (!cancelled) {
          setDoctor(d);
          setLoadError(null);
        }
      })
      .catch(async (e) => {
        if (cancelled) return;
        const fromStorage = await loadDoctorProfile(doctorId);
        if (fromStorage) {
          setDoctor(fromStorage);
          setLoadError('Loaded from your last saved data. You can edit and save.');
        } else {
          setLoadError(e instanceof Error ? e.message : 'Could not load profile. Try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // Intentionally only depend on doctorId so the effect doesn't re-run and overwrite form state when getToken/router change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const updateField = <K extends keyof Doctor>(field: K, value: Doctor[K]) => {
    if (!doctor) return;
    setDoctor({ ...doctor, [field]: value });
  };

  const insurance = doctor?.insurance ?? [];
  const otherInsurance = insurance.filter(
    (i) => !FIXED_INSURANCE_OPTIONS.some((f) => f.slug === i.slug || (i.name ?? '').toLowerCase() === f.name.toLowerCase())
  );
  const setInsuranceToggled = (opt: { name: string; slug: string }, checked: boolean) => {
    if (!doctor) return;
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

  const handleAddInsurance = () => {
    if (!doctor || !newInsuranceName.trim()) return;
    const slug = newInsuranceName.trim().toLowerCase().replace(/\s+/g, '-');
    if (insurance.some((ins) => ins.name.toLowerCase() === newInsuranceName.trim().toLowerCase())) return;
    setDoctor({ ...doctor, insurance: [...insurance, { name: newInsuranceName.trim(), slug }] });
    setNewInsuranceName('');
  };

  const handleRemoveInsurance = (insToRemove: { name: string; slug: string }) => {
    if (!doctor) return;
    setDoctor({ ...doctor, insurance: insurance.filter((i) => i.name !== insToRemove.name) });
  };

  const conditionServices = doctor?.conditionServices ?? (doctor?.conditionsAndServices?.length ? doctor.conditionsAndServices.map((s) => ({ condition: s, services: [] as string[] })) : []);

  const updateConditionServiceRow = (index: number, row: ConditionServiceRow) => {
    if (!doctor) return;
    const next = [...(doctor.conditionServices ?? conditionServices)];
    next[index] = row;
    setDoctor({ ...doctor, conditionServices: next });
  };

  const addConditionRow = () => {
    if (!doctor) return;
    const next = [...(doctor.conditionServices ?? conditionServices), { condition: '', services: [''] }];
    setDoctor({ ...doctor, conditionServices: next });
    setEditingConditionIndex(next.length - 1);
  };

  const removeConditionRow = (index: number) => {
    if (!doctor) return;
    const next = (doctor.conditionServices ?? conditionServices).filter((_, i) => i !== index);
    setDoctor({ ...doctor, conditionServices: next.length ? next : [] });
  };

  const addServiceToRow = (rowIndex: number) => {
    if (!doctor) return;
    const rows = doctor.conditionServices ?? conditionServices;
    const row = rows[rowIndex] ?? EMPTY_ROW;
    const nextServices = [...row.services, ''];
    const nextRows = [...rows];
    nextRows[rowIndex] = { ...row, services: nextServices };
    setDoctor({ ...doctor, conditionServices: nextRows });
    setEditingServiceKey(`${rowIndex}-${nextServices.length - 1}`);
  };

  const updateServiceInRow = (rowIndex: number, serviceIndex: number, value: string) => {
    if (!doctor) return;
    const rows = doctor.conditionServices ?? conditionServices;
    const row = rows[rowIndex] ?? EMPTY_ROW;
    const nextServices = [...row.services];
    nextServices[serviceIndex] = value;
    const nextRows = [...rows];
    nextRows[rowIndex] = { ...row, services: nextServices };
    setDoctor({ ...doctor, conditionServices: nextRows });
  };

  const removeServiceFromRow = (rowIndex: number, serviceIndex: number) => {
    if (!doctor) return;
    const rows = doctor.conditionServices ?? conditionServices;
    const row = rows[rowIndex] ?? EMPTY_ROW;
    const nextServices = row.services.filter((_, i) => i !== serviceIndex);
    const nextRows = [...rows];
    nextRows[rowIndex] = { ...row, services: nextServices.length ? nextServices : [''] };
    setDoctor({ ...doctor, conditionServices: nextRows });
  };

  const handleSave = async () => {
    if (!doctor || !doctorId) return;
    const token = getToken();
    if (!token) {
      setSaveError('Session expired. Please sign in again.');
      return;
    }
    setSaveError(null);
    const fullName = (doctor.fullName ?? '').trim();
    const phone = (doctor.phone ?? '').trim();
    const npi = (doctor.npi ?? '').trim().replace(/\D/g, '');
    if (!fullName || !phone || npi.length !== 10) {
      const missing: string[] = [];
      if (!fullName) missing.push('Full name');
      if (!phone) missing.push('Phone');
      if (npi.length !== 10) missing.push('NPI (10 digits)');
      setSaveError(`Please fill in all required fields: ${missing.join(', ')}.`);
      return;
    }
    setSaving(true);
    try {
      const rows = (doctor.conditionServices ?? conditionServices)
        .map((r) => ({ condition: r.condition.trim(), services: r.services.map((s) => s.trim()).filter(Boolean) }))
        .filter((r) => r.condition || r.services.length > 0);
      const toSave = {
        ...doctor,
        fullName,
        phone: phone || undefined,
        npi: npi.length === 10 ? npi : (doctor.npi ?? undefined),
        insurance: doctor.insurance ?? [],
        conditionServices: rows.length ? rows : [],
      };
      const updated = await saveDoctorProfile(doctorId, toSave);
      if (updated) setDoctor(updated);
      else setDoctor(toSave);
      setSaveSuccess(true);
      setSaveError(null);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--aip-teal)] mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
        {loadError && <p className="text-sm text-amber-600 mt-2">{loadError}</p>}
      </div>
    );
  }

  if (loadError && !doctor) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">{loadError}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
        <Button asChild variant="link"><Link href="/doctor/onboard">← Back to steps</Link></Button>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/doctor/onboard"><ArrowLeft className="mr-1 h-4 w-4" /> Back to steps</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Profile</h2>
          <p className="text-muted-foreground text-sm mt-1">You’re here because your join request was approved. Complete your profile, then submit for approval in Step 3 to get full access to the doctor portal.</p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && <span className="text-sm font-medium text-green-600 dark:text-green-500">Your profile has been saved.</span>}
          {saveError && <span className="text-sm text-destructive">{saveError}</span>}
          <Button onClick={handleSave} disabled={saving} className="rounded-lg" style={{ background: 'var(--aip-teal)', color: 'white' }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
          <CardDescription>Name, contact, and professional details. Required fields are marked with *.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name <span className="text-destructive">*</span></Label>
              <Input id="fullName" value={doctor.fullName ?? ''} onChange={(e) => updateField('fullName', e.target.value)} placeholder="e.g. Jane Smith, M.D." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
              <Input id="phone" value={doctor.phone ?? ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="10 digits" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={doctor.website ?? ''} onChange={(e) => updateField('website', e.target.value)} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="npi">NPI (10 digits) <span className="text-destructive">*</span></Label>
              <Input id="npi" value={doctor.npi ?? ''} onChange={(e) => updateField('npi', e.target.value)} placeholder="10 digits" maxLength={10} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={doctor.bio ?? ''} onChange={(e) => updateField('bio', e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalSchool">Medical school</Label>
            <Input id="medicalSchool" value={doctor.medicalSchool ?? ''} onChange={(e) => updateField('medicalSchool', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conditions Treated &amp; Procedures Offered</CardTitle>
          <CardDescription>For each condition, add the treatments or procedures you offer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {(doctor.conditionServices ?? conditionServices).length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No conditions added yet.</p>
          ) : (
            (doctor.conditionServices ?? conditionServices).map((row, rowIndex) => {
              const isEditingCondition = editingConditionIndex === rowIndex || !row.condition.trim();
              return (
                <div key={rowIndex} className="border border-border rounded-xl bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                    {isEditingCondition ? (
                      <Input
                        autoFocus={editingConditionIndex === rowIndex}
                        placeholder="e.g. Coronary Artery Disease"
                        value={row.condition}
                        onChange={(e) => updateConditionServiceRow(rowIndex, { ...row, condition: e.target.value })}
                        onFocus={() => setEditingConditionIndex(rowIndex)}
                        onBlur={() => { if (row.condition.trim()) setEditingConditionIndex(null); }}
                        className="h-8 flex-1 max-w-xs text-sm"
                      />
                    ) : (
                      <button type="button" className="font-semibold text-foreground hover:underline text-left" onClick={() => setEditingConditionIndex(rowIndex)}>
                        {row.condition}
                      </button>
                    )}
                    <button type="button" onClick={() => removeConditionRow(rowIndex)} className="ml-auto rounded p-1 text-muted-foreground hover:text-destructive" aria-label="Remove condition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pl-7">
                    {(row.services.length === 0 ? [""] : row.services).map((svc, svcIndex) => {
                      const serviceKey = `${rowIndex}-${svcIndex}`;
                      const isEditingService = editingServiceKey === serviceKey || !svc.trim();
                      return isEditingService ? (
                        <div key={svcIndex} className="inline-flex items-center gap-1">
                          <Input
                            autoFocus={editingServiceKey === serviceKey}
                            placeholder="Add treatment..."
                            value={svc}
                            onChange={(e) => updateServiceInRow(rowIndex, svcIndex, e.target.value)}
                            onFocus={() => setEditingServiceKey(serviceKey)}
                            onBlur={() => { if (svc.trim()) setEditingServiceKey(null); }}
                            className="h-8 w-36 text-sm"
                          />
                        </div>
                      ) : (
                        <span key={svcIndex} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-sm dark:border-emerald-800 dark:bg-emerald-900/30">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <button type="button" className="hover:underline" onClick={() => setEditingServiceKey(serviceKey)}>{svc}</button>
                          <button type="button" onClick={() => removeServiceFromRow(rowIndex, svcIndex)} className="rounded p-0.5 hover:text-destructive" aria-label={`Remove ${svc}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                    <button type="button" onClick={() => addServiceToRow(rowIndex)} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border bg-muted px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted/80">
                      <Plus className="h-3.5 w-3.5" /> Add treatment
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <button type="button" onClick={addConditionRow} className="text-sm font-medium text-[var(--aip-teal)] hover:underline">
            + Add Condition
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accepted Insurance Plans</CardTitle>
          <CardDescription>Practice insurances and other plans.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Practice insurances</p>
            {FIXED_INSURANCE_OPTIONS.map((opt) => {
              const isOn = insurance.some((i) => i.slug === opt.slug || (i.name ?? "").toLowerCase() === opt.name.toLowerCase());
              return (
                <div key={opt.slug} className="flex items-center justify-between py-1">
                  <Label htmlFor={`onboard-ins-${opt.slug}`} className="font-medium">{opt.name}</Label>
                  <Switch id={`onboard-ins-${opt.slug}`} checked={isOn} onCheckedChange={(checked) => setInsuranceToggled(opt, checked)} />
                </div>
              );
            })}
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Other insurance plans</p>
            <div className="flex flex-wrap items-center gap-2">
              {otherInsurance.length === 0 && <p className="text-sm text-muted-foreground">No other plans added.</p>}
              {otherInsurance.map((ins) => (
                <span key={ins.slug} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-sm dark:border-emerald-800 dark:bg-emerald-900/30">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  {ins.name}
                  <button type="button" onClick={() => handleRemoveInsurance(ins)} className="rounded p-0.5 hover:text-destructive" aria-label={`Remove ${ins.name}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4 mt-2 w-full">
                <Select value={newInsuranceName} onValueChange={setNewInsuranceName}>
                  <SelectTrigger className="h-9 w-[180px] text-sm">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_INSURANCE_PROVIDERS.filter((p) => !insurance.some((i) => i.name.toLowerCase() === p.toLowerCase())).map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={newInsuranceName}
                  onChange={(e) => setNewInsuranceName(e.target.value)}
                  placeholder="Or type custom name"
                  className="h-9 w-40 text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddInsurance(); } }}
                />
                <Button type="button" size="sm" onClick={handleAddInsurance} disabled={!newInsuranceName.trim() || saving} className="h-9 rounded-lg bg-[var(--aip-teal)] text-white">
                  <Plus className="h-4 w-4 mr-1" /> Add Plan
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 items-end">
        <p className="text-xs text-muted-foreground max-w-md text-right">Required fields are marked with *. Save stores your data. When you’re ready, complete Step 3 on the dashboard to submit for approval and get full doctor portal access.</p>
        {saveError && <p className="text-sm text-destructive w-full text-right">{saveError}</p>}
        {saveSuccess && <p className="text-sm font-medium text-green-600 dark:text-green-500 w-full text-right">Your profile has been saved.</p>}
        <Button onClick={handleSave} disabled={saving} className="rounded-lg" style={{ background: 'var(--aip-teal)', color: 'white' }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
