import { StyleSheet } from 'react-native';

import { CONSTANTS } from './constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_SECONDARY,
    paddingVertical: CONSTANTS.SPACING.SMALL,
  },
  safeAreaContent: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#2C2C2E',
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(84, 84, 88, 0.6)',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.37,
  },
  page: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  bannersSection: {
    // paddingVertical: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  bannerPage: {
    flex: 1,
    marginHorizontal: CONSTANTS.SPACING.MEDIUM * 2,
  },
  pagerIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    flex: 1,
    maxWidth: 200,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  navigation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(44, 44, 46, 0.95)',
    borderTopWidth: 0.33,
    borderTopColor: 'rgba(84, 84, 88, 0.6)',
    position: 'relative',
  },
  navBackground: {
    position: 'absolute',
    top: 4,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    height: 56,
    marginHorizontal: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 6,
    marginTop: 4,
    zIndex: 1,
    minHeight: 56,
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
    letterSpacing: 0.1,
    color: '#FFFFFF',
  },
});
