'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMyContacts, removeContact, ContactDoctor } from '@/lib/api/contacts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookUser, UserMinus, ExternalLink, Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';

export default function MyContactsPage() {
  const [contacts, setContacts] = useState<ContactDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await getMyContacts();
      setContacts(Array.isArray(list) ? list : []);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (doctorId: string) => {
    try {
      await removeContact(doctorId);
      setContacts((prev) => prev.filter((c) => c.id !== doctorId));
      showToast('Removed from contacts', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to remove contact', 'error');
    }
  };

  const displayName = (c: ContactDoctor) =>
    (c.full_name && c.full_name.trim()) || c.specialty || 'Physician';

  return (
    <div className="space-y-8 max-w-6xl relative z-10">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My Contacts
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xl">
            Your saved physicians for quick access when sending referrals or messages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link href="/doctor/dashboard/find-physician">
            <Button
              className="rounded-lg text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
            >
              Find a Physician
            </Button>
          </Link>
          <Link href="/doctor/dashboard/referrals">
            <Button
              variant="outline"
              className="rounded-lg"
              style={{ borderColor: 'var(--aip-teal)', color: 'var(--aip-teal)' }}
            >
              Send a Referral
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-gray-50/80 border border-gray-100 glass-card">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--aip-teal)]" aria-hidden />
          <p className="mt-4 text-sm text-gray-500">Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="glass-card rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 overflow-hidden">
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
              <BookUser className="h-8 w-8 text-gray-400" aria-hidden />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-gray-800">No contacts yet</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Add physicians from the Find a Physician directory to quickly send referrals and messages.
            </p>
            <Link href="/doctor/dashboard/find-physician">
              <Button className="mt-6 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}>
                Find a Physician
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
            {contacts.map((c) => (
              <li key={c.id}>
                <div className="glass-card rounded-xl overflow-hidden h-full flex flex-col hover:shadow-md transition-all duration-200">
                  <div className="p-0 flex flex-col flex-1">
                    <div className="p-5 flex gap-4 flex-1">
                      <div
                        className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl text-white"
                        style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
                        aria-hidden
                      >
                        {(displayName(c).charAt(0) || '?').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 leading-tight">
                          {displayName(c)}
                        </h3>
                        <p className="text-sm font-medium mt-1.5" style={{ color: 'var(--aip-teal)' }}>
                          {c.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex border-t border-gray-100 bg-gray-50/60 px-5 py-3 gap-2 mt-auto">
                      <Link
                        href={getDoctorProfileUrl({ slug: c.slug, id: c.id })}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(c.id)}
                        className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shrink-0"
                        title="Remove from contacts"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
