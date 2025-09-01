import { useRef } from 'react';

import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import { interpolate } from 'react-native-reanimated';
import {
  PagerView,
  type PagerStyleFn,
  type PagerViewRef,
} from 'react-native-reanimated-pager-view';

const videos = [
  {
    id: '1',
    author: '@reactnative_dev',
    avatar: '👨‍💻',
    title: 'New Vertical PagerView! 🔥',
    description:
      'Now you can create Shorts directly in React Native! #ReactNative #PagerView #Mobile',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradientColors: ['#667eea', '#764ba2'],
    likes: '12.3K',
    comments: '892',
    shares: '1.2K',
    music: '♪ Original sound - React Native',
  },
  {
    id: '2',
    author: '@animation_master',
    avatar: '🎨',
    title: 'Smooth Animations with Reanimated ✨',
    description:
      'See how easy it is to create beautiful transitions! Swipe up for the next video 👆',
    backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    gradientColors: ['#f093fb', '#f5576c'],
    likes: '25.7K',
    comments: '1.5K',
    shares: '3.2K',
    music: '♪ Chill Vibes - LoFi Beats',
  },
  {
    id: '3',
    author: '@mobile_wizard',
    avatar: '🧙‍♂️',
    title: 'Overdrag Magic 🪄',
    description:
      'When you reach the end - see a special effect! Try scrolling to the end ⬇️',
    backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    gradientColors: ['#4facfe', '#00f2fe'],
    likes: '8.9K',
    comments: '567',
    shares: '890',
    music: '♪ Magic Sounds - Mystic',
  },
  {
    id: '4',
    author: '@ui_creator',
    avatar: '🎭',
    title: 'Custom Interpolators 🎪',
    description:
      'Create unique page transition effects! Limitless possibilities 🚀',
    backgroundColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    gradientColors: ['#fa709a', '#fee140'],
    likes: '15.4K',
    comments: '923',
    shares: '1.8K',
    music: '♪ Creative Flow - Beats',
  },
  {
    id: '5',
    author: '@production_ready',
    avatar: '🚀',
    title: 'Production Ready! ⚡',
    description:
      'Ready for production! Use it in your apps today 💪 #ProductionReady',
    backgroundColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    gradientColors: ['#a8edea', '#fed6e3'],
    likes: '32.1K',
    comments: '2.1K',
    shares: '4.5K',
    music: '♪ Success - Motivational',
  },
  {
    id: '6',
    author: '@opensource_hero',
    avatar: '💝',
    title: 'Open Source Love 💖',
    description: 'Fully open source on GitHub! Join the developer community 🌟',
    backgroundColor: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    gradientColors: ['#d299c2', '#fef9d7'],
    likes: '41.2K',
    comments: '3.8K',
    shares: '7.2K',
    music: '♪ Community - Together',
  },
];

const rubberBandStyle: PagerStyleFn = ({ scrollPosition }) => {
  'worklet';

  return {
    transformOrigin: scrollPosition < 0 ? 'top' : 'bottom',
    transform: [
      {
        scaleY: interpolate(
          scrollPosition,
          [-1, 0, videos.length - 1, videos.length],
          [1.25, 1, 1, 1.25],
        ),
      },
    ],
  };
};

const Shorts: React.FC = () => {
  const ref = useRef<PagerViewRef>(null);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <PagerView
        ref={ref}
        orientation="vertical"
        pageMargin={0}
        style={rubberBandStyle}
      >
        {videos.map((video, index) => (
          <View key={video.id} style={styles.videoContainer}>
            <View
              style={[
                styles.videoCard,
                { backgroundColor: video.backgroundColor },
              ]}
            >
              <View style={styles.videoBackground}>
                <Text style={styles.avatarLarge}>{video.avatar}</Text>
              </View>

              <View style={styles.rightPanel}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.avatar}>{video.avatar}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Text style={[styles.actionIcon, styles.likeIcon]}>❤️</Text>
                  <Text style={styles.actionText}>{video.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionText}>{video.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>📤</Text>
                  <Text style={styles.actionText}>{video.shares}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>🎵</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomInfo}>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{video.author}</Text>
                  <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followText}>Follow</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoDescription}>{video.description}</Text>

                <View style={styles.musicInfo}>
                  <Text style={styles.musicText}>{video.music}</Text>
                </View>
              </View>

              <View style={styles.videoIndicator}>
                <Text style={styles.indicatorText}>
                  {index + 1} / {videos.length}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
  },
  videoCard: {
    flex: 1,
    position: 'relative',
  },
  videoBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLarge: {
    fontSize: 120,
    opacity: 0.3,
  },
  rightPanel: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatar: {
    fontSize: 40,
    marginBottom: 5,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    right: 80,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  followButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  followText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  videoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  videoDescription: {
    color: 'white',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 10,
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: 'white',
    fontSize: 12,
    fontStyle: 'italic',
  },
  videoIndicator: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  indicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  likeIcon: {
    color: '#FF3040',
  },
});

export { Shorts };
