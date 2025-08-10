import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { FlatList as GHFlatList } from 'react-native-gesture-handler';
import { PostItem } from './PostItem';
import { BannerItem } from './BannerItem';
import type { Post, Banner } from '../types';
import { styles } from '../styles';
import { postStyles } from '../styles/postStyles';
import { postsData } from '../data/posts';
import { bannersData } from '../data/banners';
import {
  useOptimizedFlatListConfig,
  keyExtractorById,
} from '../hooks/useFlatListOptimization';

interface FeedPageProps {
  likedPosts: Set<string>;
  onLike: (postId: string) => void;
}

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

export const FeedPage: React.FC<FeedPageProps> = ({ likedPosts, onLike }) => {
  const posts = useMemo(() => postsData, []);
  const banners = useMemo(() => bannersData, []);
  const flatListConfig = useOptimizedFlatListConfig();

  const renderPost = ({ item }: { item: Post }) => (
    <PostItem post={item} isLiked={likedPosts.has(item.id)} onLike={onLike} />
  );

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
