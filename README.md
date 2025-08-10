# react-native-reanimated-pager-view

High-performance PagerView component for React Native, built on `react-native-reanimated v3` and `react-native-gesture-handler`. Enhanced customization capabilities and smooth animations running on the native thread.

<a href="https://www.npmjs.com/package/react-native-reanimated-pager-view"><img alt="NPM Version" src="https://img.shields.io/npm/v/react-native-reanimated-pager-view"></a>

## ✨ Features

- 🚀 **High Performance** - uses `react-native-reanimated v3` for smooth animations on the native thread
- 🎨 **Full Customization** - configure gestures, animations and behavior through callbacks
- 📱 **Platform Support** - iOS and Android
- 🔧 **TypeScript** - complete type safety out of the box
- 🎯 **Lazy loading** - deferred page loading for performance optimization
- 🖐️ **Overdrag effect** - iOS-like bounce effect when exceeding boundaries
- 👀 **Visibility tracking** - track visible pages on screen
- 🔄 **Dynamic management** - add/remove pages with automatic positioning

https://github.com/user-attachments/assets/2fbde32b-b33b-4d79-bf62-89857b5fe499


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
import { PagerView } from 'react-native-reanimated-pager-view';

const pages = [
  { id: 'page1', color: '#ff6b6b', title: 'Page 1' },
  { id: 'page2', color: '#4ecdc4', title: 'Page 2' },
  { id: 'page3', color: '#45b7d1', title: 'Page 3' },
];

const handlePageSelected = (page: number) => {
  console.log('Selected page:', page);
};

export default function App() {
  const children = useMemo(
    () =>
      pages.map((page) => (
        <View key={page.id} style={{ flex: 1, backgroundColor: page.color }}>
          <Text>{page.title}</Text>
        </View>
      )),
    []
  );

  return (
    <PagerView
      style={{ flex: 1 }}
      initialPage={0}
      onPageSelected={handlePageSelected}
    >
      {children}
    </PagerView>
  );
}
```

### ⚠️ Important: Horizontal Scrolling Inside PagerView

When using horizontal scrollable components (like FlatList, ScrollView) inside PagerView pages, you **must** use components from `react-native-gesture-handler` to avoid gesture conflicts:

```tsx
import { FlatList } from 'react-native-gesture-handler'; // ✅ Use this for horizontal lists
// import { FlatList } from 'react-native'; // ❌ DON'T use this

