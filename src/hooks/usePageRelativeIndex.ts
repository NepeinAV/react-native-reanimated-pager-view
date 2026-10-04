import { useRef, useSyncExternalStore } from 'react';

import { useActivePageStore } from '../contexts/ActivePageStoreContext';
import { useLoopPageCount } from '../contexts/LoopPageCountContext';
import { usePageIndex } from '../contexts/PageIndexContext';
import { checkPageInWindow, getRelativePageIndex } from '../utils';

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
  const loopPageCount = useLoopPageCount();

  const activePageIndexRef = useRef(store.get());

  // Relative indices are computed from the current page index and page count,
  // so they don't go stale when pages are reordered or added
  return useSyncExternalStore(
    (listener) =>
      store.subscribe(() => {
        const activePageIndex = store.get();

        const needToUpdate = checkNeedUpdate({
          currentPageIndex: activePageIndex,
          currentRelativePageIndex: getRelativePageIndex(
            pageIndex,
            activePageIndexRef.current,
            loopPageCount,
          ),
          nextRelativePageIndex: getRelativePageIndex(
            pageIndex,
            activePageIndex,
            loopPageCount,
          ),
        });

        activePageIndexRef.current = activePageIndex;

        if (needToUpdate) {
          listener();
        }
      }),
    () => getRelativePageIndex(pageIndex, store.get(), loopPageCount),
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
