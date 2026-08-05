import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { api } from '../api';
import type { CommunityPost } from '../types/app';
import { colors, green, gray, earth, radius, spacing, fontSize, fontWeight, shadows } from '../theme';

const topics = [
  { key: 'all', label: 'All Discussions' },
  { key: 'pest_control', label: 'Pest & Disease' },
  { key: 'soil_fertilizer', label: 'Soil & Fertilizer' },
  { key: 'crop_technique', label: 'Farming Tech' },
  { key: 'weather_advisory', label: 'Weather' },
  { key: 'general', label: 'General' },
];

interface CommunityScreenProps {
  onBack: () => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({ onBack }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('all');

  // New post modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('pest_control');
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.listCommunityPosts(selectedTopic);
      setPosts(data);
    } catch (e) {
      console.error('Failed to load community posts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTopic]);

  const handleUpvote = async (postId: string) => {
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isUpvotedByMe: !p.isUpvotedByMe,
                upvotes: p.isUpvotedByMe ? p.upvotes - 1 : p.upvotes + 1,
              }
            : p
        )
      );
      await api.toggleUpvotePost(postId);
    } catch (e) {
      fetchPosts();
    }
  };

  const handleCreate = async () => {
    if (!title || !body) {
      setErr('Please fill in both title and body.');
      return;
    }
    setCreating(true);
    setErr('');
    try {
      await api.createCommunityPost({ title, body, category });
      setShowModal(false);
      setTitle('');
      setBody('');
      fetchPosts();
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Failed to publish post.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={green[700]} />

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Community Forum</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* ── Topic Chips ───────────────────────────────────────── */}
      <View style={styles.chipRowWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {topics.map((t) => {
            const active = selectedTopic === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedTopic(t.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Forum Posts List ──────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loading ? (
          <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: spacing[10] }} />
        ) : posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No discussions yet</Text>
            <Text style={styles.emptyDesc}>Be the first to start a topic for this category.</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.authorRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{post.authorName?.[0]?.toUpperCase() || 'U'}</Text>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.authorName}>{post.authorName}</Text>
                      {post.isExpert ? (
                        <View style={styles.expertBadge}>
                          <Text style={styles.expertText}>🎓 Expert</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.authorRole}>{post.authorRole}</Text>
                  </View>
                </View>
                <Text style={styles.categoryTag}>{post.category.replace('_', ' ')}</Text>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postBody} numberOfLines={3}>{post.body}</Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.upvoteBtn, post.isUpvotedByMe && styles.upvoteBtnActive]}
                  onPress={() => handleUpvote(post.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.upvoteText, post.isUpvotedByMe && styles.upvoteTextActive]}>
                    ▲ {post.upvotes} Upvotes
                  </Text>
                </TouchableOpacity>
                <Text style={styles.commentsCount}>💬 {post.commentsCount} Comments</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── New Post Modal ────────────────────────────────────── */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start a Discussion</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {err ? <Text style={styles.errMsg}>{err}</Text> : null}

              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Best fertilizer for yellow corn?"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Details / Body</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                multiline
                placeholder="Describe your issue or question..."
                value={body}
                onChangeText={setBody}
              />

              <TouchableOpacity
                style={[styles.submitBtn, creating && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={creating}
                activeOpacity={0.85}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Publish Post</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[10] + 4,
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: green[700],
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backIcon: { color: '#fff', fontSize: fontSize.md },
  backLabel: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  topTitle: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.xs },
  addBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  chipRowWrap: { backgroundColor: colors.surface, paddingVertical: spacing[2] },
  chipScroll: { paddingHorizontal: spacing[4], gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: gray[200],
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textMuted },
  chipTextActive: { color: '#fff' },

  scroll: { padding: spacing[4], gap: spacing[3], paddingBottom: spacing[10] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing[4], ...shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.sm },
  authorName: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  authorRole: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'capitalize' },
  expertBadge: { backgroundColor: colors.accentLight, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.xs },
  expertText: { color: colors.accentDark, fontSize: 10, fontWeight: fontWeight.bold },
  categoryTag: { fontSize: 10, color: colors.textMuted, backgroundColor: earth[100], paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.xs, textTransform: 'uppercase' },

  postTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 4 },
  postBody: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18, marginBottom: spacing[3] },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: gray[100], paddingTop: spacing[2] },
  upvoteBtn: { backgroundColor: gray[100], paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: radius.xs },
  upvoteBtnActive: { backgroundColor: colors.accentLight },
  upvoteText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: gray[600] },
  upvoteTextActive: { color: colors.accentDark },
  commentsCount: { fontSize: fontSize.xs, color: colors.textMuted },

  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing[8], alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: spacing[2] },
  emptyTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text },
  emptyDesc: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: 4 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdropDismiss: { flex: 1 },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing[5], maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.text },
  modalClose: { fontSize: fontSize.lg, color: colors.textMuted },
  label: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: gray[600], marginTop: spacing[2], marginBottom: 2 },
  input: { backgroundColor: earth[100], borderWidth: 1, borderColor: gray[200], borderRadius: radius.sm, padding: spacing[3], fontSize: fontSize.base },
  submitBtn: { backgroundColor: colors.accent, paddingVertical: spacing[4], borderRadius: radius.sm, alignItems: 'center', marginTop: spacing[4] },
  submitBtnText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
  btnDisabled: { opacity: 0.7 },
  errMsg: { color: colors.error, fontSize: fontSize.xs, marginBottom: spacing[2] },
});
