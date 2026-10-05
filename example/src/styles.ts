import { StyleSheet } from 'react-native';

import { CONSTANTS } from './constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: CONSTANTS.SPACING.SMALL,
  },
  safeAreaContent: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  page: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  bannersSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  navigation: {
    flexDirection: 'row',
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
