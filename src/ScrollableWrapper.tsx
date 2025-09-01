import { useMemo, type PropsWithChildren } from 'react';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { usePager } from './contexts/PagerContext';

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

  if (!pagerView) {
    return children;
  }

  if (pagerView.orientation !== orientation && pagerView.panGesture) {
    gesture.requireExternalGestureToFail(pagerView.panGesture);
  }

  return <GestureDetector gesture={gesture}>{children}</GestureDetector>;
};
