import React from 'react';

import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';

import { ScrollableWrapper } from 'react-native-reanimated-pager-view';

import { postsData } from '../data/posts';
import {
  useOptimizedFlatListConfig,
  keyExtractorById,
} from '../hooks/useFlatListOptimization';
import { styles } from '../styles';
import { postStyles } from '../styles/postStyles';

import { CardStack } from './CardStack';
import { IOSWidgetCarousel } from './IOSWidgetCarousel';
import { PostItem } from './PostItem';

import type { Post } from '../types';

const categories = [
  '🔥 Trending',
  '⭐ Favorites',
  '📸 Photos',
  '🎵 Music',
  '📱 Apps',
  '🎮 Games',
];

const FeedHeader: React.FC = () => {
  return (
    <View style={styles.bannersSection}>
      <CardStack />

      <View style={localStyles.categoriesSection}>
        <IOSWidgetCarousel />
      </View>

      <View style={localStyles.categoriesSection}>
        <ScrollableWrapper orientation="horizontal">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={localStyles.categoriesContainer}
          >
            {categories.map((action, index) => (
              <View
                key={action}
                style={[
                  localStyles.categoryItem,
                  { backgroundColor: `hsl(${index * 60}, 70%, 60%)` },
                ]}
              >
                <Text style={localStyles.categoryText}>{action}</Text>
              </View>
            ))}
          </ScrollView>
        </ScrollableWrapper>
      </View>
    </View>
  );
};

export const FeedPage: React.FC = () => {
  const flatListConfig = useOptimizedFlatListConfig();

  const renderPost = ({ item }: { item: Post }) => (
    <PostItem post={item} allPosts={postsData} />
  );

  return (
    <ScrollableWrapper orientation="vertical">
      <FlatList
        style={styles.pageContainer}
        data={postsData}
        renderItem={renderPost}
        keyExtractor={keyExtractorById}
        ListHeaderComponent={<FeedHeader />}
        contentContainerStyle={postStyles.postsSection}
        {...flatListConfig}
      />
    </ScrollableWrapper>
  );
};

const localStyles = StyleSheet.create({
  categoriesSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryItem: {
    padding: 10,
    borderRadius: 99999,
  },
  categoryText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
});
