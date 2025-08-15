"use client";

import { useEffect, ReactNode } from 'react';
import { useUserStore } from './userStore';

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const getEnsuredUserId = useUserStore(state => state.getEnsuredUserId);

  useEffect(() => {
    // This ensures the userId is loaded or generated when the app initializes.
    // The actual ID is then available via the store hook in other components.
    getEnsuredUserId();
  }, [getEnsuredUserId]);

  return <>{children}</>;
};
