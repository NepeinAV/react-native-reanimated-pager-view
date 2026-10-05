import { useMemo, useState, type ReactNode } from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PagerView,
  type PageStyleInterpolator,
} from 'react-native-reanimated-pager-view';

import { CardStack } from '../components/CardStack';
import { IOSWidgetCarousel } from '../components/IOSWidgetCarousel';
import { ControlPanel, DemoPage, kitColors, Segmented } from '../demo-kit';
import {
  cubePageInterpolator,
  peekPageInterpolator,
  zoomPageInterpolator,
} from '../interpolators';

type Preset = 'cube' | 'zoom' | 'peek' | 'stack' | 'widgets';

const PRESETS = [
  { label: 'Cube', value: 'cube' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Peek', value: 'peek' },
  { label: 'Stack', value: 'stack' },
  { label: 'Widgets', value: 'widgets' },
] as const;

const DESCRIPTIONS: Record<Preset, string> = {
  cube: 'rotateY + scale from pageOffset. The same interpolator animates the tabs of the showcase app.',
  zoom: 'Neighbour pages shrink and fade out as they leave the screen.',
  peek: 'Pages shrink and translateX pulls the neighbours closer, so they peek out from the edges – a classic carousel.',
  stack:
    'Pages ahead of the current one are stacked behind it. Uses removeClippedPages={false} to keep them all on screen.',
  widgets:
    'iOS-like widget stack: pages of different size, loop and a softer scrollToPageSpringConfig.',
};

const PAGE_INTERPOLATORS: Partial<Record<Preset, PageStyleInterpolator>> = {
  cube: cubePageInterpolator,
  zoom: zoomPageInterpolator,
  peek: peekPageInterpolator,
};

const PAGE_COUNT = 6;

const InterpolatedPager = ({ preset }: { preset: Preset }) => {
  const pages = useMemo(
    () =>
      Array.from({ length: PAGE_COUNT }, (_, index) => (
        <DemoPage key={index} index={index} />
      )),
    [],
  );

  return (
    <PagerView
      key={preset}
      pageStyleInterpolator={PAGE_INTERPOLATORS[preset]}
      removeClippedPages={false}
    >
      {pages}
    </PagerView>
  );
};

// These carousels live in the feed of the showcase app and take the height of their content,
// so they are rendered the same way: inside a scroll view sized by its content
const FeedLike = ({ children }: { children: ReactNode }) => (
  <View style={styles.centered}>
    <ScrollView scrollEnabled={false} style={styles.feedLike}>
      {children}
    </ScrollView>
  </View>
);

const renderPreset = (preset: Preset) => {
  switch (preset) {
    case 'stack':
      return (
        <FeedLike>
          <CardStack />
        </FeedLike>
      );

    case 'widgets':
      return (
        <FeedLike>
          <IOSWidgetCarousel />
        </FeedLike>
      );

    default:
      return <InterpolatedPager preset={preset} />;
  }
};

export const PageAnimationsDemo = () => {
  const [preset, setPreset] = useState<Preset>('cube');

  return (
    <View style={styles.container}>
      <View style={styles.stage}>{renderPreset(preset)}</View>

      <ControlPanel>
        <Segmented
          options={PRESETS}
          value={preset}
          onChange={setPreset}
          style={styles.segmented}
        />
        <Text style={styles.description}>{DESCRIPTIONS[preset]}</Text>
      </ControlPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  feedLike: {
    flexGrow: 0,
  },
  segmented: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  description: {
    minHeight: 54,
    fontSize: 14,
    lineHeight: 18,
    color: kitColors.textSecondary,
    paddingBottom: 8,
  },
});
