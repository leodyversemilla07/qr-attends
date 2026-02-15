import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MsHeading, MsText } from '@/components/ui/typography';
import { useMembers } from '@/hooks/use-queries';

interface BulkQRGeneratorProps {
  visible: boolean;
  onClose: () => void;
}

export function BulkQRGenerator({ visible, onClose }: BulkQRGeneratorProps) {
  const { data: members, isLoading } = useMembers();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const selectAll = () => {
    if (members) {
      setSelectedMembers(new Set(members.map(m => m._id)));
    }
  };

  const deselectAll = () => {
    setSelectedMembers(new Set());
  };

  const exportSelectedQRs = async () => {
    if (selectedMembers.size === 0) {
      Alert.alert('No Selection', 'Please select at least one member');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const selectedMemberData = members?.filter(m => selectedMembers.has(m._id)) || [];
      const total = selectedMemberData.length;
      
      // Generate a summary CSV with QR data
      let csvContent = 'Card Number,Name,Student ID,QR Data\n';
      
      for (let i = 0; i < selectedMemberData.length; i++) {
        const member = selectedMemberData[i];
        csvContent += `"${member.cardNo}","${member.firstName} ${member.lastName}","${member.studentId}","${member.cardNo}"\n`;
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      // Save CSV
      const fileName = `qr-codes-${Date.now()}.csv`;
      const fileUri = (FileSystem as any).cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export QR Code Data',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Success', `QR data exported to: ${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export QR codes');
      console.error(error);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const generatePDF = async () => {
    if (selectedMembers.size === 0) {
      Alert.alert('No Selection', 'Please select at least one member');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const selectedMemberData = members?.filter(m => selectedMembers.has(m._id)) || [];
      
      // Create HTML content for PDF
      let htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .member-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .member-card { 
              border: 2px solid #333; 
              padding: 15px; 
              text-align: center;
              page-break-inside: avoid;
            }
            .member-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .member-id { font-size: 14px; color: #666; margin-bottom: 10px; }
            .card-number { font-size: 16px; font-family: monospace; }
            .qr-placeholder { 
              width: 150px; 
              height: 150px; 
              border: 1px solid #ccc; 
              margin: 10px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Member QR Codes</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="member-grid">
      `;

      for (let i = 0; i < selectedMemberData.length; i++) {
        const member = selectedMemberData[i];
        htmlContent += `
          <div class="member-card">
            <div class="member-name">${member.firstName} ${member.lastName}</div>
            <div class="member-id">${member.studentId}</div>
            <div class="qr-placeholder">QR Code<br/>${member.cardNo}</div>
            <div class="card-number">${member.cardNo}</div>
          </div>
        `;
        setProgress(Math.round(((i + 1) / selectedMemberData.length) * 100));
      }

      htmlContent += `
          </div>
        </body>
        </html>
      `;

      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      // Rename file
      const pdfName = `qr-codes-${Date.now()}.pdf`;
      const newPath = (FileSystem as any).cacheDirectory + pdfName;
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      // Share PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export QR Codes PDF',
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
      console.error(error);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background dark:bg-dark-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border dark:border-dark-border">
          <MsHeading size="h3">Bulk QR Generator</MsHeading>
          <TouchableOpacity onPress={onClose} className="p-2">
            <IconSymbol name="xmark" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
            <MsText className="mt-4">Loading members...</MsText>
          </View>
        ) : (
          <>
            {/* Selection Actions */}
            <View className="flex-row justify-between p-4 bg-muted/30">
              <View className="flex-row gap-2">
                <Button variant="ghost" onPress={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" onPress={deselectAll}>
                  Deselect All
                </Button>
              </View>
              <MsText className="self-center">
                {selectedMembers.size} selected
              </MsText>
            </View>

            {/* Member List */}
            <ScrollView className="flex-1">
              {members?.map((member: any) => (
                <TouchableOpacity
                  key={member._id}
                  onPress={() => toggleMember(member._id)}
                  className={`flex-row items-center p-4 border-b border-border dark:border-dark-border ${
                    selectedMembers.has(member._id) ? 'bg-primary/10' : ''
                  }`}
                >
                  <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                    selectedMembers.has(member._id) 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground'
                  }`}>
                    {selectedMembers.has(member._id) && (
                      <IconSymbol name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <View className="flex-1">
                    <MsText className="font-semibold">
                      {member.firstName} {member.lastName}
                    </MsText>
                    <MsText variant="small" className="text-muted-foreground">
                      {member.studentId} • {member.cardNo}
                    </MsText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Progress Indicator */}
            {generating && (
              <View className="p-4 bg-muted">
                <View className="flex-row items-center justify-between mb-2">
                  <MsText>Generating...</MsText>
                  <MsText className="font-semibold">{progress}%</MsText>
                </View>
                <View className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            )}

            {/* Export Actions */}
            <View className="p-4 border-t border-border dark:border-dark-border gap-3">
              <Button
                variant="primary"
                onPress={exportSelectedQRs}
                disabled={generating || selectedMembers.size === 0}
              >
                <IconSymbol name="square.and.arrow.up" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-2">
                  Export CSV ({selectedMembers.size})
                </Text>
              </Button>
              <Button
                variant="secondary"
                onPress={generatePDF}
                disabled={generating || selectedMembers.size === 0}
              >
                <IconSymbol name="doc.text" size={18} color="#64748B" />
                <Text className="font-semibold ml-2">
                  Generate PDF ({selectedMembers.size})
                </Text>
              </Button>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
