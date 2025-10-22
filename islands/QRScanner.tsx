// QR Scanner island component using html5-qrcode with offline support
import { useEffect, useRef, useState } from "preact/hooks";
import { Html5Qrcode } from "html5-qrcode";
import { Icons } from "../components/Icons.tsx";
import MemberRegistrationForm from "../components/MemberRegistrationForm.tsx";
import { useOnlineStatus } from "../utils/useOnlineStatus.ts";
import { getOfflineStorage } from "../utils/offline-storage.ts";
import { getOfflineManager } from "../utils/offline-manager.ts";

interface QRScannerProps {
  eventId: string;
  eventName: string;
}

export default function QRScanner(
  { eventId, eventName: _eventName }: QRScannerProps,
) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showRegistration, setShowRegistration] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string>("");
  const [manualInput, setManualInput] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const isOnline = useOnlineStatus();

  async function startScanning() {
    if (!videoRef.current) return;

    // Check if camera access is possible
    const isHttps = globalThis.location?.protocol === 'https:' || globalThis.location?.hostname === 'localhost';
    if (!isHttps) {
      const errorMsg = "Camera access requires HTTPS. Please ensure you're accessing this site over a secure connection (HTTPS) or localhost.";
      setError(errorMsg);
      return;
    }

    try {
      setError("");
      setScanning(true);

      // Check camera permission first
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permission.state === 'denied') {
          const errorMsg = "Camera permission denied. Please allow camera access in your browser settings and try again.";
          setError(errorMsg);
          setScanning(false);
          return;
        }
      }

      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Enhanced configuration for better QR code detection
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          // Debounce - prevent multiple scans of the same code
          if (decodedText === result) return;

          setResult(decodedText);
          handleScan(decodedText);
        },
        (errorMessage: string) => {
          // Silently ignore continuous scanning errors to avoid console spam
          // Only log actual errors, not "No QR code found" messages
          if (
            !errorMessage.includes("NotFoundException") &&
            !errorMessage.includes("No MultiFormat")
          ) {
            console.warn("QR scan error:", errorMessage);
          }
        },
      );
    } catch (err) {
      console.error("Camera initialization failed:", err);
      const error = err as Error;
      let errorMessage = "Failed to start camera";

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera permission denied. Please allow camera access and try again. If you're on mobile, check your browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMessage =
          "No camera found. Please ensure your device has a camera and it's not being used by another application.";
      } else if (error.name === "NotSupportedError") {
        errorMessage =
          "Camera not supported. Please use a modern browser that supports camera access.";
      } else if (error.name === "NotReadableError") {
        errorMessage =
          "Camera is busy. Please close other applications using the camera and try again.";
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      setError(errorMessage);
      setScanning(false);
    }
  }

  async function stopScanning() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScanning(false);
  }

  function handleScan(qrData: string) {
    setError("");
    setSuccess("");

    try {
      // Member QR code contains only UUID
      const memberId = qrData.trim();

      if (!memberId) {
        setError("Invalid QR code: No member ID found");
        return;
      }

      // Record attendance for this member at the current event
      recordAttendance(memberId);
    } catch (_err) {
      setError("Invalid QR code format");
    }
  }

  async function recordAttendance(memberId: string) {
    try {
      // Try to record online first
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          eventId,
          userId: memberId,
        }),
      });

      const data = await res.json();

      // Check if response indicates offline
      if (data.offline || !isOnline) {
        // Store locally for later sync
        await storeOfflineAttendance(memberId);
        return;
      }

      if (res.ok) {
        const displayName = data.userName || memberId;
        setSuccess(`✓ Checked in: ${displayName}`);
        // Clear success message after 3 seconds and allow next scan
        setTimeout(() => {
          setSuccess("");
          setResult("");
        }, 3000);
      } else if (data.memberNotFound) {
        // Member not in database - show registration form
        await stopScanning();
        setPendingMemberId(memberId);
        setShowRegistration(true);
      } else {
        setError(data.error || "Failed to check in");
        setTimeout(() => {
          setError("");
          setResult("");
        }, 3000);
      }
    } catch (err) {
      // Network error - store offline
      if (!isOnline || err instanceof TypeError) {
        await storeOfflineAttendance(memberId);
      } else {
        setError(
          "An error occurred: " +
            (err instanceof Error ? err.message : String(err)),
        );
      }
    }
  }

  async function storeOfflineAttendance(memberId: string) {
    try {
      const storage = await getOfflineStorage();
      await storage.addPendingAttendance({
        eventId,
        userId: memberId,
        timestamp: new Date().toISOString(),
      });

      // Update pending count
      const pending = await storage.getPendingAttendance();
      setPendingCount(pending.length);

      setSuccess(
        `✓ Saved offline: ${
          memberId.substring(0, 8)
        }... (will sync when online)`,
      );
      setTimeout(() => {
        setSuccess("");
        setResult("");
      }, 3000);

      // Request background sync if supported
      const manager = getOfflineManager();
      await manager.requestBackgroundSync();
    } catch (err) {
      setError(
        "Failed to save offline: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  async function handleRegistrationSuccess(_memberName: string) {
    const memberId = pendingMemberId; // Save before clearing
    setShowRegistration(false);
    setPendingMemberId("");
    // Now record attendance with the newly registered member
    await recordAttendance(memberId);
  }

  function handleRegistrationCancel() {
    setShowRegistration(false);
    setPendingMemberId("");
    setResult("");
    setError("");
  }

  function handleManualSubmit(e: Event) {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
      setManualInput("");
    }
  }

  // Load pending count on mount
  useEffect(() => {
    async function loadPendingCount() {
      try {
        const storage = await getOfflineStorage();
        const pending = await storage.getPendingAttendance();
        setPendingCount(pending.length);
      } catch (err) {
        console.error("Failed to load pending count:", err);
      }
    }
    loadPendingCount();
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, []);

  return (
    <div class="space-y-4 sm:space-y-6">
      {showRegistration
        ? (
          <MemberRegistrationForm
            memberId={pendingMemberId}
            onSuccess={handleRegistrationSuccess}
            onCancel={handleRegistrationCancel}
          />
        )
        : (
          <>
            <div
              id="qr-reader"
              ref={videoRef}
              class="border-2 border-gray-300 rounded-lg overflow-hidden w-full max-w-md mx-auto min-h-[300px] flex items-center justify-center bg-gray-50"
            >
              {!scanning && (
                <div class="text-gray-500 text-center">
                  <Icons.Camera class="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p class="text-sm">Camera will appear here</p>
                </div>
              )}
            </div>

            {!scanning && !showManualInput && (
              <>
                <button
                  type="button"
                  class="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 text-lg sm:text-xl font-semibold flex items-center justify-center gap-3"
                  onClick={startScanning}
                >
                  <Icons.Camera class="w-6 h-6 sm:w-7 sm:h-7" />
                  Start Camera
                </button>

                <button
                  type="button"
                  class="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 text-base sm:text-lg font-semibold"
                  onClick={() => setShowManualInput(true)}
                >
                  Manual Input (If Camera Fails)
                </button>

                {pendingCount > 0 && (
                  <div class="bg-yellow-100 border border-yellow-400 p-4 rounded-lg">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 text-yellow-800">
                        <Icons.AlertCircle class="w-5 h-5" />
                        <span class="font-semibold">
                          {pendingCount}{" "}
                          attendance record{pendingCount !== 1 ? "s" : ""}{" "}
                          waiting to sync
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const manager = getOfflineManager();
                          const result = await manager.syncPendingData();
                          if (result.success > 0) {
                            const storage = await getOfflineStorage();
                            const pending = await storage
                              .getPendingAttendance();
                            setPendingCount(pending.length);
                            setSuccess(`Synced ${result.success} record(s)`);
                          }
                        }}
                        class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-semibold flex items-center gap-2"
                      >
                        <Icons.RefreshCw class="w-4 h-4" />
                        Sync Now
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {showManualInput && !scanning && (
              <div class="bg-white p-4 rounded-lg border-2 border-blue-300">
                <h3 class="text-lg font-semibold mb-3">
                  Enter Member ID Manually
                </h3>
                <form onSubmit={handleManualSubmit} class="space-y-3">
                  <input
                    type="text"
                    value={manualInput}
                    onInput={(e) => setManualInput(e.currentTarget.value)}
                    placeholder="Enter UUID from QR code"
                    class="w-full border border-gray-300 rounded-lg p-3 text-base"
                    autoFocus
                  />
                  <div class="flex gap-2">
                    <button
                      type="submit"
                      class="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualInput(false);
                        setManualInput("");
                      }}
                      class="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {scanning && (
              <button
                type="button"
                class="w-full bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 text-lg sm:text-xl font-semibold flex items-center justify-center gap-3"
                onClick={stopScanning}
              >
                <Icons.X class="w-6 h-6 sm:w-7 sm:h-7" />
                Stop Camera
              </button>
            )}

            {error && (
              <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 text-base sm:text-lg">
                <Icons.AlertCircle class="w-6 h-6 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3 text-base sm:text-lg">
                <Icons.CheckCircle2 class="w-6 h-6 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {result && !showRegistration && (
              <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg text-sm sm:text-base">
                <strong>Scanned:</strong> {result}
              </div>
            )}
          </>
        )}
    </div>
  );
}
