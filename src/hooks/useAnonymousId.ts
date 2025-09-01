import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ANONYMOUS_ID_KEY = 'letschat-anonymous-id';

// Returns the anonymous id stored in localStorage. We try to initialize
// it synchronously (in the browser) to avoid transient nulls that can
// cause race conditions when components immediately try to use the id.
export function useAnonymousId(): string | null {
  const [anonymousId, setAnonymousId] = useState<string | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      let stored = localStorage.getItem(ANONYMOUS_ID_KEY);
      if (!stored) {
        stored = uuidv4();
        // localStorage can throw in some environments (privacy modes), so guard it
        try { localStorage.setItem(ANONYMOUS_ID_KEY, stored); } catch (e) { /* ignore */ }
      }
      return stored;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(ANONYMOUS_ID_KEY);
      if (!stored) {
        const id = uuidv4();
        try { localStorage.setItem(ANONYMOUS_ID_KEY, id); } catch (e) { /* ignore */ }
        setAnonymousId(id);
      } else {
        setAnonymousId(stored);
      }
    } catch (e) {
      // If localStorage is unavailable, keep null — callers should handle it.
    }
  }, []);

  return anonymousId;
}
