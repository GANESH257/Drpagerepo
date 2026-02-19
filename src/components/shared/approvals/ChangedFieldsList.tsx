import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LocationDiffItem } from '@/lib/utils/locationDiff';
import { PracticeDiffItem } from '@/lib/utils/practiceDiff';
import { ArrowRight } from 'lucide-react';

type DiffItem = LocationDiffItem | PracticeDiffItem;

type Props = {
  items: DiffItem[];
  title?: string;
  dense?: boolean;
  showOnlyChanged?: boolean; // default true
};

export function ChangedFieldsList({
  items,
  title = 'Changed Fields',
  dense = false,
  showOnlyChanged = true,
}: Props) {
  const filtered = showOnlyChanged
    ? items.filter((i) => i.changed)
    : items;

  if (!filtered.length) {
    return (
      <div className="rounded-md border bg-white p-4">
        <div className="text-sm font-semibold mb-2">{title}</div>
        <div className="text-sm text-muted-foreground">
          No changes detected.
        </div>
      </div>
    );
  }

  const padY = dense ? 'py-2' : 'py-3';
  const textSize = dense ? 'text-xs' : 'text-sm';

  return (
    <div className="rounded-md border bg-white">
      <div className="px-4 py-3">
        <div className="text-sm font-semibold">{title}</div>
      </div>

      <Separator />

      <div className="divide-y">
        {filtered.map((item) => (
          <div key={item.field} className={`px-4 ${padY}`}>
            <div className="flex items-start justify-between gap-4">
              
              {/* Field label */}
              <div className="min-w-[120px]">
                <div className={`font-medium ${textSize}`}>
                  {item.label}
                </div>
                {item.changed && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Updated
                  </Badge>
                )}
              </div>

              {/* Before → After */}
              <div className={`flex-1 ${textSize}`}>
                <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-center">

                  {/* Before */}
                  <div className="bg-gray-50 rounded px-3 py-2 font-mono break-all">
                    {item.before}
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* After */}
                  <div className="bg-green-50 rounded px-3 py-2 font-mono break-all border border-green-200">
                    {item.after}
                  </div>

                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
