import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MsHeading, MsText } from "@/components/ui/typography";
import { useTheme } from "react-native-paper";
import { useMembers } from "@/hooks/use-queries";
import type { Doc } from "@/convex/_generated/dataModel";

interface BulkQRGeneratorProps { visible: boolean; onClose: () => void; }
type MemberRecord = Doc<"members">;

export function BulkQRGenerator({ visible, onClose }: BulkQRGeneratorProps) {
    const { colors } = useTheme();
    const { data: membersData, isLoading } = useMembers();
    const members = membersData as MemberRecord[] | undefined;
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

    const toggleMember = (memberId: string) => {
        const next = new Set(selectedMembers);
        if (next.has(memberId)) next.delete(memberId); else next.add(memberId);
        setSelectedMembers(next);
    };
    const selectAll = () => { if (members) setSelectedMembers(new Set(members.map((m) => m._id))); };
    const deselectAll = () => setSelectedMembers(new Set());

    const exportSelectedQRs = async () => {
        if (selectedMembers.size === 0) { Alert.alert("No Selection", "Please select at least one member"); return; }
        setGenerating(true); setProgress(0);
        try {
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) throw new Error("Cache directory unavailable");
            const selected: MemberRecord[] = members?.filter((m) => selectedMembers.has(m._id)) || [];
            let csv = "Card Number,Name,Student ID,QR Data\n";
            for (let i = 0; i < selected.length; i++) {
                const m = selected[i];
                csv += `"${m.cardNo}","${m.firstName} ${m.lastName}","${m.studentId}","${m.cardNo}"\n`;
                setProgress(Math.round(((i + 1) / selected.length) * 100));
            }
            const fileUri = cacheDir + `qr-codes-${Date.now()}.csv`;
            await FileSystem.writeAsStringAsync(fileUri, csv);
            if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(fileUri, { mimeType: "text/csv", dialogTitle: "Export QR Code Data", UTI: "public.comma-separated-values-text" }); }
            else Alert.alert("Success", `QR data exported to: ${fileUri}`);
        } catch { Alert.alert("Error", "Failed to export QR codes"); }
        finally { setGenerating(false); setProgress(0); }
    };

    const generatePDF = async () => {
        if (selectedMembers.size === 0) { Alert.alert("No Selection", "Please select at least one member"); return; }
        setGenerating(true); setProgress(0);
        try {
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) throw new Error("Cache directory unavailable");
            const selected: MemberRecord[] = members?.filter((m) => selectedMembers.has(m._id)) || [];
            let html = `<html><head><style>body{font-family:Arial,sans-serif;padding:20px}.header{text-align:center;margin-bottom:30px}.member-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.member-card{border:2px solid #333;padding:15px;text-align:center;page-break-inside:avoid}.member-name{font-size:18px;font-weight:bold;margin-bottom:5px}.member-id{font-size:14px;color:#666;margin-bottom:10px}.card-number{font-size:16px;font-family:monospace}.qr-placeholder{width:150px;height:150px;border:1px solid #ccc;margin:10px auto;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999}</style></head><body><div class="header"><h1>Member QR Codes</h1><p>Generated on ${new Date().toLocaleDateString()}</p></div><div class="member-grid">`;
            for (let i = 0; i < selected.length; i++) {
                const m = selected[i];
                html += `<div class="member-card"><div class="member-name">${m.firstName} ${m.lastName}</div><div class="member-id">${m.studentId}</div><div class="qr-placeholder">QR Code<br/>${m.cardNo}</div><div class="card-number">${m.cardNo}</div></div>`;
                setProgress(Math.round(((i + 1) / selected.length) * 100));
            }
            html += `</div></body></html>`;
            const { uri } = await Print.printToFileAsync({ html });
            const newPath = cacheDir + `qr-codes-${Date.now()}.pdf`;
            await FileSystem.moveAsync({ from: uri, to: newPath });
            if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(newPath, { mimeType: "application/pdf", dialogTitle: "Export QR Codes PDF", UTI: "com.adobe.pdf" });
        } catch { Alert.alert("Error", "Failed to generate PDF"); }
        finally { setGenerating(false); setProgress(0); }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.outline }}>
                    <MsHeading size="h3">Bulk QR Generator</MsHeading>
                    <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                        <IconSymbol name="xmark" size={24} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <MsText style={{ marginTop: 16 }}>Loading members...</MsText>
                    </View>
                ) : (
                    <>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, backgroundColor: colors.surfaceVariant }}>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                <Button variant="ghost" onPress={selectAll}>Select All</Button>
                                <Button variant="ghost" onPress={deselectAll}>Deselect All</Button>
                            </View>
                            <MsText style={{ alignSelf: "center" }}>{selectedMembers.size} selected</MsText>
                        </View>

                        <ScrollView style={{ flex: 1 }}>
                            {members?.map((member) => (
                                <TouchableOpacity
                                    key={member._id}
                                    onPress={() => toggleMember(member._id)}
                                    style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.outline, backgroundColor: selectedMembers.has(member._id) ? "rgba(37,99,235,0.1)" : "transparent" }}
                                >
                                    <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 2, marginRight: 12, alignItems: "center", justifyContent: "center", backgroundColor: selectedMembers.has(member._id) ? "#2563EB" : "transparent", borderColor: selectedMembers.has(member._id) ? "#2563EB" : colors.onSurfaceVariant }}>
                                        {selectedMembers.has(member._id) && <IconSymbol name="checkmark" size={14} color="#fff" />}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <MsText style={{ fontWeight: "600" }}>{member.firstName} {member.lastName}</MsText>
                                        <MsText variant="small" style={{ color: colors.onSurfaceVariant }}>{member.studentId} • {member.cardNo}</MsText>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {generating && (
                            <View style={{ padding: 16, backgroundColor: colors.surfaceVariant }}>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <MsText>Generating...</MsText>
                                    <MsText style={{ fontWeight: "600" }}>{progress}%</MsText>
                                </View>
                                <View style={{ height: 8, backgroundColor: "rgba(100,116,139,0.2)", borderRadius: 4, overflow: "hidden" }}>
                                    <View style={{ height: "100%", backgroundColor: "#2563EB", width: `${progress}%` }} />
                                </View>
                            </View>
                        )}

                        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.outline, gap: 12 }}>
                            <Button variant="primary" onPress={exportSelectedQRs} disabled={generating || selectedMembers.size === 0}>
                                Export CSV ({selectedMembers.size})
                            </Button>
                            <Button variant="secondary" onPress={generatePDF} disabled={generating || selectedMembers.size === 0}>
                                Generate PDF ({selectedMembers.size})
                            </Button>
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
}
