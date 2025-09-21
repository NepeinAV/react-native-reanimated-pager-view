import { useSyncExternalStore } from 'react';

import { useActivePageStore } from '../contexts/ActivePageStoreContext';

export const useActivePageIndex = () => {
  const store = useActivePageStore();

  return useSyncExternalStore(store.subscribe, store.get);
};
