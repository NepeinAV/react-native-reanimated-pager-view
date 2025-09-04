import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { postStyles } from '../styles/postStyles';

import { Avatar } from './Avatar';

import type { Post } from '../types';

interface PostItemProps {
  post: Post;
  allPosts?: Post[];
}

export const PostItem: React.FC<PostItemProps> = ({ post, allPosts = [] }) => {
  const navigation = useNavigation<any>();

  const handlePostPress = () => {
    navigation.navigate('PostDetail', {
      post,
      allPosts,
    });
  };
  return (
    <TouchableOpacity onPress={handlePostPress} activeOpacity={0.9}>
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
          <TouchableOpacity style={postStyles.actionButton}>
            <Text style={[postStyles.actionIcon, postStyles.likedIcon]}>
              ❤️
            </Text>
            <Text style={postStyles.actionText}>{post.likes}</Text>
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
    </TouchableOpacity>
  );
};
