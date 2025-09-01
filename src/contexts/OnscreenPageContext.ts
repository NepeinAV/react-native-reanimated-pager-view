import { createContext, useContext } from 'react';

export const OnscreenPageContext = createContext(true);

export const useIsOnscreenPage = () => useContext(OnscreenPageContext);
