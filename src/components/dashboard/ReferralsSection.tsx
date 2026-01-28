'use client';

import { useState, useEffect } from 'react';
import { PlayCircle, CheckCircle2, Plus, TrendingUp } from 'lucide-react';
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
import { Referral } from '@/types';
import { loadReferrals, saveReferrals } from '@/lib/doctorStorage';

interface ReferralsSectionProps {
  doctorId: string;
}

const SAMPLE_REFERRING_PHYSICIANS = [
  { name: 'Dr. Sarah Johnson', specialty: 'Internal Medicine' },
  { name: 'Dr. Michael Chen', specialty: 'Cardiology' },
  { name: 'Dr. Emily Davis', specialty: 'Family Practice' },
  { name: 'Dr. Robert Martinez', specialty: 'Orthopedics' },
  { name: 'Dr. Jennifer Wilson', specialty: 'Pediatrics' },
];

const SAMPLE_REASONS = [
  'Specialty consultation needed',
  'Second opinion requested',
  'Complex case management',
  'Surgical evaluation',
  'Follow-up care',
];

function generateSampleReferrals(): Referral[] {
  const referrals: Referral[] = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const physician = SAMPLE_REFERRING_PHYSICIANS[i % SAMPLE_REFERRING_PHYSICIANS.length];
    const statuses: Referral['status'][] = ['New', 'In Progress', 'Closed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    referrals.push({
      id: `ref-${i + 1}`,
      referringPhysicianName: physician.name,
      referringPhysicianSpecialty: physician.specialty,
      date: date.toISOString().split('T')[0],
      patientInitials: `P${i + 1}`,
      referralReason: SAMPLE_REASONS[Math.floor(Math.random() * SAMPLE_REASONS.length)],
      status,
      createdAt: date.toISOString(),
    });
  }

  return referrals;
}

export function ReferralsSection({ doctorId }: ReferralsSectionProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [statusFilter, setStatusFilter] = useState<Referral['status'] | 'All'>('All');

  useEffect(() => {
    const loaded = loadReferrals(doctorId);
    setReferrals(loaded);
  }, [doctorId]);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredReferrals(referrals);
    } else {
      setFilteredReferrals(referrals.filter((r) => r.status === statusFilter));
    }
  }, [referrals, statusFilter]);

  const handleStatusChange = (referralId: string, newStatus: Referral['status']) => {
    const updated = referrals.map((ref) =>
      ref.id === referralId ? { ...ref, status: newStatus } : ref
    );
    setReferrals(updated);
    saveReferrals(doctorId, updated);
  };

  const handleGenerateSample = () => {
    const samples = generateSampleReferrals();
    setReferrals(samples);
    saveReferrals(doctorId, samples);
  };

  const getStatusBadge = (status: Referral['status']) => {
    const variants: Record<
      Referral['status'],
      { variant: 'vibrant' | 'gradient' | 'colorful' }
    > = {
      New: { variant: 'vibrant' },
      'In Progress': { variant: 'gradient' },
      Closed: { variant: 'colorful' },
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant}>
        {status}
      </Badge>
    );
  };

  // Calculate metrics
  const newReferrals = referrals.filter((r) => r.status === 'New').length;
  const inProgressReferrals = referrals.filter((r) => r.status === 'In Progress').length;
  const closedThisMonth = referrals.filter((r) => {
    if (r.status !== 'Closed') return false;
    const refDate = new Date(r.date);
    const now = new Date();
    return refDate.getMonth() === now.getMonth() && refDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark-blue">Referrals</h2>
          <p className="text-muted-foreground mt-2">
            Track referrals from other physicians in the network
          </p>
        </div>
        {referrals.length === 0 && (
          <Button onClick={handleGenerateSample} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Generate Sample Referrals
          </Button>
        )}
      </div>

      {/* Network Insights */}
      {referrals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-vibrant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Referrals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newReferrals}</div>
              <p className="text-xs text-muted-foreground mt-1">Requiring attention</p>
            </CardContent>
          </Card>
          <Card className="card-vibrant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressReferrals}</div>
              <p className="text-xs text-muted-foreground mt-1">Active referrals</p>
            </CardContent>
          </Card>
          <Card className="card-vibrant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed This Month</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closedThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed referrals</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
        <TabsList>
          <TabsTrigger value="All">All ({referrals.length})</TabsTrigger>
          <TabsTrigger value="New">
            New ({referrals.filter((r) => r.status === 'New').length})
          </TabsTrigger>
          <TabsTrigger value="In Progress">
            In Progress ({referrals.filter((r) => r.status === 'In Progress').length})
          </TabsTrigger>
          <TabsTrigger value="Closed">
            Closed ({referrals.filter((r) => r.status === 'Closed').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      {filteredReferrals.length === 0 ? (
        <Card className="card-vibrant">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {referrals.length === 0
                ? 'No referrals yet.'
                : `No ${statusFilter === 'All' ? '' : statusFilter.toLowerCase()} referrals.`}
            </p>
            {referrals.length === 0 && (
              <Button onClick={handleGenerateSample} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Generate Sample Referrals
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
                  <TableHead>Referring Physician</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">
                      {referral.referringPhysicianName}
                    </TableCell>
                    <TableCell>{referral.referringPhysicianSpecialty}</TableCell>
                    <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
                    <TableCell>{referral.patientInitials}</TableCell>
                    <TableCell>{referral.referralReason}</TableCell>
                    <TableCell>{getStatusBadge(referral.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {referral.status === 'New' && (
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => handleStatusChange(referral.id, 'In Progress')}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Mark In Progress
                          </Button>
                        )}
                        {referral.status === 'In Progress' && (
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => handleStatusChange(referral.id, 'Closed')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Close Referral
                          </Button>
                        )}
                        {referral.status === 'New' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(referral.id, 'Closed')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Close
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
