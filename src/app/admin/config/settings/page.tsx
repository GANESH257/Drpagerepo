'use client';

import { useCallback, useEffect, useState } from 'react';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAdminSettings, updateAdminSettings } from '@/lib/api/admin-settings';

export default function AdminConfigSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminSettings();
      setSettings(typeof data === 'object' && data !== null ? { ...data } : {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateKey = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addKey = () => {
    const k = prompt('Setting key (e.g. site_name, support_email):');
    if (k && k.trim()) setSettings((prev) => ({ ...prev, [k.trim()]: prev[k.trim()] ?? '' }));
  };

  const removeKey = (key: string) => {
    if (!confirm(`Remove "${key}"?`)) return;
    setSettings((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateAdminSettings(settings);
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

  const entries = Object.entries(settings);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="System Settings"
        description="Global key-value settings (e.g. email templates, site name)."
      />
      {error && (
        <div className="glass-card p-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key-value settings</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10" onClick={addKey}>Add setting</Button>
            <Button size="sm" className="text-white border-0" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save all'}</Button>
          </div>
        </div>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">No settings. Click &quot;Add setting&quot; to add a key.</p>
        ) : (
          <div className="space-y-3">
            {entries.map(([key, value]) => (
              <div key={key} className="flex gap-2 items-center">
                <Input
                  className="font-mono text-sm w-[200px] rounded-lg border border-input"
                  value={key}
                  readOnly
                  disabled
                />
                <Input
                  className="flex-1 rounded-lg border border-input focus:ring-2 focus:ring-ring"
                  value={value}
                  onChange={(e) => updateKey(key, e.target.value)}
                  placeholder="Value"
                />
                <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => removeKey(key)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
