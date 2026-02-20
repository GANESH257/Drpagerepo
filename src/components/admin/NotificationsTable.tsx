'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Bell, CheckCircle2, Circle } from 'lucide-react';
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
import { Notification } from '@/types/notifications';
import { getAllNotifications } from '@/lib/adminHelpers';
import { formatDateTime } from '@/lib/dateUtils';

type NotificationWithDoctor = Notification & { doctorName?: string; doctorEmail?: string };

export function NotificationsTable() {
  const [notifications, setNotifications] = useState<NotificationWithDoctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const allNotifications = getAllNotifications();
    setNotifications(allNotifications);
  };

  const uniqueDoctors = useMemo(() => {
    const doctorSet = new Set<string>();
    notifications.forEach(n => {
      if (n.doctorName) {
        doctorSet.add(`${n.doctorId}|${n.doctorName}`);
      }
    });
    return Array.from(doctorSet).map(item => {
      const [doctorId, doctorName] = item.split('|');
      return { doctorId, doctorName };
    });
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // Read filter
    if (readFilter === 'read') {
      filtered = filtered.filter(n => n.readAt);
    } else if (readFilter === 'unread') {
      filtered = filtered.filter(n => !n.readAt);
    }

    // Doctor filter
    if (doctorFilter !== 'all') {
      filtered = filtered.filter(n => n.doctorId === doctorFilter);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => {
        return (
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          n.doctorName?.toLowerCase().includes(query) ||
          n.doctorEmail?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [notifications, typeFilter, readFilter, doctorFilter, searchQuery]);

  const getTypeBadge = (type: Notification['type']) => {
    const typeLabels: Record<Notification['type'], string> = {
      approval_update: 'Approval',
      referral_received: 'Referral',
      referral_status_changed: 'Referral',
      practice_roster_update: 'Roster',
      announcement: 'Announcement',
    };

    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[type] || type}
      </Badge>
    );
  };

  const notificationTypes: Notification['type'][] = [
    'approval_update',
    'referral_received',
    'referral_status_changed',
    'practice_roster_update',
    'announcement',
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, message, doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Status</Label>
                <Select value={readFilter} onValueChange={(value: any) => setReadFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
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
                    {uniqueDoctors.map(({ doctorId, doctorName }) => (
                      <SelectItem key={doctorId} value={doctorId}>
                        {doctorName}
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
        Showing {filteredNotifications.length} of {notifications.length} notifications
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No notifications found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        {notification.readAt ? (
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Circle className="h-4 w-4 text-blue-600" />
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(notification.type)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{notification.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm truncate" title={notification.message}>
                            {notification.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{notification.doctorName || 'Unknown'}</span>
                          {notification.doctorEmail && (
                            <span className="text-xs text-muted-foreground">
                              {notification.doctorEmail}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(notification.createdAt)}
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
