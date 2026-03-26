import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useOfflineStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    let mounted = true;
    const sub = NetInfo.addEventListener((state) => {
      if (!mounted) return;
      setIsConnected(state.isConnected ?? null);
    });
    NetInfo.fetch().then((state) => {
      if (mounted) setIsConnected(state.isConnected ?? null);
    });
    return () => {
      mounted = false;
      sub();
    };
  }, []);

  const offline = isConnected === false;
  const online = isConnected === true;
  const unknown = isConnected === null;

  return { isConnected, offline, online, unknown };
}
