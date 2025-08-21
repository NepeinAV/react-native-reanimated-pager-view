import { type ReactNode, useMemo, useRef } from 'react';

import { useIsOnscreenPage } from './context';

type Props = {
  once?: boolean;
  children: (isOnscreen: boolean) => ReactNode;
};

export const OnscreenPage = ({ children, once = false }: Props) => {
  const isOnscreen = useIsOnscreenPage();

  const isOnscreenRef = useRef(isOnscreen);

  const actualIsOnscreen = once
    ? isOnscreenRef.current || isOnscreen
    : isOnscreen;

  isOnscreenRef.current = actualIsOnscreen;

  return useMemo(
    () => children(actualIsOnscreen),
    [actualIsOnscreen, children],
  );
};
