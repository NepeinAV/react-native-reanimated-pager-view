import React from 'react';

import { StyleSheet } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainScreen } from './components/MainScreen';
import { PostDetailScreen } from './components/PostDetailScreen';
import { CONSTANTS } from './constants';

import type { Post } from './types';

// Определяем типы для навигации
export type RootStackParamList = {
  Main: undefined;
  PostDetail: {
    post: Post;
    allPosts: Post[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Main"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
                gestureResponseDistance: { start: 0 },
              }}
            >
              <Stack.Screen name="Main" component={MainScreen} />
              <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
});

export default App;
