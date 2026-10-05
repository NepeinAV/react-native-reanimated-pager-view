import type { ComponentType } from 'react';

import { NotificationTabs } from '../components/NotificationTabs';
import { Shorts } from '../components/Shorts';
import { BasicsDemo } from '../demos/BasicsDemo';
import { DynamicPagesDemo } from '../demos/DynamicPagesDemo';
import { GesturesDemo } from '../demos/GesturesDemo';
import { LoopDemo } from '../demos/LoopDemo';
import { NestedScrollDemo } from '../demos/NestedScrollDemo';
import { OverscrollDemo } from '../demos/OverscrollDemo';
import { PageAnimationsDemo } from '../demos/PageAnimationsDemo';
import { SwipeBackDemo } from '../demos/SwipeBackDemo';
import { VisibilityDemo } from '../demos/VisibilityDemo';

export type DemoId =
  | 'basics'
  | 'tabs'
  | 'vertical'
  | 'loop'
  | 'page-animations'
  | 'overscroll'
  | 'nested-scroll'
  | 'gestures'
  | 'swipe-back'
  | 'visibility'
  | 'dynamic-pages';

export type Demo = {
  id: DemoId;
  icon: string;
  title: string;
  /** What the use case is about, shown in the catalog and on top of the demo */
  summary: string;
  /** What to do on the demo screen to see the feature */
  tryIt: string[];
  /** Props, hooks and helpers the demo is built with */
  api: string[];
  component: ComponentType;
  /** Swipe back from anywhere on the screen, not only from the edge */
  fullScreenSwipeBack?: boolean;
};

export type DemoSection = {
  title: string;
  data: Demo[];
};

