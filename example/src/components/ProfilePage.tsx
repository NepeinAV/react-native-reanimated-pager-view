import React, { useRef, useCallback } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';

import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

import { CONSTANTS } from '../constants';
import { styles } from '../styles';
import { profileStyles } from '../styles/profileStyles';

import { Avatar } from './Avatar';
import { EditProfileBottomSheet } from './EditProfileBottomSheet';

export const ProfilePage: React.FC = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { height } = useWindowDimensions();

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <>
      <ScrollView
        style={styles.pageContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={profileStyles.profileHeader}>
          <View style={profileStyles.profileAvatarWrapper}>
            <Avatar text="YP" size="large" />
          </View>
          <Text style={profileStyles.profileName}>Your Profile</Text>
          <Text style={profileStyles.profileBio}>
            React Native Developer • Building beautiful apps
          </Text>
          <View style={profileStyles.profileStats}>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>127</Text>
              <Text style={profileStyles.statLabel}>Posts</Text>
            </View>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>1.2k</Text>
              <Text style={profileStyles.statLabel}>Followers</Text>
            </View>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>456</Text>
              <Text style={profileStyles.statLabel}>Following</Text>
            </View>
          </View>
          <TouchableOpacity
            style={profileStyles.editProfileButton}
            onPress={openSheet}
          >
            <Text style={profileStyles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomSheetModal
        ref={bottomSheetRef}
        enablePanDownToClose
        backgroundStyle={bottomSheetStyles.container}
        handleIndicatorStyle={bottomSheetStyles.handleIndicator}
      >
        <BottomSheetView style={{ minHeight: height / 2 }}>
          <EditProfileBottomSheet />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

ProfilePage.displayName = 'ProfilePage';

const bottomSheetStyles = StyleSheet.create({
  container: {
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  handleIndicator: {
    backgroundColor: CONSTANTS.COLORS.BORDER_COLOR,
  },
});
