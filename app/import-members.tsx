import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/Typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useMutation } from "convex/react";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImportMembers() {
  const router = useRouter();
  const { token } = useAuth();
  const bulkImport = useMutation(api.members.bulkImport);

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setImportResult(null);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to pick file");
    }
  }

  async function processImport() {
    if (!selectedFile || !token) {
      Alert.alert("Error", "No file selected");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const response = await fetch(selectedFile.uri);
      const csvText = await response.text();
      
      const lines = csvText.trim().split("\n");
      const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
      
      const firstNameIdx = headers.findIndex(h => h === "firstname" || h === "first_name");
      const lastNameIdx = headers.findIndex(h => h === "lastname" || h === "last_name");
      const middleInitialIdx = headers.findIndex(h => h === "middleinitial" || h === "middle_initial" || h === "mi");
      const studentIdIdx = headers.findIndex(h => h === "studentid" || h === "student_id" || h === "id");
      const yearSectionIdx = headers.findIndex(h => h === "yearsection" || h === "year_section" || h === "section");
      const cardNoIdx = headers.findIndex(h => h === "cardno" || h === "card_number" || h === "card");
      const emailIdx = headers.findIndex(h => h === "email");

      if (firstNameIdx === -1 || lastNameIdx === -1 || studentIdIdx === -1) {
        Alert.alert("Error", "CSV must contain: firstName, lastName, studentId");
        setImporting(false);
        return;
      }

      const members = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        if (values.length >= 3) {
          members.push({
            firstName: values[firstNameIdx] || "",
            lastName: values[lastNameIdx] || "",
            middleInitial: middleInitialIdx !== -1 ? values[middleInitialIdx] || "" : "",
            studentId: values[studentIdIdx] || "",
            yearSection: yearSectionIdx !== -1 ? values[yearSectionIdx] || "" : "",
            cardNo: cardNoIdx !== -1 ? values[cardNoIdx] || "" : "",
            email: emailIdx !== -1 ? values[emailIdx] || undefined : undefined,
          });
        }
      }

      const result = await bulkImport({
        members,
        token,
      });

      setImportResult(result);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to process CSV");
    } finally {
      setImporting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-dark-background" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <MsHeading size="h2" className="mb-2">Import Members</MsHeading>
        <MsText variant="muted" className="mb-6">
          Upload a CSV file with member data. Required columns: firstName, lastName, studentId
        </MsText>

        <Card className="p-6 mb-6 items-center">
          <IconSymbol name="doc.badge.plus" size={48} color="#2563EB" />
          <MsText className="mt-4 text-center mb-4">
            Upload CSV file with columns:{"\n"}
            firstName, lastName, studentId, middleInitial, yearSection, cardNo, email
          </MsText>
          
          <Button variant="outline" onPress={pickDocument}>
            <IconSymbol name="folder" size={18} color="#2563EB" />
            <MsText className="ml-2 text-primary">
              {selectedFile ? "Change File" : "Select CSV File"}
            </MsText>
          </Button>

          {selectedFile && (
            <MsText variant="muted" className="mt-3 text-sm">
              Selected: {selectedFile.name}
            </MsText>
          )}
        </Card>

        {selectedFile && (
          <Button
            variant="primary"
            onPress={processImport}
            loading={importing}
            className="mb-6"
          >
            Import Members
          </Button>
        )}

        {importResult && (
          <Card className="p-4 mb-6">
            <MsHeading size="h4" className="mb-3">Import Results</MsHeading>
            <View className="flex-row justify-between mb-2">
              <MsText>Success:</MsText>
              <MsText className="text-green-600 dark:text-green-400 font-bold">{importResult.success}</MsText>
            </View>
            <View className="flex-row justify-between mb-3">
              <MsText>Failed:</MsText>
              <MsText className="text-red-600 dark:text-red-400 font-bold">{importResult.failed}</MsText>
            </View>
            
            {importResult.errors.length > 0 && (
              <>
                <MsHeading size="h4" className="mb-2">Errors:</MsHeading>
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <MsText key={i} variant="small" className="text-red-500 dark:text-red-400 mb-1">
                    {err}
                  </MsText>
                ))}
                {importResult.errors.length > 5 && (
                  <MsText variant="small" className="text-muted-foreground dark:text-dark-muted-foreground">
                    ...and {importResult.errors.length - 5} more errors
                  </MsText>
                )}
              </>
            )}

            <Button
              variant="secondary"
              onPress={() => {
                setSelectedFile(null);
                setImportResult(null);
              }}
              className="mt-4"
            >
              Import Another File
            </Button>
          </Card>
        )}

        <Card className="p-4 mb-10">
          <MsHeading size="h4" className="mb-2">Example CSV Format</MsHeading>
          <MsText variant="small" className="font-mono bg-slate-100 dark:bg-dark-muted p-2 rounded">
            firstName,lastName,studentId,yearSection,cardNo,email{"\n"}
            John,Doe,2023-001,BSCS 4-A,123456,john@example.com{"\n"}
            Jane,Smith,2023-002,BSCS 4-B,789012,jane@example.com
          </MsText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
