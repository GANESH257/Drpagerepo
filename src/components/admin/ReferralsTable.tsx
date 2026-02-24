'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Send, User, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Referral } from '@/types/referrals';
import { getAllReferrals as getAllReferralsAPI, Referral as ApiReferral } from '@/lib/api/referrals';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { getAllPracticesForAdmin } from '@/lib/adminHelpers';
import { Doctor } from '@/types';
import { Practice } from '@/types/practice';
import { formatDateTime } from '@/lib/dateUtils';
import { normalizeReferralStatus, getReferralStatusLabel } from '@/lib/utils/referralStatusLabels';

export function ReferralsTable() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Referral['status']>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [practiceFilter, setPracticeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const [apiReferrals, allDoctorsRaw, allPractices] = await Promise.all([
        getAllReferralsAPI(),
        token ? getAllDoctorsArray(token) : Promise.resolve([]),
        getAllPracticesForAdmin()
      ]);
      const allDoctors = Array.isArray(allDoctorsRaw) ? allDoctorsRaw : [];

      // Transform API format to frontend format
      const transformedReferrals: Referral[] = apiReferrals.map((r: ApiReferral) => ({
        id: r.id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        fromDoctorId: r.from_doctor_id,
        toDoctorId: r.to_doctor_id,
        fromPracticeId: r.from_practice_id,
        toPracticeId: r.to_practice_id,
        patient: {
          name: r.patient_name_or_initials,
          sex: r.patient_sex as 'male' | 'female' | 'other' | undefined,
        },
        condition: r.condition_summary,
        notes: r.notes,
        status: normalizeReferralStatus(r.status),
      }));

      setReferrals(transformedReferrals);
      setDoctors(allDoctors);
      setPractices(allPractices);
    } catch (err) {
      console.error('Error loading referrals data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load referrals';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = useMemo(() => {
    let filtered = [...referrals];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Doctor filter
    if (doctorFilter !== 'all') {
      filtered = filtered.filter(r =>
        r.fromDoctorId === doctorFilter || r.toDoctorId === doctorFilter
      );
    }

    // Practice filter
    if (practiceFilter !== 'all') {
      filtered = filtered.filter(r =>
        r.fromPracticeId === practiceFilter || r.toPracticeId === practiceFilter
      );
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        const fromDoctor = doctors.find(d => d.id === r.fromDoctorId);
        const toDoctor = doctors.find(d => d.id === r.toDoctorId);
        const condition = r.condition.toLowerCase();
        const notes = r.notes?.toLowerCase() || '';

        return (
          fromDoctor?.fullName.toLowerCase().includes(query) ||
          toDoctor?.fullName.toLowerCase().includes(query) ||
          condition.includes(query) ||
          notes.includes(query) ||
          r.patient.name?.toLowerCase().includes(query)
        );
      });
    }

    // Sort by createdAt desc (newest first)
    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [referrals, statusFilter, doctorFilter, practiceFilter, searchQuery, doctors]);

  const getStatusBadge = (status: Referral['status']) => {
    switch (status) {
      case 'considering':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">{getReferralStatusLabel(status)}</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700 border-green-300">{getReferralStatusLabel(status)}</Badge>;
      case 'no_show':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-300">{getReferralStatusLabel(status)}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{getReferralStatusLabel(status)}</Badge>;
      default:
        return <Badge variant="outline">{status ? getReferralStatusLabel(status as Referral['status']) : status}</Badge>;
    }
  };

  const getDoctorName = (doctorId: string): string => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.fullName || doctorId;
  };

  const getPracticeName = (practiceId?: string): string => {
    if (!practiceId) return 'N/A';
    const practice = practices.find(p => p.id === practiceId);
    return practice?.name || practiceId;
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card className="bg-white border border-red-200 rounded-xl shadow-sm">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by doctor name, condition, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Status</Label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="considering">Considering</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Doctor</Label>
                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by doctor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Practice</Label>
                <Select value={practiceFilter} onValueChange={setPracticeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by practice..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Practices</SelectItem>
                    {practices.map((practice) => (
                      <SelectItem key={practice.id} value={practice.id}>
                        {practice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredReferrals.length} of {referrals.length} referrals
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading referrals...
                    </TableCell>
                  </TableRow>
                ) : filteredReferrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No referrals found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{getDoctorName(referral.fromDoctorId)}</span>
                          <span className="text-xs text-muted-foreground">
                            {getPracticeName(referral.fromPracticeId)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{getDoctorName(referral.toDoctorId)}</span>
                          <span className="text-xs text-muted-foreground">
                            {getPracticeName(referral.toPracticeId)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {referral.patient.name && (
                            <span className="font-medium">{referral.patient.name}</span>
                          )}
                          {referral.patient.dob && (
                            <span className="text-xs text-muted-foreground">
                              DOB: {referral.patient.dob}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={referral.condition}>
                            {referral.condition}
                          </p>
                          {referral.notes && (
                            <p className="text-xs text-muted-foreground truncate" title={referral.notes}>
                              {referral.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(referral.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
