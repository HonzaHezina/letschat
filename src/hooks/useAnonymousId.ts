import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ANONYMOUS_ID_KEY = 'letschat-anonymous-id';

export function useAnonymousId(): string | null {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    // This code runs only on the client side
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem(ANONYMOUS_ID_KEY);
      if (!storedId) {
        storedId = uuidv4();
        localStorage.setItem(ANONYMOUS_ID_KEY, storedId);
      }
      setAnonymousId(storedId);
    }
  }, []);

  return anonymousId;
}
