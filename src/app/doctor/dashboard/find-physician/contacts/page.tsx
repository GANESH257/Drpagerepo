'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMyContacts, removeContact, ContactDoctor } from '@/lib/api/contacts';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookUser, UserMinus, ExternalLink } from 'lucide-react';
import { showToast } from '@/lib/toast';

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

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Contacts"
        description="Your saved contacts for quick access when sending referrals or messages"
      />
      <div className="flex gap-2">
        <Link href="/doctor/dashboard/find-physician">
          <Button variant="outline">Find a Physician</Button>
        </Link>
        <Link href="/doctor/dashboard/referrals">
          <Button variant="outline">Send a Referral</Button>
        </Link>
      </div>
      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            <BookUser className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No contacts yet.</p>
            <p className="text-sm mt-2">Add physicians from the Find a Physician directory.</p>
            <Link href="/doctor/dashboard/find-physician">
              <Button className="mt-4">Find a Physician</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{c.full_name}</h3>
                  <p className="text-sm text-gray-600">{c.specialty}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/doctors/${c.slug || c.id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" title="View profile">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(c.id)} title="Remove from contacts">
                    <UserMinus className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
