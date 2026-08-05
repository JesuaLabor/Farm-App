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
import { useAuth } from '../contexts/AuthContext';
import type { SupplyProduct } from '../types/app';
import { colors, green, gray, earth, radius, spacing, fontSize, fontWeight, shadows } from '../theme';

const categories = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Machinery & Tools'];

interface SupplyStoreScreenProps {
  onBack: () => void;
}

export const SupplyStoreScreen: React.FC<SupplyStoreScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<SupplyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Supplier: Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [prodCat, setProdCat] = useState('Fertilizers');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('bag');
  const [stockQuantity, setStockQuantity] = useState('');
  const [desc, setDesc] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);
  const [addErr, setAddErr] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.listSupply(selectedCategory);
      setProducts(data);
    } catch (e) {
      console.error('Failed to load supply products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleCreateProduct = async () => {
    if (!name || !price || !stockQuantity) {
      setAddErr('Please fill in product name, price, and stock quantity.');
      return;
    }
    setAddingProduct(true);
    setAddErr('');
    try {
      await api.createSupplyProduct({
        name,
        category: prodCat,
        price: Number(price),
        unit,
        stockQuantity: Number(stockQuantity),
        description: desc,
      });
      setShowAddModal(false);
      setName(''); setPrice(''); setStockQuantity(''); setDesc('');
      fetchProducts();
    } catch (err: any) {
      setAddErr(err.response?.data?.error || 'Failed to add supply product.');
    } finally {
      setAddingProduct(false);
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
        <Text style={styles.topTitle}>Agri-Supply Store</Text>
        {user?.role === 'supplier' ? (
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.actionBtnText}>+ Product</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
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

      {/* ── Product List ──────────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loading ? (
          <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: spacing[10] }} />
        ) : products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🚜</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyDesc}>Try selecting a different category.</Text>
          </View>
        ) : (
          products.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryBadge}>{item.category}</Text>
                <Text style={styles.supplierName}>by {item.supplierName}</Text>
              </View>

              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description || 'Quality agricultural input'}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>₱{item.price.toLocaleString()}</Text>
                <Text style={styles.priceUnit}> / {item.unit}</Text>
              </View>
              <Text style={styles.stock}>In Stock: {item.stockQuantity} {item.unit}s</Text>

              <TouchableOpacity style={styles.orderBtn} activeOpacity={0.82}>
                <Text style={styles.orderBtnText}>Order Supply</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Supplier: Add Product Modal ───────────────────────── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Supply Product</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {addErr ? <Text style={styles.errMsg}>{addErr}</Text> : null}

              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Urea Fertilizer 46-0-0, Hybrid Corn Seeds"
                value={name}
                onChangeText={setName}
              />

              <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Price (₱) *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="1450"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Unit</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50kg bag"
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>

              <Text style={styles.label}>Stock Quantity *</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="500"
                value={stockQuantity}
                onChangeText={setStockQuantity}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                multiline
                placeholder="Product specs, certification, or usage details..."
                value={desc}
                onChangeText={setDesc}
              />

              <TouchableOpacity
                style={[styles.orderBtn, addingProduct && { opacity: 0.7 }, { marginTop: spacing[4] }]}
                onPress={handleCreateProduct}
                disabled={addingProduct}
                activeOpacity={0.85}
              >
                {addingProduct ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.orderBtnText}>Add Product to Store Catalog</Text>
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
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.xs },
  actionBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.bold },

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
  supplierName: { fontSize: fontSize.xs, color: colors.textMuted },
  productName: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.text, marginTop: spacing[1] },
  desc: { fontSize: fontSize.xs, color: colors.textMuted, marginVertical: spacing[2] },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 },
  priceValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.accent },
  priceUnit: { fontSize: fontSize.xs, color: colors.textMuted },
  stock: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing[3] },
  orderBtn: { backgroundColor: colors.accent, paddingVertical: spacing[3], borderRadius: radius.sm, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },

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
  errMsg: { color: colors.error, fontSize: fontSize.xs, marginBottom: spacing[2] },
});
