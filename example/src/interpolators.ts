import { interpolate } from 'react-native-reanimated';
import { type PageStyleInterpolator } from 'react-native-reanimated-pager-view';

export const cubePageInterpolator: PageStyleInterpolator = ({ pageOffset }) => {
  'worklet';

  const rotateY = interpolate(pageOffset, [-1, 0, 1], [60, 0, -60], 'clamp');
  const scale = interpolate(pageOffset, [-1, 0, 1], [0.8, 1, 0.8], 'clamp');

  return {
    transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }, { scale }],
  };
};

export const zoomPageInterpolator: PageStyleInterpolator = ({ pageOffset }) => {
  'worklet';

  const distance = Math.abs(pageOffset);

  return {
    opacity: interpolate(distance, [0, 1], [1, 0.3], 'clamp'),
    transform: [{ scale: interpolate(distance, [0, 1], [1, 0.75], 'clamp') }],
  };
};

const PEEK_ACTIVE_SCALE = 0.8;
const PEEK_NEIGHBOUR_SCALE = 0.7;
const PEEK_GAP = 12;
// Horizontal padding of the page content, e.g. DemoPage inset
const PEEK_PAGE_INSET = 16;

// Shrinks the pages and pulls the neighbours closer, so they peek out from the edges
export const peekPageInterpolator: PageStyleInterpolator = ({
  pageOffset,
  pageSize,
}) => {
  'worklet';

  const distance = Math.abs(pageOffset);
  const cardSize = pageSize - PEEK_PAGE_INSET * 2;
  // Moves the neighbour so there is PEEK_GAP between it and the active page
  const pull =
    pageSize -
    ((PEEK_ACTIVE_SCALE + PEEK_NEIGHBOUR_SCALE) * cardSize) / 2 -
    PEEK_GAP;

  return {
    opacity: interpolate(distance, [0, 1, 2], [1, 0.6, 0], 'clamp'),
    transform: [
      { translateX: -pageOffset * pull },
      {
        scale: interpolate(
          distance,
          [0, 1],
          [PEEK_ACTIVE_SCALE, PEEK_NEIGHBOUR_SCALE],
          'clamp',
        ),
      },
    ],
  };
};
