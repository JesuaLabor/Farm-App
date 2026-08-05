import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types/auth';
import { colors, green, gray, earth, radius, spacing, fontSize, fontWeight, shadows } from '../theme';

const roles: { role: Role; label: string; icon: string; desc: string }[] = [
  { role: 'farmer',    label: 'Farmer',    icon: '🧑‍🌾', desc: 'Sell produce & access market rates' },
  { role: 'buyer',     label: 'Buyer',     icon: '📦',  desc: 'Source fresh crops from local farms' },
  { role: 'supplier',  label: 'Supplier',  icon: '🚜',  desc: 'Sell seeds, fertilizers & machinery' },
  { role: 'expert',    label: 'Expert',    icon: '🎓',  desc: 'Provide agronomic advice & consultation' },
  { role: 'lgu_staff', label: 'LGU Staff', icon: '🏛️',  desc: 'Coordinate regional farm programs' },
];

interface RegisterScreenProps {
  onNavigateLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateLogin }) => {
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ email, password, role, firstName, lastName });
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error' || !err.response) {
        setError('Cannot reach server (http://192.168.100.164:8080). Make sure your iPhone is on the same Wi-Fi network.');
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={green[700]} />

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>🌾</Text>
        </View>
        <Text style={styles.appName}>AgriConnect</Text>
        <Text style={styles.tagline}>Join the Philippine agricultural community</Text>
      </View>

      {/* ── Card ────────────────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create your account</Text>
        <Text style={styles.cardSubtitle}>Choose a role to get started</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Role Selector ────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Your role</Text>
        <View style={styles.roleGrid}>
          {roles.map((r) => {
            const selected = role === r.role;
            return (
              <TouchableOpacity
                key={r.role}
                style={[styles.roleCard, selected && styles.roleCardSelected]}
                onPress={() => setRole(r.role)}
                activeOpacity={0.78}
              >
                <Text style={styles.roleIcon}>{r.icon}</Text>
                <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>
                  {r.label}
                </Text>
                <Text style={[styles.roleDesc, selected && styles.roleDescSelected]} numberOfLines={2}>
                  {r.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Name Fields ──────────────────────────────────── */}
        <View style={styles.nameRow}>
          <View style={[styles.field, { flex: 1, marginRight: spacing[2] }]}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={[styles.input, focusedField === 'first' && styles.inputFocused]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Juan"
              placeholderTextColor={gray[400]}
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
              placeholder="dela Cruz"
              placeholderTextColor={gray[400]}
              onFocus={() => setFocusedField('last')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={[styles.input, focusedField === 'email' && styles.inputFocused]}
            value={email}
            onChangeText={setEmail}
            placeholder="juan@agri.com"
            placeholderTextColor={gray[400]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password (min. 8 characters)</Text>
          <TextInput
            style={[styles.input, focusedField === 'password' && styles.inputFocused]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={gray[400]}
            secureTextEntry
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.82}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnText}>Create account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={onNavigateLogin} activeOpacity={0.7}>
          <Text style={styles.linkText}>
            Already registered?{' '}
            <Text style={styles.linkAccent}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        AgriConnect · Department of Agriculture Partnership
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: green[700],
  },
  scroll: {
    flexGrow: 1,
  },

  // ── Header ─────────────────────────────────────────────
  header: {
    paddingTop: spacing[10] + 8,
    paddingBottom: spacing[7],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  logoIcon: {
    fontSize: 28,
  },
  appName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: spacing[1] + 2,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  // ── Card ───────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing[4],
    borderRadius: radius.xl,
    padding: spacing[6],
    ...shadows.lg,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    marginBottom: spacing[1],
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[5],
  },

  // ── Error ──────────────────────────────────────────────
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

  // ── Role Selector ──────────────────────────────────────
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing[2] + 2,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  roleCard: {
    width: '47%',
    backgroundColor: earth[100],
    borderRadius: radius.md,
    padding: spacing[3],
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
  },
  roleIcon: {
    fontSize: 22,
    marginBottom: spacing[1] + 2,
  },
  roleLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  roleLabelSelected: {
    color: colors.accentDark,
  },
  roleDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  roleDescSelected: {
    color: green[600],
  },

  // ── Fields ─────────────────────────────────────────────
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
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },

  // ── Button ─────────────────────────────────────────────
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
    ...shadows.sm,
  },
  btnDisabled: {
    opacity: 0.68,
  },
  btnText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },

  // ── Link ───────────────────────────────────────────────
  link: {
    marginTop: spacing[5],
    alignItems: 'center',
  },
  linkText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  linkAccent: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },

  // ── Footer ─────────────────────────────────────────────
  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.42)',
    paddingVertical: spacing[6],
  },
});
