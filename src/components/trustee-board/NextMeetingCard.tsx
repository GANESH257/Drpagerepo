'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Download, FileText, ExternalLink } from 'lucide-react';
import { nextMeeting } from '@/data/boardMeetings';

export function NextMeetingCard() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadICS = () => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = nextMeeting.icsFile || '/ics/next-board-meeting.ics';
    link.download = 'next-board-meeting.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="meeting" className="py-16 md:py-24 relative skin-tint">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-teal/10 mb-4">
              <Calendar className="h-8 w-8 text-brand-teal" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
              Next Scheduled Meeting
            </h2>
          </div>

          {/* Meeting Card */}
          <Card className="card-vibrant shadow-xl">
            <CardHeader className="bg-gradient-to-r from-brand-teal/15 to-brand-blue-light/10 pb-4">
              <CardTitle className="text-2xl md:text-3xl text-brand-dark-blue">
                Board of Trustees Meeting
              </CardTitle>
              <CardDescription className="text-base">
                {formatDate(nextMeeting.date)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-brand-teal mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Date</p>
                    <p className="text-lg text-gray-900">{formatDate(nextMeeting.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-brand-teal mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Time</p>
                    <p className="text-lg text-gray-900">
                      {nextMeeting.time} {nextMeeting.timezone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
                <MapPin className="h-5 w-5 text-brand-teal mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
                  {nextMeeting.isVirtual ? (
                    <div>
                      <p className="text-lg text-gray-900 mb-2">Virtual Meeting</p>
                      {nextMeeting.meetingLink && (
                        <a
                          href={nextMeeting.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-brand-teal hover:text-brand-dark-blue transition-colors text-sm"
                        >
                          Join Meeting
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-lg text-gray-900">{nextMeeting.location}</p>
                  )}
                </div>
              </div>

              {/* Agenda Highlights */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-brand-dark-blue">
                  Agenda Highlights
                </h3>
                <ul className="space-y-2">
                  {nextMeeting.agendaHighlights.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-brand-teal mt-1.5 flex-shrink-0">•</span>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleDownloadICS}
                  className="bg-brand-teal hover:bg-brand-teal/90 text-white flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button
                  variant="outline"
                  className="border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue hover:text-white flex-1"
                  asChild
                >
                  <a href="/policies/meeting-agenda.pdf" download>
                    <FileText className="mr-2 h-4 w-4" />
                    View Agenda
                  </a>
                </Button>
              </div>

              {/* Meeting Cadence */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Meeting Cadence:</strong> Board meetings are held monthly on the third Monday of each month.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
