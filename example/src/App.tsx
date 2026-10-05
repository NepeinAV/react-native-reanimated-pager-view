import React from 'react';

import { StyleSheet } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  DarkTheme,
  NavigationContainer,
  type LinkingOptions,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CatalogScreen } from './catalog/CatalogScreen';
import { DEMOS_BY_ID } from './catalog/demos';
import { DemoScreen } from './catalog/DemoScreen';
import { MainScreen } from './components/MainScreen';
import { PostDetailScreen } from './components/PostDetailScreen';
import { CONSTANTS } from './constants';

import type { RootStackParamList } from './navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: CONSTANTS.COLORS.ACCENT_BLUE,
    background: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
    card: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
    border: CONSTANTS.COLORS.SEPARATOR_COLOR,
  },
};

// Opens a demo directly, e.g. `npx uri-scheme open reanimatedpagerview.example://demo/loop --ios`
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['reanimatedpagerview.example://'],
  config: {
    // Keeps the catalog under a demo opened by a link, so there is a way back
    initialRouteName: 'Catalog',
    screens: {
      Demo: 'demo/:id',
      Showcase: 'showcase',
    },
  },
};

const fullScreenSwipeBackOptions = {
  fullScreenGestureEnabled: true,
  gestureResponseDistance: { start: 0 },
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer theme={theme} linking={linking}>
            <Stack.Navigator
              initialRouteName="Catalog"
              screenOptions={{
                headerBackButtonDisplayMode: 'minimal',
                contentStyle: { backgroundColor: 'transparent' },
                gestureEnabled: true,
              }}
            >
              <Stack.Screen
                name="Catalog"
                component={CatalogScreen}
                options={{ title: 'PagerView examples' }}
              />
              <Stack.Screen
                name="Demo"
                component={DemoScreen}
                options={({ route }) => {
                  const demo = DEMOS_BY_ID[route.params.id];

                  return {
                    title: demo?.title,
                    ...(demo?.fullScreenSwipeBack &&
                      fullScreenSwipeBackOptions),
                  };
                }}
              />
              <Stack.Screen
                name="Showcase"
                component={MainScreen}
                options={{ title: 'Real-world app' }}
              />
              <Stack.Screen
                name="PostDetail"
                component={PostDetailScreen}
                options={{ title: 'Posts', ...fullScreenSwipeBackOptions }}
              />
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
