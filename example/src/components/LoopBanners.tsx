import { useMemo, useState } from 'react';

import { View, StyleSheet } from 'react-native';

import { PagerView } from 'react-native-reanimated-pager-view';

import { CONSTANTS } from '../constants';
import { bannersData } from '../data/banners';

import { BannerItem } from './BannerItem';

export const LoopBanners = () => {
  const [activePage, setActivePage] = useState(0);

  const pages = useMemo(
    () =>
      bannersData.map((banner) => (
        <View key={banner.id} style={styles.bannerPage}>
          <BannerItem banner={banner} />
        </View>
      )),
    [],
  );

  return (
    <View>
      <PagerView
        loop
        onPageSelected={setActivePage}
        blockParentScrollableWrapperActivation
      >
        {pages}
      </PagerView>
      <View style={styles.dots} pointerEvents="none">
        {bannersData.map((banner, index) => (
          <View
            key={banner.id}
            style={[styles.dot, index === activePage && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerPage: {
    flex: 1,
    marginHorizontal: CONSTANTS.SPACING.MEDIUM * 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
});
