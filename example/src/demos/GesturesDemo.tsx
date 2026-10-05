import { useCallback, useMemo, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { PagerView } from 'react-native-reanimated-pager-view';

import {
  ControlPanel,
  ControlRow,
  DemoPage,
  EventLog,
  Segmented,
  useEventLog,
} from '../demo-kit';

const PAGE_COUNT = 5;

const ACTIVATION_DISTANCES = [
  { label: '10', value: 10 },
  { label: '40', value: 40 },
  { label: '80', value: 80 },
] as const;

const VELOCITY_THRESHOLDS = [
  { label: '100', value: 100 },
  { label: '500', value: 500 },
  { label: '3000', value: 3000 },
] as const;

const DIRECTION_TOLERANCES = [
  { label: '15°', value: 15 },
  { label: '45°', value: 45 },
  { label: '75°', value: 75 },
] as const;

const ACTIVATION_THRESHOLDS = [
  { label: '0.3', value: 0.3 },
  { label: '0.8', value: 0.8 },
  { label: '1', value: 1 },
] as const;

export const GesturesDemo = () => {
  const [activationDistance, setActivationDistance] = useState<number>(10);
  const [panVelocityThreshold, setPanVelocityThreshold] = useState<number>(500);
  const [directionTolerance, setDirectionTolerance] = useState<number>(45);
  const [pageActivationThreshold, setPageActivationThreshold] =
    useState<number>(0.8);

  const { entries, log } = useEventLog();

  const pages = useMemo(
    () =>
      Array.from({ length: PAGE_COUNT }, (_, index) => (
        <DemoPage key={index} index={index} />
      )),
    [],
  );

  const onPageSelected = useCallback(
    (page: number) => log(`onPageSelected(${page})`),
    [log],
  );
  const onDragStart = useCallback(() => log('onDragStart()'), [log]);
  const onDragEnd = useCallback(() => log('onDragEnd()'), [log]);

  return (
    <View style={styles.container}>
      <PagerView
        activationDistance={activationDistance}
        panVelocityThreshold={panVelocityThreshold}
        gestureDirectionToleranceDeg={directionTolerance}
        pageActivationThreshold={pageActivationThreshold}
        onPageSelected={onPageSelected}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {pages}
      </PagerView>

      <ControlPanel>
        <ControlRow label="activationDistance">
          <Segmented
            options={ACTIVATION_DISTANCES}
            value={activationDistance}
            onChange={setActivationDistance}
          />
        </ControlRow>
        <ControlRow label="panVelocityThreshold">
          <Segmented
            options={VELOCITY_THRESHOLDS}
            value={panVelocityThreshold}
            onChange={setPanVelocityThreshold}
          />
        </ControlRow>
        <ControlRow label="gestureDirectionToleranceDeg">
          <Segmented
            options={DIRECTION_TOLERANCES}
            value={directionTolerance}
            onChange={setDirectionTolerance}
          />
        </ControlRow>
        <ControlRow label="pageActivationThreshold">
          <Segmented
            options={ACTIVATION_THRESHOLDS}
            value={pageActivationThreshold}
            onChange={setPageActivationThreshold}
          />
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
});
