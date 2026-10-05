import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { kitColors, monospace } from '../demo-kit';

type ApiChipsProps = {
  api: string[];
  limit?: number;
  /** Keeps the chips in a single scrollable line */
  singleLine?: boolean;
};

export const ApiChips = ({
  api,
  limit = api.length,
  singleLine = false,
}: ApiChipsProps) => {
  const visible = api.slice(0, limit);
  const hiddenCount = api.length - visible.length;

  const chips = (
    <>
      {visible.map((item) => (
        <Text key={item} style={styles.chip}>
          {item}
        </Text>
      ))}
      {hiddenCount > 0 && (
        <Text style={[styles.chip, styles.more]}>+{hiddenCount}</Text>
      )}
    </>
  );

  if (singleLine) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.singleLine}
      >
        {chips}
      </ScrollView>
    );
  }

  return <View style={styles.chips}>{chips}</View>;
};

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  singleLine: {
    gap: 6,
  },
  chip: {
    fontFamily: monospace,
    fontSize: 11,
    color: kitColors.code,
    backgroundColor: 'rgba(255, 212, 121, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    overflow: 'hidden',
  },
  more: {
    color: kitColors.textSecondary,
    backgroundColor: kitColors.surfaceRaised,
  },
});
