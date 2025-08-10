import React, { useMemo, useCallback } from 'react';
import { FlatList } from 'react-native';
import { ChatItem } from './ChatItem';
import type { Chat } from '../types';
import { styles } from '../styles';
import { chatsData } from '../data/chats';
import {
  useOptimizedFlatListConfig,
  keyExtractorById,
} from '../hooks/useFlatListOptimization';

interface MessagesPageProps {}

export const MessagesPage: React.FC<MessagesPageProps> = () => {
  const chats = useMemo(() => chatsData, []);
  const flatListConfig = useOptimizedFlatListConfig();

  const renderChat = useCallback(
    ({ item }: { item: Chat }) => <ChatItem chat={item} />,
    []
  );

  return (
    <FlatList
      style={styles.pageContainer}
      data={chats}
      renderItem={renderChat}
      keyExtractor={keyExtractorById}
      {...flatListConfig}
    />
  );
};
