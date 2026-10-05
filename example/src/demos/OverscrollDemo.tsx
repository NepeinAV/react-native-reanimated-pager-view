import { useCallback, useMemo, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import {
  createBounceScrollOffsetInterpolator,
  getOverscrollOffset,
  PagerView,
  type OverscrollSide,
  type PagerStyleFn,
  type ScrollPosition,
} from 'react-native-reanimated-pager-view';

import {
  ControlPanel,
  ControlRow,
  DemoPage,
  EventLog,
  kitColors,
  Segmented,
  useEventLog,
} from '../demo-kit';

type Mode = 'bounce' | 'rubber' | 'none';

const MODES = [
  { label: 'Bounce', value: 'bounce' },
  { label: 'Rubber band', value: 'rubber' },
  { label: 'None', value: 'none' },
] as const;

const RESISTANCE_FACTORS = [
  { label: '0.3', value: 0.3 },
  { label: '0.7', value: 0.7 },
  { label: '0.9', value: 0.9 },
] as const;

const PAGE_COUNT = 3;

// Stretches the whole pager when the user drags beyond the first or the last page
const rubberBandStyle: PagerStyleFn = ({ scrollPosition }) => {
  'worklet';

  return {
    transformOrigin: scrollPosition < 0 ? 'left' : 'right',
    transform: [
      {
        scaleX: interpolate(
          scrollPosition,
          [-1, 0, PAGE_COUNT - 1, PAGE_COUNT],
          [1.25, 1, 1, 1.25],
        ),
      },
    ],
  };
};

// Without scrollOffsetInterpolator the position passed to onPageScroll
// is clamped to the edges, so the meter stays empty
const OverscrollMeter = ({
  scrollPosition,
}: {
  scrollPosition: SharedValue<number>;
}) => {
  const fillStyle = useAnimatedStyle(() => {
    const offset = getOverscrollOffset(scrollPosition.value, PAGE_COUNT - 1);

    return {
      width: `${Math.min(Math.abs(offset) * 100, 50)}%`,
      left: offset < 0 ? undefined : '50%',
      right: offset < 0 ? '50%' : undefined,
    };
  });

  return (
    <View style={styles.meter}>
      <Animated.View style={[styles.meterFill, fillStyle]} />
      <View style={styles.meterCenter} />
    </View>
  );
};

export const OverscrollDemo = () => {
  const [mode, setMode] = useState<Mode>('bounce');
  const [resistanceFactor, setResistanceFactor] = useState<number>(0.7);
  const [thresholdSide, setThresholdSide] = useState<OverscrollSide | null>(
    null,
  );

  const scrollPosition = useSharedValue(0);
  const { entries, log } = useEventLog();

  const onThresholdReached = useCallback(
    ({ side }: { side: OverscrollSide }) => {
      log(`onThresholdReached({ side: '${side}' })`);
      setThresholdSide(side);
    },
    [log],
  );

  const bounceInterpolator = useMemo(
    () =>
      createBounceScrollOffsetInterpolator({
        resistanceFactor,
        onThresholdReached,
        triggerThresholdCallbackOnlyOnce: true,
      }),
    [resistanceFactor, onThresholdReached],
  );

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

  const onDragStart = useCallback(() => setThresholdSide(null), []);

  return (
    <View style={styles.container}>
      <PagerView
        style={mode === 'rubber' ? rubberBandStyle : undefined}
        scrollOffsetInterpolator={
          mode === 'bounce' ? bounceInterpolator : undefined
        }
        onPageScroll={onPageScroll}
        onDragStart={onDragStart}
      >
        {pages}
      </PagerView>

      <View style={styles.thresholdArea}>
        <Text style={styles.thresholdText}>
          {thresholdSide
            ? `🎯 Pulled past the ${thresholdSide} edge – e.g. "load more" or "close"`
            : ' '}
        </Text>
      </View>

      <ControlPanel>
        <ControlRow label="getOverscrollOffset">
          <OverscrollMeter scrollPosition={scrollPosition} />
        </ControlRow>

        <ControlRow label="effect">
          <Segmented options={MODES} value={mode} onChange={setMode} />
        </ControlRow>

        <ControlRow label="resistanceFactor">
          <View
            pointerEvents={mode === 'bounce' ? 'auto' : 'none'}
            style={mode !== 'bounce' && styles.disabled}
          >
            <Segmented
              options={RESISTANCE_FACTORS}
              value={resistanceFactor}
              onChange={setResistanceFactor}
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
  thresholdArea: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  thresholdText: {
    textAlign: 'center',
    fontSize: 14,
    color: kitColors.code,
  },
  meter: {
    width: 140,
    height: 8,
    borderRadius: 4,
    backgroundColor: kitColors.surfaceRaised,
    overflow: 'hidden',
  },
  meterFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: kitColors.code,
  },
  meterCenter: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: kitColors.textSecondary,
  },
  disabled: {
    opacity: 0.35,
  },
});
