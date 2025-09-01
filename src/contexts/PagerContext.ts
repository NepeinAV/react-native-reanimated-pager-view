import { createContext, useContext } from 'react';

import { type PanGesture } from 'react-native-gesture-handler';

import type { Orientation } from '../types';

export type PagerContextValue = {
  panGesture: PanGesture;
  orientation: Orientation;
};

export const PagerContext = createContext<PagerContextValue | null>(null);

export const usePager = () => {
  return useContext(PagerContext);
};
