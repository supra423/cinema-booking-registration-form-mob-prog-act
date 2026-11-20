import React, { useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ITEM_HEIGHT = 36;
const PICKER_HEIGHT = ITEM_HEIGHT * 3;

const HOURS = Array.from({ length: 6 }, (_, i) => String(i)); // 0h - 5h
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0')
); // 00m - 59m
const PRESETS = ['1h 30m', '1h 45m', '2h 00m', '2h 30m'];

function RuntimeWheel({ data, selectedValue, unit, onSelect }) {
  const scrollRef = useRef(null);
  const selectedIndex = Math.max(
    0,
    data.findIndex((item) => item === selectedValue)
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, [selectedIndex]);

  const handleMomentumEnd = (event) => {
    const index = Math.min(
      data.length - 1,
      Math.max(0, Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT))
    );
    onSelect(data[index]);
  };

  return (
    <View style={styles.wheel}>
      <View pointerEvents="none" style={styles.highlight} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {data.map((item, index) => {
          const active = index === selectedIndex;
          return (
            <TouchableOpacity
              key={`${unit}-${item}`}
              style={styles.row}
              onPress={() => {
                onSelect(item);
                scrollRef.current?.scrollTo({
                  y: index * ITEM_HEIGHT,
                  animated: true,
                });
              }}
            >
              <Text style={[styles.rowText, active && styles.rowTextActive]}>
                {item}
                {unit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function parseRuntimeString(runtimeStr = '2h 00m') {
  const match = String(runtimeStr).match(/(\d+)\s*h.*?(\d+)\s*m/i);
  if (!match) return { hours: '2', minutes: '00' };
  return {
    hours: String(Math.min(5, parseInt(match[1], 10) || 0)),
    minutes: String(Math.min(59, parseInt(match[2], 10) || 0)).padStart(2, '0'),
  };
}

export function formatRuntimeString({ hours = '2', minutes = '00' }) {
  return `${parseInt(hours, 10) || 0}h ${String(minutes).padStart(2, '0')}m`;
}

export default function RuntimeClockPicker({ value = '2h 00m', onChange }) {
  const { hours, minutes } = parseRuntimeString(value);

  const applyUpdate = (nextHours, nextMinutes) => {
    onChange?.(formatRuntimeString({ hours: nextHours, minutes: nextMinutes }));
  };

  return (
    <View style={styles.frame}>
      <View style={styles.header}>
        <Text style={styles.title}>RUNNING TIME</Text>
        <Text style={styles.readout}>
          {formatRuntimeString({ hours, minutes })}
        </Text>
      </View>

      <View style={styles.wheels}>
        <RuntimeWheel
          data={HOURS}
          selectedValue={hours}
          unit="h"
          onSelect={(h) => applyUpdate(h, minutes)}
        />
        <RuntimeWheel
          data={MINUTES}
          selectedValue={minutes}
          unit="m"
          onSelect={(m) => applyUpdate(hours, m)}
        />
      </View>

      <View style={styles.presetsRow}>
        {PRESETS.map((preset) => {
          const isCurrent = formatRuntimeString({ hours, minutes }) === preset;
          return (
            <TouchableOpacity
              key={preset}
              style={[styles.presetChip, isCurrent && styles.presetChipActive]}
              onPress={() => onChange?.(preset)}
            >
              <Text
                style={[styles.presetText, isCurrent && styles.presetTextActive]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#0B0F17',
    borderWidth: 1.5,
    borderColor: '#2A3446',
    borderRadius: 10,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  readout: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '800',
  },
  wheels: {
    height: PICKER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  wheel: {
    width: 90,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(214, 40, 40, 0.16)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D62828',
    borderRadius: 6,
  },
  row: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  rowTextActive: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  presetChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  presetChipActive: {
    backgroundColor: '#D62828',
  },
  presetText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});