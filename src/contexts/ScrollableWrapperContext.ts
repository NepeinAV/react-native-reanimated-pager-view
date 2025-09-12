import { createContext, useContext } from 'react';

import { type NativeGesture } from 'react-native-gesture-handler';

export type ScrollableWrapperContextValue = {
  gesture: NativeGesture;
  orientation: 'horizontal' | 'vertical';
};

export const ScrollableWrapperContext =
  createContext<ScrollableWrapperContextValue | null>(null);

export const useScrollableWrapper = () => useContext(ScrollableWrapperContext);
