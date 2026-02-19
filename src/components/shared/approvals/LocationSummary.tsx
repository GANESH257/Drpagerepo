import * as React from 'react';
import type { PracticeLocation } from '@/types/practice';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Clock, Link as LinkIcon } from 'lucide-react';

type Props = {
  location?: Partial<PracticeLocation> | null;
  title?: string; // optional heading e.g. "Location (After)"
  showBadges?: boolean; // show "Has coords", "Has phone", etc.
  showId?: boolean; // show location.id
  showCoords?: boolean; // show lat/lng
  dense?: boolean; // tighter spacing for tables/drawers
  /** Optional label override if location.name is missing */
  fallbackName?: string; // e.g. "Main Office" or "Location"
};

function safe(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  return String(v);
}

function formatCoords(lat?: number, lng?: number): string {
  if (typeof lat !== 'number' || typeof lng !== 'number') return '';
  if (Number.isNaN(lat) || Number.isNaN(lng)) return '';
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function hasCoords(loc: Partial<PracticeLocation>): boolean {
  return (
    typeof loc.lat === 'number' &&
    typeof loc.lng === 'number' &&
    !Number.isNaN(loc.lat) &&
    !Number.isNaN(loc.lng)
  );
}

export function LocationSummary({
  location,
  title,
  showBadges = true,
  showId = true,
  showCoords = true,
  dense = false,
  fallbackName = 'Location',
}: Props) {
  const loc = location ?? {};

  const name = safe(loc.name) || fallbackName;
  const address = safe(loc.address);
  const city = safe(loc.city);
  const state = safe(loc.state).toUpperCase();
  const zip = safe(loc.zip);

  const phone = safe(loc.phone);
  const hours = safe(loc.hours);
  const directionsUrl = safe(loc.directionsUrl);
  const id = safe(loc.id);

  const coordsText = formatCoords(
    typeof loc.lat === 'number' ? loc.lat : undefined,
    typeof loc.lng === 'number' ? loc.lng : undefined
  );

  const line2Parts = [city, state, zip].filter(Boolean);
  const line2 = line2Parts.join(line2Parts.length >= 2 ? ', ' : ' ');

  const padY = dense ? 'py-2' : 'py-3';
  const gapY = dense ? 'gap-2' : 'gap-3';
  const textSm = dense ? 'text-xs' : 'text-sm';

  return (
    <div className={`rounded-md border bg-white ${dense ? '' : ''}`}>
      {title ? (
        <div className={`px-4 ${padY}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="mt-1 text-base font-semibold">{name}</div>
            </div>
            {showBadges ? (
              <div className="flex flex-wrap justify-end gap-2">
                {hasCoords(loc) && <Badge variant="secondary">Has coords</Badge>}
                {phone && <Badge variant="secondary">Has phone</Badge>}
                {hours && <Badge variant="secondary">Has hours</Badge>}
                {directionsUrl && (
                  <Badge variant="secondary">Has link</Badge>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={`px-4 ${padY}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="text-base font-semibold">{name}</div>
            {showBadges ? (
              <div className="flex flex-wrap justify-end gap-2">
                {hasCoords(loc) && <Badge variant="secondary">Has coords</Badge>}
                {phone && <Badge variant="secondary">Has phone</Badge>}
                {hours && <Badge variant="secondary">Has hours</Badge>}
                {directionsUrl && <Badge variant="secondary">Has link</Badge>}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <Separator />

      <div className={`px-4 ${padY}`}>
        <div className={`grid ${gapY}`}>
          <div className="flex gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className={textSm}>
              {address ? <div>{address}</div> : null}
              {line2 ? <div className="text-muted-foreground">{line2}</div> : null}
              {!address && !line2 ? (
                <div className="text-muted-foreground">No address provided</div>
              ) : null}
            </div>
          </div>

          {phone ? (
            <div className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className={textSm}>{phone}</div>
            </div>
          ) : null}

          {hours ? (
            <div className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className={`${textSm} whitespace-pre-wrap`}>{hours}</div>
            </div>
          ) : null}

          {directionsUrl ? (
            <div className="flex gap-2">
              <LinkIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className={`${textSm} text-blue-600 hover:underline break-all`}
              >
                {directionsUrl}
              </a>
            </div>
          ) : null}

          {showCoords ? (
            <div className="flex gap-2">
              <div className="mt-0.5 h-4 w-4" /> {/* spacer to align icons */}
              <div className={textSm}>
                <div className="text-muted-foreground">Coordinates</div>
                <div className="font-mono">
                  {coordsText || '—'}
                </div>
              </div>
            </div>
          ) : null}

          {showId ? (
            <div className="flex gap-2">
              <div className="mt-0.5 h-4 w-4" />
              <div className={textSm}>
                <div className="text-muted-foreground">Location ID</div>
                <div className="font-mono break-all">{id || '—'}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
