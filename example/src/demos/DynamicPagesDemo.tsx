import { useCallback, useMemo, useRef, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { PagerView } from 'react-native-reanimated-pager-view';

import {
  Button,
  ButtonRow,
  ControlPanel,
  DemoPage,
  EventLog,
  getPageColor,
  Stat,
  StatRow,
  ToggleRow,
  useEventLog,
} from '../demo-kit';

type PageItem = {
  id: string;
  color: string;
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const createPage = (index: number): PageItem => ({
  id:
    LETTERS[index % LETTERS.length] +
    (index >= LETTERS.length ? `${index}` : ''),
  color: getPageColor(index),
});

const INITIAL_PAGES = [0, 1, 2].map(createPage);

// Fisher–Yates, repeated until the order actually changes
const shuffleItems = (items: PageItem[]) => {
  if (items.length < 2) return items;

  let shuffled = items;

  while (shuffled.every((item, index) => item === items[index])) {
    shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
  }

  return shuffled;
};

export const DynamicPagesDemo = () => {
  const [items, setItems] = useState<PageItem[]>(INITIAL_PAGES);
  const [page, setPage] = useState(0);
  const [holdCurrentPage, setHoldCurrentPage] = useState(true);

  const nextIndex = useRef(INITIAL_PAGES.length);
  const { entries, log } = useEventLog();

  const currentItem = items[Math.min(page, items.length - 1)];

  const pages = useMemo(
    () =>
      items.map((item, index) => (
        <DemoPage
          key={item.id}
          index={index}
          label={item.id}
          color={item.color}
        >
          <Text style={styles.pageIndex}>index {index}</Text>
        </DemoPage>
      )),
    [items],
  );

  const onPageSelected = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      log(`onPageSelected(${nextPage})`);
    },
    [log],
  );

  const addPage = useCallback(
    (position: 'start' | 'end') => {
      const item = createPage(nextIndex.current++);

      log(`Add page ${item.id} to the ${position}`);
      setItems((prev) =>
        position === 'start' ? [item, ...prev] : [...prev, item],
      );
    },
    [log],
  );

  const removeCurrent = useCallback(() => {
    if (!currentItem) return;

    log(`Remove page ${currentItem.id}`);
    setItems((prev) => prev.filter((item) => item.id !== currentItem.id));
  }, [currentItem, log]);

  const shuffle = useCallback(() => {
    log('Shuffle pages');
    setItems(shuffleItems);
  }, [log]);

  return (
    <View style={styles.container}>
      <PagerView
        holdCurrentPageOnChildrenUpdate={holdCurrentPage}
        onPageSelected={onPageSelected}
      >
        {pages}
      </PagerView>

      <ControlPanel>
        <StatRow>
          <Stat label="current page">{`${page}`}</Stat>
          <Stat label="current key">{currentItem?.id ?? '–'}</Stat>
          <Stat label="pages">{`${items.length}`}</Stat>
        </StatRow>

        <ButtonRow>
          <Button title="+ Prepend" onPress={() => addPage('start')} />
          <Button title="+ Append" onPress={() => addPage('end')} />
          <Button
            title="− Remove current"
            onPress={removeCurrent}
            disabled={items.length <= 1}
          />
          <Button title="Shuffle" onPress={shuffle} />
        </ButtonRow>

        <ToggleRow
          label="holdCurrentPageOnChildrenUpdate"
          value={holdCurrentPage}
          onValueChange={setHoldCurrentPage}
        />

        <EventLog entries={entries} lines={3} />
      </ControlPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageIndex: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
