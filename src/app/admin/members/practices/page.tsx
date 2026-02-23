'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
import { getPractices, getPractice, updatePractice, type Practice } from '@/lib/api/practices';
import { getToken } from '@/lib/api/config';

function firstLocation(p: Practice) {
  const locs = p.locations;
  if (Array.isArray(locs) && locs.length) return locs[0];
  return null;
}

export default function AdminMembersPracticesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Practice | null>(null);
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      const res = await getPractices({ includePending: true, limit: 500 }, token);
      setPractices(res.practices || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load practices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = async (p: Practice) => {
    const token = getToken();
    if (!token) return;
    try {
      const full = await getPractice(p.id, token);
      setEditing(full);
      setFormName(full.name ?? '');
      const loc = firstLocation(full);
      setFormCity(loc?.city ?? (full as any).city ?? '');
      setFormState(loc?.state ?? (full as any).state ?? '');
      setFormStatus((full as any).status ?? '');
      setEditOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load practice');
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await updatePractice(
        editing.id,
        {
          name: formName,
          city: formCity || undefined,
          state: formState || undefined,
          status: formStatus || undefined,
        },
        token
      );
      setEditOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F5FA8]" />
      </div>
    );
  }
  if (error && practices.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Manage Practices</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button className="mt-4" onClick={load}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Manage Practices</h2>
        <p className="text-gray-600 mt-1">
          Edit practice profiles, view doctors, and manage membership status.
        </p>
      </div>
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="pt-6">
          {practices.length === 0 ? (
            <p className="text-gray-600">No practices found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Doctors</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practices.map((p) => {
                  const loc = firstLocation(p);
                  const doctorCount = Array.isArray(p.doctors) ? p.doctors.length : 0;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{loc?.city ?? (p as any).city ?? '—'}</TableCell>
                      <TableCell>{loc?.state ?? (p as any).state ?? '—'}</TableCell>
                      <TableCell>{doctorCount}</TableCell>
                      <TableCell>{(p as any).status ?? '—'}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                        <Button asChild variant="ghost" size="sm" className="ml-1">
                          <Link href={`/admin/members/doctors?practiceId=${p.id}`}>View doctors</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit practice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input value={formCity} onChange={(e) => setFormCity(e.target.value)} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={formState} onChange={(e) => setFormState(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Input value={formStatus} onChange={(e) => setFormStatus(e.target.value)} placeholder="e.g. active" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
