import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/utils/auth-context";
import { useTheme } from "react-native-paper";
import { useMutation } from "convex/react";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImportMembers() {
  const { token } = useAuth();
  const bulkImport = useMutation(api.members.bulkImport);
  const { colors, dark: isDark } = useTheme();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "text/csv", copyToCacheDirectory: true });
      if (result.assets && result.assets.length > 0) { setSelectedFile(result.assets[0]); setImportResult(null); }
    } catch { Alert.alert("Error", "Failed to pick file"); }
  }

  async function processImport() {
    if (!selectedFile || !token) { Alert.alert("Error", "No file selected"); return; }
    setImporting(true); setImportResult(null);
    try {
      const response = await fetch(selectedFile.uri);
      const csvText = await response.text();
      const lines = csvText.trim().split("\n");
      const headers = lines[0].toLowerCase().split(",").map((h: string) => h.trim());
      const firstNameIdx = headers.findIndex((h: string) => h === "firstname" || h === "first_name");
      const lastNameIdx = headers.findIndex((h: string) => h === "lastname" || h === "last_name");
      const middleInitialIdx = headers.findIndex((h: string) => h === "middleinitial" || h === "middle_initial" || h === "mi");
      const studentIdIdx = headers.findIndex((h: string) => h === "studentid" || h === "student_id" || h === "id");
      const yearSectionIdx = headers.findIndex((h: string) => h === "yearsection" || h === "year_section" || h === "section");
      const cardNoIdx = headers.findIndex((h: string) => h === "cardno" || h === "card_number" || h === "card");
      const emailIdx = headers.findIndex((h: string) => h === "email");
      if (firstNameIdx === -1 || lastNameIdx === -1 || studentIdIdx === -1) { Alert.alert("Error", "CSV must contain: firstName, lastName, studentId"); setImporting(false); return; }
      const members = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v: string) => v.trim());
        if (values.length >= 3) {
          members.push({ firstName: values[firstNameIdx] || "", lastName: values[lastNameIdx] || "", middleInitial: middleInitialIdx !== -1 ? values[middleInitialIdx] || "" : "", studentId: values[studentIdIdx] || "", yearSection: yearSectionIdx !== -1 ? values[yearSectionIdx] || "" : "", cardNo: cardNoIdx !== -1 ? values[cardNoIdx] || "" : "", email: emailIdx !== -1 ? values[emailIdx] || undefined : undefined });
        }
      }
      const result = await bulkImport({ members, token });
      setImportResult(result);
    } catch (e: any) { Alert.alert("Error", e.message || "Failed to process CSV"); }
    finally { setImporting(false); }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom", "left", "right"]}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }} showsVerticalScrollIndicator={false}>
        <MsHeading size="h2" style={{ marginBottom: 8 }}>Import Members</MsHeading>
        <MsText variant="muted" style={{ marginBottom: 24 }}>
          Upload a CSV file with member data. Required columns: firstName, lastName, studentId
        </MsText>

        <Card style={{ padding: 24, marginBottom: 24, alignItems: "center" }}>
          <IconSymbol name="doc.badge.plus" size={48} color="#2563EB" />
          <MsText style={{ marginTop: 16, textAlign: "center", marginBottom: 16 }}>
            Upload CSV file with columns:{"\n"}
            firstName, lastName, studentId, middleInitial, yearSection, cardNo, email
          </MsText>
          <Button variant="outline" onPress={pickDocument}>
            <IconSymbol name="folder" size={18} color="#2563EB" />
            <MsText style={{ marginLeft: 8, color: "#2563EB" }}>
              {selectedFile ? "Change File" : "Select CSV File"}
            </MsText>
          </Button>
          {selectedFile && (
            <MsText variant="muted" style={{ marginTop: 12, fontSize: 14 }}>Selected: {selectedFile.name}</MsText>
          )}
        </Card>

        {selectedFile && (
          <Button variant="primary" onPress={processImport} loading={importing} style={{ marginBottom: 24 }}>
            Import Members
          </Button>
        )}

        {importResult && (
          <Card style={{ padding: 16, marginBottom: 24 }}>
            <MsHeading size="h4" style={{ marginBottom: 12 }}>Import Results</MsHeading>
            <View style={styles.resultRow}>
              <MsText>Success:</MsText>
              <MsText style={{ color: "#16A34A", fontWeight: "700" }}>{importResult.success}</MsText>
            </View>
            <View style={[styles.resultRow, { marginBottom: 12 }]}>
              <MsText>Failed:</MsText>
              <MsText style={{ color: "#DC2626", fontWeight: "700" }}>{importResult.failed}</MsText>
            </View>
            {importResult.errors.length > 0 && (
              <>
                <MsHeading size="h4" style={{ marginBottom: 8 }}>Errors:</MsHeading>
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <MsText key={i} variant="small" style={{ color: "#EF4444", marginBottom: 4 }}>{err}</MsText>
                ))}
                {importResult.errors.length > 5 && (
                  <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>
                    ...and {importResult.errors.length - 5} more errors
                  </MsText>
                )}
              </>
            )}
            <Button variant="secondary" onPress={() => { setSelectedFile(null); setImportResult(null); }} style={{ marginTop: 16 }}>
              Import Another File
            </Button>
          </Card>
        )}

        <Card style={{ padding: 16, marginBottom: 40 }}>
          <MsHeading size="h4" style={{ marginBottom: 8 }}>Example CSV Format</MsHeading>
          <MsText variant="small" style={{ fontFamily: "monospace", backgroundColor: isDark ? colors.surfaceVariant : "#F1F5F9", padding: 8, borderRadius: 6 }}>
            firstName,lastName,studentId,yearSection,cardNo,email{"\n"}
            John,Doe,2023-001,BSCS 4-A,123456,john@example.com{"\n"}
            Jane,Smith,2023-002,BSCS 4-B,789012,jane@example.com
          </MsText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
});
