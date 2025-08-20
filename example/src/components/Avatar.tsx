import React from 'react';

import { View, Text, StyleSheet } from 'react-native';

import { CONSTANTS } from '../constants';

interface AvatarProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  text,
  size = 'medium',
  backgroundColor = CONSTANTS.COLORS.ACCENT_BLUE,
}) => {
  const sizeConfig = {
    small: {
      size: CONSTANTS.AVATAR_SIZES.SMALL,
      fontSize: CONSTANTS.FONT_SIZES.EXTRA_SMALL,
    },
    medium: {
      size: CONSTANTS.AVATAR_SIZES.MEDIUM,
      fontSize: CONSTANTS.FONT_SIZES.SMALL,
    },
    large: {
      size: CONSTANTS.AVATAR_SIZES.LARGE,
      fontSize: CONSTANTS.FONT_SIZES.HEADER,
    },
  };

  const config = sizeConfig[size];

  return (
    <View
      style={[
        styles.container,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: config.fontSize }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
  },
});
