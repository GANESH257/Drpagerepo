'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getDoctors } from '@/lib/api/doctors';
import { getDepartments } from '@/lib/api/departments';
import { addContact, getMyContacts } from '@/lib/api/contacts';
import { getToken } from '@/lib/api/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Doctor } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, BookUser, Loader2, Stethoscope, Star } from 'lucide-react';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';

export default function FindPhysicianPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState<string>('all');
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [departments, setDepartments] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [contactIds, setContactIds] = useState<Set<string>>(new Set());

  const loadContacts = useCallback(async () => {
    try {
      const list = await getMyContacts();
      setContactIds(new Set((list || []).map((c) => c.id)));
    } catch {
      setContactIds(new Set());
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await getDoctors(
        {
          search: search || undefined,
          specialty: specialty || undefined,
          city: city || undefined,
          state: state || undefined,
          limit: 50,
        },
        token ?? undefined
      );
      setDoctors(res.doctors || []);
    } catch (e) {
      setDoctors([]);
      setError(e instanceof Error ? e.message : 'Failed to load physicians');
    } finally {
      setLoading(false);
    }
  }, [search, specialty, city, state]);

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const insuranceOptions = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => (d.insurance || []).forEach((i) => i.name && set.add(i.name)));
    return Array.from(set).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      if (acceptingOnly && !d.acceptsNewPatients) return false;
      if (insuranceFilter && insuranceFilter !== 'all') {
        const has = (d.insurance || []).some((i) => i.name === insuranceFilter);
        if (!has) return false;
      }
      return true;
    });
  }, [doctors, acceptingOnly, insuranceFilter]);

  const handleAddContact = async (doctorId: string) => {
    setAddingId(doctorId);
    try {
      await addContact(doctorId);
      setContactIds((prev) => new Set(prev).add(doctorId));
      showToast('Added to contacts', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to add contact', 'error');
    } finally {
      setAddingId(null);
    }
  };

  const displayName = (d: Doctor) =>
    d.fullName || [d.firstName, d.lastName].filter(Boolean).join(' ').trim() || d.specialty || 'Physician';

  const initials = (d: Doctor) => {
    const name = displayName(d);
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    return (name.charAt(0) || '?').toUpperCase();
  };

  const nameWithTitle = (d: Doctor) => {
    const name = displayName(d);
    return name.match(/^Dr\./i) ? name : `Dr. ${name}`;
  };

  const locationLine = (d: Doctor) => {
    if (d.practiceName && d.locations?.length) {
      const loc = d.locations[0];
      return `${d.practiceName} ${loc.city || ''} ${loc.state || ''}`.trim();
    }
    if (d.practiceName) return d.practiceName;
    if (d.locations?.length) {
      const loc = d.locations[0];
      return [loc.city, loc.state].filter(Boolean).join(', ');
    }
    return null;
  };

  return (
    <div className="space-y-5 max-w-6xl relative z-10">
      {/* Page header */}
      <header>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Find a Physician</h1>
        <p className="mt-0.5 text-xs text-gray-600">
          Search and connect with physicians across the AIP network
        </p>
      </header>

      {/* Search and filter bar - single row */}
      <div className="glass-card p-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:gap-2">
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search by name, specialty, or condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white"
            />
          </div>
          <Select value={specialty || 'all'} onValueChange={(v) => setSpecialty(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full lg:w-[160px] h-9 text-sm rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.slug} value={dept.slug}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
            <SelectTrigger className="w-full lg:w-[160px] h-9 text-sm rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white">
              <SelectValue placeholder="All Insurance Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Insurance Plans</SelectItem>
              {insuranceOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              id="accepting"
              checked={acceptingOnly}
              onCheckedChange={setAcceptingOnly}
              className="data-[state=checked]:bg-[var(--aip-teal)] h-5 w-9"
            />
            <Label htmlFor="accepting" className="text-xs font-medium text-gray-700 whitespace-nowrap cursor-pointer">
              Accepting New Patients
            </Label>
          </div>
        </div>
      </div>

      {/* My Contacts link */}
      <div className="flex justify-end">
        <Link href="/doctor/dashboard/find-physician/contacts">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs h-8 border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/5"
          >
            <BookUser className="h-3.5 w-3.5 mr-1.5" />
            My Contacts
          </Button>
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-800 flex items-center justify-between gap-3"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={load}
            className="font-medium text-red-700 underline hover:no-underline shrink-0 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      <section aria-label="Search results">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl bg-gray-50/80 border border-gray-100 glass-card">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--aip-teal)]" aria-hidden />
            <p className="mt-3 text-xs text-gray-500">Searching physicians...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="glass-card rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 overflow-hidden">
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto">
                <Stethoscope className="h-6 w-6 text-gray-400" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-800">No physicians found</h3>
              <p className="mt-1.5 text-xs text-gray-500 max-w-sm mx-auto">
                Try changing search, specialty, or filters—or clear filters to see all.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {filteredDoctors.length} physician{filteredDoctors.length !== 1 ? 's' : ''} found
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
              {filteredDoctors.map((d) => (
                <li key={d.id}>
                  <div className="glass-card rounded-xl overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex gap-3">
                        <div
                          className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm text-white"
                          style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
                          aria-hidden
                        >
                          {initials(d)}
                        </div>
                        <div className="min-w-0 flex-1 relative">
                          {(() => {
                            const badgeLabel = (d.badgesAwards && d.badgesAwards.length > 0)
                              ? (typeof d.badgesAwards[0] === 'object' && d.badgesAwards[0]?.name)
                                ? d.badgesAwards[0].name
                                : String(d.badgesAwards[0])
                              : d.featured
                                ? 'Top Doctor 2024'
                                : null;
                            return badgeLabel ? (
                              <div className="absolute top-0 right-0 flex items-center gap-0.5 rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-semibold">
                                <Star className="h-3 w-3 fill-current" />
                                {badgeLabel}
                              </div>
                            ) : null;
                          })()}
                          <h3 className="text-sm font-semibold text-gray-900 leading-tight pr-20">
                            {nameWithTitle(d)}
                            {d.credentials && (
                              <span className="font-normal text-gray-600">, {d.credentials}</span>
                            )}
                          </h3>
                          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--aip-teal)' }}>
                            {d.specialty}
                          </p>
                          {locationLine(d) && (
                            <p className="text-[11px] text-gray-500 mt-1 truncate">{locationLine(d)}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {(d.insurance || []).slice(0, 5).map((ins) => (
                          <span
                            key={ins.slug || ins.name}
                            className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700"
                          >
                            {ins.name}
                          </span>
                        ))}
                        {(d.insurance?.length || 0) > 5 && (
                          <span className="text-[11px] text-gray-500">+{(d.insurance?.length || 0) - 5} more</span>
                        )}
                      </div>
                      {!d.acceptsNewPatients && (
                        <div className="mt-1.5">
                          <span className="inline-flex items-center rounded bg-red-100 text-red-800 px-1.5 py-0.5 text-[11px] font-medium">
                            Not Accepting
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex border-t border-gray-100 p-3 gap-1.5">
                      <Link href={getDoctorProfileUrl(d)} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-lg h-8 text-xs border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          View Profile
                        </Button>
                      </Link>
                      {contactIds.has(d.id) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="rounded-lg h-8 text-xs border-emerald-200 bg-emerald-50/80 text-emerald-700 shrink-0 cursor-default"
                        >
                          Added
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddContact(d.id)}
                          disabled={addingId === d.id}
                          className="rounded-lg h-8 text-xs shrink-0 border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/5"
                        >
                          {addingId === d.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          ) : (
                            <>
                              <UserPlus className="h-3.5 w-3.5 mr-1" />
                              Add to Contacts
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
