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

  const relativeIndexRef = useRef(pageIndex - store.get());

  return useSyncExternalStore(
    (listener) =>
      store.subscribe(() => {
        const nextRelativePageIndex = pageIndex - store.get();

        const needToUpdate = checkNeedUpdate({
          currentPageIndex: store.get(),
          currentRelativePageIndex: relativeIndexRef.current,
          nextRelativePageIndex,
        });

        relativeIndexRef.current = nextRelativePageIndex;

        if (needToUpdate) {
          listener();
        }
      }),
    () => relativeIndexRef.current,
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
