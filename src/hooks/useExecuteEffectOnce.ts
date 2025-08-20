import { useEffect, useRef } from 'react';

export const useExecuteEffectOnce = (executor: () => boolean | void) => {
  const isExecuted = useRef(false);

  useEffect(() => {
    if (!isExecuted.current) {
      isExecuted.current = executor() !== false;
    }
  }, [executor]);
};
