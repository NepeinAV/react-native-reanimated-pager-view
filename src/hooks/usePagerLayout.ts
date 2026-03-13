import { useRef, useState } from 'react';

import { View, useWindowDimensions, type LayoutRectangle } from 'react-native';

import { useSharedValue } from 'react-native-reanimated';

type Params = {
  estimatedSize: number | null | undefined;
  isVertical: boolean;
  pageCount: number;
  pageMargin: number;
  onUpdateLayoutValue: (pageSize: number) => void;
};

export const usePagerLayout = ({
  estimatedSize,
  isVertical,
  pageCount,
  pageMargin,
  onUpdateLayoutValue,
}: Params) => {
  const layoutViewRef = useRef<View>(null);
  const isLayoutHandlerCalled = useRef(false);

  const isLayoutHandlerCalledShared = useSharedValue(false);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [layoutSize, setLayoutSize] = useState(() => {
    if (estimatedSize === null) {
      return null;
    }

    return estimatedSize ?? (isVertical ? windowHeight : windowWidth);
  });

  const getPageSize = (nextLayoutSize: number) => {
    return nextLayoutSize + pageMargin;
  };

  const pageSize = getPageSize(layoutSize || 0);
  const contentSize = pageCount * pageSize;

  const isLayoutMeasured = layoutSize !== null;

  const updateLayoutValue = (
    layout: Pick<LayoutRectangle, 'width' | 'height'>,
  ) => {
    let nextLayoutSize = isVertical ? layout.height : layout.width;

    const isLayoutSizeChanged = layoutSize !== nextLayoutSize;

    const isFirstCall = !isLayoutHandlerCalled.current;

    isLayoutHandlerCalled.current = true;
    isLayoutHandlerCalledShared.value = true;

    if (isLayoutSizeChanged) {
      setLayoutSize(nextLayoutSize);
    }

    if (isFirstCall || isLayoutSizeChanged) {
      onUpdateLayoutValue(getPageSize(nextLayoutSize));
    }
  };

  return {
    pageSize,
    contentSize,
    isLayoutMeasured,
    isLayoutHandlerCalledShared,
    layoutViewRef,
    updateLayoutValue,
  };
};
