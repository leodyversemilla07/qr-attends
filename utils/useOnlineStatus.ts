import * as Network from 'expo-network';
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  async function checkNetwork() {
    try {
        const state = await Network.getNetworkStateAsync();
        setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    } catch (e) {
        // Assume offline if check fails
        setIsOnline(false);
    }
  }

  useEffect(() => {
    checkNetwork();
    // Poll every 5 seconds (Simple solution)
    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  return isOnline;
}
