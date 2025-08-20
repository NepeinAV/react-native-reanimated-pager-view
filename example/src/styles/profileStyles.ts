import { StyleSheet } from 'react-native';

import { CONSTANTS } from '../constants';

export const profileStyles = StyleSheet.create({
  profileHeader: {
    backgroundColor: '#2C2C2E',
    padding: 20,
    alignItems: 'center',
  },
  profileAvatarWrapper: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 14,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  editProfileButton: {
    backgroundColor: '#38383A',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: '#48484A',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
});
