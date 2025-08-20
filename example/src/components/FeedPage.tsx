import React, { useMemo } from 'react';

import { View, Text, FlatList } from 'react-native';

import { FlatList as GHFlatList } from 'react-native-gesture-handler';

import { bannersData } from '../data/banners';
import { postsData } from '../data/posts';
import {
  useOptimizedFlatListConfig,
  keyExtractorById,
} from '../hooks/useFlatListOptimization';
import { styles } from '../styles';
import { postStyles } from '../styles/postStyles';

import { BannerItem } from './BannerItem';
import { PostItem } from './PostItem';

import type { Post, Banner } from '../types';

const BannersHeader: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const renderBanner = ({ item }: { item: Banner }) => (
    <BannerItem banner={item} onPress={() => {}} />
  );

  return (
    <View style={styles.bannersSection}>
      <Text style={styles.sectionTitle}>Featured</Text>
      <GHFlatList
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannersContainer}
      />
    </View>
  );
};

export const FeedPage: React.FC = () => {
  const posts = useMemo(() => postsData, []);
  const banners = useMemo(() => bannersData, []);
  const flatListConfig = useOptimizedFlatListConfig();

  const renderPost = ({ item }: { item: Post }) => <PostItem post={item} />;

  return (
    <FlatList
      style={styles.pageContainer}
      data={posts}
      renderItem={renderPost}
      keyExtractor={keyExtractorById}
      ListHeaderComponent={<BannersHeader banners={banners} />}
      contentContainerStyle={postStyles.postsSection}
      {...flatListConfig}
    />
  );
};
