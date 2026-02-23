'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F5FA8]" />
      </div>
    );
  }

  const entries = Object.entries(settings);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">System Settings</h2>
        <p className="text-gray-600 mt-1">Global key-value settings (e.g. email templates, site name).</p>
      </div>
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Key-value settings</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addKey}>Add setting</Button>
              <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save all'}</Button>
            </div>
          </div>
          {entries.length === 0 ? (
            <p className="text-gray-500 text-sm">No settings. Click &quot;Add setting&quot; to add a key.</p>
          ) : (
            <div className="space-y-3">
              {entries.map(([key, value]) => (
                <div key={key} className="flex gap-2 items-center">
                  <Input
                    className="font-mono text-sm w-[200px]"
                    value={key}
                    readOnly
                    disabled
                  />
                  <Input
                    className="flex-1"
                    value={value}
                    onChange={(e) => updateKey(key, e.target.value)}
                    placeholder="Value"
                  />
                  <Button variant="ghost" size="sm" className="text-red-600 shrink-0" onClick={() => removeKey(key)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
