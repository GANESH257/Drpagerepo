'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMyContacts, removeContact, ContactDoctor } from '@/lib/api/contacts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { BookUser, UserMinus, Loader2, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';
import { ReferralDialog } from '@/components/shared/referrals/ReferralDialog';
import { getUploadFullUrl } from '@/lib/api/upload';
import { useProfileView } from '@/contexts/ProfileViewContext';
import type { Doctor } from '@/types';

function contactToDoctor(c: ContactDoctor): Doctor {
  return {
    id: c.id,
    fullName: c.full_name ?? '',
    specialty: c.specialty ?? '',
    slug: c.slug ?? '',
    email: (c as any).email ?? '',
  } as Doctor;
}

function contactInitials(c: ContactDoctor): string {
  const name = (c.full_name || '').trim();
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  return (name.charAt(0) || '?').toUpperCase();
}

function contactNameWithTitle(c: ContactDoctor): string {
  const name = (c.full_name || '').trim();
  return name.match(/^Dr\./i) ? name : `Dr. ${name}`;
}

export default function MyContactsPage() {
  const { openProfile } = useProfileView();
  const [contacts, setContacts] = useState<ContactDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [referralTarget, setReferralTarget] = useState<ContactDoctor | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await getMyContacts();
      setContacts(Array.isArray(list) ? list : []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load contacts');
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
              Referral
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
      ) : loadError ? (
        <div className="glass-card rounded-2xl py-16 flex flex-col items-center gap-3 text-center px-6">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <p className="font-semibold text-gray-900">Could not load contacts</p>
          <p className="text-sm text-gray-500">{loadError}</p>
          <Button size="sm" variant="outline" onClick={load} className="flex items-center gap-1.5 mt-1">
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
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
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
            {contacts.map((c) => (
              <li key={c.id}>
                <div className="glass-card rounded-xl overflow-hidden h-full flex flex-col hover:shadow-md transition-all duration-200">
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex gap-3">
                      {/* Profile image or initials */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {c.profile_image_url ? (
                          <Image
                            src={c.profile_image_url.startsWith('http') ? c.profile_image_url : getUploadFullUrl(c.profile_image_url)}
                            alt=""
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span
                            className="w-full h-full flex items-center justify-center font-semibold text-sm text-white"
                            style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
                            aria-hidden
                          >
                            {contactInitials(c)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-semibold text-gray-900 leading-tight">
                          {contactNameWithTitle(c)}
                          {c.credentials && (
                            <span className="font-normal text-gray-600">, {c.credentials}</span>
                          )}
                        </h3>
                        <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--aip-teal)' }}>
                          {c.specialty || '—'}
                        </p>
                        {c.practice_name && (
                          <p className="text-[11px] text-gray-600 mt-1 truncate" title={c.practice_name}>
                            {c.practice_name}
                          </p>
                        )}
                        {(c.city || c.state) && (
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            {[c.city, c.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    {c.insurance && c.insurance.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1">
                        <span className="text-[11px] text-gray-500 font-medium mr-0.5">Insurance:</span>
                        {c.insurance.slice(0, 5).map((ins) => (
                          <span
                            key={ins.slug || ins.name}
                            className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700"
                          >
                            {ins.name}
                          </span>
                        ))}
                        {c.insurance.length > 5 && (
                          <span className="text-[11px] text-gray-500">+{c.insurance.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex border-t border-gray-100 p-3 gap-1.5 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-0 rounded-lg h-8 text-xs border-border text-foreground bg-background hover:bg-accent hover:text-accent-foreground"
                      onClick={() => openProfile({ slug: c.slug ?? undefined, id: c.id })}
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setReferralTarget(c)}
                      className="rounded-lg h-8 text-xs shrink-0 text-white"
                      style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
                      title="Send referral"
                    >
                      <Send className="h-3.5 w-3.5 mr-1 shrink-0" />
                      Refer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(c.id)}
                      className="rounded-lg h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 shrink-0"
                      title="Remove from contacts"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {referralTarget && (
        <ReferralDialog
          doctor={contactToDoctor(referralTarget)}
          open={!!referralTarget}
          onOpenChange={(open) => { if (!open) setReferralTarget(null); }}
        />
      )}
    </div>
  );
}
