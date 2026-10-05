import { useCallback, useMemo, useRef, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { useSharedValue } from 'react-native-reanimated';
import {
  PagerView,
  type PagerViewRef,
  type ScrollPosition,
  type ScrollState,
} from 'react-native-reanimated-pager-view';

import {
  AnimatedNumber,
  Button,
  ButtonRow,
  ControlPanel,
  ControlRow,
  DemoPage,
  EventLog,
  Segmented,
  Stat,
  StatRow,
  ToggleRow,
  useEventLog,
} from '../demo-kit';

const PAGE_COUNT = 5;

const PAGE_MARGINS = [
  { label: '0', value: 0 },
  { label: '16', value: 16 },
  { label: '48', value: 48 },
] as const;

export const BasicsDemo = () => {
  const pagerRef = useRef<PagerViewRef>(null);
  const scrollPosition = useSharedValue(0);

  const [page, setPage] = useState(0);
  const [scrollState, setScrollState] = useState<ScrollState>('idle');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [pageMargin, setPageMargin] = useState<number>(0);

  const { entries, log } = useEventLog();

  const pages = useMemo(
    () =>
      Array.from({ length: PAGE_COUNT }, (_, index) => (
        <DemoPage key={index} index={index} />
      )),
    [],
  );

  const onPageScroll = useCallback(
    (position: ScrollPosition) => {
      'worklet';

      scrollPosition.value = position;
    },
    [scrollPosition],
  );

  const onPageSelected = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      log(`onPageSelected(${nextPage})`);
    },
    [log],
  );

  const onPageScrollStateChanged = useCallback(
    (state: ScrollState) => {
      setScrollState(state);
      log(`onPageScrollStateChanged('${state}')`);
    },
    [log],
  );

  const onDragStart = useCallback(() => log('onDragStart()'), [log]);
  const onDragEnd = useCallback(() => log('onDragEnd()'), [log]);
  const onInitialMeasure = useCallback(() => log('onInitialMeasure()'), [log]);

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        scrollEnabled={scrollEnabled}
        pageMargin={pageMargin}
        onPageScroll={onPageScroll}
        onPageSelected={onPageSelected}
        onPageScrollStateChanged={onPageScrollStateChanged}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onInitialMeasure={onInitialMeasure}
      >
        {pages}
      </PagerView>

      <ControlPanel>
        <StatRow>
          <Stat label="onPageSelected">{`${page}`}</Stat>
          <Stat label="onPageScroll">
            <AnimatedNumber value={scrollPosition} />
          </Stat>
          <Stat label="scroll state">{scrollState}</Stat>
        </StatRow>

        <ButtonRow>
          <Button
            title="‹ setPage"
            disabled={page === 0}
            onPress={() => pagerRef.current?.setPage(page - 1)}
          />
          <Button
            title="setPage ›"
            disabled={page === PAGE_COUNT - 1}
            onPress={() => pagerRef.current?.setPage(page + 1)}
          />
          <Button
            title={`Jump to ${page === 0 ? PAGE_COUNT : 1} instantly`}
            onPress={() =>
              pagerRef.current?.setPageWithoutAnimation(
                page === 0 ? PAGE_COUNT - 1 : 0,
              )
            }
          />
        </ButtonRow>

        <ToggleRow
          label="scrollEnabled"
          value={scrollEnabled}
          onValueChange={setScrollEnabled}
        />

        <ControlRow label="pageMargin">
          <Segmented
            options={PAGE_MARGINS}
            value={pageMargin}
            onChange={setPageMargin}
          />
        </ControlRow>

        <EventLog entries={entries} lines={4} />
      </ControlPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
