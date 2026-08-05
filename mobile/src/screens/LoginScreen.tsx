import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, green, gray, earth, radius, spacing, fontSize, fontWeight, shadows } from '../theme';

interface LoginScreenProps {
  onNavigateRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error' || !err.response) {
        setError('Cannot reach server. Please make sure the backend is running and try again.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={green[700]} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gradient Header Panel ─────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>🌾</Text>
          </View>
          <Text style={styles.appName}>AgriConnect</Text>
          <Text style={styles.tagline}>
            Connecting farmers, buyers, and suppliers across the Philippines
          </Text>
        </View>

        {/* ── Form Card ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              value={email}
              onChangeText={setEmail}
              placeholder="farmer@agri.com"
              placeholderTextColor={gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordFocused && styles.inputFocused]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={gray[400]}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={onNavigateRegister} activeOpacity={0.7}>
            <Text style={styles.linkText}>
              New to AgriConnect?{' '}
              <Text style={styles.linkAccent}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          AgriConnect · Department of Agriculture Partnership
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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

  // ── Header ──────────────────────────────────────────────
  header: {
    paddingTop: spacing[10] + 8,
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[6],
    backgroundColor: green[700],
    alignItems: 'center',
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  logoIcon: {
    fontSize: 32,
  },
  appName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: spacing[2],
  },
  tagline: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  // ── Card ────────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing[4],
    borderRadius: radius.xl,
    padding: spacing[6],
    marginTop: -spacing[2],
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

  // ── Error ────────────────────────────────────────────────
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

  // ── Fields ───────────────────────────────────────────────
  field: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: gray[600],
    marginBottom: spacing[1] + 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: earth[100],
    borderWidth: 1.5,
    borderColor: gray[200],
    borderRadius: radius.sm,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: fontSize.base,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },

  // ── Button ───────────────────────────────────────────────
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

  // ── Link ─────────────────────────────────────────────────
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

  // ── Footer ───────────────────────────────────────────────
  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.45)',
    paddingVertical: spacing[6],
  },
});
