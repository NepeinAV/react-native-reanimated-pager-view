import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Post } from '../types';
import { postStyles } from '../styles/postStyles';
import { Avatar } from './Avatar';

interface PostItemProps {
  post: Post;
  isLiked: boolean;
  onLike: (postId: string) => void;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  isLiked,
  onLike,
}) => {
  const handlePostLike = useCallback(() => {
    onLike(post.id);
  }, [onLike, post.id]);

  return (
    <View style={postStyles.postContainer}>
      <View style={postStyles.postHeader}>
        <Avatar text={post.avatar} size="medium" />
        <View style={postStyles.postInfo}>
          <Text style={postStyles.authorName}>{post.author}</Text>
          <Text style={postStyles.postTime}>{post.time}</Text>
        </View>
      </View>
      <Text style={postStyles.postContent}>{post.content}</Text>
      <View style={postStyles.postActions}>
        <TouchableOpacity
          style={postStyles.actionButton}
          onPress={handlePostLike}
        >
          <Text
            style={[
              postStyles.actionIcon,
              isLiked ? postStyles.likedIcon : postStyles.unlikedIcon,
            ]}
          >
            ❤️
          </Text>
          <Text style={postStyles.actionText}>
            {post.likes + (isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionButton} onPress={() => {}}>
          <Text style={postStyles.actionIcon}>💬</Text>
          <Text style={postStyles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionButton} onPress={() => {}}>
          <Text style={postStyles.actionIcon}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
