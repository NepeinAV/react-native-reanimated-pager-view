import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Banner } from '../types';
import { CONSTANTS } from '../constants';

interface BannerItemProps {
  banner: Banner;
  onPress?: () => void;
}

export const BannerItem: React.FC<BannerItemProps> = ({ banner, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.bannerContainer, { backgroundColor: banner.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Text style={styles.imageEmoji}>{banner.image}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{banner.title}</Text>
        <Text style={styles.subtitle}>{banner.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: 280,
    height: 120,
    borderRadius: CONSTANTS.BORDER_RADIUS.MEDIUM,
    marginRight: CONSTANTS.SPACING.LARGE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CONSTANTS.SPACING.EXTRA_LARGE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
