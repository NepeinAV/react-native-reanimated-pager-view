import { useRef, useState, useCallback, useMemo } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StyleSheet,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  PagerView,
  type PagerViewRef,
} from 'react-native-reanimated-pager-view';

import { CONSTANTS } from '../constants';

const { width: screenWidth } = Dimensions.get('window');

const TABS = [
  { key: 'main', title: 'General', icon: '👤' },
  { key: 'settings', title: 'Settings', icon: '⚙️' },
  { key: 'security', title: 'Security', icon: '🔒' },
] as const;

export const EditProfileBottomSheet = () => {
  const pagerRef = useRef<PagerViewRef>(null);
  const [activeTab, setActiveTab] = useState(0);

  const animatedPage = useSharedValue(0);

  const handleTabPress = useCallback((index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  }, []);

  const handlePageSelected = useCallback((position: number) => {
    setActiveTab(position);
  }, []);

  const onPageScroll = useCallback(
    (e: { position: number; offset: number }) => {
      'worklet';
      animatedPage.value = e.position + e.offset;
    },
    [animatedPage]
  );

  const tabBackgroundStyle = useAnimatedStyle(() => {
    const tabWidth = (screenWidth - 32 - 8) / TABS.length;
    const translateX = interpolate(
      animatedPage.value,
      [0, TABS.length - 1],
      [0, tabWidth * (TABS.length - 1)],
      Extrapolation.CLAMP
    );

    return {
      width: tabWidth,
      transform: [{ translateX: 4 + translateX }],
    };
  });

  const memoizedTabs = TABS.map((tab, idx) => (
    <TouchableOpacity
      key={tab.key}
      style={styles.tab}
      onPress={() => handleTabPress(idx)}
    >
      <Text style={styles.tabIcon}>{tab.icon}</Text>
      <Text style={[styles.tabText, activeTab === idx && styles.activeTabText]}>
        {tab.title}
      </Text>
    </TouchableOpacity>
  ));

  const memoizedPages = useMemo(
    () => [
      <GeneralTab key="main" />,
      <SettingsTab key="settings" />,
      <SecurityTab key="security" />,
    ],
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <Animated.View style={[styles.tabBackground, tabBackgroundStyle]} />
        {memoizedTabs}
      </View>
      <PagerView
        ref={pagerRef}
        onPageSelected={handlePageSelected}
        onPageScroll={onPageScroll}
      >
        {memoizedPages}
      </PagerView>
    </View>
  );
};

