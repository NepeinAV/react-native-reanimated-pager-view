import { useRef, useSyncExternalStore } from 'react';

import { useActivePageStore } from '../contexts/ActivePageStoreContext';
import { usePageIndex } from '../contexts/PageIndexContext';
import { checkPageInWindow } from '../utils';

type CheckNeedUpdateFn = (params: {
  currentPageIndex: number;
  currentRelativePageIndex: number;
  nextRelativePageIndex: number;
}) => boolean;

export const usePageRelativeIndex = (
  checkNeedUpdate: CheckNeedUpdateFn = () => true,
) => {
  const store = useActivePageStore();
  const pageIndex = usePageIndex();

  const activePageIndexRef = useRef(store.get());

  // Relative indices are computed from the current page index,
  // so they don't go stale when pages are reordered
  return useSyncExternalStore(
    (listener) =>
      store.subscribe(() => {
        const activePageIndex = store.get();

        const needToUpdate = checkNeedUpdate({
          currentPageIndex: activePageIndex,
          currentRelativePageIndex: pageIndex - activePageIndexRef.current,
          nextRelativePageIndex: pageIndex - activePageIndex,
        });

        activePageIndexRef.current = activePageIndex;

        if (needToUpdate) {
          listener();
        }
      }),
    () => pageIndex - store.get(),
  );
};

export const usePageRelativeIndexInWindow = (windowSize = 0) =>
  usePageRelativeIndex(({ currentRelativePageIndex, nextRelativePageIndex }) =>
    checkPageInWindow({
      currentRelativePageIndex,
      nextRelativePageIndex,
      windowSize,
    }),
  );
