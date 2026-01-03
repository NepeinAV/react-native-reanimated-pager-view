import { useMemo, useCallback } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import {
  createBounceScrollOffsetInterpolator,
  ScrollableWrapper,
} from 'react-native-reanimated-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useNavigation,
  useRoute,
  type RouteProp,
  type NavigationProp,
} from '@react-navigation/native';

import { CONSTANTS } from '../constants';

import { Avatar } from './Avatar';
import { CustomPagerView } from './CustomPagerView';

import type { Post } from '../types';

export type RootStackParamList = {
  Main: undefined;
  PostDetail: {
    post: Post;
    allPosts: Post[];
  };
};

type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;
type PostDetailNavigationProp = NavigationProp<RootStackParamList>;

const PostDetailPage: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <ScrollableWrapper orientation="vertical">
      <ScrollView style={styles.pageContainer}>
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Avatar text={post.avatar} size="large" />
            <View style={styles.postInfo}>
              <Text style={styles.authorName}>{post.author}</Text>
              <Text style={styles.postTime}>{post.time}</Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          {/* Additional content to demonstrate scrolling */}
          <View style={styles.additionalContent}>
            <Text style={styles.sectionTitle}>Post Details</Text>
            <Text style={styles.detailText}>
              This is additional content for the post. You can scroll vertically
              here while the horizontal pager allows navigation between posts.
            </Text>

            <Text style={styles.sectionTitle}>Comments</Text>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.comment}>
                <Avatar text={`U${i}`} size="small" />
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>User {i}</Text>
                  <Text style={styles.commentText}>
                    Great post! This is comment #{i}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScrollableWrapper>
  );
};

const pagerViewSwipeBackArea = { left: -30 };

const PageIndicator: React.FC<{
  totalPages: number;
  scrollPosition: SharedValue<number>;
}> = ({ totalPages, scrollPosition }) => {
  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: totalPages }, (_, index) => (
        <PageDot key={index} index={index} scrollPosition={scrollPosition} />
      ))}
    </View>
  );
};

const PageDot: React.FC<{
  index: number;
  scrollPosition: SharedValue<number>;
}> = ({ index, scrollPosition }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = interpolate(
      scrollPosition.value,
      [index - 1, index, index + 1],
      [0, 1, 0],
      Extrapolation.CLAMP,
    );

    const scale = interpolate(isActive, [0, 1], [0.6, 1], Extrapolation.CLAMP);

    const opacity = interpolate(
      isActive,
      [0, 1],
      [0.3, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return <Animated.View style={[styles.indicatorDot, animatedStyle]} />;
};

export const PostDetailScreen: React.FC = () => {
  const navigation = useNavigation<PostDetailNavigationProp>();
  const route = useRoute<PostDetailRouteProp>();

  const { post, allPosts } = route.params;

  const initialIndex = allPosts.findIndex((p: Post) => p.id === post.id);

  const scrollPosition = useSharedValue(initialIndex);

  const children = useMemo(
    () =>
      allPosts.map((postItem: Post) => (
        <PostDetailPage key={postItem.id} post={postItem} />
      )),
    [allPosts],
  );

  const handlePageScroll = useCallback(
    (position: number) => {
      'worklet';

      scrollPosition.value = position;
    },
    [scrollPosition],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Posts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <CustomPagerView
        style={styles.pager}
        initialPage={initialIndex}
        failActivationWhenExceedingStartEdge
        scrollOffsetInterpolator={createBounceScrollOffsetInterpolator()}
        hitSlop={pagerViewSwipeBackArea}
        onPageScroll={handlePageScroll}
        lazy
      >
        {children}
      </CustomPagerView>

      <PageIndicator
        totalPages={allPosts.length}
        scrollPosition={scrollPosition}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CONSTANTS.COLORS.BORDER_COLOR,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: CONSTANTS.COLORS.ACCENT_BLUE,
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    color: CONSTANTS.COLORS.ACCENT_BLUE,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 60, // Balance the back button width
  },
  pager: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  postContainer: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 14,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 20,
  },
  additionalContent: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: CONSTANTS.COLORS.BORDER_COLOR,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    marginTop: 16,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    marginBottom: 16,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 8,
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
    borderTopWidth: 1,
    borderTopColor: CONSTANTS.COLORS.BORDER_COLOR,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CONSTANTS.COLORS.ACCENT_BLUE,
    marginHorizontal: 4,
  },
});
