import { StyleSheet } from 'react-native';

import { CONSTANTS } from '../constants';

export const postStyles = StyleSheet.create({
  postsSection: {
    paddingTop: 10,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  postContainer: {
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_SECONDARY,
    marginBottom: 10,
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postInfo: {
    flex: 1,
    marginLeft: CONSTANTS.SPACING.MEDIUM,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postTime: {
    fontSize: 12,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#38383A',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  actionText: {
    fontSize: 14,
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  likedIcon: {
    color: '#FF3B30',
  },
  unlikedIcon: {
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
  },
});
