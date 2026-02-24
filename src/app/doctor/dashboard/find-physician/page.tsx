'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDoctors } from '@/lib/api/doctors';
import { addContact, getMyContacts } from '@/lib/api/contacts';
import { getToken } from '@/lib/api/config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Doctor } from '@/types';
import { Search, UserPlus, BookUser, Loader2, MapPin, Stethoscope, ExternalLink, Check } from 'lucide-react';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';

export default function FindPhysicianPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
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
        { search: search || undefined, specialty: specialty || undefined, city: city || undefined, state: state || undefined, limit: 50 },
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
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

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

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Find a Physician
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xl">
            Search the AIP network by name, specialty, or location. Add physicians to My Contacts for quick referrals.
          </p>
        </div>
        <Link href="/doctor/dashboard/find-physician/contacts">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-[var(--brand-dark-blue)] text-[var(--brand-dark-blue)] hover:bg-[var(--brand-dark-blue)]/5 hover:border-[var(--brand-dark-blue)]"
          >
            <BookUser className="h-4 w-4 mr-2" />
            My Contacts
          </Button>
        </Link>
      </header>

      {/* Search panel */}
      <Card className="rounded-2xl border border-gray-200/90 bg-white shadow-[var(--shadow-md)] overflow-hidden">
        <CardContent className="p-6 sm:p-7">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Search</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="search" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name or specialty
              </Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  id="search"
                  placeholder="e.g. cardiology, Smith..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="specialty" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialty
              </Label>
              <Input
                id="specialty"
                placeholder="Any"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="mt-1.5 h-11 rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </Label>
              <Input
                id="city"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 h-11 rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white"
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </Label>
              <Input
                id="state"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1.5 h-11 rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              onClick={load}
              className="rounded-lg bg-[var(--brand-dark-blue)] hover:bg-[#0d5496] text-white shadow-sm px-5"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {(search || specialty || city || state) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setSearch('');
                  setSpecialty('');
                  setCity('');
                  setState('');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error banner */}
      {error && (
        <div
          className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-800 flex items-center justify-between gap-4"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={load}
            className="font-medium text-red-700 underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      <section aria-label="Search results">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-gray-50/80 border border-gray-100">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-dark-blue)]" aria-hidden />
            <p className="mt-4 text-sm text-gray-500">Searching physicians...</p>
          </div>
        ) : doctors.length === 0 ? (
          <Card className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 overflow-hidden">
            <CardContent className="py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
                <Stethoscope className="h-8 w-8 text-gray-400" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-800">No physicians found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Try changing name, specialty, city, or state—or clear filters to see all.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {doctors.length} physician{doctors.length !== 1 ? 's' : ''} found
            </p>
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
              {doctors.map((d) => (
                <li key={d.id}>
                  <Card className="rounded-xl border border-gray-200/90 bg-white shadow-sm hover:shadow-[var(--shadow-md)] hover:border-[var(--brand-dark-blue)]/20 transition-all duration-200 overflow-hidden h-full flex flex-col">
                    <CardContent className="p-0 flex flex-col flex-1">
                      <div className="p-5 flex gap-4 flex-1">
                        <div
                          className="flex-shrink-0 w-14 h-14 rounded-xl bg-[var(--brand-dark-blue)]/10 flex items-center justify-center text-[var(--brand-dark-blue)] font-bold text-xl"
                          aria-hidden
                        >
                          {(displayName(d).charAt(0) || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 leading-tight">
                            {displayName(d)}
                          </h3>
                          {d.credentials && (
                            <p className="text-xs text-gray-500 mt-0.5">{d.credentials}</p>
                          )}
                          <p className="text-sm font-medium text-[var(--brand-dark-blue)] mt-1.5">
                            {d.specialty}
                          </p>
                          {d.practiceName && (
                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 min-w-0">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                              <span className="truncate">{d.practiceName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex border-t border-gray-100 bg-gray-50/60 px-5 py-3 gap-2 mt-auto">
                        <Link
                          href={getDoctorProfileUrl(d)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-0"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-lg border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                            View profile
                          </Button>
                        </Link>
                        {contactIds.has(d.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="rounded-lg border-emerald-200 bg-emerald-50/80 text-emerald-700 shrink-0 cursor-default"
                          >
                            <Check className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                            Added
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddContact(d.id)}
                            disabled={addingId === d.id}
                            className="rounded-lg border-[var(--brand-dark-blue)] text-[var(--brand-dark-blue)] hover:bg-[var(--brand-dark-blue)]/5 shrink-0"
                          >
                            {addingId === d.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            ) : (
                              <>
                                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                Add
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
