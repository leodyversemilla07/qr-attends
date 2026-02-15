import React, { useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MsHeading, MsText } from '@/components/ui/typography';
import { useAttendanceByEvent, useEvent, useMembers } from '@/hooks/use-queries';
import { Id } from '@/convex/_generated/dataModel';
import { format } from 'date-fns';

interface PDFReportGeneratorProps {
  eventId?: Id<'events'>;
}

export function PDFReportGenerator({ eventId }: PDFReportGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<'event' | 'members' | 'summary'>('summary');
  
  const { data: event } = useEvent(eventId || '' as Id<'events'>);
  const { data: attendees } = useAttendanceByEvent(eventId || '' as Id<'events'>);
  const { data: members } = useMembers();

  const generateEventReport = async () => {
    if (!event || !attendees) return;

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563EB; padding-bottom: 20px; }
            .title { font-size: 28px; font-weight: bold; color: #1E293B; margin-bottom: 10px; }
            .subtitle { font-size: 16px; color: #64748B; }
            .info { margin: 20px 0; padding: 15px; background: #F1F5F9; border-radius: 8px; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { font-weight: bold; color: #475569; }
            .value { color: #1E293B; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #2563EB; color: white; padding: 12px; text-align: left; font-weight: bold; }
            td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; }
            tr:nth-child(even) { background: #F8FAFC; }
            .footer { margin-top: 40px; text-align: center; color: #94A3B8; font-size: 12px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 15px; background: #EFF6FF; border-radius: 8px; }
            .stat-number { font-size: 32px; font-weight: bold; color: #2563EB; }
            .stat-label { font-size: 14px; color: #64748B; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Attendance Report</div>
            <div class="subtitle">${event.name}</div>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${format(new Date(event.date), 'MMMM d, yyyy')}</span>
            </div>
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">${event.time}</span>
            </div>
            <div class="info-row">
              <span class="label">Location:</span>
              <span class="value">${event.location}</span>
            </div>
            <div class="info-row">
              <span class="label">Generated:</span>
              <span class="value">${format(new Date(), 'MMMM d, yyyy h:mm a')}</span>
            </div>
          </div>

          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">${attendees.length}</div>
              <div class="stat-label">Attendees</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${members?.length || 0}</div>
              <div class="stat-label">Total Members</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${Math.round((attendees.length / (members?.length || 1)) * 100)}%</div>
              <div class="stat-label">Attendance Rate</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Student ID</th>
                <th>Year/Section</th>
                <th>Check-in Time</th>
              </tr>
            </thead>
            <tbody>
              ${attendees.map((attendee, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${attendee.member?.firstName} ${attendee.member?.lastName}</td>
                  <td>${attendee.member?.studentId}</td>
                  <td>${attendee.member?.yearSection}</td>
                  <td>${format(new Date(attendee.timestamp), 'h:mm a')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>QR Attends - Professional Attendance Management</p>
            <p>This report was automatically generated by the QR Attends system.</p>
          </div>
        </body>
      </html>
    `;

    return html;
  };

  const generateMembersReport = async () => {
    if (!members) return;

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #10B981; padding-bottom: 20px; }
            .title { font-size: 28px; font-weight: bold; color: #1E293B; margin-bottom: 10px; }
            .subtitle { font-size: 16px; color: #64748B; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #10B981; color: white; padding: 12px; text-align: left; font-weight: bold; }
            td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; }
            tr:nth-child(even) { background: #F8FAFC; }
            .footer { margin-top: 40px; text-align: center; color: #94A3B8; font-size: 12px; }
            .summary { margin: 20px 0; padding: 20px; background: #ECFDF5; border-radius: 8px; text-align: center; }
            .summary-number { font-size: 48px; font-weight: bold; color: #10B981; }
            .summary-label { font-size: 18px; color: #059669; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Members Directory</div>
            <div class="subtitle">Complete Member List</div>
          </div>

          <div class="summary">
            <div class="summary-number">${members.length}</div>
            <div class="summary-label">Total Registered Members</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Student ID</th>
                <th>Year/Section</th>
                <th>Card Number</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${members.map((member, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${member.firstName} ${member.middleInitial} ${member.lastName}</td>
                  <td>${member.studentId}</td>
                  <td>${member.yearSection}</td>
                  <td>${member.cardNo}</td>
                  <td>${member.email || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>QR Attends - Professional Attendance Management</p>
            <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
        </body>
      </html>
    `;

    return html;
  };

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      let html = '';
      let fileName = '';

      switch (reportType) {
        case 'event':
          if (!eventId) {
            Alert.alert('Error', 'Please select an event first');
            return;
          }
          html = (await generateEventReport()) || '';
          fileName = `event-report-${event?.name?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
          break;
        case 'members':
          html = (await generateMembersReport()) || '';
          fileName = `members-directory-${Date.now()}.pdf`;
          break;
        case 'summary':
        default:
          // For summary, we'll create a simple overview
          html = (await generateMembersReport()) || ''; // Fallback to members for now
          fileName = `summary-report-${Date.now()}.pdf`;
          break;
      }

      if (!html) {
        Alert.alert('Error', 'Failed to generate report content');
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });
      
      const newPath = (FileSystem as any).cacheDirectory + fileName;
      await FileSystem.moveAsync({ from: uri, to: newPath });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export PDF Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Success', `Report saved to: ${newPath}`);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="m-4">
      <MsHeading size="h4" className="mb-4">Generate PDF Report</MsHeading>
      
      <MsText variant="small" className="text-muted-foreground mb-4">
        Export professional attendance reports in PDF format
      </MsText>

      {/* Report Type Selection */}
      <View className="flex-row gap-2 mb-4">
        <Button
          variant={reportType === 'summary' ? 'primary' : 'ghost'}
          onPress={() => setReportType('summary')}
          className="flex-1"
        >
          Summary
        </Button>
        {eventId && (
          <Button
            variant={reportType === 'event' ? 'primary' : 'ghost'}
            onPress={() => setReportType('event')}
            className="flex-1"
          >
            Event
          </Button>
        )}
        <Button
          variant={reportType === 'members' ? 'primary' : 'ghost'}
          onPress={() => setReportType('members')}
          className="flex-1"
        >
          Members
        </Button>
      </View>

      {/* Report Preview Info */}
      <View className="bg-muted/50 p-4 rounded-lg mb-4">
        <MsText className="font-semibold mb-2">
          {reportType === 'event' && event ? `Event: ${event.name}` : 
           reportType === 'members' ? 'Complete Members Directory' : 
           'System Summary Report'}
        </MsText>
        <MsText variant="small" className="text-muted-foreground">
          {reportType === 'event' ? `Includes all attendees for ${event?.date || 'selected event'}` :
           reportType === 'members' ? `Lists all ${members?.length || 0} registered members` :
           'Overview of attendance and member statistics'}
        </MsText>
      </View>

      {/* Generate Button */}
      <Button
        variant="primary"
        onPress={generatePDF}
        disabled={generating}
      >
        {generating ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <MsText className="text-white font-semibold ml-2">Generating...</MsText>
          </>
        ) : (
          <>
            <IconSymbol name="doc.text" size={18} color="#fff" />
            <MsText className="text-white font-semibold ml-2">Generate PDF</MsText>
          </>
        )}
      </Button>
    </Card>
  );
}
