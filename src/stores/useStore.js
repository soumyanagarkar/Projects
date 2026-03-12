// Backwards-compatible re-exports for existing Zustand stores.
// New code should prefer the dedicated stores under src/state/.

import { useUserStore } from '../state/userStore';
import { useProjectState } from '../state/projectStore';
import { useNotificationState } from '../state/notificationStore';

export const useAuthStore = useUserStore;
export const useProjectStore = useProjectState;
export const useNotificationStore = useNotificationState;
