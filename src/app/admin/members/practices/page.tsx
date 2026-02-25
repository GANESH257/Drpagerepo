'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getPractices, getPractice, updatePractice, type Practice } from '@/lib/api/practices';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { Search, X, Building2, MapPin, Users, Pencil, ArrowRight } from 'lucide-react';

function firstLocation(p: Practice) {
  const locs = p.locations;
  if (Array.isArray(locs) && locs.length) return locs[0];
  return null;
}

export default function AdminMembersPracticesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [doctorCountByPracticeId, setDoctorCountByPracticeId] = useState<Record<string, number>>({});

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Practice | null>(null);
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { setError('Authentication required'); return; }
      const [res, allDoctors] = await Promise.all([
        getPractices({ includePending: true, limit: 500 }, token),
        getAllDoctorsArray(token, { limit: 2000 }),
      ]);
      setPractices(res.practices || []);
      const counts: Record<string, number> = {};
      for (const d of allDoctors) {
        const pid = d.practiceId ?? (d as any).practice_id;
        if (pid) {
          counts[pid] = (counts[pid] ?? 0) + 1;
        }
      }
      setDoctorCountByPracticeId(counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load practices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build unique state options
  const stateOptions = useMemo(() => {
    const seen = new Set<string>();
    practices.forEach((p) => {
      const loc = firstLocation(p);
      const st = loc?.state ?? (p as any).state;
      if (st) seen.add(st);
    });
    return Array.from(seen).sort();
  }, [practices]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return practices.filter((p) => {
      const loc = firstLocation(p);
      const st = loc?.state ?? (p as any).state ?? '';
      const city = loc?.city ?? (p as any).city ?? '';
      const pStatus = (p as any).status ?? 'active';

      if (statusFilter !== 'all' && pStatus !== statusFilter) return false;
      if (stateFilter !== 'all' && st !== stateFilter) return false;
      if (q) {
        const name = (p.name ?? '').toLowerCase();
        const cityLow = city.toLowerCase();
        const stateLow = st.toLowerCase();
        if (!name.includes(q) && !cityLow.includes(q) && !stateLow.includes(q)) return false;
      }
      return true;
    });
  }, [practices, search, statusFilter, stateFilter]);

  const hasActiveFilters = search || statusFilter !== 'all' || stateFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setStateFilter('all');
  };

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
      await updatePractice(editing.id, { name: formName, city: formCity || undefined, state: formState || undefined, status: formStatus || undefined }, token);
      setEditOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--aip-teal)' }} />
      </div>
    );
  }
  if (error && practices.length === 0) {
    return (
      <div className="space-y-4">
        <SectionHeader title="Manage Practices" description="Edit practice profiles, view doctors, and manage membership status." />
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
        title="Manage Practices"
        description="Edit practice profiles, view doctors, and manage membership status."
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
              placeholder="Search name, city, state…"
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
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          {/* State */}
          {stateOptions.length > 0 && (
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="h-9 w-[130px] bg-background text-sm">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {stateOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Clear + count */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {practices.length}
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
                {hasActiveFilters ? 'No practices match your filters.' : 'No practices found.'}
              </p>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-3 text-[var(--aip-teal)]">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => {
                const loc = firstLocation(p);
                const doctorCount = doctorCountByPracticeId[p.id] ?? (Array.isArray(p.doctors) ? p.doctors.length : 0);
                const city = loc?.city ?? (p as any).city ?? '—';
                const state = loc?.state ?? (p as any).state ?? '—';
                const status = (p as any).status ?? 'active';
                return (
                  <Card key={p.id} className="overflow-hidden border-border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="shrink-0 rounded-lg bg-[var(--aip-teal)]/10 p-2">
                            <Building2 className="h-4 w-4 text-[var(--aip-teal)]" />
                          </div>
                          <h3 className="font-semibold text-foreground truncate" title={p.name}>{p.name}</h3>
                        </div>
                        <StatusBadge status={status} />
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{city}, {state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>{doctorCount} doctor{doctorCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-0 border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10">
                          <Link href={`/admin/members/doctors?practiceId=${p.id}`} className="inline-flex items-center">
                            View doctors
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-xl border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit practice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input className="mt-1 rounded-lg border border-input" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</Label>
                <Input className="mt-1 rounded-lg border border-input" value={formCity} onChange={(e) => setFormCity(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">State</Label>
                <Input className="mt-1 rounded-lg border border-input" value={formState} onChange={(e) => setFormState(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
              <Select value={formStatus || 'active'} onValueChange={setFormStatus}>
                <SelectTrigger className="mt-1 rounded-lg border border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
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
