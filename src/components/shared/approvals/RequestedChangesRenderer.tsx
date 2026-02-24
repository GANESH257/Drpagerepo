'use client';

import * as React from 'react';
import { ApprovalRequest, PracticeLocationAddPayload, PracticeLocationEditPayload, PracticeLocationRemovePayload, PracticeEditPayload, DoctorJoinPracticePayload, PracticeAddDoctorPayload, PracticeRemoveDoctorPayload } from '@/types/approvals';
import { PracticeLocation } from '@/types/practice';
import { getPracticeById } from '@/lib/services/practiceDirectoryService';
import { LocationSummary } from './LocationSummary';
import { PracticeSummary } from './PracticeSummary';
import { ChangedFieldsList } from './ChangedFieldsList';
import { diffLocationsChangedOnly, normalizeLocationAddressKey } from '@/lib/utils/locationDiff';
import { diffPracticeChangedOnly } from '@/lib/utils/practiceDiff';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getDoctor } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { getUploadFullUrl } from '@/lib/api/upload';
import type { Doctor } from '@/types';

/**
 * Resolve practiceId from multiple possible locations in request/payload
 * Handles legacy requests where practiceId might be in target instead of payload
 */
function resolvePracticeId(request: ApprovalRequest, payload: any): string | null {
  return (
    payload?.practiceId ??
    request?.target?.practiceId ??
    request?.submittedBy?.practiceId ??
    null
  );
}

/**
 * Raw JSON payload display (fallback for non-location requests)
 */
