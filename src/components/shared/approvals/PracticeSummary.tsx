import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Phone, Link as LinkIcon, Building2 } from 'lucide-react';

type PracticeData = {
  name: string;
  description?: string;
  phone?: string;
  website?: string;
  insurances?: string[];
  services?: string[];
};

type Props = {
  practice?: PracticeData | null;
  title?: string; // optional heading e.g. "Practice (Before)"
  dense?: boolean; // tighter spacing for tables/drawers
};

function safe(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  return String(v);
}

export function PracticeSummary({
  practice,
  title,
  dense = false,
}: Props) {
  const p = practice ?? { name: 'Practice' };

  const name = safe(p.name) || 'Practice';
  const description = safe(p.description);
  const phone = safe(p.phone);
  const website = safe(p.website);
  const insurances = p.insurances || [];
  const services = p.services || [];

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
            <div className="flex flex-wrap justify-end gap-2">
              {insurances.length > 0 && (
                <Badge variant="secondary">
                  {insurances.length} insurance{insurances.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {services.length > 0 && (
                <Badge variant="secondary">
                  {services.length} service{services.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={`px-4 ${padY}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="text-base font-semibold">{name}</div>
            <div className="flex flex-wrap justify-end gap-2">
              {insurances.length > 0 && (
                <Badge variant="secondary">
                  {insurances.length} insurance{insurances.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {services.length > 0 && (
                <Badge variant="secondary">
                  {services.length} service{services.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      <Separator />

      <div className={`px-4 ${padY}`}>
        <div className={`grid ${gapY}`}>
          {description ? (
            <div className="flex gap-2">
              <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className={`${textSm} text-muted-foreground whitespace-pre-wrap`}>
                {description}
              </div>
            </div>
          ) : null}

          {phone ? (
            <div className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className={textSm}>{phone}</div>
            </div>
          ) : null}

          {website ? (
            <div className="flex gap-2">
              <LinkIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className={`${textSm} text-blue-600 hover:underline break-all`}
              >
                {website}
              </a>
            </div>
          ) : null}

          {insurances.length > 0 ? (
            <div className="flex gap-2">
              <div className="mt-0.5 h-4 w-4" /> {/* spacer to align icons */}
              <div className={textSm}>
                <div className="text-muted-foreground">Insurances</div>
                <div>{insurances.join(', ')}</div>
              </div>
            </div>
          ) : null}

          {services.length > 0 ? (
            <div className="flex gap-2">
              <div className="mt-0.5 h-4 w-4" /> {/* spacer to align icons */}
              <div className={textSm}>
                <div className="text-muted-foreground">Services</div>
                <div>{services.join(', ')}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
