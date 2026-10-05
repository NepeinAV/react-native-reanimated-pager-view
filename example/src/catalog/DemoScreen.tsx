import { useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useRoute, type RouteProp } from '@react-navigation/native';

import { kitColors } from '../demo-kit';

import { ApiChips } from './ApiChips';
import { DEMOS_BY_ID, type Demo } from './demos';

import type { RootStackParamList } from '../navigation';

const Tips = ({ demo }: { demo: Demo }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View style={styles.tips}>
      <Pressable
        onPress={() => setIsExpanded((value) => !value)}
        hitSlop={8}
        style={styles.tipsHeader}
      >
        <Text style={styles.summary} numberOfLines={isExpanded ? undefined : 1}>
          {demo.summary}
        </Text>
        <Text style={styles.toggle}>{isExpanded ? 'Hide' : 'Tips'}</Text>
      </Pressable>

      {isExpanded && (
        <>
          <View style={styles.tryIt}>
            {demo.tryIt.map((tip) => (
              <Text key={tip} style={styles.tip}>
                <Text style={styles.bullet}>→ </Text>
                {tip}
              </Text>
            ))}
          </View>
          <ApiChips api={demo.api} singleLine />
        </>
      )}
    </View>
  );
};

export const DemoScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Demo'>>();
  // The id comes from a deep link, so it may be unknown
  const demo = DEMOS_BY_ID[route.params.id];

  if (!demo) {
    return (
      <View style={[styles.container, styles.notFound]}>
        <Text style={styles.tip}>Unknown example: {route.params.id}</Text>
      </View>
    );
  }

  const DemoComponent = demo.component;

  return (
    <View style={styles.container}>
      <Tips demo={demo} />
      <View style={styles.content}>
        <DemoComponent />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: kitColors.background,
  },
  tips: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: kitColors.separator,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  summary: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: kitColors.text,
  },
  toggle: {
    fontSize: 15,
    lineHeight: 20,
    color: kitColors.accent,
  },
  tryIt: {
    gap: 4,
  },
  tip: {
    fontSize: 14,
    lineHeight: 19,
    color: kitColors.textSecondary,
  },
  bullet: {
    color: kitColors.accent,
  },
  content: {
    flex: 1,
  },
  notFound: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
