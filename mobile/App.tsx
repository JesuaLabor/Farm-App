import React, { useState } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MarketplaceScreen } from './src/screens/MarketplaceScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { SupplyStoreScreen } from './src/screens/SupplyStoreScreen';
import { FinancialTrackerScreen } from './src/screens/FinancialTrackerScreen';
import { BottomTabBar, type TabKey } from './src/components/BottomTabBar';

type ActiveView = TabKey | 'financial';

const MainNavigator: React.FC = () => {
  const { user } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  if (!user) {
    return authScreen === 'login' ? (
      <LoginScreen onNavigateRegister={() => setAuthScreen('register')} />
    ) : (
      <RegisterScreen onNavigateLogin={() => setAuthScreen('login')} />
    );
  }

  const renderActiveScreen = () => {
    switch (activeView) {
      case 'profile':
        return <ProfileScreen onBack={() => setActiveView('dashboard')} />;
      case 'marketplace':
        return <MarketplaceScreen onBack={() => setActiveView('dashboard')} />;
      case 'community':
        return <CommunityScreen onBack={() => setActiveView('dashboard')} />;
      case 'supply':
        return <SupplyStoreScreen onBack={() => setActiveView('dashboard')} />;
      case 'financial':
        return <FinancialTrackerScreen onBack={() => setActiveView('dashboard')} />;
      case 'dashboard':
      default:
        return (
          <DashboardScreen
            onSelectTab={(tab) => setActiveView(tab)}
            onNavigateFinancial={() => setActiveView('financial')}
          />
        );
    }
  };

  // Determine active tab for BottomTabBar highlight
  const currentTab: TabKey =
    activeView === 'financial' ? 'dashboard' : (activeView as TabKey);

  return (
    <View style={styles.appShell}>
      <View style={styles.contentArea}>{renderActiveScreen()}</View>
      <BottomTabBar activeTab={currentTab} onSelectTab={(tab) => setActiveView(tab)} />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#123720" />
        <AuthProvider>
          <MainNavigator />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f4',
  },
  appShell: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
});
