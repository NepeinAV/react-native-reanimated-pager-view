import { createContext, useContext } from 'react';

export const PageIndexContext = createContext(0);

export const usePageIndex = () => useContext(PageIndexContext);
