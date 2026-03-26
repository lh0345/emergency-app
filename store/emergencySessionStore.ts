import { create } from 'zustand';

import { pickActionsForScenario } from '@/constants/scenarios';

export type EmergencySessionState = {
  scenarioId: string | null;
  sessionId: string | null;
  answers: Record<string, string>;
  actions: string[];
  startScenario: (scenarioId: string) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  computeActions: () => void;
  reset: () => void;
};

function newSessionId() {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `em-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useEmergencySessionStore = create<EmergencySessionState>((set, get) => ({
  scenarioId: null,
  sessionId: null,
  answers: {},
  actions: [],
  startScenario: (scenarioId) =>
    set({
      scenarioId,
      sessionId: newSessionId(),
      answers: {},
      actions: [],
    }),
  setAnswer: (questionId, optionId) =>
    set((s) => ({
      answers: { ...s.answers, [questionId]: optionId },
    })),
  computeActions: () => {
    const { scenarioId, answers } = get();
    if (!scenarioId) return;
    const actions = pickActionsForScenario(scenarioId, answers);
    set({ actions });
  },
  reset: () => set({ scenarioId: null, sessionId: null, answers: {}, actions: [] }),
}));
