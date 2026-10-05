import type { ReactNode } from 'react';

import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { kitColors, monospace } from './theme';

/**
 * Bottom area of a demo with knobs to play with
 */
export const ControlPanel = ({ children }: { children: ReactNode }) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(bottom, 12) }]}>
      {children}
    </View>
  );
};

type ControlRowProps = {
  label: string;
  children: ReactNode;
};

export const ControlRow = ({ label, children }: ControlRowProps) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
};

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export const ToggleRow = ({ label, value, onValueChange }: ToggleRowProps) => {
  return (
    <ControlRow label={label}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: kitColors.accent }}
      />
    </ControlRow>
  );
};

type SegmentedProps<T> = {
  options: readonly { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export const Segmented = <T,>({
  options,
  value,
  onChange,
  style,
}: SegmentedProps<T>) => {
  return (
    <View style={[styles.segmented, style]}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.label}
            onPress={() => onChange(option.value)}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text
              style={[styles.segmentText, isActive && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export const Button = ({ title, onPress, disabled }: ButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={styles.buttonText} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
};

export const ButtonRow = ({ children }: { children: ReactNode }) => {
  return <View style={styles.buttonRow}>{children}</View>;
};

type StatProps = {
  label: string;
  children: ReactNode;
};

/**
 * Labelled value, e.g. "page 2"
 */
export const Stat = ({ label, children }: StatProps) => {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValue}>
        {typeof children === 'string' || typeof children === 'number' ? (
          <Text style={styles.statValueText}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
};

export const StatRow = ({ children }: { children: ReactNode }) => {
  return <View style={styles.statRow}>{children}</View>;
};

export const controlStyles = StyleSheet.create({
  statValueText: {
    fontFamily: monospace,
    fontSize: 15,
    fontWeight: '600',
    color: kitColors.text,
    padding: 0,
  },
});

const styles = StyleSheet.create({
  panel: {
    backgroundColor: kitColors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 32,
  },
  label: {
    flexShrink: 1,
    fontFamily: monospace,
    fontSize: 13,
    color: kitColors.code,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: kitColors.surfaceRaised,
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: kitColors.accent,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: kitColors.textSecondary,
  },
  segmentTextActive: {
    color: kitColors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: kitColors.surfaceRaised,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: kitColors.accent,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: kitColors.surfaceRaised,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 11,
    color: kitColors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    minHeight: 20,
    justifyContent: 'center',
  },
  statValueText: controlStyles.statValueText,
});
