import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, Globe, Bell, LogOut, ChevronRight, Wallet, Key, Info } from 'lucide-react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will clear your wallet data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          Alert.alert('Logged out', 'You have been logged out successfully');
        }}
      ]
    );
  };

  const handleExportWallet = () => {
    Alert.alert(
      'Export Wallet',
      'This will show your private key. Make sure you are in a secure location and no one can see your screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {
          Alert.alert(
            'Private Key',
            'Demo Private Key:\n0x1234567890123456789012345678901234567890123456789012345678901234\n\nStore this securely!',
            [{ text: 'OK' }]
          );
        }}
      ]
    );
  };

  const handleBackupWallet = () => {
    Alert.alert(
      'Backup Wallet',
      'Create a secure backup of your wallet. This includes your private keys and transaction history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Backup', onPress: () => {
          Alert.alert('Backup Created', 'Your wallet backup has been created successfully');
        }}
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, danger = false }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIcon, danger && styles.dangerIcon]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || <ChevronRight size={20} color="#9ca3af" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<User size={20} color="#6b7280" />}
              title="Profile"
              subtitle="Manage your profile information"
              onPress={() => Alert.alert('Profile', 'Profile management coming soon')}
            />
            <SettingItem
              icon={<Shield size={20} color="#6b7280" />}
              title="Security"
              subtitle="Manage your security settings"
              onPress={() => Alert.alert('Security', 'Security settings coming soon')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Bell size={20} color="#6b7280" />}
              title="Notifications"
              subtitle="Enable push notifications for transactions"
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                  thumbColor={notifications ? '#fff' : '#f4f4f5'}
                />
              }
            />
            <SettingItem
              icon={<Shield size={20} color="#6b7280" />}
              title="Biometric Login"
              subtitle="Use fingerprint or face recognition"
              rightComponent={
                <Switch
                  value={biometrics}
                  onValueChange={setBiometrics}
                  trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                  thumbColor={biometrics ? '#fff' : '#f4f4f5'}
                />
              }
            />
            <SettingItem
              icon={<Globe size={20} color="#6b7280" />}
              title="Network"
              subtitle="Celo Alfajores Testnet"
              onPress={() => Alert.alert('Network', 'Network selection coming soon')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Management</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Key size={20} color="#6b7280" />}
              title="Export Private Key"
              subtitle="Export your wallet's private key"
              onPress={handleExportWallet}
            />
            <SettingItem
              icon={<Wallet size={20} color="#6b7280" />}
              title="Backup Wallet"
              subtitle="Create a secure backup of your wallet"
              onPress={handleBackupWallet}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Info size={20} color="#6b7280" />}
              title="App Information"
              subtitle="Version 1.0.0"
              onPress={() => Alert.alert(
                'Celo NFC Payment App',
                'Version 1.0.0\n\nA secure NFC-based payment application built on the Celo blockchain.\n\nDeveloped with React Native and Expo.'
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<LogOut size={20} color="#ef4444" />}
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              danger={true}
              rightComponent={<></>}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Celo NFC Payment App</Text>
          <Text style={styles.footerText}>Secure • Fast • Decentralized</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginLeft: 24,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: '#fef2f2',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  dangerText: {
    color: '#ef4444',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
    textAlign: 'center',
  },
});