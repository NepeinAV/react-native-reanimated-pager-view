import { useCallback } from 'react';

import { useActivePageStore } from '../contexts/ActivePageStoreContext';
import { usePageIndex } from '../contexts/PageIndexContext';

export const useIsOnscreenPageGetter = () => {
  const activePageStore = useActivePageStore();
  const pageIndex = usePageIndex();

  return useCallback(
    () => activePageStore.get() === pageIndex,
    [activePageStore, pageIndex],
  );
};
