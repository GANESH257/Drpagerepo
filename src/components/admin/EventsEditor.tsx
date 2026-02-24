'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getBoardMeetings,
  saveBoardMeetings,
  resetBoardMeetings,
  BoardMeetingsData,
} from '@/lib/adminStorage';
import { BoardMeeting } from '@/types';

// GlobalMedicalEvent type (matching API format)
interface GlobalMedicalEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  isOnline: boolean;
  description?: string;
  url?: string;
}
import { getEvents, createEvent, updateEvent, deleteEvent, Event as ApiEvent } from '@/lib/api/events';

export function EventsEditor() {
  const [activeTab, setActiveTab] = useState('global');
  const [globalEvents, setGlobalEvents] = useState<GlobalMedicalEvent[]>([]);
  const [boardMeetings, setBoardMeetings] = useState<BoardMeetingsData>({
    nextMeeting: {} as BoardMeeting,
    upcomingMeetings: [],
  });
  const [editingGlobalEvent, setEditingGlobalEvent] = useState<GlobalMedicalEvent | null>(null);
  const [editingBoardMeeting, setEditingBoardMeeting] = useState<BoardMeeting | null>(null);
  const [isGlobalDialogOpen, setIsGlobalDialogOpen] = useState(false);
  const [isBoardDialogOpen, setIsBoardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'global' | 'board'; id: string } | null>(null);
  const [resetType, setResetType] = useState<'global' | 'board' | null>(null);
  const [globalFormData, setGlobalFormData] = useState<Partial<GlobalMedicalEvent>>({});
  const [boardFormData, setBoardFormData] = useState<Partial<BoardMeeting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Load global events from API
      const apiEvents = await getEvents();
      // Transform API format to frontend format
      const transformedEvents: GlobalMedicalEvent[] = apiEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        isOnline: e.is_online,
        description: e.description,
        url: e.url,
      }));
      setGlobalEvents(transformedEvents);
      // Board meetings still use localStorage for now
      setBoardMeetings(getBoardMeetings());
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Global Medical Events handlers
  const handleAddGlobalEvent = () => {
    setEditingGlobalEvent(null);
    setGlobalFormData({
      id: `event-${Date.now()}`,
      title: '',
      date: '',
      location: '',
      isOnline: false,
      description: '',
      url: '',
    });
    setIsGlobalDialogOpen(true);
  };

  const handleEditGlobalEvent = (event: GlobalMedicalEvent) => {
    setEditingGlobalEvent(event);
    setGlobalFormData({ ...event });
    setIsGlobalDialogOpen(true);
  };

  const handleSaveGlobalEvent = async () => {
    if (!globalFormData.id || !globalFormData.title || !globalFormData.date) return;

    try {
      setSaving(true);
      setError(null);

      const eventData: ApiEvent = {
        id: globalFormData.id,
        title: globalFormData.title!,
        date: globalFormData.date!,
        location: globalFormData.location || '',
        is_online: globalFormData.isOnline || false,
        description: globalFormData.description,
        url: globalFormData.url,
      };

      if (editingGlobalEvent) {
        await updateEvent(editingGlobalEvent.id, eventData);
      } else {
        await createEvent(eventData);
      }

      await loadEvents(); // Reload from API
      setIsGlobalDialogOpen(false);
      setEditingGlobalEvent(null);
      setGlobalFormData({});
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGlobalEvent = (event: GlobalMedicalEvent) => {
    setItemToDelete({ type: 'global', id: event.id });
    setIsDeleteDialogOpen(true);
  };

  // Board Meetings handlers
  const handleAddBoardMeeting = () => {
    setEditingBoardMeeting(null);
    setBoardFormData({
      id: `meeting-${Date.now()}`,
      date: '',
      time: '',
      timezone: 'PST',
      location: '',
      isVirtual: false,
      meetingLink: '',
      agendaHighlights: [],
      icsFile: '',
    });
    setIsBoardDialogOpen(true);
  };

  const handleEditBoardMeeting = (meeting: BoardMeeting, isNext: boolean) => {
    setEditingBoardMeeting(meeting);
    setBoardFormData({ ...meeting, _isNext: isNext } as any);
    setIsBoardDialogOpen(true);
  };

  const handleSaveBoardMeeting = () => {
    if (!boardFormData.id || !boardFormData.date || !boardFormData.time) return;

    const meetingData: BoardMeeting = {
      id: boardFormData.id,
      date: boardFormData.date,
      time: boardFormData.time,
      timezone: boardFormData.timezone || 'PST',
      location: boardFormData.location || '',
      isVirtual: boardFormData.isVirtual || false,
      meetingLink: boardFormData.meetingLink,
      agendaHighlights: boardFormData.agendaHighlights || [],
      icsFile: boardFormData.icsFile,
    };

    const updated = { ...boardMeetings };
    const isNext = (boardFormData as any)._isNext;

    if (isNext) {
      updated.nextMeeting = meetingData;
    } else {
      if (editingBoardMeeting) {
        updated.upcomingMeetings = updated.upcomingMeetings.map((m) =>
          m.id === editingBoardMeeting.id ? meetingData : m
        );
      } else {
        updated.upcomingMeetings = [...updated.upcomingMeetings, meetingData];
      }
    }

    setBoardMeetings(updated);
    saveBoardMeetings(updated);
    setIsBoardDialogOpen(false);
    setEditingBoardMeeting(null);
    setBoardFormData({});
  };

  const handleDeleteBoardMeeting = (meeting: BoardMeeting) => {
    setItemToDelete({ type: 'board', id: meeting.id });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setSaving(true);
      if (itemToDelete.type === 'global') {
        await deleteEvent(itemToDelete.id);
        await loadEvents(); // Reload from API
      } else {
        const updated = {
          ...boardMeetings,
          upcomingMeetings: boardMeetings.upcomingMeetings.filter((m) => m.id !== itemToDelete.id),
        };
        setBoardMeetings(updated);
        saveBoardMeetings(updated);
      }

      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (resetType === 'global') {
      // For global events, reset means reloading from API (which has defaults)
      await loadEvents();
    } else if (resetType === 'board') {
      resetBoardMeetings();
      await loadEvents();
    }
    setIsResetDialogOpen(false);
    setResetType(null);
  };

  const addAgendaItem = () => {
    setBoardFormData({
      ...boardFormData,
      agendaHighlights: [...(boardFormData.agendaHighlights || []), ''],
    });
  };

  const updateAgendaItem = (index: number, value: string) => {
    const highlights = [...(boardFormData.agendaHighlights || [])];
    highlights[index] = value;
    setBoardFormData({ ...boardFormData, agendaHighlights: highlights });
  };

  const removeAgendaItem = (index: number) => {
    const highlights = boardFormData.agendaHighlights?.filter((_, i) => i !== index) || [];
    setBoardFormData({ ...boardFormData, agendaHighlights: highlights });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="global">Global Medical Events</TabsTrigger>
          <TabsTrigger value="board">Board Meetings</TabsTrigger>
        </TabsList>

        {/* Global Medical Events Tab */}
        <TabsContent value="global" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Global Medical Events</h3>
              <p className="text-sm text-muted-foreground">
                Manage medical conferences, webinars, and continuing education events
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddGlobalEvent} className="text-white border-0" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }} disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading events...
            </div>
          )}

          <div className="space-y-3">
            {globalEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-foreground">{event.title}</span>
                    <Badge variant={isUpcoming(event.date) ? 'gradient' : 'outline'}>
                      {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
                    </Badge>
                    {event.isOnline && <Badge variant="outline">Online</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>{formatDate(event.date)}</span>
                    <span className="mx-2">•</span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEditGlobalEvent(event)} variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDeleteGlobalEvent(event)} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {globalEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No events found. Click "Add Event" to create one.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Board Meetings Tab */}
        <TabsContent value="board" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Board Meetings</h3>
              <p className="text-sm text-muted-foreground">
                Manage board meetings including the next meeting and upcoming meetings
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setResetType('board'); setIsResetDialogOpen(true); }} variant="outline">
                Reset to Defaults
              </Button>
              <Button onClick={handleAddBoardMeeting} className="text-white border-0" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Meeting
              </Button>
            </div>
          </div>

          {/* Next Meeting */}
          {boardMeetings.nextMeeting && boardMeetings.nextMeeting.id && (
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Next Meeting</h4>
              <div className="flex items-center justify-between p-4 border-2 rounded-lg border-[var(--aip-teal)] bg-[var(--aip-teal)]/5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-foreground">
                      {formatDate(boardMeetings.nextMeeting.date)} at {boardMeetings.nextMeeting.time} {boardMeetings.nextMeeting.timezone}
                    </span>
                    {boardMeetings.nextMeeting.isVirtual && <Badge variant="outline">Virtual</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>{boardMeetings.nextMeeting.location}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleEditBoardMeeting(boardMeetings.nextMeeting, true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Upcoming Meetings */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Upcoming Meetings</h4>
            {boardMeetings.upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-foreground">
                      {formatDate(meeting.date)} at {meeting.time} {meeting.timezone}
                    </span>
                    {meeting.isVirtual && <Badge variant="outline">Virtual</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>{meeting.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEditBoardMeeting(meeting, false)} variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDeleteBoardMeeting(meeting)} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {boardMeetings.upcomingMeetings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming meetings. Click "Add Meeting" to create one.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Global Event Dialog */}
      <Dialog open={isGlobalDialogOpen} onOpenChange={setIsGlobalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGlobalEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {editingGlobalEvent ? 'Update event details below' : 'Create a new global medical event'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={globalFormData.title || ''}
                onChange={(e) => setGlobalFormData({ ...globalFormData, title: e.target.value })}
                placeholder="Annual Medical Conference 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={globalFormData.date || ''}
                  onChange={(e) => setGlobalFormData({ ...globalFormData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={globalFormData.location || ''}
                  onChange={(e) => setGlobalFormData({ ...globalFormData, location: e.target.value })}
                  placeholder="San Francisco, CA or Online"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isOnline"
                checked={globalFormData.isOnline || false}
                onCheckedChange={(checked) => setGlobalFormData({ ...globalFormData, isOnline: checked })}
              />
              <Label htmlFor="isOnline">Online Event</Label>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={globalFormData.description || ''}
                onChange={(e) => setGlobalFormData({ ...globalFormData, description: e.target.value })}
                placeholder="Event description..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="url">URL (Optional)</Label>
              <Input
                id="url"
                type="url"
                value={globalFormData.url || ''}
                onChange={(e) => setGlobalFormData({ ...globalFormData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGlobalDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveGlobalEvent}
              className="bg-gradient-to-br from-[var(--aip-teal)] to-[var(--aip-navy)] text-white hover:opacity-90"
              disabled={!globalFormData.title || !globalFormData.date || saving}
            >
              {saving ? 'Saving...' : 'Save Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Board Meeting Dialog */}
      <Dialog open={isBoardDialogOpen} onOpenChange={setIsBoardDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBoardMeeting ? 'Edit Meeting' : 'Add New Meeting'}
            </DialogTitle>
            <DialogDescription>
              {editingBoardMeeting ? 'Update meeting details below' : 'Create a new board meeting'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="meeting-date">Date *</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={boardFormData.date || ''}
                  onChange={(e) => setBoardFormData({ ...boardFormData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meeting-time">Time *</Label>
                <Input
                  id="meeting-time"
                  value={boardFormData.time || ''}
                  onChange={(e) => setBoardFormData({ ...boardFormData, time: e.target.value })}
                  placeholder="2:00 PM"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={boardFormData.timezone || 'PST'}
                  onChange={(e) => setBoardFormData({ ...boardFormData, timezone: e.target.value })}
                  placeholder="PST"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="meeting-location">Location *</Label>
              <Input
                id="meeting-location"
                value={boardFormData.location || ''}
                onChange={(e) => setBoardFormData({ ...boardFormData, location: e.target.value })}
                placeholder="Virtual Meeting or Physical Location"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isVirtual"
                checked={boardFormData.isVirtual || false}
                onCheckedChange={(checked) => setBoardFormData({ ...boardFormData, isVirtual: checked })}
              />
              <Label htmlFor="isVirtual">Virtual Meeting</Label>
            </div>

            {boardFormData.isVirtual && (
              <div>
                <Label htmlFor="meeting-link">Meeting Link</Label>
                <Input
                  id="meeting-link"
                  type="url"
                  value={boardFormData.meetingLink || ''}
                  onChange={(e) => setBoardFormData({ ...boardFormData, meetingLink: e.target.value })}
                  placeholder="https://zoom.us/j/123456789"
                />
              </div>
            )}

            <div>
              <Label htmlFor="ics-file">ICS File Path (Optional)</Label>
              <Input
                id="ics-file"
                value={boardFormData.icsFile || ''}
                onChange={(e) => setBoardFormData({ ...boardFormData, icsFile: e.target.value })}
                placeholder="/ics/next-board-meeting.ics"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Agenda Highlights</Label>
                <Button type="button" onClick={addAgendaItem} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {boardFormData.agendaHighlights?.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateAgendaItem(index, e.target.value)}
                      placeholder="Agenda item..."
                    />
                    <Button
                      type="button"
                      onClick={() => removeAgendaItem(index)}
                      variant="ghost"
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!boardFormData.agendaHighlights || boardFormData.agendaHighlights.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No agenda items. Click "Add Item" to add one.
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBoardDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBoardMeeting}
              className="bg-gradient-to-br from-[var(--aip-teal)] to-[var(--aip-navy)] text-white hover:opacity-90"
              disabled={!boardFormData.date || !boardFormData.time}
            >
              Save Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type === 'global' ? 'Event' : 'Meeting'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {itemToDelete?.type === 'global' ? 'event' : 'meeting'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all custom {resetType === 'global' ? 'events' : 'meetings'} changes and restore the defaults. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-gradient-to-br from-[var(--aip-teal)] to-[var(--aip-navy)] text-white hover:opacity-90">
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
