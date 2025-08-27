import React from 'react';

import { View, Text, StyleSheet } from 'react-native';

import { CONSTANTS } from '../constants';

import type { Banner } from '../types';

interface BannerItemProps {
  banner: Banner;
}

export const BannerItem: React.FC<BannerItemProps> = ({ banner }) => {
  return (
    <View style={[styles.bannerContainer, { backgroundColor: banner.color }]}>
      <View style={styles.imageContainer}>
        <Text style={styles.imageEmoji}>{banner.image}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{banner.title}</Text>
        <Text style={styles.subtitle}>{banner.subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    height: 120,
    borderRadius: CONSTANTS.BORDER_RADIUS.MEDIUM,
    marginRight: CONSTANTS.SPACING.LARGE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CONSTANTS.SPACING.EXTRA_LARGE,
    marginVertical: CONSTANTS.SPACING.LARGE,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 20,
        spreadDistance: 0,
        color: `rgba(0, 0, 0, 0.2)`,
      },
    ],
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: CONSTANTS.SPACING.LARGE,
  },
  imageEmoji: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: CONSTANTS.FONT_SIZES.EXTRA_LARGE,
    fontWeight: '600',
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: CONSTANTS.SPACING.EXTRA_SMALL,
  },
  subtitle: {
    fontSize: CONSTANTS.FONT_SIZES.SMALL,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
});
