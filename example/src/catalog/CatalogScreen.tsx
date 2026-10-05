import { useCallback } from 'react';

import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { useNavigation, type NavigationProp } from '@react-navigation/native';

import { kitColors } from '../demo-kit';

import { ApiChips } from './ApiChips';
import { DEMO_SECTIONS, type Demo, type DemoSection } from './demos';

import type { RootStackParamList } from '../navigation';

type Navigation = NavigationProp<RootStackParamList>;

const ShowcaseCard = () => {
  const navigation = useNavigation<Navigation>();

  return (
    <Pressable
      onPress={() => navigation.navigate('Showcase')}
      style={({ pressed }) => [styles.showcase, pressed && styles.pressed]}
    >
      <Text style={styles.showcaseEyebrow}>ALL TOGETHER</Text>
      <Text style={styles.showcaseTitle}>Real-world app ›</Text>
      <Text style={styles.showcaseText}>
        A social app built with PagerView: looped tabs with a 3D transition, a
        feed with nested carousels, tabs in a bottom sheet and a post viewer
        with swipe-back.
      </Text>
    </Pressable>
  );
};

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.intro}>
      Each example focuses on one use case of the library. Open it, follow the
      tips on top and play with the controls at the bottom.
    </Text>
    <ShowcaseCard />
  </View>
);

const DemoRow = ({ demo }: { demo: Demo }) => {
  const navigation = useNavigation<Navigation>();

  return (
    <Pressable
      onPress={() => navigation.navigate('Demo', { id: demo.id })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>{demo.icon}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.title}>{demo.title}</Text>
        <Text style={styles.summary}>{demo.summary}</Text>
        <ApiChips api={demo.api} limit={3} />
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
};

const keyExtractor = (demo: Demo) => demo.id;

export const CatalogScreen = () => {
  const renderItem = useCallback(
    ({ item }: { item: Demo }) => <DemoRow demo={item} />,
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: DemoSection }) => (
      <Text style={styles.sectionTitle}>{section.title}</Text>
    ),
    [],
  );

  return (
    <SectionList
      sections={DEMO_SECTIONS}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      ListHeaderComponent={Header}
      stickySectionHeadersEnabled={false}
      contentInsetAdjustmentBehavior="automatic"
      style={styles.list}
      contentContainerStyle={styles.content}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: kitColors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    gap: 16,
    paddingTop: 8,
  },
  intro: {
    fontSize: 15,
    lineHeight: 21,
    color: kitColors.textSecondary,
  },
  showcase: {
    backgroundColor: kitColors.accent,
    borderRadius: 18,
    padding: 16,
    gap: 4,
  },
  showcaseEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  showcaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: kitColors.text,
  },
  showcaseText: {
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: kitColors.textSecondary,
    marginTop: 28,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: kitColors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: kitColors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  iconText: {
    fontSize: 22,
  },
  rowContent: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: kitColors.text,
  },
  summary: {
    fontSize: 14,
    lineHeight: 19,
    color: kitColors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: kitColors.textSecondary,
  },
});
