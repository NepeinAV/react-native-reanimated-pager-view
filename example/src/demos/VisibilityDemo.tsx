import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import {
  PagerView,
  useActivePageIndex,
  useIsOnscreenPage,
  usePageRelativeIndex,
} from 'react-native-reanimated-pager-view';

import {
  ControlPanel,
  ControlRow,
  DemoPage,
  EventLog,
  getPageColor,
  kitColors,
  monospace,
  Segmented,
  ToggleRow,
  useEventLog,
} from '../demo-kit';

const PAGE_COUNT = 8;

const LAZY_PAGE_LIMITS = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
] as const;

type TrackedPageProps = {
  index: number;
  onMountChange: (index: number, isMounted: boolean) => void;
};

const TrackedPage = memo(({ index, onMountChange }: TrackedPageProps) => {
  const isOnscreen = useIsOnscreenPage();
  const relativeIndex = usePageRelativeIndex();
  const activePageIndex = useActivePageIndex();

  useEffect(() => {
    onMountChange(index, true);

    return () => onMountChange(index, false);
  }, [index, onMountChange]);

  return (
    <DemoPage index={index}>
      <View style={styles.badges}>
        <Text style={[styles.badge, isOnscreen && styles.badgeActive]}>
          {isOnscreen
            ? '👀 useIsOnscreenPage: true'
            : 'useIsOnscreenPage: false'}
        </Text>
        <Text style={styles.badge}>usePageRelativeIndex: {relativeIndex}</Text>
        <Text style={styles.badge}>useActivePageIndex: {activePageIndex}</Text>
      </View>
    </DemoPage>
  );
});

export const VisibilityDemo = () => {
  const [lazy, setLazy] = useState(true);
  const [lazyPageLimit, setLazyPageLimit] = useState<number>(1);
  const [mountedPages, setMountedPages] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [activePage, setActivePage] = useState(0);

  const { entries, log } = useEventLog();

  const onMountChange = useCallback(
    (index: number, isMounted: boolean) => {
      log(`Page ${index + 1} ${isMounted ? 'mounted' : 'unmounted'}`);

      setMountedPages((prev) => {
        const next = new Set(prev);

        if (isMounted) {
          next.add(index);
        } else {
          next.delete(index);
        }

        return next;
      });
    },
    [log],
  );

  const pages = useMemo(
    () =>
      Array.from({ length: PAGE_COUNT }, (_, index) => (
        <TrackedPage key={index} index={index} onMountChange={onMountChange} />
      )),
    [onMountChange],
  );

  return (
    <View style={styles.container}>
      <View style={styles.cells}>
        {pages.map((_, index) => {
          const isMounted = mountedPages.has(index);

          return (
            <View
              key={index}
              style={[
                styles.cell,
                isMounted && { backgroundColor: getPageColor(index) },
                index === activePage && styles.activeCell,
              ]}
            >
              <Text style={[styles.cellText, !isMounted && styles.dimmed]}>
                {index + 1}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.legend}>
        Colored – rendered, outlined – active page
      </Text>

      <PagerView
        // Remount to see the lazy loading from scratch
        key={`${lazy}-${lazyPageLimit}`}
        lazy={lazy}
        lazyPageLimit={lazyPageLimit}
        onPageSelected={setActivePage}
      >
        {pages}
      </PagerView>

      <ControlPanel>
        <ToggleRow
          label="lazy"
          value={lazy}
          onValueChange={(value) => {
            setActivePage(0);
            setLazy(value);
          }}
        />
        <ControlRow label="lazyPageLimit">
          <View
            pointerEvents={lazy ? 'auto' : 'none'}
            style={!lazy && styles.dimmed}
          >
            <Segmented
              options={LAZY_PAGE_LIMITS}
              value={lazyPageLimit}
              onChange={(value) => {
                setActivePage(0);
                setLazyPageLimit(value);
              }}
            />
          </View>
        </ControlRow>
        <EventLog entries={entries} lines={3} />
      </ControlPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cells: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cell: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: kitColors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCell: {
    borderColor: '#fff',
  },
  cellText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  dimmed: {
    opacity: 0.35,
  },
  legend: {
    fontSize: 12,
    color: kitColors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  badges: {
    gap: 6,
    alignItems: 'center',
  },
  badge: {
    fontFamily: monospace,
    fontSize: 12,
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  badgeActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});
