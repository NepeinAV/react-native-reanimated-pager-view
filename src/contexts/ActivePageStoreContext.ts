import { createContext, useContext } from 'react';

export type ActivePageStoreContextValue = {
  get: () => number;
  subscribe: (listener: () => void) => () => void;
};

export const ActivePageStoreContext =
  createContext<ActivePageStoreContextValue>({
    get: () => 0,
    subscribe: () => () => {},
  });

export const useActivePageStore = () => useContext(ActivePageStoreContext);
