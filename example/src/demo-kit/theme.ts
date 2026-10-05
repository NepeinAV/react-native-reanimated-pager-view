import { Platform } from 'react-native';

import { CONSTANTS } from '../constants';

export const PAGE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#F7B731',
  '#A55EEA',
  '#26DE81',
  '#FD9644',
  '#4B7BEC',
];

export const getPageColor = (index: number) =>
  PAGE_COLORS[index % PAGE_COLORS.length] as string;

export const kitColors = {
  background: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  surface: CONSTANTS.COLORS.BACKGROUND_SECONDARY,
  surfaceRaised: CONSTANTS.COLORS.BACKGROUND_TERTIARY,
  accent: CONSTANTS.COLORS.ACCENT_BLUE,
  text: CONSTANTS.COLORS.TEXT_PRIMARY,
  textSecondary: CONSTANTS.COLORS.TEXT_SECONDARY,
  separator: CONSTANTS.COLORS.SEPARATOR_COLOR,
  code: '#FFD479',
};

export const monospace = Platform.select({
  ios: 'Menlo',
  default: 'monospace',
});
