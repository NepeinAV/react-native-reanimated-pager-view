export const CONSTANTS = {
  SCREEN_PADDING: 20,
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    EXTRA_LARGE: 20,
  },

  COLORS: {
    BACKGROUND_PRIMARY: '#1C1C1E',
    BACKGROUND_SECONDARY: '#2C2C2E',
    BACKGROUND_TERTIARY: '#38383A',
    ACCENT_BLUE: '#007AFF',
    ACCENT_GREEN: '#34C759',
    ACCENT_RED: '#FF3B30',
    ACCENT_ORANGE: '#FF9500',
    TEXT_PRIMARY: '#FFFFFF',
    TEXT_SECONDARY: '#8E8E93',
    BORDER_COLOR: '#48484A',
    SEPARATOR_COLOR: 'rgba(84, 84, 88, 0.6)',
  },

  FONT_SIZES: {
    EXTRA_SMALL: 10,
    SMALL: 12,
    MEDIUM: 14,
    LARGE: 16,
    EXTRA_LARGE: 18,
    TITLE: 20,
    HEADER: 24,
    HERO: 34,
  },

  SPACING: {
    EXTRA_SMALL: 4,
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    EXTRA_LARGE: 20,
    XXL: 24,
  },

  AVATAR_SIZES: {
    SMALL: 28,
    MEDIUM: 32,
    LARGE: 80,
  },

  ANIMATION: {
    SPRING_CONFIG: {
      damping: 15,
      mass: 1,
      stiffness: 150,
    },
  },

  FLATLIST_CONFIG: {
    MAX_TO_RENDER_PER_BATCH: 10,
    WINDOW_SIZE: 10,
    INITIAL_NUM_TO_RENDER: 8,
  },

  PROFILE_TABS: [
    { key: 'main', title: 'General', icon: '👤' },
    { key: 'settings', title: 'Settings', icon: '⚙️' },
    { key: 'security', title: 'Security', icon: '🔒' },
  ],

  NOTIFICATION_FILTERS: [
    'All',
    'Unread',
    'Like',
    'Comment',
    'Follow',
    'Message',
  ],
} as const;

export type NotificationFilter =
  (typeof CONSTANTS.NOTIFICATION_FILTERS)[number];

export type ProfileTabKey = (typeof CONSTANTS.PROFILE_TABS)[number]['key'];
