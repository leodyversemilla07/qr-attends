// Hook for managing offline state in components
import { useEffect, useState } from "preact/hooks";
import { getOfflineManager } from "../utils/offline-manager.ts";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const manager = getOfflineManager();

    // Set initial status
    setIsOnline(manager.getOnlineStatus());

    // Listen for changes
    const listener = (online: boolean) => {
      setIsOnline(online);
    };

    manager.onStatusChange(listener);

    // Cleanup
    return () => {
      manager.removeStatusListener(listener);
    };
  }, []);

  return isOnline;
}
