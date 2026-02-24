'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getDoctors, getDoctor, updateDoctor } from '@/lib/api/doctors';
import type { Doctor } from '@/types';
import { getToken } from '@/lib/api/config';
import { Search, X } from 'lucide-react';

export default function AdminMembersDoctorsPage() {
  const searchParams = useSearchParams();
  const practiceIdParam = searchParams.get('practiceId') ?? '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [saving, setSaving] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [practiceFilter, setPracticeFilter] = useState(practiceIdParam || 'all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { setError('Authentication required'); return; }
      const res = await getDoctors({ limit: 500 }, token);
      setDoctors(res.doctors || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build unique options from loaded data
  const specialtyOptions = useMemo(() => {
    const seen = new Set<string>();
    doctors.forEach((d) => { if (d.specialty) seen.add(d.specialty); });
    return Array.from(seen).sort();
  }, [doctors]);

  const practiceOptions = useMemo(() => {
    const map = new Map<string, string>();
    doctors.forEach((d) => {
      if (d.practiceId) map.set(d.practiceId, d.practiceName || d.practiceId);
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [doctors]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors.filter((d) => {
      if (specialtyFilter !== 'all' && d.specialty !== specialtyFilter) return false;
      if (statusFilter !== 'all' && ((d as any).status ?? 'active') !== statusFilter) return false;
      if (practiceFilter !== 'all' && d.practiceId !== practiceFilter) return false;
      if (q) {
        const name = (d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ')).toLowerCase();
        const emailVal = (d.email ?? '').toLowerCase();
        const spec = (d.specialty ?? '').toLowerCase();
        if (!name.includes(q) && !emailVal.includes(q) && !spec.includes(q)) return false;
      }
      return true;
    });
  }, [doctors, search, specialtyFilter, statusFilter, practiceFilter]);

  const hasActiveFilters = search || specialtyFilter !== 'all' || statusFilter !== 'all' || practiceFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setSpecialtyFilter('all');
    setStatusFilter('all');
    setPracticeFilter('all');
  };

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
      await updateDoctor(editing.id, { firstName, lastName, email: email || undefined, specialty: specialty || undefined, status: status || undefined }, token);
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--aip-teal)' }} />
      </div>
    );
  }
  if (error && doctors.length === 0) {
    return (
      <div className="space-y-4">
        <SectionHeader title="Manage Doctors" description="Edit doctor profiles, reset password, and set status." />
        <div className="glass-card p-6">
          <p className="text-destructive">{error}</p>
          <Button className="mt-4 border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10" onClick={load}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Manage Doctors"
        description="Edit doctor profiles, reset password, and set status (Active/Inactive)."
      />
      {error && <div className="glass-card p-4"><p className="text-destructive text-sm">{error}</p></div>}

      <div className="glass-card overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 p-4">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, specialty…"
              className="pl-9 h-9 bg-background text-sm"
            />
          </div>
          {/* Status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px] bg-background text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {/* Specialty */}
          {specialtyOptions.length > 0 && (
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="h-9 w-[170px] bg-background text-sm">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialtyOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Practice */}
          {practiceOptions.length > 0 && (
            <Select value={practiceFilter} onValueChange={setPracticeFilter}>
              <SelectTrigger className="h-9 w-[170px] bg-background text-sm">
                <SelectValue placeholder="All Practices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Practices</SelectItem>
                {practiceOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Clear + count */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {doctors.length}
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                {hasActiveFilters ? 'No doctors match your filters.' : 'No doctors found.'}
              </p>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-3 text-[var(--aip-teal)]">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Name</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Email</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Practice</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Specialty</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="w-[200px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id} className="hover:bg-accent/30">
                    <TableCell className="font-medium">
                      {d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ') || d.id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.email ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{d.practiceName ?? d.practiceId ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{d.specialty ?? '—'}</TableCell>
                    <TableCell><StatusBadge status={(d as any).status ?? 'active'} /></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10" onClick={() => openEdit(d)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="ml-1 text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10" onClick={() => handleResetPassword(d)}>Reset password</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-xl border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit doctor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First name</Label>
                <Input className="mt-1 rounded-lg border border-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last name</Label>
                <Input className="mt-1 rounded-lg border border-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input type="email" className="mt-1 rounded-lg border border-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Specialty</Label>
              <Input className="mt-1 rounded-lg border border-input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1 rounded-lg border border-input">
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
            <Button variant="outline" className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="text-white border-0" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }} onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
