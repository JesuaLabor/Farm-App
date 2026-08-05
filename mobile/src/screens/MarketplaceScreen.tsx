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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { ProduceListing } from '../types/app';
import { colors, green, gray, earth, radius, spacing, fontSize, fontWeight, shadows } from '../theme';

const categories = ['All', 'Grains & Cereals', 'Vegetables', 'Fruits', 'Root Crops', 'Livestock & Poultry'];

interface MarketplaceScreenProps {
  onBack: () => void;
}

export const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Purchase modal (for Buyers)
  const [selectedItem, setSelectedItem] = useState<ProduceListing | null>(null);
  const [purchaseQty, setPurchaseQty] = useState('1');
  const [contactMsg, setContactMsg] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sell Produce Modal (for Farmers)
  const [showSellModal, setShowSellModal] = useState(false);
  const [cropName, setCropName] = useState('');
  const [sellCat, setSellCat] = useState('Grains & Cereals');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [location, setLocation] = useState(user?.region || 'Central Luzon');
  const [desc, setDesc] = useState('');
  const [submittingSell, setSubmittingSell] = useState(false);
  const [sellErr, setSellErr] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await api.listProduce(search, selectedCategory);
      setListings(data);
    } catch (e) {
      console.error('Failed to load listings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [search, selectedCategory]);

  const handleBuy = async () => {
    if (!selectedItem) return;
    const qty = Number(purchaseQty);
    if (!qty || qty <= 0) {
      setFeedback({ type: 'error', text: 'Please enter a valid quantity.' });
      return;
    }
    setPurchasing(true);
    setFeedback(null);
    try {
      await api.initiatePurchase({
        listingId: selectedItem.id,
        quantity: qty,
        contactMessage: contactMsg,
      });
      setFeedback({ type: 'success', text: 'Purchase request sent! Track under your order history.' });
      setTimeout(() => {
        setSelectedItem(null);
        setFeedback(null);
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Purchase failed.' });
    } finally {
      setPurchasing(false);
    }
  };

  const handleCreateListing = async () => {
    if (!cropName || !quantity || !pricePerUnit) {
      setSellErr('Please fill in crop name, quantity, and price.');
      return;
    }
    setSubmittingSell(true);
    setSellErr('');
    try {
      await api.createProduceListing({
        cropName,
        category: sellCat,
        quantity: Number(quantity),
        unit,
        pricePerUnit: Number(pricePerUnit),
        location,
        description: desc,
      });
      setShowSellModal(false);
      setCropName(''); setQuantity(''); setPricePerUnit(''); setDesc('');
      fetchListings();
    } catch (err: any) {
      setSellErr(err.response?.data?.error || 'Failed to list produce for sale.');
    } finally {
      setSubmittingSell(false);
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
        <Text style={styles.topTitle}>Produce Marketplace</Text>
        {user?.role === 'farmer' ? (
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSellModal(true)}>
            <Text style={styles.actionBtnText}>+ Sell</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {/* ── Search Bar ────────────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search crop name (e.g. Rice, Mango)..."
          placeholderTextColor={gray[400]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── Category Chips ────────────────────────────────────── */}
      <View style={styles.chipRowWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Listings ──────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loading ? (
          <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: spacing[10] }} />
        ) : listings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🌾</Text>
            <Text style={styles.emptyTitle}>No produce listings found</Text>
            <Text style={styles.emptyDesc}>Try searching for a different crop or category.</Text>
          </View>
        ) : (
          listings.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryBadge}>{item.category}</Text>
                <Text style={styles.location}>📍 {item.location}</Text>
              </View>

              <Text style={styles.cropName}>{item.cropName}</Text>
              <Text style={styles.farmerName}>by {item.farmerName}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>₱{item.pricePerUnit.toLocaleString()}</Text>
                <Text style={styles.priceUnit}> / {item.unit}</Text>
              </View>
              <Text style={styles.stock}>Available: {item.quantity} {item.unit}</Text>

              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => {
                  setSelectedItem(item);
                  setPurchaseQty('1');
                  setContactMsg('');
                  setFeedback(null);
                }}
                activeOpacity={0.82}
              >
                <Text style={styles.buyBtnText}>View Details &amp; Order</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Farmer: Sell Produce Modal ─────────────────────────── */}
      <Modal visible={showSellModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowSellModal(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>List Produce for Sale</Text>
              <TouchableOpacity onPress={() => setShowSellModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {sellErr ? <Text style={styles.errMsg}>{sellErr}</Text> : null}

              <Text style={styles.label}>Crop Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Yellow Corn, Dinorado Rice"
                value={cropName}
                onChangeText={setCropName}
              />

              <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="100"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Unit</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="kg / sack"
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>

              <Text style={styles.label}>Price per Unit (₱) *</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="25.00"
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
              />

              <Text style={styles.label}>Farm Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Cabanatuan, Nueva Ecija"
                value={location}
                onChangeText={setLocation}
              />

              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                multiline
                placeholder="Harvest date, quality grade, organic..."
                value={desc}
                onChangeText={setDesc}
              />

              <TouchableOpacity
                style={[styles.confirmBtn, submittingSell && styles.btnDisabled]}
                onPress={handleCreateListing}
                disabled={submittingSell}
                activeOpacity={0.85}
              >
                {submittingSell ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Publish Produce Listing</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Buyer: Purchase Request Modal ───────────────────────── */}
      <Modal visible={!!selectedItem} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setSelectedItem(null)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Request</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {selectedItem && (
                <>
                  <Text style={styles.modalItemName}>{selectedItem.cropName}</Text>
                  <Text style={styles.modalDetail}>Farmer: {selectedItem.farmerName}</Text>
                  <Text style={styles.modalDetail}>Price: ₱{selectedItem.pricePerUnit} / {selectedItem.unit}</Text>

                  {feedback && (
                    <View style={[styles.feedback, feedback.type === 'error' && styles.feedbackErr]}>
                      <Text style={[styles.feedbackText, feedback.type === 'error' && styles.feedbackTextErr]}>
                        {feedback.text}
                      </Text>
                    </View>
                  )}

                  {user?.role === 'buyer' ? (
                    <>
                      <Text style={styles.label}>Quantity Needed ({selectedItem.unit})</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={purchaseQty}
                        onChangeText={setPurchaseQty}
                      />

                      <Text style={styles.label}>Delivery Note / Instructions</Text>
                      <TextInput
                        style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                        multiline
                        placeholder="Preferred pickup address..."
                        value={contactMsg}
                        onChangeText={setContactMsg}
                      />

                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Estimate:</Text>
                        <Text style={styles.totalValue}>
                          ₱{((Number(purchaseQty) || 0) * selectedItem.pricePerUnit).toLocaleString()}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.confirmBtn, purchasing && styles.btnDisabled]}
                        onPress={handleBuy}
                        disabled={purchasing}
                        activeOpacity={0.85}
                      >
                        {purchasing ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.confirmBtnText}>Submit Order Request</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.rbacBox}>
                      <Text style={styles.rbacText}>
                        Only registered <Text style={{ fontWeight: 'bold' }}>Buyers</Text> can initiate produce purchase requests. Log in with a buyer account to buy directly.
                      </Text>
                    </View>
                  )}
                </>
              )}
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
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.xs },
  actionBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  searchWrap: { padding: spacing[4], backgroundColor: green[700] },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: radius.sm,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: fontSize.base,
    color: colors.text,
  },

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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[1] },
  categoryBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.accentDark,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  location: { fontSize: fontSize.xs, color: colors.textMuted },
  cropName: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.text, marginTop: spacing[1] },
  farmerName: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing[2] },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 },
  priceValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.accent },
  priceUnit: { fontSize: fontSize.xs, color: colors.textMuted },
  stock: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing[3] },
  buyBtn: { backgroundColor: colors.accent, paddingVertical: spacing[3], borderRadius: radius.sm, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },

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
  modalItemName: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.accent, marginBottom: 2 },
  modalDetail: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 2 },
  label: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: gray[600], marginTop: spacing[2], marginBottom: 2 },
  input: { backgroundColor: earth[100], borderWidth: 1, borderColor: gray[200], borderRadius: radius.sm, padding: spacing[3], fontSize: fontSize.base },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing[3], marginBottom: spacing[3], backgroundColor: colors.accentLight, padding: spacing[3], borderRadius: radius.sm },
  totalLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  totalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.accent },
  confirmBtn: { backgroundColor: colors.accent, paddingVertical: spacing[4], borderRadius: radius.sm, alignItems: 'center', marginTop: spacing[3] },
  confirmBtnText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
  btnDisabled: { opacity: 0.7 },
  feedback: { backgroundColor: colors.successBg, padding: spacing[2], borderRadius: radius.sm, marginVertical: spacing[2] },
  feedbackErr: { backgroundColor: colors.errorBg },
  feedbackText: { color: colors.success, fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  feedbackTextErr: { color: colors.error },
  rbacBox: { backgroundColor: '#fef2f2', borderLeftWidth: 3, borderLeftColor: colors.error, borderRadius: radius.sm, padding: spacing[3], marginTop: spacing[3] },
  rbacText: { color: colors.error, fontSize: fontSize.xs, lineHeight: 18 },
  errMsg: { color: colors.error, fontSize: fontSize.xs, marginBottom: spacing[2] },
});
