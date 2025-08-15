import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface UserState {
  userId: string | null;
  getEnsuredUserId: () => string;
}

// Helper function to encapsulate localStorage logic for userId
// This function interacts with a specific localStorage key directly.
const getOrInitializeLegacyUserId = (): string => {
  if (typeof window === 'undefined') {
    return `server-temp-${uuidv4()}`;
  }
  let storedUserId = localStorage.getItem('letschat_anonymous_user_id');
  if (!storedUserId) {
    storedUserId = uuidv4();
    localStorage.setItem('letschat_anonymous_user_id', storedUserId);
  }
  return storedUserId;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      getEnsuredUserId: () => {
        let currentId = get().userId;
        if (!currentId) {
          // If store's userId is null (e.g. first load, or after clearing 'letschat-user-storage'),
          // try to get it from our legacy/direct localStorage item or generate new.
          currentId = getOrInitializeLegacyUserId();
          set({ userId: currentId });
        }
        // Ensure the legacy key is also updated if store had a different ID or was null
        // This might happen if 'letschat-user-storage' was populated but 'letschat_anonymous_user_id' was cleared.
        if (typeof window !== 'undefined' && localStorage.getItem('letschat_anonymous_user_id') !== currentId) {
            localStorage.setItem('letschat_anonymous_user_id', currentId);
        }
        return currentId;
      },
    }),
    {
      name: 'letschat-user-storage', // Name for Zustand's own persisted state
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userId: state.userId }),
      onRehydrateStorage: (state) => {
        // This is called when state is rehydrated from 'letschat-user-storage'
        return (rehydratedState, error) => {
          if (error) {
            console.error("Failed to rehydrate user store:", error);
          }
          if (rehydratedState) {
            // If rehydrated userId is null or undefined, try to initialize it
            // from the legacy key or generate a new one.
            if (!rehydratedState.userId) {
              const legacyId = getOrInitializeLegacyUserId();
              rehydratedState.userId = legacyId; // Directly set on the rehydrated state object
                                                // This ensures the store starts with a valid ID.
            }
          }
        }
      }
    }
  )
);

// To ensure the store is initialized as soon as possible, especially if localStorage ('letschat-user-storage') is empty.
// This will run getEnsuredUserId once when the store module is first imported if not in SSR.
if (typeof window !== 'undefined') {
    useUserStore.getState().getEnsuredUserId();
}