function MyPageWithHorizontalScroll() {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        horizontal
        renderItem={({ item }) => <ItemComponent item={item} />}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
```

This prevents gesture conflicts between the PagerView's horizontal pan gesture and the nested horizontal scroll gesture.

## 📚 API Documentation

### Basic Properties

| Property        | Type          | Default | Description                            |
| --------------- | ------------- | ------- | -------------------------------------- |
| `children`      | `ReactNode[]` | -       | Array of pages to display              |
| `style`         | `ViewStyle`   | -       | Style object for the container         |
| `initialPage`   | `number`      | `0`     | Initial page number                    |
| `scrollEnabled` | `boolean`     | `true`  | Enable pager scrolling                 |
| `pageMargin`    | `number`      | `0`     | Margin between pages                   |
| `overdrag`      | `boolean`     | `true`  | Enable iOS-like bounce overdrag effect |

### Animation Customization

| Property                   | Type     | Default | Description                                                                                             |
| -------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `overdragResistanceFactor` | `number` | `0.7`   | Resistance coefficient during overdrag                                                                  |
| `overdragThreshold`        | `number` | `100`   | Threshold for triggering overdrag callback                                                              |
| `panVelocityThreshold`     | `number` | `500`   | Minimum velocity for page switching. Note: page will switch if scrolled past 50% regardless of velocity |
| `pageActivationThreshold`  | `number` | `0.8`   | Visibility percentage for page activation                                                               |

### Callbacks

**Note:** Only `onPageScroll` should be a worklet for optimal performance. All other callbacks are called via runOnJS.

| Property                   | Type                                                  | Description                                                         |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| `onPageSelected`           | `(page: number) => void`                              | Called when a new page is selected                                  |
| `onPageScroll`             | `({ position, offset }) => void`                      | Called during scrolling and page offset changes (should be worklet) |
| `onPageScrollStateChanged` | `(state) => void`                                     | State change during scrolling                                       |
| `onDragStart`              | `() => void`                                          | Start of drag gesture                                               |
| `onDragEnd`                | `() => void`                                          | End of drag gesture                                                 |
| `onOverdrag`               | `(side: 'left'                   \| 'right') => void` | Called when overdrag threshold is reached                           |
| `onInitialMeasure`         | `() => void`                                          | Called after initial measurement of container dimensions            |

### Gesture Customization

| Property               | Type                            | Description                       |
| ---------------------- | ------------------------------- | --------------------------------- |
| `gestureConfiguration` | `(gesture: Gesture) => Gesture` | Function to customize pan gesture |

### Performance Optimization

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

| Property                          | Type             | Default                          | Description                                                                                                                                               |
| --------------------------------- | ---------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `holdCurrentPageOnChildrenUpdate` | `boolean`        | `false`                          | Maintain current page position when children array changes. Useful when pages are dynamically added/removed and you want to stay on the same logical page |
| `estimatedWidth`                  | `number \| null` | `Dimensions.get('window').width` | Expected container width. If `null`, width will be measured on first render (may cause layout shift)                                                      |

### Ref Methods

| Method                    | Type                     | Description                        |
| ------------------------- | ------------------------ | ---------------------------------- |
| `setPage`                 | `(page: number) => void` | Navigate to page with animation    |
| `setPageWithoutAnimation` | `(page: number) => void` | Navigate to page without animation |

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
    []
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

For simpler cases, you can use the `useIsOnscreenPage` hook:

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
    []
  );

  return (
    <PagerView trackOnscreen={true} trackOnscreenPageLimit={1}>
      {children}
    </PagerView>
  );
};
```

## 🎯 Advanced Examples

### Lazy Loading

```tsx
import React, { useMemo } from 'react';

const LAZY_PAGES = [
  { id: 'page1', title: 'Page 1', content: 'Heavy content 1' },
  { id: 'page2', title: 'Page 2', content: 'Heavy content 2' },
  { id: 'page3', title: 'Page 3', content: 'Heavy content 3' },
];

const handlePageSelected = (page: number) => {
  console.log('Page loaded:', page);
};

const LazyPagerExample = () => {
  const children = useMemo(
    () => LAZY_PAGES.map((page) => <LazyPage key={page.id} data={page} />),
    []
  );

  return (
    <PagerView
      lazy={true}
      lazyPageLimit={1}
      onPageSelected={handlePageSelected}
    >
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
  return gesture
    .activeOffsetX([-20, 20]) // Higher activation threshold
    .failOffsetY([-10, 10]); // Lower Y sensitivity
};

const CustomGesturePager = () => {
  const children = useMemo(
    () =>
      GESTURE_PAGES.map((page) => (
        <View key={page.id}>
          <Text>{page.title}</Text>
        </View>
      )),
    []
  );

  return (
    <PagerView gestureConfiguration={customGestureConfig} scrollEnabled={true}>
      {children}
    </PagerView>
  );
};
```

## 🔧 React Navigation Integration

### Solving iOS swipe back issue

When using with React Navigation on iOS, gesture conflict may occur when PagerView gesture are activating before the navigation gesture. Solution is to require the navigation gesture to fail before activation of PagerView gesture:

```tsx
import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { useGestureHandlerRef } from '@react-navigation/stack';

function MyPagerScreen() {
  const navigationGestureRef = useGestureHandlerRef();

  const pages = useMemo(
    () => [
      { id: 'page1', title: 'Page 1' },
      { id: 'page2', title: 'Page 2' },
      { id: 'page3', title: 'Page 3' },
    ],
    []
  );

  const customGestureConfig = useCallback(
    (gesture: Gesture) => {
      if (Platform.OS === 'ios' && navigationGestureRef) {
        return gesture.requireExternalGestureToFail(navigationGestureRef);
      }

      return gesture;
    },
    [navigationGestureRef]
  );

  const children = useMemo(
    () =>
      pages.map((page) => (
        <View key={page.id}>
          <Text>{page.title}</Text>
        </View>
      )),
    [pages]
  );

  return (
    <PagerView gestureConfiguration={customGestureConfig} scrollEnabled={true}>
      {children}
    </PagerView>
  );
}
```

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
    []
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
      estimatedWidth={screenWidth}
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
