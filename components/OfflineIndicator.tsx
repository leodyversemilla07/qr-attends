// Offline indicator component
import { useOnlineStatus } from "../utils/useOnlineStatus.ts";
import { Icons } from "./Icons.tsx";

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div class="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center font-medium flex items-center justify-center gap-2 shadow-lg">
      <Icons.WifiOff class="w-5 h-5" />
      <span>
        You're offline - Changes will sync when connection is restored
      </span>
    </div>
  );
}
