# react-native-reanimated-pager-view

High-performance PagerView component for React Native, built on `react-native-reanimated v3` and `react-native-gesture-handler`. Enhanced customization capabilities and smooth animations running on the native thread.

<a href="https://www.npmjs.com/package/react-native-reanimated-pager-view"><img alt="NPM Version" src="https://img.shields.io/npm/v/react-native-reanimated-pager-view"></a>

## ✨ Features

- 🚀 **High Performance** - uses `react-native-reanimated v3` for smooth animations on the native thread
- 🎨 **Full Customization** - configure gestures, animations and behavior through callbacks
- ✨ **Custom Page Animations** - create stunning page transitions with `pageStyleInterpolator`
- ↔️ **Overscroll effects** - add an overscroll effect when reaching the edges (see `createBounceScrollOffsetInterpolator` for iOS-like bounce effect)
- 📱 **Platform Support** - iOS and Android
- 🔧 **TypeScript** - complete type safety out of the box
- 🎯 **Lazy loading** - deferred page loading for performance optimization
- 👀 **Visibility tracking** - track visible pages on screen
- 🔄 **Dynamic management** - add/remove pages with automatic positioning
- 📱 **Vertical Mode** - support for vertical scrolling

https://github.com/user-attachments/assets/121e4339-e74d-4946-8d73-4760cc221d34

## 🗂️ Table of Contents

