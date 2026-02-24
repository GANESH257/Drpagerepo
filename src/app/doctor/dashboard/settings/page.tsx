'use client';

import { useEffect, useState } from 'react';
import { getPreferences, updatePreferences, DoctorPreferences } from '@/lib/api/preferences';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AccountSettingsPage() {
  const [prefs, setPrefs] = useState<DoctorPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPreferences()
      .then(setPrefs)
      .catch((e) => {
        setPrefs(null);
        setError(e instanceof Error ? e.message : 'Failed to load preferences');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: keyof DoctorPreferences, value: boolean) => {
    if (!prefs) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePreferences({ [key]: value });
      setPrefs(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--aip-teal)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader
        title="Account Settings"
        description="Manage your login and notification preferences"
      />
      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-semibold">Notification preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email_digest">Email digest</Label>
              <Switch
                id="email_digest"
                checked={prefs?.email_digest ?? true}
                onCheckedChange={(v) => handleToggle('email_digest', v)}
                disabled={saving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify_referrals">Notify on new referrals</Label>
              <Switch
                id="notify_referrals"
                checked={prefs?.notify_referrals ?? true}
                onCheckedChange={(v) => handleToggle('notify_referrals', v)}
                disabled={saving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify_messages">Notify on new messages</Label>
              <Switch
                id="notify_messages"
                checked={prefs?.notify_messages ?? true}
                onCheckedChange={(v) => handleToggle('notify_messages', v)}
                disabled={saving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notify_announcements">Notify on announcements</Label>
              <Switch
                id="notify_announcements"
                checked={prefs?.notify_announcements ?? true}
                onCheckedChange={(v) => handleToggle('notify_announcements', v)}
                disabled={saving}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Login and password changes are managed through your authentication provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
