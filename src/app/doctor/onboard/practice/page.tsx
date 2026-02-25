'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { getPractice, updatePractice, type Practice } from '@/lib/api/practices';
import { Save, Loader2, ArrowLeft } from 'lucide-react';

const TIMEOUT_MS = 8000;

export default function OnboardPracticePage() {
  const router = useRouter();
  const { getToken, getUser } = useDoctorSession();
  const user = getUser();
  const practiceId = user?.practiceId;

  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!practiceId || user?.roleInPractice !== 'practice_admin') {
      router.replace('/doctor/onboard');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const token = getToken();
    if (!token) {
      router.push('/join-us');
      return;
    }
    const loadWithTimeout = Promise.race([
      getPractice(practiceId, token),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Load timed out')), TIMEOUT_MS)
      ),
    ]);
    loadWithTimeout
      .then((p) => {
        if (!cancelled) {
          setPractice(p);
          setLoadError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Could not load practice.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [practiceId, user?.roleInPractice, router, getToken]);

  const handleSave = async () => {
    if (!practice || !practiceId) return;
    const token = getToken();
    if (!token) {
      setSaveError('Session expired. Please sign in again.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const addr = practice.address && typeof practice.address === 'object' ? practice.address : {} as Record<string, string>;
      await updatePractice(
        practiceId,
        {
          name: practice.name,
          phone: practice.phone ?? '',
          website: (practice as { website?: string }).website ?? '',
          address_line1: (practice as { address_line1?: string }).address_line1 ?? addr.line1 ?? '',
          address_line2: (practice as { address_line2?: string }).address_line2 ?? addr.line2 ?? '',
          city: (practice as { city?: string }).city ?? addr.city ?? '',
          state: (practice as { state?: string }).state ?? addr.state ?? '',
          zip: (practice as { zip?: string }).zip ?? addr.zip ?? '',
        },
        token
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    if (!practice) return;
    const next = { ...practice };
    if (field === 'name') next.name = value;
    else if (field === 'phone') (next as Record<string, string>).phone = value;
    else if (field === 'website') (next as Record<string, string>).website = value;
    else if (['address_line1', 'city', 'state', 'zip'].includes(field)) {
      const addr = (next.address && typeof next.address === 'object' ? { ...next.address } : {}) as Record<string, string>;
      addr[field === 'address_line1' ? 'line1' : field] = value;
      next.address = addr;
      (next as Record<string, string>)[field] = value;
    }
    setPractice(next);
  };

  const addr = practice?.address && typeof practice.address === 'object' ? practice.address : {};
  const line1 = (practice as { address_line1?: string })?.address_line1 ?? (addr as { line1?: string })?.line1 ?? '';
  const city = (practice as { city?: string })?.city ?? (addr as { city?: string })?.city ?? '';
  const state = (practice as { state?: string })?.state ?? (addr as { state?: string })?.state ?? '';
  const zip = (practice as { zip?: string })?.zip ?? (addr as { zip?: string })?.zip ?? '';

  if (loading && !practice) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--aip-teal)] mb-4" />
        <p className="text-muted-foreground">Loading practice...</p>
      </div>
    );
  }

  if (loadError && !practice) {
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

  if (!practice) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/doctor/onboard"><ArrowLeft className="mr-1 h-4 w-4" /> Back to steps</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Practice</h2>
          <p className="text-muted-foreground text-sm mt-1">Practice details and primary address. One save for the whole page.</p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && <span className="text-sm text-green-600">Saved.</span>}
          {saveError && <span className="text-sm text-destructive">{saveError}</span>}
          <Button onClick={handleSave} disabled={saving} className="rounded-lg" style={{ background: 'var(--aip-teal)', color: 'white' }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Practice details</CardTitle>
          <CardDescription>Name, phone, website, and primary address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Practice name</Label>
              <Input id="name" value={practice.name ?? ''} onChange={(e) => updateField('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={(practice as { phone?: string }).phone ?? ''} onChange={(e) => updateField('phone', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={(practice as { website?: string }).website ?? ''} onChange={(e) => updateField('website', e.target.value)} placeholder="https://" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address_line1">Address line 1</Label>
              <Input id="address_line1" value={line1} onChange={(e) => updateField('address_line1', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => updateField('city', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => updateField('state', e.target.value)} placeholder="e.g. MO" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" value={zip} onChange={(e) => updateField('zip', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="rounded-lg" style={{ background: 'var(--aip-teal)', color: 'white' }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
