import { createContext, useContext } from 'react';

export const PageOnscreenContext = createContext<boolean>(true);

export const useIsOnscreenPage = () => useContext(PageOnscreenContext);
