import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, green, gray, radius, spacing, fontSize, fontWeight, shadows } from '../theme';

export type TabKey = 'dashboard' | 'marketplace' | 'community' | 'supply' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'dashboard',   label: 'Home',      icon: '🏠' },
  { key: 'marketplace', label: 'Market',    icon: '🌾' },
  { key: 'community',   label: 'Community', icon: '💬' },
  { key: 'supply',      label: 'Supplies',  icon: '🚜' },
  { key: 'profile',     label: 'Profile',   icon: '👤' },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <View style={styles.bar}>
      {tabs.map((t) => {
        const isActive = activeTab === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={styles.tabBtn}
            onPress={() => onSelectTab(t.key)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.activeDot} />}
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{t.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: gray[200],
    paddingTop: spacing[2],
    paddingBottom: spacing[4], // extra padding for iOS home indicator
    paddingHorizontal: spacing[2],
    justifyContent: 'space-around',
    alignItems: 'center',
    ...shadows.md,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: spacing[1],
  },
  activeDot: {
    position: 'absolute',
    top: -spacing[2],
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.65,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.accentDark,
    fontWeight: fontWeight.bold,
  },
});
