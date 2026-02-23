'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AppointmentRequest } from '@/types';
import { loadAppointmentRequests, saveAppointmentRequests } from '@/lib/doctorStorage';

interface AppointmentsSectionProps {
  doctorId: string;
}

const SAMPLE_PATIENT_NAMES = [
  'John Smith',
  'Sarah Johnson',
  'Michael Chen',
  'Emily Davis',
  'Robert Martinez',
  'Jennifer Wilson',
  'David Brown',
  'Lisa Anderson',
];

const SAMPLE_REASONS = [
  'Annual checkup',
  'Follow-up appointment',
  'New patient consultation',
  'Pain management',
  'Medication review',
  'Lab results discussion',
];

const SAMPLE_INSURANCE = ['Aetna', 'Blue Cross Blue Shield', 'Cigna', 'UnitedHealthcare', 'Medicare'];

function generateSampleRequests(): AppointmentRequest[] {
  const requests: AppointmentRequest[] = [];
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + Math.floor(Math.random() * 14) + 1);
    const hours = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    const statuses: AppointmentRequest['status'][] = ['New', 'Confirmed', 'Completed', 'Declined'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    requests.push({
      id: `req-${i + 1}`,
      patientName: SAMPLE_PATIENT_NAMES[i % SAMPLE_PATIENT_NAMES.length],
      requestedDate: date.toISOString().split('T')[0],
      requestedTime: hours[Math.floor(Math.random() * hours.length)],
      reason: SAMPLE_REASONS[Math.floor(Math.random() * SAMPLE_REASONS.length)],
      insurance: SAMPLE_INSURANCE[Math.floor(Math.random() * SAMPLE_INSURANCE.length)],
      status,
      createdAt: new Date(now.getTime() - i * 86400000).toISOString(),
    });
  }

  return requests;
}

export function AppointmentsSection({ doctorId }: AppointmentsSectionProps) {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AppointmentRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<AppointmentRequest['status'] | 'All'>('All');
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [declineNote, setDeclineNote] = useState('');
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const loaded = await loadAppointmentRequests(doctorId);
      setRequests(loaded);
    }
    load();
  }, [doctorId]);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.status === statusFilter));
    }
  }, [requests, statusFilter]);

  const handleStatusChange = (requestId: string, newStatus: AppointmentRequest['status'], note?: string) => {
    const updated = requests.map((req) =>
      req.id === requestId
        ? { ...req, status: newStatus, declinedNote: note }
        : req
    );
    setRequests(updated);
    saveAppointmentRequests(doctorId, updated);
  };

  const handleApprove = (request: AppointmentRequest) => {
    handleStatusChange(request.id, 'Confirmed');
  };

  const handleDeclineClick = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setDeclineNote('');
    setIsDeclineDialogOpen(true);
  };

  const handleDeclineConfirm = () => {
    if (!selectedRequest) return;
    handleStatusChange(selectedRequest.id, 'Declined', declineNote);
    setIsDeclineDialogOpen(false);
    setSelectedRequest(null);
    setDeclineNote('');
  };

  const handleGenerateSample = () => {
    const samples = generateSampleRequests();
    setRequests(samples);
    saveAppointmentRequests(doctorId, samples);
  };

  const getStatusBadge = (status: AppointmentRequest['status']) => {
    const variants: Record<AppointmentRequest['status'], { variant: 'vibrant' | 'gradient' | 'colorful' | 'destructive' }> = {
      New: { variant: 'vibrant' },
      Confirmed: { variant: 'gradient' },
      Completed: { variant: 'colorful' },
      Declined: { variant: 'destructive' },
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark-blue">Care Requests</h2>
          <p className="text-gray-500 mt-2 font-medium">
            Review and schedule upcoming patient consultations
          </p>
        </div>
        {requests.length === 0 && (
          <Button onClick={handleGenerateSample} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Generate Sample Requests
          </Button>
        )}
      </div>

      {/* Filters */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
        <TabsList>
          <TabsTrigger value="All">All ({requests.length})</TabsTrigger>
          <TabsTrigger value="New">
            New ({requests.filter((r) => r.status === 'New').length})
          </TabsTrigger>
          <TabsTrigger value="Confirmed">
            Confirmed ({requests.filter((r) => r.status === 'Confirmed').length})
          </TabsTrigger>
          <TabsTrigger value="Completed">
            Completed ({requests.filter((r) => r.status === 'Completed').length})
          </TabsTrigger>
          <TabsTrigger value="Declined">
            Declined ({requests.filter((r) => r.status === 'Declined').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      {filteredRequests.length === 0 ? (
        <Card className="card-vibrant">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {requests.length === 0
                ? 'No appointment requests yet.'
                : `No ${statusFilter === 'All' ? '' : statusFilter.toLowerCase()} requests.`}
            </p>
            {requests.length === 0 && (
              <Button onClick={handleGenerateSample} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Generate Sample Requests
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="card-vibrant">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Requested Date/Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.patientName}</TableCell>
                    <TableCell>
                      <div>{new Date(request.requestedDate).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">{request.requestedTime}</div>
                    </TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>{request.insurance}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {request.status === 'New' && (
                          <>
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={() => handleApprove(request)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineClick(request)}
                              className="text-destructive hover:text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                        {request.status === 'Confirmed' && (
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => handleStatusChange(request.id, 'Completed')}
                          >
                            Mark Completed
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" title="Message patient (placeholder)">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Decline Dialog */}
      <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Appointment Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this appointment request (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4" data-scroll-exclude>
            <div className="space-y-2" data-scroll-exclude>
              <Label htmlFor="declineNote">Decline Note (Optional)</Label>
              <Textarea
                id="declineNote"
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="e.g., Not accepting new patients at this time..."
                rows={4}
                data-scroll-speed="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeclineDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeclineConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}