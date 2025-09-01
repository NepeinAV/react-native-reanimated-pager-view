import React, { useMemo, useCallback } from 'react';

import { FlatList } from 'react-native';

import { ScrollableWrapper } from 'react-native-reanimated-pager-view';

import { chatsData } from '../data/chats';
import {
  useOptimizedFlatListConfig,
  keyExtractorById,
} from '../hooks/useFlatListOptimization';
import { styles } from '../styles';

import { ChatItem } from './ChatItem';

import type { Chat } from '../types';

interface MessagesPageProps {}

export const MessagesPage: React.FC<MessagesPageProps> = () => {
  const chats = useMemo(() => chatsData, []);
  const flatListConfig = useOptimizedFlatListConfig();

  const renderChat = useCallback(
    ({ item }: { item: Chat }) => <ChatItem chat={item} />,
    [],
  );

  return (
    <ScrollableWrapper orientation="vertical">
      <FlatList
        style={styles.pageContainer}
        data={chats}
        renderItem={renderChat}
        keyExtractor={keyExtractorById}
        {...flatListConfig}
      />
    </ScrollableWrapper>
  );
};