const GeneralTab = () => (
  <View style={styles.pageContainer}>
    <Text style={styles.pageTitle}>General</Text>
    <Text style={styles.pageSubtitle}>Edit your basic profile information</Text>

    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Personal Information</Text>

      <Text style={styles.inputLabel}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor={CONSTANTS.COLORS.TEXT_SECONDARY}
        defaultValue="Your Profile"
      />

      <Text style={styles.inputLabel}>Bio</Text>
      <TextInput
        style={[styles.input, styles.textareaInput]}
        placeholder="Tell about yourself"
        placeholderTextColor={CONSTANTS.COLORS.TEXT_SECONDARY}
        multiline
        defaultValue="React Native Developer • Building beautiful apps"
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const SettingsTab = () => (
  <View style={styles.pageContainer}>
    <Text style={styles.pageTitle}>Settings</Text>
    <Text style={styles.pageSubtitle}>
      Manage your profile and app settings
    </Text>

    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Privacy</Text>

      <View style={styles.settingsItem}>
        <Text style={styles.settingsItemText}>Private Profile</Text>
        <Text style={styles.settingsItemValue}>Off</Text>
      </View>

      <View style={styles.settingsItem}>
        <Text style={styles.settingsItemText}>Show Activity</Text>
        <Text style={styles.settingsItemValue}>On</Text>
      </View>

      <View style={[styles.settingsItem, styles.settingsItemLast]}>
        <Text style={styles.settingsItemText}>Notifications</Text>
        <Text style={styles.settingsItemValue}>On</Text>
      </View>
    </View>

    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Theme</Text>

      <View style={[styles.settingsItem, styles.settingsItemLast]}>
        <Text style={styles.settingsItemText}>Dark Theme</Text>
        <Text style={styles.settingsItemValue}>On</Text>
      </View>
    </View>
  </View>
);

const SecurityTab = () => (
  <View style={styles.pageContainer}>
    <Text style={styles.pageTitle}>Security</Text>
    <Text style={styles.pageSubtitle}>
      Manage your password and security settings
    </Text>

    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Authentication</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonSecondary]}>
        <Text style={styles.buttonText}>Setup 2FA</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Sessions</Text>

      <View style={styles.settingsItem}>
        <Text style={styles.settingsItemText}>Active Sessions</Text>
        <Text style={styles.settingsItemValue}>3 devices</Text>
      </View>

      <TouchableOpacity style={[styles.button, styles.buttonDanger]}>
        <Text style={styles.buttonText}>End All Sessions</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_SECONDARY,
    marginHorizontal: CONSTANTS.SPACING.LARGE,
    marginTop: CONSTANTS.SPACING.SMALL,
    marginBottom: CONSTANTS.SPACING.LARGE,
    borderRadius: CONSTANTS.BORDER_RADIUS.MEDIUM,
    padding: 4,
    position: 'relative',
  },
  tabBackground: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: CONSTANTS.COLORS.ACCENT_BLUE,
    borderRadius: CONSTANTS.BORDER_RADIUS.SMALL,
    shadowColor: CONSTANTS.COLORS.ACCENT_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: CONSTANTS.SPACING.MEDIUM,
    paddingHorizontal: CONSTANTS.SPACING.LARGE,
    borderRadius: CONSTANTS.BORDER_RADIUS.SMALL,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: CONSTANTS.FONT_SIZES.SMALL,
    fontWeight: '600',
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  activeTabText: {
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  tabIcon: {
    fontSize: CONSTANTS.FONT_SIZES.EXTRA_LARGE,
  },
  pageContainer: {
    flex: 1,
    padding: CONSTANTS.SPACING.EXTRA_LARGE,
  },
  pageTitle: {
    fontSize: CONSTANTS.FONT_SIZES.TITLE,
    fontWeight: '700',
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: CONSTANTS.SPACING.SMALL,
  },
  pageSubtitle: {
    fontSize: CONSTANTS.FONT_SIZES.SMALL,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    marginBottom: CONSTANTS.SPACING.XXL,
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_SECONDARY,
    borderRadius: CONSTANTS.BORDER_RADIUS.MEDIUM,
    padding: CONSTANTS.SPACING.LARGE,
    marginBottom: CONSTANTS.SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: CONSTANTS.FONT_SIZES.MEDIUM,
    fontWeight: '600',
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: CONSTANTS.SPACING.MEDIUM,
  },
  inputLabel: {
    fontSize: CONSTANTS.FONT_SIZES.SMALL,
    fontWeight: '500',
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    marginBottom: CONSTANTS.SPACING.SMALL,
    marginTop: CONSTANTS.SPACING.MEDIUM,
  },
  input: {
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_TERTIARY,
    borderRadius: CONSTANTS.BORDER_RADIUS.SMALL,
    padding: CONSTANTS.SPACING.MEDIUM,
    fontSize: CONSTANTS.FONT_SIZES.MEDIUM,
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: CONSTANTS.COLORS.BORDER_COLOR,
  },
  button: {
    backgroundColor: CONSTANTS.COLORS.ACCENT_BLUE,
    borderRadius: CONSTANTS.BORDER_RADIUS.SMALL,
    padding: CONSTANTS.SPACING.MEDIUM,
    alignItems: 'center',
    marginTop: CONSTANTS.SPACING.LARGE,
  },
  buttonText: {
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
    fontSize: CONSTANTS.FONT_SIZES.SMALL,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: CONSTANTS.COLORS.ACCENT_GREEN,
  },
  buttonDanger: {
    backgroundColor: CONSTANTS.COLORS.ACCENT_RED,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: CONSTANTS.SPACING.MEDIUM,
    borderBottomWidth: 0.5,
    borderBottomColor: CONSTANTS.COLORS.BORDER_COLOR,
  },
  settingsItemLast: {
    borderBottomWidth: 0,
  },
  settingsItemText: {
    fontSize: CONSTANTS.FONT_SIZES.SMALL,
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  settingsItemValue: {
    fontSize: CONSTANTS.FONT_SIZES.SMALL,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  textareaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});
