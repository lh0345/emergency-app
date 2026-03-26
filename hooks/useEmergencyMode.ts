import { useRouter } from 'expo-router';

import { useEmergencySessionStore } from '@/store/emergencySessionStore';

/** Entry helpers for Emergency Mode navigation */
export function useEmergencyMode() {
  const router = useRouter();
  const startScenario = useEmergencySessionStore((s) => s.startScenario);
  const reset = useEmergencySessionStore((s) => s.reset);

  const openEmergencyHome = () => {
    reset();
    router.push('/emergency');
  };

  const openScenario = (scenarioId: string) => {
    startScenario(scenarioId);
    router.push(`/emergency/${scenarioId}`);
  };

  return { openEmergencyHome, openScenario };
}
