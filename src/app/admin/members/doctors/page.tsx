'use client';

import { useCallback, useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDoctors, getDoctor, updateDoctor, type Doctor } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';

export default function AdminMembersDoctorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [status, setStatus] = useState<string>('active');
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
      const res = await getDoctors({ limit: 500 }, token);
      setDoctors(res.doctors || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = async (d: Doctor) => {
    const token = getToken();
    if (!token) return;
    try {
      const full = await getDoctor(d.id, token);
      setEditing(full);
      setFirstName(full.firstName ?? '');
      setLastName(full.lastName ?? '');
      setEmail(full.email ?? '');
      setSpecialty(full.specialty ?? '');
      setStatus((full as any).status ?? 'active');
      setEditOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load doctor');
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await updateDoctor(
        editing.id,
        {
          firstName,
          lastName,
          email: email || undefined,
          specialty: specialty || undefined,
          status: status as any,
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

  const handleResetPassword = (d: Doctor) => {
    alert('Password reset is not implemented in this build. Use your auth provider or backend admin tool to reset the password for ' + (d.email || d.id) + '.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F5FA8]" />
      </div>
    );
  }
  if (error && doctors.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Manage Doctors</h2>
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
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Manage Doctors</h2>
        <p className="text-gray-600 mt-1">
          Edit doctor profiles, reset password, and set status (Active/Inactive).
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
          {doctors.length === 0 ? (
            <p className="text-gray-600">No doctors found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Practice</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ') || d.id}</TableCell>
                    <TableCell>{d.email ?? '—'}</TableCell>
                    <TableCell>{d.practiceId ?? '—'}</TableCell>
                    <TableCell>{d.specialty ?? '—'}</TableCell>
                    <TableCell>{(d as any).status ?? 'active'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openEdit(d)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="ml-1" onClick={() => handleResetPassword(d)}>Reset password</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit doctor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Specialty</Label>
              <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
