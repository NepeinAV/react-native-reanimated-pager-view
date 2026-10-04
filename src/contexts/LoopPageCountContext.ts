import { createContext, useContext } from 'react';

/**
 * Page count of the nearest PagerView when loop mode is enabled, otherwise `null`.
 */
export const LoopPageCountContext = createContext<number | null>(null);

export const useLoopPageCount = () => useContext(LoopPageCountContext);
