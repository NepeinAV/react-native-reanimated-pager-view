import { CONSTANTS } from '../constants';

export interface FlatListConfig {
  removeClippedSubviews: boolean;
  maxToRenderPerBatch: number;
  windowSize: number;
  initialNumToRender: number;
  showsVerticalScrollIndicator: boolean;
}

export const useOptimizedFlatListConfig = (): FlatListConfig => ({
  removeClippedSubviews: true,
  maxToRenderPerBatch: CONSTANTS.FLATLIST_CONFIG.MAX_TO_RENDER_PER_BATCH,
  windowSize: CONSTANTS.FLATLIST_CONFIG.WINDOW_SIZE,
  initialNumToRender: CONSTANTS.FLATLIST_CONFIG.INITIAL_NUM_TO_RENDER,
  showsVerticalScrollIndicator: false,
});

export const keyExtractorById = <T extends { id: string }>(item: T) => item.id;
