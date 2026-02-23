'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
  type Specialty,
} from '@/lib/api/specialties';
import {
  getInsuranceProviders,
  createInsuranceProvider,
  updateInsuranceProvider,
  deleteInsuranceProvider,
  type InsuranceProvider,
} from '@/lib/api/insurance-providers';
import {
  getConditions,
  createCondition,
  updateCondition,
  deleteCondition,
  type Condition,
} from '@/lib/api/conditions';
import {
  getTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,
  type Treatment,
} from '@/lib/api/treatments';
import {
  getConditionTreatments,
  linkConditionTreatment,
  unlinkConditionTreatment,
  type ConditionTreatmentLink,
} from '@/lib/api/condition-treatments';

function SpecialtiesTab() {
  const [list, setList] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSpecialties();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setSortOrder(list.length);
    setOpen(true);
  };
  const openEdit = (s: Specialty) => {
    setEditing(s);
    setName(s.name);
    setSlug(s.slug ?? '');
    setSortOrder(s.sort_order ?? 0);
    setOpen(true);
  };
  const save = async () => {
    try {
      if (editing) {
        await updateSpecialty(editing.id, { name, slug: slug || undefined, sort_order: sortOrder });
      } else {
        await createSpecialty({ name, slug: slug || undefined, sort_order: sortOrder });
      }
      setOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this specialty?')) return;
    try {
      await deleteSpecialty(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  if (loading) return <div className="animate-spin h-8 w-8 border-2 border-[#0F5FA8] rounded-full border-t-transparent" />;
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end">
          <Button onClick={openCreate}>Add specialty</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Sort order</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.slug ?? '—'}</TableCell>
                <TableCell>{s.sort_order ?? 0}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => remove(s.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit specialty' : 'Add specialty'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Slug (optional)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function InsuranceTab() {
  const [list, setList] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InsuranceProvider | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInsuranceProviders();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setSortOrder(list.length);
    setOpen(true);
  };
  const openEdit = (s: InsuranceProvider) => {
    setEditing(s);
    setName(s.name);
    setSlug(s.slug ?? '');
    setSortOrder(s.sort_order ?? 0);
    setOpen(true);
  };
  const save = async () => {
    try {
      if (editing) {
        await updateInsuranceProvider(editing.id, { name, slug: slug || undefined, sort_order: sortOrder });
      } else {
        await createInsuranceProvider({ name, slug: slug || undefined, sort_order: sortOrder });
      }
      setOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this insurance provider?')) return;
    try {
      await deleteInsuranceProvider(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  if (loading) return <div className="animate-spin h-8 w-8 border-2 border-[#0F5FA8] rounded-full border-t-transparent" />;
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end">
          <Button onClick={openCreate}>Add insurance provider</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Sort order</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.slug ?? '—'}</TableCell>
                <TableCell>{s.sort_order ?? 0}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => remove(s.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit insurance provider' : 'Add insurance provider'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Slug (optional)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function ConditionsTreatmentsTab() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [links, setLinks] = useState<ConditionTreatmentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [condId, setCondId] = useState('');
  const [treatId, setTreatId] = useState('');
  const [addCondOpen, setAddCondOpen] = useState(false);
  const [addTreatOpen, setAddTreatOpen] = useState(false);
  const [condName, setCondName] = useState('');
  const [treatName, setTreatName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, t, l] = await Promise.all([
        getConditions(),
        getTreatments(),
        getConditionTreatments(),
      ]);
      setConditions(Array.isArray(c) ? c : []);
      setTreatments(Array.isArray(t) ? t : []);
      setLinks(Array.isArray(l) ? l : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addLink = async () => {
    if (!condId || !treatId) return;
    try {
      await linkConditionTreatment(condId, treatId);
      setLinkOpen(false);
      setCondId('');
      setTreatId('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to link');
    }
  };
  const removeLink = async (conditionId: string, treatmentId: string) => {
    if (!confirm('Remove this link?')) return;
    try {
      await unlinkConditionTreatment(conditionId, treatmentId);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unlink');
    }
  };
  const addCondition = async () => {
    if (!condName.trim()) return;
    try {
      await createCondition({ name: condName.trim() });
      setAddCondOpen(false);
      setCondName('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add condition');
    }
  };
  const addTreatment = async () => {
    if (!treatName.trim()) return;
    try {
      await createTreatment({ name: treatName.trim() });
      setAddTreatOpen(false);
      setTreatName('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add treatment');
    }
  };

  if (loading) return <div className="animate-spin h-8 w-8 border-2 border-[#0F5FA8] rounded-full border-t-transparent" />;
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <h3 className="font-semibold text-[#0F5FA8] mb-2">Conditions</h3>
          <div className="flex gap-2 mb-2">
            <Button size="sm" onClick={() => setAddCondOpen(true)}>Add condition</Button>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {conditions.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
            {conditions.length === 0 && <li>None</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-[#0F5FA8] mb-2">Treatments</h3>
          <div className="flex gap-2 mb-2">
            <Button size="sm" onClick={() => setAddTreatOpen(true)}>Add treatment</Button>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {treatments.map((t) => (
              <li key={t.id}>{t.name}</li>
            ))}
            {treatments.length === 0 && <li>None</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-[#0F5FA8] mb-2">Condition – Treatment links</h3>
          <div className="flex gap-2 mb-2">
            <Button size="sm" onClick={() => setLinkOpen(true)}>Link condition to treatment</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condition</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((l, i) => (
                <TableRow key={`${l.condition_id}-${l.treatment_id}-${i}`}>
                  <TableCell>{l.condition_name ?? l.condition_id}</TableCell>
                  <TableCell>{l.treatment_name ?? l.treatment_id}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => removeLink(l.condition_id, l.treatment_id)}>Unlink</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {links.length === 0 && <p className="text-sm text-gray-500">No links yet.</p>}
        </div>
        <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link condition to treatment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Condition</Label>
                <select className="w-full border rounded px-3 py-2" value={condId} onChange={(e) => setCondId(e.target.value)}>
                  <option value="">Select</option>
                  {conditions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Treatment</Label>
                <select className="w-full border rounded px-3 py-2" value={treatId} onChange={(e) => setTreatId(e.target.value)}>
                  <option value="">Select</option>
                  {treatments.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLinkOpen(false)}>Cancel</Button>
              <Button onClick={addLink} disabled={!condId || !treatId}>Link</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={addCondOpen} onOpenChange={setAddCondOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add condition</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label>Name</Label>
              <Input value={condName} onChange={(e) => setCondName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCondOpen(false)}>Cancel</Button>
              <Button onClick={addCondition}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={addTreatOpen} onOpenChange={setAddTreatOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add treatment</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label>Name</Label>
              <Input value={treatName} onChange={(e) => setTreatName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTreatOpen(false)}>Cancel</Button>
              <Button onClick={addTreatment}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default function AdminConfigMedicalDataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Medical Data Lists</h2>
        <p className="text-gray-600 mt-1">
          Specialties, insurance providers, and conditions & treatments.
        </p>
      </div>
      <Tabs defaultValue="specialties">
        <TabsList>
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="insurance">Insurance Providers</TabsTrigger>
          <TabsTrigger value="conditions">Conditions & Treatments</TabsTrigger>
        </TabsList>
        <TabsContent value="specialties" className="mt-4">
          <SpecialtiesTab />
        </TabsContent>
        <TabsContent value="insurance" className="mt-4">
          <InsuranceTab />
        </TabsContent>
        <TabsContent value="conditions" className="mt-4">
          <ConditionsTreatmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