export const DEMO_SECTIONS: DemoSection[] = [
  {
    title: 'Basics',
    data: [
      {
        id: 'basics',
        icon: '👆',
        title: 'Pager & callbacks',
        summary:
          'A plain horizontal pager controlled from code, with every callback logged.',
        tryIt: [
          'Swipe a page and scroll the log to see the order of callbacks',
          'Use the buttons to call setPage / setPageWithoutAnimation',
          'Turn off scrollEnabled, change pageMargin',
        ],
        api: [
          'ref.setPage',
          'ref.setPageWithoutAnimation',
          'onPageSelected',
          'onPageScroll',
          'onPageScrollStateChanged',
          'onDragStart / onDragEnd',
          'scrollEnabled',
          'pageMargin',
        ],
        component: BasicsDemo,
      },
      {
        id: 'tabs',
        icon: '🗂️',
        title: 'Tabs with animated indicator',
        summary:
          'Segmented tabs whose indicator follows the finger, driven by onPageScroll on the UI thread.',
        tryIt: [
          'Drag between pages slowly – the indicator follows your finger',
          'Tap a tab to jump to it with setPage',
          'Scroll a list vertically, then swipe sideways',
        ],
        api: [
          'onPageScroll',
          'onPageSelected',
          'ref.setPage',
          'ScrollableWrapper',
        ],
        component: NotificationTabs,
      },
    ],
  },
  {
    title: 'Modes',
    data: [
      {
        id: 'vertical',
        icon: '📺',
        title: 'Vertical pager (Shorts)',
        summary:
          'Full-screen vertical feed like TikTok or Shorts, stretching like a rubber band at the edges.',
        tryIt: [
          'Swipe up and down between videos',
          'Pull down on the first video or up on the last one',
        ],
        api: ['orientation="vertical"', 'style={(params) => …}'],
        component: Shorts,
      },
      {
        id: 'loop',
        icon: '♾️',
        title: 'Infinite loop & autoplay',
        summary:
          'The first page follows the last one. Autoplay is just setPage(page + 1) on a timer.',
        tryIt: [
          'Swipe past the last page – the first one comes next',
          'Drag a page to pause autoplay',
          'Turn off loop – autoplay stops at the last page',
        ],
        api: ['loop', 'ref.setPage(page + 1)', 'onDragStart / onDragEnd'],
        component: LoopDemo,
      },
    ],
  },
  {
    title: 'Look & feel',
    data: [
      {
        id: 'page-animations',
        icon: '🎨',
        title: 'Custom page transitions',
        summary:
          'Cube, zoom, carousel, card stack and widget stack – all made with one worklet function.',
        tryIt: [
          'Pick a preset below and swipe slowly',
          'Each effect is a worklet that turns pageOffset of a page into its style',
        ],
        api: [
          'pageStyleInterpolator',
          'removeClippedPages',
          'scrollToPageSpringConfig',
        ],
        component: PageAnimationsDemo,
      },
      {
        id: 'overscroll',
        icon: '↔️',
        title: 'Overscroll effects',
        summary:
          'What happens when the user drags beyond the first or the last page.',
        tryIt: [
          'Drag the first page right or the last page left',
          'Compare the effects and resistance factors',
          'Pull far enough to trigger onThresholdReached',
        ],
        api: [
          'createBounceScrollOffsetInterpolator',
          'scrollOffsetInterpolator',
          'onThresholdReached',
          'style={(params) => …}',
          'getOverscrollOffset',
        ],
        component: OverscrollDemo,
      },
    ],
  },
  {
    title: 'Gestures',
    data: [
      {
        id: 'nested-scroll',
        icon: '🧩',
        title: 'Scrollables inside pages',
        summary:
          'Vertical lists, horizontal scroll views and nested pagers inside pages, without gesture conflicts.',
        tryIt: [
          'Scroll the list, the chips and the nested banners',
          'Swipe pages while the list is still scrolling',
          'Turn off ScrollableWrapper to see the conflict',
        ],
        api: ['ScrollableWrapper', 'blockParentScrollableWrapperActivation'],
        component: NestedScrollDemo,
      },
      {
        id: 'gestures',
        icon: '🎛️',
        title: 'Gesture tuning',
        summary:
          'How far, how fast and how straight the swipe should be to change the page.',
        tryIt: [
          'Increase activationDistance – the drag starts later',
          'Set panVelocityThreshold to 3000 – short flicks stop switching pages',
          'Set the tolerance to 15° and swipe diagonally',
          'Change pageActivationThreshold and watch when onPageSelected fires',
        ],
        api: [
          'activationDistance',
          'panVelocityThreshold',
          'gestureDirectionToleranceDeg',
          'pageActivationThreshold',
        ],
        component: GesturesDemo,
      },
      {
        id: 'swipe-back',
        icon: '⬅️',
        title: 'Swipe back navigation',
        summary:
          'A pager on a screen with the full-screen swipe-back gesture of React Navigation (iOS).',
        tryIt: [
          'On page 1 swipe right – the screen goes back',
          'Turn off failActivationWhenExceedingStartEdge and try again',
          'hitSlop leaves an edge area to the navigation gesture',
        ],
        api: ['failActivationWhenExceedingStartEdge', 'hitSlop'],
        component: SwipeBackDemo,
        fullScreenSwipeBack: true,
      },
    ],
  },
  {
    title: 'Performance & data',
    data: [
      {
        id: 'visibility',
        icon: '👀',
        title: 'Lazy loading & visibility',
        summary:
          'Render pages only when they get close, and know which page is on screen.',
        tryIt: [
          'Swipe forward and watch pages get rendered in the strip above',
          'Change lazyPageLimit to preload more neighbours',
          'Each page shows what the visibility hooks return',
        ],
        api: [
          'lazy',
          'lazyPageLimit',
          'useIsOnscreenPage',
          'usePageRelativeIndex',
          'useActivePageIndex',
        ],
        component: VisibilityDemo,
      },
      {
        id: 'dynamic-pages',
        icon: '➕',
        title: 'Adding & removing pages',
        summary:
          'Change the pages on the fly and keep the user on the same page.',
        tryIt: [
          'Prepend a page – you stay on the same letter',
          'Turn off holdCurrentPageOnChildrenUpdate and prepend again',
          'Remove the current page or shuffle them',
        ],
        api: ['holdCurrentPageOnChildrenUpdate', 'key'],
        component: DynamicPagesDemo,
      },
    ],
  },
];

// Ids come from deep links too, so a demo may be missing
export const DEMOS_BY_ID: Partial<Record<string, Demo>> = Object.fromEntries(
  DEMO_SECTIONS.flatMap((section) => section.data).map((demo) => [
    demo.id,
    demo,
  ]),
);
