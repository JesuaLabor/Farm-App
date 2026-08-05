import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { colors, green, gray, earth, radius, spacing, fontSize, fontWeight, shadows } from '../theme';
import type { Role } from '../types/auth';
import type { TabKey } from '../components/BottomTabBar';

interface DashboardScreenProps {
  onSelectTab: (tab: TabKey) => void;
  onNavigateFinancial: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onSelectTab, onNavigateFinancial }) => {
  const { user, logout } = useAuth();
  const [prices, setPrices] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadDashboardPreview = async () => {
      try {
        const [pData, cData] = await Promise.all([
          api.listPrices().catch(() => []),
          api.listCommunityPosts('all').catch(() => []),
        ]);
        setPrices(pData.slice(0, 3));
        setPosts(cData.slice(0, 2));
      } catch (e) {
        console.error('Failed preview load:', e);
      } finally {
        setLoadingData(false);
      }
    };
    loadDashboardPreview();
  }, []);

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  const roleLabelMap: Record<Role, string> = {
    farmer:    'Farmer Producer',
    buyer:     'Wholesale Buyer',
    supplier:  'Agri Supplier',
    expert:    'Agronomist Expert',
    lgu_staff: 'LGU Agriculture Officer',
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={green[800]} />

      {/* ── Hero Top Header ───────────────────────────────────── */}
      <View style={styles.heroHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🌾</Text>
          </View>
          <Text style={styles.appName}>AgriConnect</Text>
        </View>

        <TouchableOpacity style={styles.avatarBtn} onPress={() => onSelectTab('profile')} activeOpacity={0.8}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Welcome Greeting Card ─────────────────────────────── */}
      <View style={styles.bannerContainer}>
        <View style={styles.roleChip}>
          <View style={styles.roleDot} />
          <Text style={styles.roleChipText}>{roleLabelMap[user.role] ?? user.role}</Text>
        </View>

        <Text style={styles.greetingTitle}>Welcome back, {user.firstName} 👋</Text>
        <Text style={styles.greetingSub}>
          {user.region ? `Regional Hub: ${user.region}` : 'Philippine Agricultural Ecosystem'}
        </Text>

        {/* Quick Weather / Harvest Tip Pill */}
        <View style={styles.tipPill}>
          <Text style={styles.tipIcon}>☀️</Text>
          <Text style={styles.tipText}>Good harvest weather reported in Central Luzon</Text>
        </View>
      </View>

      {/* ── Quick Action Grid (Role-Based Shortcuts) ───────────── */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickCard} onPress={() => onSelectTab('marketplace')} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: green[100] }]}>
              <Text style={styles.quickIcon}>🌾</Text>
            </View>
            <Text style={styles.quickTitle}>Marketplace</Text>
            <Text style={styles.quickSub}>Crops &amp; Produce</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} onPress={() => onSelectTab('community')} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: '#f3e8ff' }]}>
              <Text style={styles.quickIcon}>💬</Text>
            </View>
            <Text style={styles.quickTitle}>Forum</Text>
            <Text style={styles.quickSub}>Ask Experts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} onPress={() => onSelectTab('supply')} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: earth[100] }]}>
              <Text style={styles.quickIcon}>🚜</Text>
            </View>
            <Text style={styles.quickTitle}>Supplies</Text>
            <Text style={styles.quickSub}>Seeds &amp; Tools</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} onPress={onNavigateFinancial} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: '#dbeafe' }]}>
              <Text style={styles.quickIcon}>📒</Text>
            </View>
            <Text style={styles.quickTitle}>Finances</Text>
            <Text style={styles.quickSub}>Income &amp; Expense</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Market Prices Snippet ─────────────────────────────── */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Regional Market Rates</Text>
          <TouchableOpacity onPress={() => onSelectTab('marketplace')}>
            <Text style={styles.seeAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        {loadingData ? (
          <ActivityIndicator color={colors.accent} style={{ padding: spacing[4] }} />
        ) : prices.length === 0 ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Palay (Dry) · ₱22.50 / kg</Text>
            <Text style={styles.previewSub}>Central Luzon benchmark rate</Text>
          </View>
        ) : (
          prices.map((p, idx) => (
            <View key={p.id || idx} style={styles.previewCard}>
              <View style={styles.priceMeta}>
                <Text style={styles.previewTitle}>{p.commodity}</Text>
                <Text style={styles.priceTag}>₱{p.price} / {p.unit}</Text>
              </View>
              <Text style={styles.previewSub}>📍 {p.region}</Text>
            </View>
          ))
        )}
      </View>

      {/* ── Community Highlights Snippet ───────────────────────── */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Discussions</Text>
          <TouchableOpacity onPress={() => onSelectTab('community')}>
            <Text style={styles.seeAllText}>View Forum ›</Text>
          </TouchableOpacity>
        </View>

        {posts.length > 0 && (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postPreviewCard}
              onPress={() => onSelectTab('community')}
              activeOpacity={0.8}
            >
              <Text style={styles.postPreviewCat}>{post.category?.replace('_', ' ')}</Text>
              <Text style={styles.postPreviewTitle}>{post.title}</Text>
              <Text style={styles.postPreviewAuthor}>by {post.authorName} · {post.upvotes} Upvotes</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* ── Logout Button ────────────────────────────────────── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.75}>
        <Text style={styles.logoutText}>Sign out of AgriConnect</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingBottom: spacing[8] },

  // ── Hero ───────────────────────────────────────────────
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[10] + 4,
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[5],
    backgroundColor: green[800],
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 18 },
  appName: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: '#fff', letterSpacing: -0.3 },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  // ── Welcome Banner ─────────────────────────────────────
  bannerContainer: {
    backgroundColor: green[800],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderRadius: radius.xs,
    marginBottom: spacing[2],
  },
  roleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6ee7b7' },
  roleChipText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  greetingTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: '#fff', letterSpacing: -0.4 },
  greetingSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2, marginBottom: spacing[4] },
  tipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
  },
  tipIcon: { fontSize: fontSize.base },
  tipText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.medium },

  // ── Section Layout ─────────────────────────────────────
  sectionWrap: { paddingHorizontal: spacing[4], marginTop: spacing[5] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  sectionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text },
  seeAllText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.accent },

  // ── Quick Actions ──────────────────────────────────────
  quickGrid: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  quickCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'flex-start',
    ...shadows.xs,
  },
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  quickIcon: { fontSize: 20 },
  quickTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text },
  quickSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  // ── Snippets ───────────────────────────────────────────
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[2],
    ...shadows.xs,
  },
  priceMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text },
  priceTag: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.accent },
  previewSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  postPreviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[2],
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    ...shadows.xs,
  },
  postPreviewCat: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.accentDark, textTransform: 'uppercase', marginBottom: 2 },
  postPreviewTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  postPreviewAuthor: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },

  // ── Logout ────────────────────────────────────────────
  logoutBtn: {
    marginHorizontal: spacing[4],
    marginTop: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: gray[200],
    alignItems: 'center',
  },
  logoutText: { color: colors.textMuted, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