function RawJsonPayload({ payload }: { payload: Record<string, any> }) {
  return (
    <div className="space-y-2">
      <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Location Add View - Shows formatted location information with warnings
 */
function LocationAddView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload as PracticeLocationAddPayload;
  const location = payload.location;
  const practiceId = resolvePracticeId(request, payload);
  const [practice, setPractice] = React.useState<any>(null);
  
  React.useEffect(() => {
    async function loadPractice() {
      if (!practiceId) {
        setPractice(null);
        return;
      }
      try {
        const p = await getPracticeById(practiceId);
        setPractice(p);
      } catch {
        setPractice(null);
      }
    }
    loadPractice();
  }, [practiceId]);

  // Show warning if practiceId is missing
  if (!practiceId) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Practice ID</AlertTitle>
          <AlertDescription>
            Missing practiceId for this request (legacy snapshot). Cannot verify duplicates.
          </AlertDescription>
        </Alert>
        <LocationSummary
          location={location}
          title="Add Location"
          fallbackName="New Location"
          showBadges={true}
          showId={true}
          showCoords={true}
        />
      </div>
    );
  }

  // Show warning if practice not found
  if (!practice) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Practice Not Found</AlertTitle>
          <AlertDescription>
            Practice not found (may have been deleted or not in storage). Cannot verify duplicates.
          </AlertDescription>
        </Alert>
        <LocationSummary
          location={location}
          title="Add Location"
          fallbackName="New Location"
          showBadges={true}
          showId={true}
          showCoords={true}
        />
      </div>
    );
  }

  // Check for duplicate coordinates
  const hasDuplicateCoords = React.useMemo(() => {
    if (!practice || !location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return false;
    }
    const lat = location.lat;
    const lng = location.lng;
    return practice.locations.some((loc: PracticeLocation) => {
      if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
      // Compare with 6 decimal precision
      return (
        Math.abs(loc.lat - lat) < 0.000001 &&
        Math.abs(loc.lng - lng) < 0.000001
      );
    });
  }, [practice, location]);

  // Check for duplicate address
  const hasDuplicateAddress = React.useMemo(() => {
    if (!practice || !location) return false;
    const newKey = normalizeLocationAddressKey(location);
    return practice.locations.some((loc: PracticeLocation) => {
      const existingKey = normalizeLocationAddressKey(loc);
      return existingKey === newKey && existingKey !== '';
    });
  }, [practice, location]);

  const fallbackName = 'New Location';

  return (
    <div className="space-y-4">
      <LocationSummary
        location={location}
        title="Add Location"
        fallbackName={fallbackName}
        showBadges={true}
        showId={true}
        showCoords={true}
      />

      {/* Warnings */}
      {hasDuplicateCoords && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Coordinate Warning</AlertTitle>
          <AlertDescription>
            Coordinates match another location in this practice. Markers may overlap (offset/clustering exists).
          </AlertDescription>
        </Alert>
      )}

      {hasDuplicateAddress && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Address Warning</AlertTitle>
          <AlertDescription>
            Address matches another location in this practice.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Location Remove View - Shows location details with last-location warning
 */
function LocationRemoveView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload as PracticeLocationRemovePayload;
  const practiceId = resolvePracticeId(request, payload);
  const [practice, setPractice] = React.useState<any>(null);
  
  React.useEffect(() => {
    async function loadPractice() {
      if (!practiceId) {
        setPractice(null);
        return;
      }
      try {
        const p = await getPracticeById(practiceId);
        setPractice(p);
      } catch {
        setPractice(null);
      }
    }
    loadPractice();
  }, [practiceId]);

  const location = React.useMemo(() => {
    if (!practice) return null;
    return practice.locations.find((l: PracticeLocation) => l.id === payload.locationId) || null;
  }, [practice, payload.locationId]);

  const isLastLocation = practice ? practice.locations.length <= 1 : false;

  // Show warning if practiceId is missing
  if (!practiceId) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Practice ID</AlertTitle>
          <AlertDescription>
            Missing practiceId for this request (legacy snapshot). Cannot resolve location details.
          </AlertDescription>
        </Alert>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            A practice must retain at least one location.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show warning if practice not found
  if (!practice) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Practice Not Found</AlertTitle>
          <AlertDescription>
            Practice not found (may have been deleted or not in storage). Cannot resolve location details.
          </AlertDescription>
        </Alert>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            A practice must retain at least one location.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {location ? (
        <LocationSummary
          location={location}
          title="Remove Location"
          fallbackName="Location"
          showBadges={true}
          showId={true}
          showCoords={true}
        />
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location Not Found</AlertTitle>
          <AlertDescription>
            Location details not found (may already be removed/changed).
          </AlertDescription>
        </Alert>
      )}

      {/* Hard rule messaging */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          A practice must retain at least one location.
        </AlertDescription>
      </Alert>

      {isLastLocation && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Last Location Warning</AlertTitle>
          <AlertDescription>
            This removal would violate the last-location rule. Approval will fail (guarded).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Location Edit Diff View - Shows Before/After comparison with changed fields
 */
function LocationEditDiffView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload as PracticeLocationEditPayload;
  const practiceId = resolvePracticeId(request, payload);
  const [practice, setPractice] = React.useState<any>(null);
  
  React.useEffect(() => {
    async function loadPractice() {
      if (!practiceId) {
        setPractice(null);
        return;
      }
      try {
        const p = await getPracticeById(practiceId);
        setPractice(p);
      } catch {
        setPractice(null);
      }
    }
    loadPractice();
  }, [practiceId]);

  const beforeLocation = React.useMemo(() => {
    if (!practice) return null;
    return practice.locations.find((l: PracticeLocation) => l.id === payload.locationId) || null;
  }, [practice, payload.locationId]);

  const afterLocation = payload.updatedLocation;

  // Show warning if practiceId is missing
  if (!practiceId) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Practice ID</AlertTitle>
          <AlertDescription>
            Missing practiceId for this request (legacy snapshot). Cannot show before/after comparison.
          </AlertDescription>
        </Alert>
        <LocationSummary
          location={afterLocation}
          title="After"
          fallbackName="Location (After)"
          showBadges={true}
          showId={true}
          showCoords={true}
        />
      </div>
    );
  }

  // Show warning if practice not found
  if (!practice) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Practice Not Found</AlertTitle>
          <AlertDescription>
            Practice not found (may have been deleted or not in storage). Cannot show before/after comparison.
          </AlertDescription>
        </Alert>
        <LocationSummary
          location={afterLocation}
          title="After"
          fallbackName="Location (After)"
          showBadges={true}
          showId={true}
          showCoords={true}
        />
      </div>
    );
  }

  // Validation: ID immutability
  const hasInvalidId = afterLocation.id !== payload.locationId;

  // Check for duplicate coordinates (excluding current location)
  const hasDuplicateCoords = React.useMemo(() => {
    if (!practice || !afterLocation || typeof afterLocation.lat !== 'number' || typeof afterLocation.lng !== 'number') {
      return false;
    }
    const lat = afterLocation.lat;
    const lng = afterLocation.lng;
    return practice.locations.some((loc: PracticeLocation) => {
      if (loc.id === payload.locationId) return false; // Exclude current
      if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
      return (
        Math.abs(loc.lat - lat) < 0.000001 &&
        Math.abs(loc.lng - lng) < 0.000001
      );
    });
  }, [practice, afterLocation, payload.locationId]);

  // Check for duplicate address (excluding current location)
  const hasDuplicateAddress = React.useMemo(() => {
    if (!practice || !afterLocation) return false;
    const newKey = normalizeLocationAddressKey(afterLocation);
    return practice.locations.some((loc: PracticeLocation) => {
      if (loc.id === payload.locationId) return false; // Exclude current
      const existingKey = normalizeLocationAddressKey(loc);
      return existingKey === newKey && existingKey !== '';
    });
  }, [practice, afterLocation, payload.locationId]);

  // Get changed fields
  const changedFields = React.useMemo(() => {
    return diffLocationsChangedOnly(beforeLocation, afterLocation);
  }, [beforeLocation, afterLocation]);

  return (
    <div className="space-y-6">
      {/* Before/After Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        <LocationSummary
          location={beforeLocation}
          title="Before"
          fallbackName={beforeLocation ? 'Location (Before)' : 'Location Not Found'}
          showBadges={true}
          showId={true}
          showCoords={true}
        />
        <LocationSummary
          location={afterLocation}
          title="After"
          fallbackName="Location (After)"
          showBadges={true}
          showId={true}
          showCoords={true}
        />
      </div>

      {/* Changed Fields */}
      <ChangedFieldsList items={changedFields} />

      {/* Validation Warnings */}
      {hasInvalidId && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid Request</AlertTitle>
          <AlertDescription>
            Invalid request: updatedLocation.id must match locationId.
          </AlertDescription>
        </Alert>
      )}

      {hasDuplicateCoords && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Coordinate Warning</AlertTitle>
          <AlertDescription>
            Coordinates match another location in this practice. Markers may overlap (offset/clustering exists).
          </AlertDescription>
        </Alert>
      )}

      {hasDuplicateAddress && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Address Warning</AlertTitle>
          <AlertDescription>
            Address matches another location in this practice.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Practice locations bulk edit view - shows the list of locations that will replace current ones
 */
function LocationsBulkEditView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload as { practiceId?: string; locations?: PracticeLocation[] };
  const locations = payload?.locations ?? [];
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Practice admin submitted an update to practice locations. Approving will replace all current locations with the following ({locations.length} location{locations.length !== 1 ? 's' : ''}).
      </p>
      <div className="space-y-3">
        {locations.map((loc, i) => (
          <Card key={loc.id || i}>
            <CardContent className="pt-4">
              <LocationSummary
                location={loc}
                title={`Location ${i + 1}`}
                fallbackName="Location"
                showBadges={false}
                showId={true}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Practice Edit Diff View - Shows Before/After comparison with changed fields
 */
function PracticeEditDiffView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload as PracticeEditPayload;
  const practiceId = resolvePracticeId(request, payload);
  const [practice, setPractice] = React.useState<any>(null);

  // Must run unconditionally (Rules of Hooks) — before any early returns
  const changedFields = React.useMemo(() => {
    if (!payload?.before || !payload?.after) return [];
    return diffPracticeChangedOnly(payload.before, payload.after);
  }, [payload?.before, payload?.after]);

  React.useEffect(() => {
    async function loadPractice() {
      if (!practiceId) {
        setPractice(null);
        return;
      }
      try {
        const p = await getPracticeById(practiceId);
        setPractice(p);
      } catch {
        setPractice(null);
      }
    }
    loadPractice();
  }, [practiceId]);

  // Show warning if practiceId is missing
  if (!practiceId) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Practice ID</AlertTitle>
          <AlertDescription>
            Missing practiceId for this request (legacy snapshot). Cannot show before/after comparison.
          </AlertDescription>
        </Alert>
        {payload.after && (
          <PracticeSummary
            practice={payload.after}
            title="After"
          />
        )}
      </div>
    );
  }

  // Show warning if practice not found
  if (!practice) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Practice Not Found</AlertTitle>
          <AlertDescription>
            Practice not found (may have been deleted or not in storage). Cannot show before/after comparison.
          </AlertDescription>
        </Alert>
        {payload.after && (
          <PracticeSummary
            practice={payload.after}
            title="After"
          />
        )}
      </div>
    );
  }

  // Show warning if before is missing
  if (!payload.before) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Before Snapshot</AlertTitle>
          <AlertDescription>
            Missing before snapshot for this request (legacy data). Showing after snapshot only.
          </AlertDescription>
        </Alert>
        {payload.after && (
          <PracticeSummary
            practice={payload.after}
            title="After"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Before/After Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        <PracticeSummary
          practice={payload.before}
          title="Before"
        />
        <PracticeSummary
          practice={payload.after}
          title="After"
        />
      </div>

      {/* Changed Fields */}
      {changedFields.length > 0 ? (
        <ChangedFieldsList items={changedFields} />
      ) : (
        <div className="rounded-md border bg-white p-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              No field changes detected.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Roster Change View - Shows practice/doctor associations
 */
function RosterView({ request }: { request: ApprovalRequest }) {
  const practiceId = request.target?.practiceId;
  const doctorId = request.target?.doctorId;
  const invitedEmail = request.target?.invitedDoctorEmail;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Request Type</Label>
              <div className="mt-1 font-medium capitalize">
                {request.type.replace(/_/g, ' ')}
              </div>
            </div>
            {practiceId && (
              <div>
                <Label className="text-muted-foreground">Practice ID</Label>
                <div className="mt-1 font-mono text-sm">{practiceId}</div>
              </div>
            )}
            {doctorId && (
              <div>
                <Label className="text-muted-foreground">Doctor ID</Label>
                <div className="mt-1 font-mono text-sm">{doctorId}</div>
              </div>
            )}
            {invitedEmail && (
              <div>
                <Label className="text-muted-foreground">Invited Email</Label>
                <div className="mt-1">{invitedEmail}</div>
              </div>
            )}
          </div>

          {request.type === 'doctor_join_practice' && request.payload?.doctor && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <h4 className="font-bold text-brand-dark-blue">Applicant (verify identity)</h4>
              <div className="grid gap-2 text-sm">
                <div><Label className="text-muted-foreground">Name</Label><div className="mt-0.5 font-medium">{request.payload.doctor.fullName} {request.payload.doctor.credentials}</div></div>
                <div><Label className="text-muted-foreground">Email</Label><div className="mt-0.5">{request.payload.doctor.email}</div></div>
                <div><Label className="text-muted-foreground">Specialty</Label><div className="mt-0.5">{request.payload.doctor.specialty}</div></div>
                {request.payload.doctor.npi && <div><Label className="text-muted-foreground">NPI</Label><div className="mt-0.5 font-medium">{request.payload.doctor.npi}</div></div>}
              </div>
            </div>
          )}

          {request.payload?.message && (
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <Label className="text-muted-foreground block mb-1">Message from Practice</Label>
              {request.payload.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * New Practice View - Shows signup application details
 */
function NewPracticeView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload;
  const practice = payload.practice;
  const doctor = payload.doctor;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-bold text-brand-dark-blue">Practice Details</h4>
            <div>
              <Label className="text-muted-foreground">Practice Name</Label>
              <div className="mt-1 font-medium">{practice?.name}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Location</Label>
              <div className="mt-1">
                {practice?.address?.city}, {practice?.address?.state}
              </div>
            </div>
            {practice?.website && (
              <div>
                <Label className="text-muted-foreground">Website</Label>
                <div className="mt-1 text-brand-teal underline">{practice.website}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-bold text-brand-dark-blue">Admin Doctor</h4>
            <div>
              <Label className="text-muted-foreground">Full Name</Label>
              <div className="mt-1 font-medium">{doctor?.fullName} {doctor?.credentials}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Specialty</Label>
              <div className="mt-1">{doctor?.specialty}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <div className="mt-1">{doctor?.email}</div>
            </div>
            {doctor?.npi && (
              <div>
                <Label className="text-muted-foreground">NPI (verify identity)</Label>
                <div className="mt-1 font-medium">{doctor.npi}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h4 className="font-bold text-brand-dark-blue mb-4">Membership Selection</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Plan ID:</span>
              <span className="ml-2 font-medium capitalize">{payload.plan?.planId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Billing:</span>
              <span className="ml-2 font-medium capitalize">{payload.plan?.billingCycle}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="ml-2 font-medium capitalize">{payload.paymentMethod}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * PA Profile & Practice Completion View - Profile + practice details submitted after first approval
 */
function PAProfilePracticeCompletionView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload || {};
  const doc = payload.doctor || {};
  const prac = payload.practice || {};
  const locs = Array.isArray(payload.locations) ? payload.locations : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-bold text-brand-dark-blue">Profile details</h4>
          <div className="grid gap-2 text-sm">
            <div><Label className="text-muted-foreground">Full name</Label><div className="mt-0.5 font-medium">{doc.fullName}</div></div>
            {doc.npi && <div><Label className="text-muted-foreground">NPI</Label><div className="mt-0.5 font-medium">{doc.npi}</div></div>}
            {doc.bio && <div><Label className="text-muted-foreground">Bio</Label><div className="mt-0.5">{doc.bio}</div></div>}
            {doc.phone && <div><Label className="text-muted-foreground">Phone</Label><div className="mt-0.5">{doc.phone}</div></div>}
            {doc.website && <div><Label className="text-muted-foreground">Website</Label><div className="mt-0.5">{doc.website}</div></div>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-bold text-brand-dark-blue">Practice details</h4>
          <div className="grid gap-2 text-sm">
            <div><Label className="text-muted-foreground">Name</Label><div className="mt-0.5 font-medium">{prac.name}</div></div>
            {prac.description && <div><Label className="text-muted-foreground">Description</Label><div className="mt-0.5">{prac.description}</div></div>}
            {prac.phone && <div><Label className="text-muted-foreground">Phone</Label><div className="mt-0.5">{prac.phone}</div></div>}
            {(prac.address_line1 || prac.address?.line1) && <div><Label className="text-muted-foreground">Address</Label><div className="mt-0.5">{prac.address_line1 || prac.address?.line1} {prac.city} {prac.state} {prac.zip}</div></div>}
          </div>
          {locs.length > 0 && (
            <div className="mt-4">
              <Label className="text-muted-foreground">Locations</Label>
              <ul className="mt-1 list-disc pl-4 space-y-1">
                {locs.map((loc: any, idx: number) => {
                  const parts = [loc.name];
                  const street = (loc.address_line1 || (loc as any).address) && (loc.address_line1 || (loc as any).address) !== 'N/A'
                    ? (loc.address_line1 || (loc as any).address)
                    : (idx === 0 ? (prac.address_line1 || (prac as any).address?.line1) : null);
                  if (street) parts.push(street);
                  const zip = (loc.zip && loc.zip !== '00000') ? loc.zip : (prac.zip || (prac as any).address?.zip || '');
                  const city = loc.city || (idx === 0 ? prac.city || (prac as any).address?.city : null);
                  const state = loc.state || (idx === 0 ? prac.state || (prac as any).address?.state : null);
                  if (city || state || zip) parts.push([city, state, zip].filter(Boolean).join(', '));
                  return <li key={loc.id || loc.name}>{parts.filter(Boolean).join(' — ')}</li>;
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Keys used to detect scalar profile changes */
const PROFILE_SCALAR_KEYS = ['fullName', 'npi', 'bio', 'about', 'phone', 'website', 'credentials', 'specialty', 'medicalSchool', 'residency', 'internship'] as const;

/** Resolve image URL for approval view (path or full URL) */
function approvalImageUrl(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return '';
  return getUploadFullUrl(pathOrUrl);
}

/**
 * Doctor Profile Completion View - Profile details submitted by doctor joining a practice
 */
function DoctorProfileCompletionView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload || {};
  const doc = payload.doctor || {};
  const requested = doc as Record<string, unknown>;
  const doctorId = payload.doctorId ?? (request.target as { doctorId?: string })?.doctorId ?? (request as unknown as { target_doctor_id?: string }).target_doctor_id ?? '';
  const [currentDoctor, setCurrentDoctor] = React.useState<Doctor | null>(null);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const profileImageUrl = (requested.profileImageUrl ?? requested.profile_image_url) as string | undefined;

  React.useEffect(() => {
    if (!doctorId) {
      setCurrentDoctor(null);
      setLoadFailed(false);
      return;
    }
    const token = getToken();
    getDoctor(doctorId, token ?? undefined)
      .then((d) => {
        setCurrentDoctor(d);
        setLoadFailed(false);
      })
      .catch(() => {
        setCurrentDoctor(null);
        setLoadFailed(true);
      });
  }, [doctorId]);

  const currentImage = currentDoctor?.image ?? (currentDoctor as unknown as Record<string, unknown>)?.profileImageUrl ?? (currentDoctor as unknown as Record<string, unknown>)?.profile_image_url ?? '';
  const requestedImage = requested.profileImageUrl ?? requested.profile_image_url ?? '';
  const imageChanged = requestedImage && (currentImage !== requestedImage || !currentImage);
  const currentCertsJson = JSON.stringify(currentDoctor?.boardCertifications ?? []);
  const requestedCertsJson = JSON.stringify(requested.boardCertifications ?? []);
  const certsChanged = requestedCertsJson !== currentCertsJson;
  const currentBadgesJson = JSON.stringify(currentDoctor?.badgesAwards ?? []);
  const requestedBadgesJson = JSON.stringify(requested.badgesAwards ?? []);
  const badgesChanged = requestedBadgesJson !== currentBadgesJson;

  const changedScalars = PROFILE_SCALAR_KEYS.filter((key) => {
    const reqVal = requested[key];
    const curVal = currentDoctor?.[key] ?? currentDoctor?.[key === 'fullName' ? 'fullName' : key];
    const r = reqVal === undefined || reqVal === null ? '' : String(reqVal).trim();
    const c = curVal === undefined || curVal === null ? '' : String(curVal).trim();
    return r !== c;
  });

  const boardCerts = Array.isArray(requested.boardCertifications) ? requested.boardCertifications : [];
  const badgesAwards = Array.isArray(requested.badgesAwards) ? requested.badgesAwards : [];
  const hasAnyChanges = changedScalars.length > 0 || imageChanged || (certsChanged && boardCerts.length > 0) || (badgesChanged && badgesAwards.length > 0);

  if (doctorId && currentDoctor === null && !loadFailed) {
    return <p className="text-sm text-muted-foreground">Loading current profile to show changes…</p>;
  }

  if (loadFailed || (!hasAnyChanges && !currentDoctor)) {
    const fallbackCerts = Array.isArray(requested.boardCertifications) ? requested.boardCertifications : [];
    const fallbackBadges = Array.isArray(requested.badgesAwards) ? requested.badgesAwards : [];
    const fallbackProfileImg = (requested.profileImageUrl ?? requested.profile_image_url) as string | undefined;
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-bold text-brand-dark-blue">Profile details (requested)</h4>
            {fallbackProfileImg && (
              <div>
                <Label className="text-muted-foreground">Profile image</Label>
                <div className="mt-1.5">
                  <img
                    src={approvalImageUrl(fallbackProfileImg)}
                    alt="Profile"
                    className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              </div>
            )}
            <div className="grid gap-2 text-sm">
              {requested.fullName != null && String(requested.fullName) && <div><Label className="text-muted-foreground">Full name</Label><div className="mt-0.5 font-medium">{String(requested.fullName)}</div></div>}
              {requested.npi != null && String(requested.npi) && <div><Label className="text-muted-foreground">NPI</Label><div className="mt-0.5 font-medium">{String(requested.npi)}</div></div>}
              {requested.bio != null && String(requested.bio) && <div><Label className="text-muted-foreground">Bio</Label><div className="mt-0.5">{String(requested.bio)}</div></div>}
              {requested.about != null && String(requested.about) && <div><Label className="text-muted-foreground">About</Label><div className="mt-0.5">{String(requested.about)}</div></div>}
              {requested.phone != null && String(requested.phone) && <div><Label className="text-muted-foreground">Phone</Label><div className="mt-0.5">{String(requested.phone)}</div></div>}
              {requested.website != null && String(requested.website) && <div><Label className="text-muted-foreground">Website</Label><div className="mt-0.5">{String(requested.website)}</div></div>}
            </div>
            {fallbackCerts.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Board certifications</Label>
                <div className="mt-1.5 flex flex-wrap gap-3">
                  {fallbackCerts.map((c: { name?: string; year?: string; imageUrl?: string }, i: number) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {c.imageUrl && (
                        <img
                          src={approvalImageUrl(c.imageUrl)}
                          alt={c.name || 'Certification'}
                          className="h-16 w-16 rounded object-cover border border-gray-200"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <span className="text-xs text-muted-foreground">{c.name}{c.year ? ` (${c.year})` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {fallbackBadges.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Badges & awards</Label>
                <div className="mt-1.5 flex flex-wrap gap-3">
                  {fallbackBadges.map((b: { name?: string; year?: string; imageUrl?: string }, i: number) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {b.imageUrl && (
                        <img
                          src={approvalImageUrl(b.imageUrl)}
                          alt={b.name || 'Award'}
                          className="h-16 w-16 rounded object-cover border border-gray-200"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <span className="text-xs text-muted-foreground">{b.name}{b.year ? ` (${b.year})` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-bold text-brand-dark-blue">Profile details</h4>
          {profileImageUrl && (
            <div>
              <Label className="text-muted-foreground">Profile image</Label>
              <div className="mt-1.5">
                <img
                  src={approvalImageUrl(profileImageUrl)}
                  alt="Profile"
                  className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {boardCerts.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-bold text-brand-dark-blue">Board certifications</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {boardCerts.map((item: { name?: string; year?: string; imageUrl?: string } | string, idx: number) => {
                const name = typeof item === 'string' ? item : item?.name;
                const year = typeof item === 'object' && item && 'year' in item ? item.year : undefined;
                const imageUrl = typeof item === 'object' && item && 'imageUrl' in item ? item.imageUrl : undefined;
                if (!name) return null;
                return (
                  <div key={idx} className="flex items-start gap-3 rounded-md border p-3">
                    {imageUrl && (
                      <img
                        src={approvalImageUrl(imageUrl)}
                        alt={name}
                        className="h-12 w-12 flex-shrink-0 rounded object-cover border"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{name}</div>
                      {year && <div className="text-xs text-muted-foreground">{year}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
      </Card>
      )}

      {badgesAwards.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-bold text-brand-dark-blue">Badges & awards</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {badgesAwards.map((item: { name?: string; year?: string; imageUrl?: string }, idx: number) => {
                const name = item?.name;
                const year = item?.year;
                const imageUrl = item?.imageUrl;
                if (!name) return null;
                return (
                  <div key={idx} className="flex items-start gap-3 rounded-md border p-3">
                    {imageUrl && (
                      <img
                        src={approvalImageUrl(imageUrl)}
                        alt={name}
                        className="h-12 w-12 flex-shrink-0 rounded object-cover border"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{name}</div>
                      {year && <div className="text-xs text-muted-foreground">{year}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Insurance & Services edit view - payload.insurance and payload.conditionServices (or legacy conditionsAndServices)
 */
function InsuranceEditView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload || {};
  const insurance = Array.isArray(payload.insurance) ? payload.insurance : [];
  const conditionServices = Array.isArray(payload.conditionServices) ? payload.conditionServices : [];
  const conditionsAndServices = Array.isArray(payload.conditionsAndServices) ? payload.conditionsAndServices : [];

  const hasConditionServices = conditionServices.length > 0 && conditionServices.some((r: any) => r.condition || (r.services && r.services.length > 0));
  const hasLegacyList = !hasConditionServices && conditionsAndServices.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-bold text-brand-dark-blue">Accepted insurance</h4>
          {insurance.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {insurance.map((ins: { name?: string; slug?: string }) => (
                <span key={ins.slug || ins.name} className="rounded-md bg-muted px-2 py-1 text-sm">
                  {ins.name || ins.slug || '—'}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No insurance plans in this request.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-bold text-brand-dark-blue">Conditions & services</h4>
          {hasConditionServices ? (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left font-medium p-2 w-[40%]">Condition</th>
                    <th className="text-left font-medium p-2">Treatments / Services</th>
                  </tr>
                </thead>
                <tbody>
                  {conditionServices.map((row: { condition?: string; services?: string[] }, i: number) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="p-2">{row.condition || '—'}</td>
                      <td className="p-2">
                        {Array.isArray(row.services) && row.services.length > 0 ? (
                          <span className="text-muted-foreground">{row.services.filter(Boolean).join(', ')}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : hasLegacyList ? (
            <ul className="list-disc list-inside text-sm space-y-1">
              {conditionsAndServices.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No conditions/services in this request.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main renderer component - Routes to appropriate view based on request type
 */
export function RequestedChangesRenderer({ request }: { request: ApprovalRequest }) {
  const [showRawJson, setShowRawJson] = React.useState(false);

  let content: React.ReactNode;

  switch (request.type) {
    case 'practice_location_add_request':
      content = <LocationAddView request={request} />;
      break;
    case 'practice_location_edit_request':
      content = <LocationEditDiffView request={request} />;
      break;
    case 'practice_location_remove_request':
      content = <LocationRemoveView request={request} />;
      break;
    case 'practice_edit_request':
    case 'practice_admin_practice_profile_edit':
      content = <PracticeEditDiffView request={request} />;
      break;
    case 'practice_admin_practice_locations_edit':
      content = <LocationsBulkEditView request={request} />;
      break;
    case 'doctor_join_practice':
    case 'practice_doctor_add_request':
    case 'practice_doctor_remove_request':
      content = <RosterView request={request} />;
      break;
    case 'new_practice_with_admin_doctor':
      content = <NewPracticeView request={request} />;
      break;
    case 'practice_admin_profile_practice_completion':
      content = <PAProfilePracticeCompletionView request={request} />;
      break;
    case 'doctor_profile_completion':
    case 'doctor_profile_edit':
    case 'practice_admin_profile_edit':
      content = <DoctorProfileCompletionView request={request} />;
      break;
    case 'doctor_insurance_edit':
    case 'practice_admin_insurance_edit':
      content = <InsuranceEditView request={request} />;
      break;
    default:
      content = <RawJsonPayload payload={request.payload} />;
  }

  return (
    <div className="space-y-4">
      {content}

      {/* Collapsible Raw JSON */}
      <Accordion type="single" collapsible>
        <AccordionItem value="raw-json">
          <AccordionTrigger>View Raw Payload (JSON)</AccordionTrigger>
          <AccordionContent>
            <RawJsonPayload payload={request.payload} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
