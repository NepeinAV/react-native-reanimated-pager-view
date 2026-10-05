import type { ReactNode } from 'react';

import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { getPageColor } from './theme';

type DemoPageProps = {
  index: number;
  label?: string;
  color?: string;
  inset?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * A plain numbered page, so it's always clear which page is on screen
 */
export const DemoPage = ({
  index,
  label,
  color = getPageColor(index),
  inset = true,
  style,
  children,
}: DemoPageProps) => {
  return (
    <View style={[styles.wrapper, inset && styles.inset]}>
      <View style={[styles.card, { backgroundColor: color }, style]}>
        <Text style={styles.number}>{label ?? index + 1}</Text>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  inset: {
    padding: 16,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  number: {
    fontSize: 72,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.95)',
  },
});
