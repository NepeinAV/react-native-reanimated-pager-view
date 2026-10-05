import { useMemo, useState, type ReactNode } from 'react';

import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  ScrollableWrapper,
  type Orientation,
} from 'react-native-reanimated-pager-view';

import { ChatItem } from '../components/ChatItem';
import { CustomPagerView } from '../components/CustomPagerView';
import { LoopBanners } from '../components/LoopBanners';
import { chatsData } from '../data/chats';
import { ControlPanel, kitColors, ToggleRow } from '../demo-kit';
import { keyExtractorById } from '../hooks/useFlatListOptimization';

import type { Chat } from '../types';

const categories = [
  '🔥 Trending',
  '⭐ Favorites',
  '📸 Photos',
  '🎵 Music',
  '📱 Apps',
  '🎮 Games',
];

type MaybeWrapProps = {
  wrap: boolean;
  orientation: Orientation;
  children: ReactNode;
};

const MaybeWrap = ({ wrap, orientation, children }: MaybeWrapProps) =>
  wrap ? (
    <ScrollableWrapper orientation={orientation}>{children}</ScrollableWrapper>
  ) : (
    children
  );

const renderChat = ({ item }: { item: Chat }) => <ChatItem chat={item} />;

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const FeedHeader = ({ wrap }: { wrap: boolean }) => (
  <View>
    <SectionTitle>Horizontal ScrollView</SectionTitle>
    <MaybeWrap wrap={wrap} orientation="horizontal">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {categories.map((category, index) => (
          <View
            key={category}
            style={[
              styles.chip,
              { backgroundColor: `hsl(${index * 60}, 70%, 60%)` },
            ]}
          >
            <Text style={styles.chipText}>{category}</Text>
          </View>
        ))}
      </ScrollView>
    </MaybeWrap>

    <SectionTitle>Nested PagerView</SectionTitle>
    <LoopBanners />

    <SectionTitle>Vertical FlatList</SectionTitle>
  </View>
);

const PageLabel = ({ children }: { children: string }) => (
  <View style={styles.pageLabel}>
    <Text style={styles.pageLabelText}>{children}</Text>
  </View>
);

export const NestedScrollDemo = () => {
  const [wrap, setWrap] = useState(true);

  const pages = useMemo(
    () => [
      <View key="feed" style={styles.page}>
        <PageLabel>Page 1 · Feed</PageLabel>
        <MaybeWrap wrap={wrap} orientation="vertical">
          <FlatList
            data={chatsData}
            renderItem={renderChat}
            keyExtractor={keyExtractorById}
            ListHeaderComponent={<FeedHeader wrap={wrap} />}
          />
        </MaybeWrap>
      </View>,
      <View key="chats" style={styles.page}>
        <PageLabel>Page 2 · Chats</PageLabel>
        <MaybeWrap wrap={wrap} orientation="vertical">
          <FlatList
            data={chatsData}
            renderItem={renderChat}
            keyExtractor={keyExtractorById}
          />
        </MaybeWrap>
      </View>,
    ],
    [wrap],
  );

  return (
    <View style={styles.container}>
      <CustomPagerView key={String(wrap)}>{pages}</CustomPagerView>

      <ControlPanel>
        <ToggleRow
          label="<ScrollableWrapper>"
          value={wrap}
          onValueChange={setWrap}
        />
        <Text style={styles.hint}>
          {wrap
            ? 'Lists scroll and pages swipe without fighting each other. Swipe sideways while the list is still scrolling – the pager takes over.'
            : 'Without the wrapper the lists and the pager compete for the same touches: try to swipe pages while scrolling the list or the chips.'}
        </Text>
      </ControlPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageLabel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: kitColors.separator,
  },
  pageLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: kitColors.textSecondary,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: kitColors.code,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  chips: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 16,
    color: '#fff',
  },
  hint: {
    fontSize: 14,
    lineHeight: 18,
    color: kitColors.textSecondary,
    paddingBottom: 8,
  },
});
