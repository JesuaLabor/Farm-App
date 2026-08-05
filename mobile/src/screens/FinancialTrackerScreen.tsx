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
import type { FinancialEntry } from '../types/app';
import { colors, green, gray, earth, radius, spacing, fontSize, fontWeight, shadows } from '../theme';

interface FinancialTrackerScreenProps {
  onBack: () => void;
}

export const FinancialTrackerScreen: React.FC<FinancialTrackerScreenProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // New entry modal
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Harvest Sale');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await api.listFinancialEntries();
      setEntries(data);
    } catch (e) {
      console.error('Failed to load financial entries:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const totalIncome = entries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const handleAddEntry = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0 || !description) return;
    setSaving(true);
    try {
      await api.createFinancialEntry({
        type,
        category,
        amount: amt,
        description,
        date: new Date().toISOString(),
      });
      setShowModal(false);
      setAmount('');
      setDescription('');
      fetchEntries();
    } catch (e) {
      console.error('Failed to save financial entry:', e);
    } finally {
      setSaving(false);
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
        <Text style={styles.topTitle}>Financial Tracker</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* ── Net Profit Summary Header ─────────────────────────── */}
      <View style={styles.summaryBox}>
        <View style={styles.netBox}>
          <Text style={styles.netLabel}>Net Profit / Loss</Text>
          <Text style={[styles.netValue, netProfit < 0 && styles.netNegative]}>
            ₱{netProfit.toLocaleString()}
          </Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statIncome}>+₱{totalIncome.toLocaleString()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statExpense}>-₱{totalExpense.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* ── Recent Transactions ───────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Transaction Log</Text>
        {loading ? (
          <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: spacing[5] }} />
        ) : entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No financial records</Text>
            <Text style={styles.emptyDesc}>Tap "+ Log" above to record your farm income or expenses.</Text>
          </View>
        ) : (
          entries.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    item.type === 'income' ? styles.incomeCircle : styles.expenseCircle,
                  ]}
                >
                  <Text style={styles.circleIcon}>{item.type === 'income' ? '↗' : '↘'}</Text>
                </View>
                <View>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.itemAmount,
                  item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                ]}
              >
                {item.type === 'income' ? '+' : '-'}₱{item.amount.toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Log Entry Modal ────────────────────────────────────── */}
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
              <Text style={styles.modalTitle}>Log Financial Entry</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Type selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeOption, type === 'income' && styles.typeIncomeActive]}
                  onPress={() => { setType('income'); setCategory('Harvest Sale'); }}
                >
                  <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Income (+)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, type === 'expense' && styles.typeExpenseActive]}
                  onPress={() => { setType('expense'); setCategory('Fertilizers'); }}
                >
                  <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Expense (-)</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Amount (₱)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="e.g. 15000"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={styles.label}>Description / Notes</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sold 50 sacks of Palay"
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity
                style={[styles.submitBtn, saving && styles.btnDisabled]}
                onPress={handleAddEntry}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Entry</Text>
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

  summaryBox: { backgroundColor: green[700], paddingHorizontal: spacing[5], paddingBottom: spacing[6] },
  netBox: { alignItems: 'center', marginBottom: spacing[4] },
  netLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5 },
  netValue: { fontSize: 32, fontWeight: fontWeight.extrabold, color: '#fff', marginTop: 2 },
  netNegative: { color: '#fca5a5' },

  statRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.md, padding: spacing[3] },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  statLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  statIncome: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: '#6ee7b7' },
  statExpense: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: '#fca5a5' },

  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  sectionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing[3] },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing[4], marginBottom: spacing[2], ...shadows.xs },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  incomeCircle: { backgroundColor: colors.accentLight },
  expenseCircle: { backgroundColor: '#fef2f2' },
  circleIcon: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  itemCategory: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text },
  itemDesc: { fontSize: fontSize.xs, color: colors.textMuted },

  itemAmount: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  incomeAmount: { color: colors.accentDark },
  expenseAmount: { color: colors.error },

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
  label: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: gray[600], marginTop: spacing[3], marginBottom: 2 },
  input: { backgroundColor: earth[100], borderWidth: 1, borderColor: gray[200], borderRadius: radius.sm, padding: spacing[3], fontSize: fontSize.base },

  typeSelector: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[1] },
  typeOption: { flex: 1, paddingVertical: spacing[3], borderRadius: radius.sm, borderWidth: 1, borderColor: gray[200], alignItems: 'center' },
  typeIncomeActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  typeExpenseActive: { backgroundColor: colors.error, borderColor: colors.error },
  typeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textMuted },
  typeTextActive: { color: '#fff' },

  submitBtn: { backgroundColor: colors.accent, paddingVertical: spacing[4], borderRadius: radius.sm, alignItems: 'center', marginTop: spacing[5] },
  submitBtnText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
  btnDisabled: { opacity: 0.7 },
});
