'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, X } from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export type DateRangePreset = '7d' | '30d' | '90d' | 'all';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

/**
 * Date Range Picker Component
 * 
 * Provides preset buttons (7d, 30d, 90d, All time) and custom date range inputs
 */
export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);

  const applyPreset = (preset: DateRangePreset) => {
    const now = new Date();
    let from: Date | null = null;
    let to: Date | null = null;

    switch (preset) {
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        to = now;
        break;
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        to = now;
        break;
      case '90d':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        to = now;
        break;
      case 'all':
        from = null;
        to = null;
        break;
    }

    onChange({ from, to });
    setShowCustom(false);
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const from = e.target.value ? new Date(e.target.value) : null;
    onChange({ ...value, from });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const to = e.target.value ? new Date(e.target.value) : null;
    onChange({ ...value, to });
  };

  const clearRange = () => {
    onChange({ from: null, to: null });
    setShowCustom(false);
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPresetLabel = (): string => {
    if (!value.from && !value.to) return 'All time';
    if (value.from && value.to) {
      const daysDiff = Math.floor(
        (value.to.getTime() - value.from.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysDiff === 7) return 'Last 7 days';
      if (daysDiff === 30) return 'Last 30 days';
      if (daysDiff === 90) return 'Last 90 days';
      return 'Custom range';
    }
    return 'Custom range';
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        <Button
          type="button"
          variant={!value.from && !value.to ? 'default' : 'outline'}
          size="sm"
          onClick={() => applyPreset('7d')}
        >
          7d
        </Button>
        <Button
          type="button"
          variant={
            value.from &&
            value.to &&
            Math.floor(
              (value.to.getTime() - value.from.getTime()) /
                (24 * 60 * 60 * 1000)
            ) === 30
              ? 'default'
              : 'outline'
          }
          size="sm"
          onClick={() => applyPreset('30d')}
        >
          30d
        </Button>
        <Button
          type="button"
          variant={
            value.from &&
            value.to &&
            Math.floor(
              (value.to.getTime() - value.from.getTime()) /
                (24 * 60 * 60 * 1000)
            ) === 90
              ? 'default'
              : 'outline'
          }
          size="sm"
          onClick={() => applyPreset('90d')}
        >
          90d
        </Button>
        <Button
          type="button"
          variant={!value.from && !value.to ? 'default' : 'outline'}
          size="sm"
          onClick={() => applyPreset('all')}
        >
          All time
        </Button>
        <Button
          type="button"
          variant={showCustom ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowCustom(!showCustom)}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Custom
        </Button>
        {(value.from || value.to) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearRange}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showCustom && (
        <div className="flex gap-4 items-end p-3 border rounded-md bg-gray-50">
          <div className="flex-1">
            <Label htmlFor="date-from" className="text-xs text-gray-600">
              From
            </Label>
            <Input
              id="date-from"
              type="date"
              value={formatDateForInput(value.from)}
              onChange={handleFromChange}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="date-to" className="text-xs text-gray-600">
              To
            </Label>
            <Input
              id="date-to"
              type="date"
              value={formatDateForInput(value.to)}
              onChange={handleToChange}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {(value.from || value.to) && (
        <div className="text-xs text-gray-600 mt-1">
          {value.from && value.to
            ? `${formatDate(value.from)} - ${formatDate(value.to)}`
            : value.from
            ? `From ${formatDate(value.from)}`
            : `Until ${formatDate(value.to!)}`}
        </div>
      )}
    </div>
  );
}
