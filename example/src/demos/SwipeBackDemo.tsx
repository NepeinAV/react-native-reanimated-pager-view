import { useMemo, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import {
  createBounceScrollOffsetInterpolator,
  PagerView,
} from 'react-native-reanimated-pager-view';

import {
  ControlPanel,
  ControlRow,
  DemoPage,
  kitColors,
  Segmented,
  ToggleRow,
} from '../demo-kit';

const PAGE_COUNT = 4;

const EDGE_AREAS = [
  { label: '0', value: 0 },
  { label: '30', value: 30 },
  { label: '80', value: 80 },
] as const;

const bounceInterpolator = createBounceScrollOffsetInterpolator();

export const SwipeBackDemo = () => {
  const [failAtStartEdge, setFailAtStartEdge] = useState(true);
  const [edgeArea, setEdgeArea] = useState<number>(30);

  const pages = useMemo(
    () =>
      Array.from({ length: PAGE_COUNT }, (_, index) => (
        <DemoPage key={index} index={index} />
      )),
    [],
  );

  const hitSlop = useMemo(() => ({ left: -edgeArea }), [edgeArea]);

  return (
    <View style={styles.container}>
      <View style={styles.pager}>
        <PagerView
          failActivationWhenExceedingStartEdge={failAtStartEdge}
          hitSlop={hitSlop}
          scrollOffsetInterpolator={bounceInterpolator}
        >
          {pages}
        </PagerView>

        {/* Visualizes the area excluded from the pager gesture by hitSlop */}
        <View
          pointerEvents="none"
          style={[styles.edgeArea, { width: edgeArea }]}
        />
      </View>

      <ControlPanel>
        <ToggleRow
          label="failActivationWhenExceedingStartEdge"
          value={failAtStartEdge}
          onValueChange={setFailAtStartEdge}
        />
        <ControlRow label="hitSlop={{ left: -N }}">
          <Segmented
            options={EDGE_AREAS}
            value={edgeArea}
            onChange={setEdgeArea}
          />
        </ControlRow>
        <Text style={styles.hint}>
          {failAtStartEdge
            ? 'On page 1 swipe right anywhere – the screen goes back.'
            : 'On page 1 swiping right only bounces the pager. Back works from the highlighted edge area only.'}
        </Text>
      </ControlPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  edgeArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 212, 121, 0.25)',
    borderRightWidth: 1,
    borderRightColor: kitColors.code,
  },
  hint: {
    minHeight: 36,
    fontSize: 14,
    lineHeight: 18,
    color: kitColors.textSecondary,
    paddingBottom: 8,
  },
});
