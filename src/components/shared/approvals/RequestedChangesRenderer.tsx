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
  const practice = React.useMemo(() => {
    if (!practiceId) return null;
    try {
      return getPracticeById(practiceId);
    } catch {
      return null;
    }
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
    return practice.locations.some((loc) => {
      if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
      // Compare with 6 decimal precision
      return (
        Math.abs(loc.lat - location.lat) < 0.000001 &&
        Math.abs(loc.lng - location.lng) < 0.000001
      );
    });
  }, [practice, location]);

  // Check for duplicate address
  const hasDuplicateAddress = React.useMemo(() => {
    if (!practice || !location) return false;
    const newKey = normalizeLocationAddressKey(location);
    return practice.locations.some((loc) => {
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
  const practice = React.useMemo(() => {
    if (!practiceId) return null;
    try {
      return getPracticeById(practiceId);
    } catch {
      return null;
    }
  }, [practiceId]);

  const location = React.useMemo(() => {
    if (!practice) return null;
    return practice.locations.find((l) => l.id === payload.locationId) || null;
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
  const practice = React.useMemo(() => {
    if (!practiceId) return null;
    try {
      return getPracticeById(practiceId);
    } catch {
      return null;
    }
  }, [practiceId]);

  const beforeLocation = React.useMemo(() => {
    if (!practice) return null;
    return practice.locations.find((l) => l.id === payload.locationId) || null;
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
    return practice.locations.some((loc) => {
      if (loc.id === payload.locationId) return false; // Exclude current
      if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
      return (
        Math.abs(loc.lat - afterLocation.lat) < 0.000001 &&
        Math.abs(loc.lng - afterLocation.lng) < 0.000001
      );
    });
  }, [practice, afterLocation, payload.locationId]);

  // Check for duplicate address (excluding current location)
  const hasDuplicateAddress = React.useMemo(() => {
    if (!practice || !afterLocation) return false;
    const newKey = normalizeLocationAddressKey(afterLocation);
    return practice.locations.some((loc) => {
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
 * Practice Edit Diff View - Shows Before/After comparison with changed fields
 */
function PracticeEditDiffView({ request }: { request: ApprovalRequest }) {
  const payload = request.payload as PracticeEditPayload;
  const practiceId = resolvePracticeId(request, payload);
  const practice = React.useMemo(() => {
    if (!practiceId) return null;
    try {
      return getPracticeById(practiceId);
    } catch {
      return null;
    }
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

  // Get changed fields
  const changedFields = React.useMemo(() => {
    return diffPracticeChangedOnly(payload.before, payload.after);
  }, [payload.before, payload.after]);

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
      content = <PracticeEditDiffView request={request} />;
      break;
    case 'doctor_join_practice':
    case 'practice_doctor_add_request':
    case 'practice_doctor_remove_request':
      content = <RosterView request={request} />;
      break;
    case 'new_practice_with_admin_doctor':
      content = <NewPracticeView request={request} />;
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
