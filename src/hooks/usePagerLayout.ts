import { useEffect, useRef, useState } from 'react';

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
  const measuredLayoutRef = useRef<Pick<
    LayoutRectangle,
    'width' | 'height'
  > | null>(null);

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
    measuredLayoutRef.current = layout;

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

  // Switching the orientation doesn't change the layout, so there is no new layout event
  useEffect(() => {
    if (measuredLayoutRef.current) {
      updateLayoutValue(measuredLayoutRef.current);
    }

    // Only the orientation matters here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVertical]);

  // Changing the page margin changes the page size but not the layout, so there is no new layout event
  useEffect(() => {
    const layout = measuredLayoutRef.current;

    // The measured layout is used instead of layoutSize, which is stale if the orientation changed in the same render
    if (layout) {
      onUpdateLayoutValue(
        getPageSize(isVertical ? layout.height : layout.width),
      );
    }

    // Only the page margin matters here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageMargin]);

  return {
    pageSize,
    contentSize,
    isLayoutMeasured,
    isLayoutHandlerCalledShared,
    layoutViewRef,
    updateLayoutValue,
  };
};
