import { useCallback, useMemo, useRef } from 'react';

import type { ActivePageStoreContextValue } from '../contexts/ActivePageStoreContext';

export const useCreateActivePageStore = (initialPage: number) => {
  const activePageRef = useRef(initialPage);
  const listenersRef = useRef(new Set<() => void>());

  const store = useMemo<ActivePageStoreContextValue>(
    () => ({
      get: () => activePageRef.current,
      subscribe: (listener) => {
        listenersRef.current.add(listener);

        return () => listenersRef.current.delete(listener);
      },
    }),
    [],
  );

  const onPageSelected = useCallback((page: number) => {
    if (activePageRef.current === page) {
      return;
    }

    activePageRef.current = page;

    listenersRef.current.forEach((listener) => listener());
  }, []);

  return { store, onPageSelected } as const;
};
