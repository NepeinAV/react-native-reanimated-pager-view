import { StyleSheet } from 'react-native';
import { CONSTANTS } from '../constants';

export const notificationStyles = StyleSheet.create({
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
    marginLeft: CONSTANTS.SPACING.MEDIUM,
  },
  notificationText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  notificationAuthor: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  notificationIcon: {
    fontSize: 16,
    marginLeft: 10,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    borderBottomWidth: 0.33,
    borderBottomColor: 'rgba(84, 84, 88, 0.6)',
  },
  filterContentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#3A3A3C',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
});
