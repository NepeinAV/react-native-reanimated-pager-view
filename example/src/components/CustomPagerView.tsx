import type { Ref } from 'react';

import {
  createBounceScrollOffsetInterpolator,
  PagerView,
  type PagerViewProps,
  type PagerViewRef,
} from 'react-native-reanimated-pager-view';

const bounceInterpolator = createBounceScrollOffsetInterpolator();

export const CustomPagerView = (
  props: PagerViewProps & { ref?: Ref<PagerViewRef> },
) => {
  return <PagerView scrollOffsetInterpolator={bounceInterpolator} {...props} />;
};
