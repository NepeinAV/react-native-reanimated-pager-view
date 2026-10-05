import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import {
  PagerView,
  type PagerViewRef,
} from 'react-native-reanimated-pager-view';

import {
  ControlPanel,
  DemoPage,
  EventLog,
  ToggleRow,
  useEventLog,
} from '../demo-kit';

const PAGE_COUNT = 5;
const AUTOPLAY_INTERVAL = 2000;

export const LoopDemo = () => {
  const pagerRef = useRef<PagerViewRef>(null);

  const [page, setPage] = useState(0);
  const [loop, setLoop] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const { entries, log } = useEventLog();

  const pages = useMemo(
    () =>
      Array.from({ length: PAGE_COUNT }, (_, index) => (
        <DemoPage key={index} index={index} />
      )),
    [],
  );

  // In loop mode `setPage(page + 1)` on the last page scrolls forward to the first one
  useEffect(() => {
    if (!autoplay || isDragging) return;

    const timeout = setTimeout(() => {
      pagerRef.current?.setPage(page + 1);
    }, AUTOPLAY_INTERVAL);

    return () => clearTimeout(timeout);
  }, [autoplay, isDragging, page]);

  const onPageSelected = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      log(`onPageSelected(${nextPage})`);
    },
    [log],
  );

  const onDragStart = useCallback(() => setIsDragging(true), []);
  const onDragEnd = useCallback(() => setIsDragging(false), []);

  const onLoopChange = useCallback((value: boolean) => {
    // The pager is remounted by `key`, so it starts from the first page again
    setPage(0);
    setLoop(value);
  }, []);

  return (
    <View style={styles.container}>
      <PagerView
        key={String(loop)}
        ref={pagerRef}
        loop={loop}
        onPageSelected={onPageSelected}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {pages}
      </PagerView>

      <View style={styles.dots}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === page && styles.activeDot]}
          />
        ))}
      </View>

      <ControlPanel>
        <ToggleRow label="loop" value={loop} onValueChange={onLoopChange} />
        <ToggleRow
          label="autoplay: setPage(page + 1)"
          value={autoplay}
          onValueChange={setAutoplay}
        />
        <EventLog entries={entries} lines={3} />
      </ControlPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
});
