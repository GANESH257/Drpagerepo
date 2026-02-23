'use client';

import { useState, useRef } from 'react';
import { CertificationItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadImage } from '@/lib/api/upload';
import { getUploadFullUrl } from '@/lib/api/upload';
import { Award, Plus, Trash2, Loader2 } from 'lucide-react';

interface CredentialItemFormProps {
  items: CertificationItem[];
  onChange: (items: CertificationItem[]) => void;
  label?: string;
  addButtonLabel?: string;
}

export function CredentialItemForm({
  items,
  onChange,
  label = 'Items',
  addButtonLabel = 'Add',
}: CredentialItemFormProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleAdd = () => {
    onChange([...items, { name: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof CertificationItem, value: string) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(next);
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    try {
      const url = await uploadImage(file);
      handleChange(index, 'imageUrl', url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4" data-scroll-exclude>
      <div className="flex items-center justify-between" data-scroll-exclude>
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd} data-scroll-speed="0">
          <Plus className="h-4 w-4 mr-1" />
          {addButtonLabel}
        </Button>
      </div>

      <div className="space-y-3" data-scroll-exclude>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row gap-3 p-3 border rounded-lg bg-card"
            data-scroll-exclude
            style={{ transform: 'translate3d(0, 0, 0)', boxSizing: 'border-box' }}
          >
            <div className="flex items-center gap-2 shrink-0" data-scroll-exclude style={{ flexShrink: 0 }}>
              {item.imageUrl ? (
                <img
                  src={getUploadFullUrl(item.imageUrl)}
                  alt=""
                  className="w-12 h-12 object-contain rounded border shrink-0"
                  data-scroll-speed="0"
                  style={{ transform: 'translate3d(0, 0, 0)', width: '3rem', height: '3rem', minWidth: '3rem', maxWidth: '3rem', minHeight: '3rem', maxHeight: '3rem', flexShrink: 0 }}
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded border bg-muted flex items-center justify-center shrink-0"
                  data-scroll-speed="0"
                  style={{ transform: 'translate3d(0, 0, 0)', width: '3rem', height: '3rem', minWidth: '3rem', maxWidth: '3rem', minHeight: '3rem', maxHeight: '3rem', flexShrink: 0 }}
                >
                  {uploadingIndex === index ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Award className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              )}
              <input
                ref={(el) => { fileInputRefs.current[index] = el; }}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFileChange(index, e)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={uploadingIndex !== null}
                onClick={() => fileInputRefs.current[index]?.click()}
                title="Image is optional"
                data-scroll-speed="0"
              >
                {item.imageUrl ? 'Change' : 'Upload (optional)'}
              </Button>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2" data-scroll-exclude>
              <Input
                placeholder="Name"
                value={item.name}
                data-scroll-speed="0"
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              />
              <Input
                placeholder="Year (e.g. 2020)"
                value={item.year ?? ''}
                onChange={(e) => handleChange(index, 'year', e.target.value)}
                data-scroll-speed="0"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              aria-label="Remove"
              data-scroll-speed="0"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