- [📚 API Documentation](#-api-documentation)
  - [Basic Properties](#basic-properties)
  - [Animation Customization](#animation-customization)
  - [Page Animations](#page-animations)
  - [Scroll Offset Interpolation](#scroll-offset-interpolation)
  - [Dynamic Styling](#dynamic-styling)
  - [Callbacks](#callbacks)
  - [Gesture Customization](#gesture-customization)
  - [Performance](#performance)
  - [Page Visibility Tracking](#page-visibility-tracking)
  - [Page Management](#page-management)
  - [Ref Methods](#ref-methods)
- [🔧 ScrollableWrapper Component](#-scrollablewrapper-component)
- [👀 Page Visibility Tracking](#-page-visibility-tracking)
- [📱 Vertical Mode](#-vertical-mode)
- [🎯 Advanced Examples](#-advanced-examples)
  - [Custom Page Animations](#custom-page-animations)
  - [Lazy Loading](#lazy-loading)
  - [Gesture Customization](#gesture-customization-1)
- [🔧 React Navigation Integration](#-react-navigation-integration)
- [⚡ Performance Optimization](#-performance-optimization)

## 🚀 Quick Start

### Installation

```bash
# npm
npm install react-native-reanimated-pager-view react-native-reanimated react-native-gesture-handler

# yarn
yarn add react-native-reanimated-pager-view react-native-reanimated react-native-gesture-handler

# pnpm
pnpm add react-native-reanimated-pager-view react-native-reanimated react-native-gesture-handler

# bun
bun add react-native-reanimated-pager-view react-native-reanimated react-native-gesture-handler
```

Follow the [installation instructions](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) for react-native-reanimated and react-native-gesture-handler.

### Basic Usage

```tsx
import React, { useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import {
  PagerView,
  createBounceScrollOffsetInterpolator,
} from 'react-native-reanimated-pager-view';

const pages = [
  { id: 'page1', color: '#ff6b6b', title: 'Page 1' },
  { id: 'page2', color: '#4ecdc4', title: 'Page 2' },
  { id: 'page3', color: '#45b7d1', title: 'Page 3' },
];

// Optional: Add bounce effect
const bounceInterpolator = createBounceScrollOffsetInterpolator();

export default function App() {
  const children = useMemo(
    () =>
      pages.map((page) => (
        <View key={page.id} style={{ flex: 1, backgroundColor: page.color }}>
          <Text>{page.title}</Text>
        </View>
      )),
    [],
  );

  return (
    <PagerView scrollOffsetInterpolator={bounceInterpolator}>
      {children}
    </PagerView>
  );
}
```

### ⚠️ Important: Nested Scrollable Components

When using scrollable components inside PagerView pages, you need to prevent gesture conflicts. The library provides a [`ScrollableWrapper`](#-scrollablewrapper-component) component that automatically handles this.

## 📚 API Documentation

### Basic Properties

| Property        | Type                         | Default        | Description                                  |
| --------------- | ---------------------------- | -------------- | -------------------------------------------- |
| `children`      | `ReactNode[]`                | -              | Array of pages to display                    |
| `style`         | `ViewStyle \| PagerStyleFn`  | -              | Style object or function for the container   |
| `initialPage`   | `number`                     | `0`            | Initial page number                          |
| `scrollEnabled` | `boolean`                    | `true`         | Enable pager scrolling                       |
| `pageMargin`    | `number`                     | `0`            | Margin between pages                         |
| `orientation`   | `'horizontal' \| 'vertical'` | `'horizontal'` | Scrolling direction (horizontal or vertical) |

### Animation Customization

| Property                   | Type                       | Default | Description                                                                                                      |
| -------------------------- | -------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `pageStyleInterpolator`    | `PageStyleInterpolator`    | -       | Custom function for animating pages based on scroll position (must be a worklet)                                 |
| `scrollOffsetInterpolator` | `ScrollOffsetInterpolator` | -       | Custom scroll behavior interpolator                                                                              |
| `scrollToPageSpringConfig` | `ScrollToPageSpringConfig` | -       | Configure spring parameters used when scrolling to the target page after a drag or `setPage` (must be a worklet) |
| `panVelocityThreshold`     | `number`                   | `500`   | Minimum velocity for page switching. Note: page will switch if scrolled past 50% regardless of velocity          |
| `pageActivationThreshold`  | `number`                   | `0.8`   | Visibility percentage for page activation                                                                        |

### Page Animations

| Property                | Type                    | Description                                                                      |
| ----------------------- | ----------------------- | -------------------------------------------------------------------------------- |
| `pageStyleInterpolator` | `PageStyleInterpolator` | Custom function for animating pages based on scroll position (must be a worklet) |

The `pageStyleInterpolator` function receives:

- `pageOffset`: number - The offset between current scroll position and page index (can be negative)
- `pageIndex`: number - The page index that is being interpolated
- `pageSize`: number - The size of each page (width for horizontal, height for vertical)
- `scrollPosition`: number - The current scroll position as a floating point number

And should return a `ViewStyle` object with transform/animation properties.

⚠️ **Important**: The `pageStyleInterpolator` function must be a worklet (use `'worklet';` directive).

### Scroll Offset Interpolation

| Property                   | Type                       | Description                                                          |
| -------------------------- | -------------------------- | -------------------------------------------------------------------- |
| `scrollOffsetInterpolator` | `ScrollOffsetInterpolator` | Custom function for modifying scroll behavior and overscroll effects |

The library provides a built-in `createBounceScrollOffsetInterpolator` utility for creating iOS-like bounce effects:

```tsx
import { createBounceScrollOffsetInterpolator } from 'react-native-reanimated-pager-view';

const bounceInterpolator = createBounceScrollOffsetInterpolator({
  resistanceFactor: 0.7, // Overscroll resistance (0-1)
  threshold: 0.3, // Threshold for callback trigger
  onThresholdReached: ({ side }) => {
    console.log(`Reached ${side} boundary`);
  },
  triggerThresholdCallbackOnlyOnce: false, // Trigger callback multiple times or once per gesture
});

<PagerView scrollOffsetInterpolator={bounceInterpolator} />;
```

> You can write your own scroll offset interpolator by following the same pattern as `createBounceScrollOffsetInterpolator` 🔥.

### Dynamic Styling

The `style` prop can accept a function for dynamic styling based on scroll position:

```tsx
const rubberBandStyle: PagerStyleFn = ({ scrollPosition }) => {
  'worklet';

  return {
    transformOrigin: scrollPosition < 0 ? 'top' : 'bottom',
    transform: [
      {
        scaleY: interpolate(
          scrollPosition,
          [-1, 0, pages.length - 1, pages.length],
          [1.25, 1, 1, 1.25],
        ),
      },
    ],
  };
};

<PagerView style={rubberBandStyle} />;
```

### Callbacks

**Note:** Only `onPageScroll` should be a worklet for optimal performance. All other callbacks are called via runOnJS.

| Property                   | Type                         | Description                                                              |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------ |
| `onPageSelected`           | `(page: number) => void`     | Called when a new page is selected                                       |
| `onPageScroll`             | `(position: number) => void` | Called during scrolling with current scroll position (should be worklet) |
| `onPageScrollStateChanged` | `(state) => void`            | State change during scrolling                                            |
| `onDragStart`              | `() => void`                 | Start of drag gesture                                                    |
| `onDragEnd`                | `() => void`                 | End of drag gesture                                                      |
| `onInitialMeasure`         | `() => void`                 | Called after initial measurement of container dimensions                 |

### Gesture Customization

| Property                                 | Type                            | Description                                                                                                                                                                                                                          |
| ---------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `gestureConfiguration`                   | `(gesture: Gesture) => Gesture` | Function to customize pan gesture                                                                                                                                                                                                    |
| `activationDistance`                     | `number`                        | Minimum distance before activation (default: 10)                                                                                                                                                                                     |
| `failActivationWhenExceedingStartEdge`   | `boolean`                       | Fail gesture activation when swiping beyond **start** edge. For example, this is useful for resolving conflicts with fullscreen swipe-back navigation gesture (default: false)                                                       |
| `failActivationWhenExceedingEndEdge`     | `boolean`                       | Fail gesture activation when swiping beyond **end** edge. Allows parent gestures to handle (default: false)                                                                                                                          |
| `hitSlop`                                | `HitSlop`                       | Define touchable area for gesture recognition                                                                                                                                                                                        |
| `blockParentScrollableWrapperActivation` | `boolean` (iOS)                 | When true, PagerView's pan gesture actively blocks activation of the nearest parent `ScrollableWrapper` gesture (if any). Use to capture swipes while parent scrollable is still decelerating (momentum). (iOS only, default: false) |
| `blocksExternalGesture`                  | `ExternalGesture[]`             | Inverse (many-to-one) relation of `requireExternalGestureToFail`. Prevents listed gestures from activating simultaneously; PagerView gesture takes priority                                                                          |

### Performance

| Property             | Type      | Default | Description                                                                                                  |
| -------------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `lazy`               | `boolean` | `false` | Deferred page loading                                                                                        |
| `lazyPageLimit`      | `number`  | `1`     | Number of pages to preload                                                                                   |
| `removeClippedPages` | `boolean` | `true`  | Remove invisible pages from Native Tree. Note: enabled by default but may cause issues, use with caution ⚠️. |

### Page Visibility Tracking

Enable tracking of which pages are currently visible on screen. Useful for analytics, video playback control, or other visibility-dependent features.

| Property                 | Type      | Default | Description                                                                                                          |
| ------------------------ | --------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `trackOnscreen`          | `boolean` | `false` | Enable visibility tracking for pages                                                                                 |
| `trackOnscreenPageLimit` | `number`  | `0`     | Range of pages to consider as onscreen. 0 means only the active page, 1 means active page plus one page on each side |

### Page Management

| Property                          | Type             | Default                          | Description                                                                                                                                                |
| --------------------------------- | ---------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `holdCurrentPageOnChildrenUpdate` | `boolean`        | `false`                          | Maintain current page position when children array changes. Useful when pages are dynamically added/removed and you want to stay on the same logical page  |
| `estimatedSize`                   | `number \| null` | `Dimensions.get('window').width` | Expected container size (width for horizontal, height for vertical orientation). If `null`, size will be measured on first render (may cause layout shift) |

### Ref Methods

| Method                    | Type                     | Description                        |
| ------------------------- | ------------------------ | ---------------------------------- |
| `setPage`                 | `(page: number) => void` | Navigate to page with animation    |
| `setPageWithoutAnimation` | `(page: number) => void` | Navigate to page without animation |

## 🔧 ScrollableWrapper Component

The `ScrollableWrapper` component solves gesture conflicts when using scrollable components inside PagerView pages. It automatically detects the PagerView's orientation and configures gesture priorities to prevent conflicts. Also, it provides Twitter/𝕏-like behavior where swiping to change pages smoothly interrupts internal scrolling **and** switches to PagerView gesture (just wrap everything that can scroll 🪄).

### When to use ScrollableWrapper

Use `ScrollableWrapper` whenever you have scrollable content inside PagerView pages:

- **Vertical scrolls** inside horizontal PagerView (FlatList, ScrollView, etc.)
- **Horizontal scrolls** inside vertical PagerView (horizontal FlatList, carousel, etc.)
- **Any scrollable component** that might conflict with PagerView gestures

### Basic Usage

```tsx
import { ScrollableWrapper } from 'react-native-reanimated-pager-view';

// For vertical scrolling content in horizontal PagerView
function FeedPage() {
  return (
    <ScrollableWrapper orientation="vertical">
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostItem post={item} />}
      />
    </ScrollableWrapper>
  );
}

// For horizontal scrolling content in vertical PagerView
function HorizontalCarouselPage() {
  return (
    <ScrollableWrapper orientation="horizontal">
      <FlatList
        data={items}
        horizontal
        renderItem={({ item }) => <CarouselItem item={item} />}
      />
    </ScrollableWrapper>
  );
}
```

### Props

| Property      | Type          | Default      | Description                           |
| ------------- | ------------- | ------------ | ------------------------------------- |
| `orientation` | `Orientation` | `'vertical'` | Orientation of the scrollable content |
| `children`    | `ReactNode`   | -            | The scrollable component to wrap      |

### Advanced Usage with Multiple Scrollables

```tsx
function ComplexPage() {
  return (
    <View style={{ flex: 1 }}>
      {/* Vertical main content */}
      <ScrollableWrapper orientation="vertical">
        <ScrollView>
          <Text>Main content that scrolls vertically</Text>

          {/* Horizontal carousel within vertical scroll */}
          <ScrollableWrapper orientation="horizontal">
            <FlatList
              data={carouselItems}
              horizontal
              renderItem={({ item }) => <CarouselItem item={item} />}
            />
          </ScrollableWrapper>

          <Text>More vertical content...</Text>
        </ScrollView>
      </ScrollableWrapper>
    </View>
  );
}
```

## 👀 Page Visibility Tracking

The library provides built-in support for tracking which pages are currently visible on screen. This is useful for analytics, lazy loading content, pausing/resuming videos, or any other visibility-dependent features.

### OnscreenPage Component

A render-prop component that provides visibility state for pages. Useful for conditional rendering based on page visibility.

**Props:**

- `children: (isOnscreen: boolean) => ReactNode` - Render function that receives visibility state
- `once?: boolean` - If true, `isOnscreen` will remain true once the page becomes visible (default: false)

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { PagerView, OnscreenPage } from 'react-native-reanimated-pager-view';

const PAGES = [
  { id: 'video1', uri: 'video1.mp4' },
  { id: 'video2', uri: 'video2.mp4' },
  { id: 'video3', uri: 'video3.mp4' },
];

const VideoPage = ({ videoUri }) => {
  return (
    <OnscreenPage>
      {(isOnscreen) => (
        <View>
          <Video
            source={{ uri: videoUri }}
            paused={!isOnscreen} // Pause when page is not visible
          />
          <Text>Status: {isOnscreen ? 'Playing' : 'Paused'}</Text>
        </View>
      )}
    </OnscreenPage>
  );
};

const App = () => {
  const children = useMemo(
    () => PAGES.map((page) => <VideoPage key={page.id} videoUri={page.uri} />),
    [],
  );

  return (
    <PagerView
      trackOnscreen={true}
      trackOnscreenPageLimit={0} // Only active page is considered onscreen
    >
      {children}
    </PagerView>
  );
};
```

**Example with `once` prop:**

```tsx
const AnalyticsPage = ({ pageId }) => {
  return (
    <OnscreenPage once={true}>
      {(hasBeenVisible) => {
        // Track page view only once when it becomes visible
        if (hasBeenVisible) {
          analytics.track('page_view', { pageId });
        }

        return (
          <View>
            <Text>Page {pageId}</Text>
            <Text>Has been seen: {hasBeenVisible ? 'Yes' : 'No'}</Text>
          </View>
        );
      }}
    </OnscreenPage>
  );
};
```

### Alternative: useIsOnscreenPage Hook

You can also use the `useIsOnscreenPage` hook:

```tsx
import React, { useMemo } from 'react';
import { useIsOnscreenPage } from 'react-native-reanimated-pager-view';

const VISIBILITY_PAGES = [
  { id: 'page1', title: 'Page 1' },
  { id: 'page2', title: 'Page 2' },
  { id: 'page3', title: 'Page 3' },
];

const PageWithTracking = ({ data }) => {
  const isOnscreen = useIsOnscreenPage();

  return (
    <View>
      <Text>{data.title}</Text>
      <Text>Visible: {isOnscreen ? 'Yes' : 'No'}</Text>
    </View>
  );
};

const VisibilityTrackingExample = () => {
  const children = useMemo(
    () =>
      VISIBILITY_PAGES.map((page) => (
        <PageWithTracking key={page.id} data={page} />
      )),
    [],
  );

  return (
    <PagerView trackOnscreen={true} trackOnscreenPageLimit={1}>
      {children}
    </PagerView>
  );
};
```

## 📱 Vertical Mode

The PagerView supports vertical scrolling, perfect for creating any vertical page-based navigation.

### Basic Vertical Usage

```tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PagerView } from 'react-native-reanimated-pager-view';

const pages = [
  { id: 'page1', color: '#ff6b6b', title: 'Swipe Up' },
  { id: 'page2', color: '#4ecdc4', title: 'Keep Swiping' },
  { id: 'page3', color: '#45b7d1', title: 'Almost There' },
  { id: 'page4', color: '#96ceb4', title: 'Last Page!' },
];

// Create bounce interpolator for vertical mode
const bounceInterpolator = createBounceScrollOffsetInterpolator();

const VerticalExample = () => {
  const children = useMemo(
    () =>
      pages.map((page) => (
        <View
          key={page.id}
          style={[styles.page, { backgroundColor: page.color }]}
        >
          <Text style={styles.title}>{page.title}</Text>
        </View>
      )),
    [],
  );

  return (
    <PagerView
      style={styles.container}
      orientation="vertical"
      scrollOffsetInterpolator={bounceInterpolator}
    >
      {children}
    </PagerView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
```

## 🎯 Advanced Examples

### Custom Page Animations

```tsx
import React, { useMemo } from 'react';
import { interpolate } from 'react-native-reanimated';
import {
  PagerView,
  type PageStyleInterpolator,
} from 'react-native-reanimated-pager-view';

const ANIMATION_PAGES = [
  { id: 'page1', title: 'Page 1', color: '#ff6b6b' },
  { id: 'page2', title: 'Page 2', color: '#4ecdc4' },
  { id: 'page3', title: 'Page 3', color: '#45b7d1' },
];

const pageStyleInterpolator: PageStyleInterpolator = ({ pageOffset }) => {
  'worklet';

  const rotateY = interpolate(pageOffset, [-1, 0, 1], [60, 0, -60], 'clamp');
  const scale = interpolate(pageOffset, [-1, 0, 1], [0.8, 1, 0.8], 'clamp');

  return {
    transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }, { scale }],
  };
};

const CustomAnimationPager = () => {
  const children = useMemo(
    () =>
      ANIMATION_PAGES.map((page) => (
        <View
          key={page.id}
          style={{
            flex: 1,
            backgroundColor: page.color,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>
            {page.title}
          </Text>
        </View>
      )),
    [],
  );

  return (
    <PagerView pageStyleInterpolator={pageStyleInterpolator}>
      {children}
    </PagerView>
  );
};
```

### Lazy Loading

```tsx
import React, { useMemo } from 'react';

const LAZY_PAGES = [
  { id: 'page1', title: 'Page 1', content: 'Heavy content 1' },
  { id: 'page2', title: 'Page 2', content: 'Heavy content 2' },
  { id: 'page3', title: 'Page 3', content: 'Heavy content 3' },
];

const LazyPagerExample = () => {
  const children = useMemo(
    () => LAZY_PAGES.map((page) => <LazyPage key={page.id} data={page} />),
    [],
  );

  return (
    <PagerView lazy={true} lazyPageLimit={1}>
      {children}
    </PagerView>
  );
};
```

### Gesture Customization

```tsx
import React, { useCallback, useMemo } from 'react';

const GESTURE_PAGES = [
  { id: 'page1', title: 'Page 1' },
  { id: 'page2', title: 'Page 2' },
  { id: 'page3', title: 'Page 3' },
];

const customGestureConfig = (gesture: Gesture) => {
  // Reduce gesture area
  return gesture.hitSlop(-10);
};

const CustomGesturePager = () => {
  const children = useMemo(
    () =>
      GESTURE_PAGES.map((page) => (
        <View key={page.id}>
          <Text>{page.title}</Text>
        </View>
      )),
    [],
  );

  return (
    <PagerView gestureConfiguration={customGestureConfig} scrollEnabled={true}>
      {children}
    </PagerView>
  );
};
```

## 🔧 React Navigation Integration

When using swipe-back navigation gesture, PagerView can interfere by capturing swipes from the screen edge. These props solve the conflict:

- Use `failActivationWhenExceedingStartEdge={true}` when you want to allow fullscreen swipe-back gesture from **first** page (you should enable fullscreen swipe-back gesture in your navigation configuration too).
- Use `hitSlop` to add area on the left edge of PagerView that would allow swipe-back gesture to be recognized. You probably want this value to be equal to the value of React Navigation's `gestureResponseDistance` prop.

```tsx
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { PagerView } from 'react-native-reanimated-pager-view';

const pages = [
  { id: 'page1', color: '#ff6b6b', title: 'Page 1' },
  { id: 'page2', color: '#4ecdc4', title: 'Page 2' },
  { id: 'page3', color: '#45b7d1', title: 'Page 3' },
];

// Add 50px of non-swipeable area on the left edge
const pagerViewSwipeBackArea = { left: -50 };

export default function ScreenInStack() {
  const children = useMemo(
    () =>
      pages.map((page) => (
        <View key={page.id} style={{ flex: 1, backgroundColor: page.color }}>
          <Text>{page.title}</Text>
        </View>
      )),
    [],
  );

  return (
    <PagerView
      failActivationWhenExceedingStartEdge
      hitSlop={pagerViewSwipeBackArea}
    >
      {children}
    </PagerView>
  );
}
```

That's it! These two props ensure your PagerView works seamlessly with navigation swipe-back gesture.

> You can use the same approach for modals with vertical swipes too! 🔥

## ⚡ Performance Optimization

### Recommendations

1. **Use lazy loading** for large number of pages
2. **Optimize children** - use key props, memo, and consider wrapping all children in useMemo or extracting outside component
3. **Be careful with removeClippedPages** - while enabled by default for memory optimization, it may cause issues with complex layouts. Disable if you encounter problems, but expect potential performance impact

### Optimization Example

```tsx
// Extract pages outside component to avoid recreation
const STATIC_PAGES = [
  { id: 'page1', title: 'Page 1', color: '#ff6b6b' },
  { id: 'page2', title: 'Page 2', color: '#4ecdc4' },
  { id: 'page3', title: 'Page 3', color: '#45b7d1' },
];

const MemoizedPage = memo(({ data }) => (
  <View style={{ flex: 1, backgroundColor: data.color }}>
    <Text>{data.title}</Text>
  </View>
));

const OptimizedPager = memo(() => {
  // Memoize children to prevent recreation on re-renders
  const children = useMemo(
    () =>
      STATIC_PAGES.map((page) => <MemoizedPage key={page.id} data={page} />),
    [],
  );

  // Memoize callbacks
  const handlePageSelected = useCallback((page: number) => {
    console.log('Page selected:', page);
  }, []);

  return (
    <PagerView
      lazy={true}
      lazyPageLimit={1}
      removeClippedPages={true}
      estimatedSize={screenWidth}
      onPageSelected={handlePageSelected}
    >
      {children}
    </PagerView>
  );
});
```

## 🙏 Acknowledgments

- [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) - for the powerful animation engine
- [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler) - for the flexible gesture system
- [react-native-pager-view](https://github.com/callstack/react-native-pager-view) - for inspiration and API reference

---

**Made with ❤️ for the React Native community**
