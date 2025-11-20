import { useMemo, type PropsWithChildren } from 'react';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { usePager } from './contexts/PagerContext';
import { ScrollableWrapperContext } from './contexts/ScrollableWrapperContext';

import type { Orientation } from './types';

type Props = PropsWithChildren<{
  /**
   * Orientation of the scrollable area
   *
   * @default 'vertical'
   */
  orientation: Orientation;
}>;

export const ScrollableWrapper = ({
  children,
  orientation = 'vertical',
}: Props) => {
  const pagerView = usePager();

  const gesture = useMemo(
    () => Gesture.Native().disallowInterruption(true),
    [],
  );

  const contextValue = useMemo(
    () => ({ gesture, orientation }),
    [gesture, orientation],
  );

  if (pagerView && pagerView.orientation !== orientation) {
    gesture
      .requireExternalGestureToFail(pagerView.panGesture)
      .simultaneousWithExternalGesture(pagerView.panGesture);
  }

  return (
    <ScrollableWrapperContext.Provider value={contextValue}>
      {pagerView ? (
        <GestureDetector gesture={gesture}>{children}</GestureDetector>
      ) : (
        children
      )}
    </ScrollableWrapperContext.Provider>
  );
};
