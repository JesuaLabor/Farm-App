import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { colors, green, gray, earth, radius, spacing, fontSize, fontWeight, shadows } from '../theme';

interface ProfileScreenProps {
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { user, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [region, setRegion] = useState(user?.region || '');
  const [address, setAddress] = useState(user?.address || '');

  const [saving, setSaving] = useState(false);
  const [msgType, setMsgType] = useState<'success' | 'error' | null>(null);
  const [msgText, setMsgText] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  const roleLabelMap: Record<string, string> = {
    farmer:    'Farmer',
    buyer:     'Buyer',
    supplier:  'Supplier',
    expert:    'Expert',
    lgu_staff: 'LGU Staff',
  };

  const handleSave = async () => {
    setSaving(true);
    setMsgType(null);
    setMsgText('');
    try {
      await api.updateProfile({ firstName, lastName, phone, region, address });
      await refreshProfile();
      setMsgType('success');
      setMsgText('Profile updated successfully.');
    } catch (err: any) {
      setMsgType('error');
      setMsgText(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle="light-content" backgroundColor={green[700]} />

      {/* ── Top Bar ─────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>My profile</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* ── Avatar Card ─────────────────────────────────── */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarSquircle}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <Text style={styles.displayName}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.displayEmail}>{user.email}</Text>
        <View style={styles.roleTag}>
          <View style={styles.roleTagDot} />
          <Text style={styles.roleTagText}>{roleLabelMap[user.role] ?? user.role}</Text>
        </View>
      </View>

      {/* ── Form Card ───────────────────────────────────── */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Personal information</Text>

        <View style={styles.nameRow}>
          <View style={[styles.field, { flex: 1, marginRight: spacing[2] }]}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={[styles.input, focusedField === 'first' && styles.inputFocused]}
              value={firstName}
              onChangeText={setFirstName}
              onFocus={() => setFocusedField('first')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Last name</Text>
            <TextInput
              style={[styles.input, focusedField === 'last' && styles.inputFocused]}
              value={lastName}
              onChangeText={setLastName}
              onFocus={() => setFocusedField('last')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={[styles.input, focusedField === 'phone' && styles.inputFocused]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+63 917 123 4567"
            placeholderTextColor={gray[400]}
            keyboardType="phone-pad"
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Region / Province</Text>
          <TextInput
            style={[styles.input, focusedField === 'region' && styles.inputFocused]}
            value={region}
            onChangeText={setRegion}
            placeholder="Region III - Central Luzon"
            placeholderTextColor={gray[400]}
            onFocus={() => setFocusedField('region')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.inputMulti, focusedField === 'address' && styles.inputFocused]}
            value={address}
            onChangeText={setAddress}
            placeholder="Street, Barangay, City, Province"
            placeholderTextColor={gray[400]}
            multiline
            numberOfLines={3}
            onFocus={() => setFocusedField('address')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Feedback inline */}
        {msgType === 'success' && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{msgText}</Text>
          </View>
        )}
        {msgType === 'error' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{msgText}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.82}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save changes</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing[10],
  },

  // ── Top Bar ───────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[10] + 4,
    paddingBottom: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: green[700],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    width: 80,
  },
  backIcon: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.md,
  },
  backLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  topTitle: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },

  // ── Avatar Section ────────────────────────────────────
  avatarSection: {
    backgroundColor: green[700],
    alignItems: 'center',
    paddingBottom: spacing[7],
    paddingHorizontal: spacing[5],
  },
  avatarSquircle: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,        // squircle shape
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  avatarInitials: {
    color: '#fff',
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
  },
  displayName: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  displayEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginBottom: spacing[3],
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.xs,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    gap: spacing[1] + 2,
  },
  roleTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6ee7b7',
  },
  roleTagText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },

  // ── Form Card ─────────────────────────────────────────
  formCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing[4],
    marginTop: -spacing[2],
    borderRadius: radius.xl,
    padding: spacing[5],
    ...shadows.md,
  },
  formTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing[4],
  },

  nameRow: {
    flexDirection: 'row',
  },
  field: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing[1] + 2,
  },
  input: {
    backgroundColor: earth[100],
    borderWidth: 1.5,
    borderColor: gray[200],
    borderRadius: radius.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: fontSize.base,
    color: colors.text,
  },
  inputMulti: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },

  // ── Feedback ──────────────────────────────────────────
  successBox: {
    backgroundColor: colors.successBg,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  successText: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // ── Save Button ───────────────────────────────────────
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: spacing[4],
    alignItems: 'center',
    ...shadows.sm,
  },
  saveBtnDisabled: {
    opacity: 0.68,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
});
