import { useCallback, useRef, useState } from 'react';

import { ScrollView, StyleSheet, Text } from 'react-native';

import { kitColors, monospace } from './theme';

type LogEntry = {
  id: number;
  time: string;
  message: string;
};

const MAX_ENTRIES = 30;

const formatTime = (date: Date) =>
  [date.getMinutes(), date.getSeconds()]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':') + `.${Math.floor(date.getMilliseconds() / 100)}`;

/**
 * Collects callback calls, so it's visible when and in which order they fire
 */
export const useEventLog = () => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const nextId = useRef(0);

  const log = useCallback((message: string) => {
    const entry = {
      id: nextId.current++,
      time: formatTime(new Date()),
      message,
    };

    setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
  }, []);

  return { entries, log };
};

type EventLogProps = {
  entries: LogEntry[];
  lines?: number;
};

const LINE_HEIGHT = 17;

/**
 * Shows the latest events on top, older ones are reachable by scrolling
 */
export const EventLog = ({ entries, lines = 4 }: EventLogProps) => {
  return (
    <ScrollView
      style={[styles.container, { height: lines * LINE_HEIGHT + 16 }]}
      contentContainerStyle={styles.content}
    >
      {entries.length === 0 ? (
        <Text style={styles.placeholder}>Events will appear here…</Text>
      ) : (
        entries.map((entry, index) => (
          <Text
            key={entry.id}
            style={[styles.line, index > 0 && styles.oldLine]}
            numberOfLines={1}
          >
            <Text style={styles.time}>{entry.time} </Text>
            {entry.message}
          </Text>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  content: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  placeholder: {
    fontFamily: monospace,
    fontSize: 12,
    lineHeight: LINE_HEIGHT,
    color: kitColors.textSecondary,
  },
  line: {
    fontFamily: monospace,
    fontSize: 12,
    lineHeight: LINE_HEIGHT,
    color: '#7CFC9A',
  },
  oldLine: {
    opacity: 0.55,
  },
  time: {
    color: kitColors.textSecondary,
  },
});
