'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getDoctors } from '@/lib/api/doctors';
import { addContact } from '@/lib/api/contacts';
import { getToken } from '@/lib/api/config';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Doctor } from '@/types';
import { Search, UserPlus, BookUser, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { showToast } from '@/lib/toast';

export default function FindPhysicianPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

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
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleAddContact = async (doctorId: string) => {
    setAddingId(doctorId);
    try {
      await addContact(doctorId);
      showToast('Added to contacts', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to add contact', 'error');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Find a Physician"
        description="Search the AIP network by name, specialty, location, or insurance"
      />
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
          <button type="button" onClick={load} className="ml-2 underline">Retry</button>
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Search by name or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="max-w-[120px]" />
        <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="max-w-[80px]" />
        <Input placeholder="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="max-w-[140px]" />
        <Button onClick={load} variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Link href="/doctor/dashboard/find-physician/contacts">
          <Button variant="secondary">
            <BookUser className="h-4 w-4 mr-2" />
            My Contacts
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{d.fullName}</h3>
                    <p className="text-sm text-gray-600">{d.specialty}</p>
                    {d.practiceName && <p className="text-xs text-gray-500">{d.practiceName}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/doctors/${d.slug || d.id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddContact(d.id)}
                      disabled={addingId === d.id}
                    >
                      {addingId === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!loading && doctors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            No physicians found. Try adjusting your search.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
