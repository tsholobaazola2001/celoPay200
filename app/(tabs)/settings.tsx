import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Switch, ScrollView, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, Globe, Bell, LogOut, ChevronRight, Wallet, Key, Info, X, Copy, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateWallet } from '@/utils/celoUtils';

interface UserProfile {
  name: string;
  email: string;
  walletAddress: string;
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('Celo Alfajores Testnet');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Demo User',
    email: 'demo@example.com',
    walletAddress: '0x1234567890123456789012345678901234567890'
  });

  const networks = [
    'Celo Alfajores Testnet',
    'Celo Mainnet',
    'Celo Baklava Testnet'
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedBiometrics = await AsyncStorage.getItem('biometrics');
      const savedNetwork = await AsyncStorage.getItem('selectedNetwork');
      const savedProfile = await AsyncStorage.getItem('userProfile');

      if (savedNotifications !== null) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedBiometrics !== null) {
        setBiometrics(JSON.parse(savedBiometrics));
      }
      if (savedNetwork) {
        setSelectedNetwork(savedNetwork);
      }
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    saveSettings('notifications', value);
  };

  const handleBiometricsToggle = (value: boolean) => {
    setBiometrics(value);
    saveSettings('biometrics', value);
    if (value) {
      Alert.alert('Biometric Login Enabled', 'You can now use fingerprint or face recognition to log in.');
    }
  };

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    saveSettings('selectedNetwork', network);
    setShowNetworkModal(false);
    Alert.alert('Network Changed', `Switched to ${network}`);
  };

  const handleProfileSave = () => {
    saveSettings('userProfile', userProfile);
    setShowProfileModal(false);
    Alert.alert('Profile Updated', 'Your profile has been saved successfully.');
  };

  const handleExportWallet = () => {
    setShowPrivateKeyModal(true);
  };

  const handleBackupWallet = () => {
    setShowBackupModal(true);
  };

  const generateNewWallet = () => {
    const newWallet = generateWallet();
    setUserProfile(prev => ({ ...prev, walletAddress: newWallet.address }));
    Alert.alert('New Wallet Generated', 'A new wallet has been created. Make sure to backup your private key!');
  };

  const copyToClipboard = (text: string, label: string) => {
    // For web compatibility, we'll show an alert with the text
    Alert.alert(`${label} Copied`, text);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will clear your wallet data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Logged out', 'You have been logged out successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
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
              subtitle={`${userProfile.name} • ${userProfile.email}`}
              onPress={() => setShowProfileModal(true)}
            />
            <SettingItem
              icon={<Shield size={20} color="#6b7280" />}
              title="Security"
              subtitle="Manage your security settings"
              onPress={() => setShowSecurityModal(true)}
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
                  onValueChange={handleNotificationToggle}
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
                  onValueChange={handleBiometricsToggle}
                  trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                  thumbColor={biometrics ? '#fff' : '#f4f4f5'}
                />
              }
            />
            <SettingItem
              icon={<Globe size={20} color="#6b7280" />}
              title="Network"
              subtitle={selectedNetwork}
              onPress={() => setShowNetworkModal(true)}
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
                'Version 1.0.0\n\nA secure NFC-based payment application built on the Celo blockchain.\n\nDeveloped with React Native and Expo.\n\nFeatures:\n• NFC payment data exchange\n• Secure blockchain transactions\n• Transaction history\n• Multi-network support'
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

      {/* Profile Modal */}
      <Modal visible={showProfileModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={userProfile.name}
                onChangeText={(text) => setUserProfile(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={userProfile.email}
                onChangeText={(text) => setUserProfile(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Wallet Address</Text>
              <View style={styles.walletContainer}>
                <Text style={styles.walletAddress}>{userProfile.walletAddress}</Text>
                <TouchableOpacity onPress={() => copyToClipboard(userProfile.walletAddress, 'Wallet Address')}>
                  <Copy size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.generateButton} onPress={generateNewWallet}>
                <Text style={styles.generateButtonText}>Generate New Wallet</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleProfileSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Security Modal */}
      <Modal visible={showSecurityModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Security Settings</Text>
            <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.securityOption}>
              <Shield size={24} color="#10b981" />
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Two-Factor Authentication</Text>
                <Text style={styles.securitySubtitle}>Add an extra layer of security</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => Alert.alert('Coming Soon', '2FA will be available in a future update')}
                trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              />
            </View>
            <View style={styles.securityOption}>
              <Key size={24} color="#10b981" />
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Auto-lock</Text>
                <Text style={styles.securitySubtitle}>Lock app after inactivity</Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => Alert.alert('Auto-lock', 'Auto-lock setting updated')}
                trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Network Modal */}
      <Modal visible={showNetworkModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Network</Text>
            <TouchableOpacity onPress={() => setShowNetworkModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {networks.map((network) => (
              <TouchableOpacity
                key={network}
                style={[styles.networkOption, selectedNetwork === network && styles.selectedNetwork]}
                onPress={() => handleNetworkChange(network)}
              >
                <Text style={[styles.networkText, selectedNetwork === network && styles.selectedNetworkText]}>
                  {network}
                </Text>
                {selectedNetwork === network && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Private Key Modal */}
      <Modal visible={showPrivateKeyModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Private Key</Text>
            <TouchableOpacity onPress={() => setShowPrivateKeyModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.warningBox}>
              <Shield size={24} color="#f59e0b" />
              <Text style={styles.warningText}>
                Never share your private key with anyone. Anyone with access to your private key can control your wallet.
              </Text>
            </View>
            <View style={styles.privateKeyContainer}>
              <Text style={styles.privateKeyLabel}>Private Key:</Text>
              <View style={styles.privateKeyBox}>
                <Text style={styles.privateKeyText}>
                  {showPrivateKey 
                    ? '0x1234567890123456789012345678901234567890123456789012345678901234'
                    : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'
                  }
                </Text>
                <TouchableOpacity onPress={() => setShowPrivateKey(!showPrivateKey)}>
                  {showPrivateKey ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              {showPrivateKey && (
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => copyToClipboard('0x1234567890123456789012345678901234567890123456789012345678901234', 'Private Key')}
                >
                  <Copy size={16} color="#fff" />
                  <Text style={styles.copyButtonText}>Copy Private Key</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Backup Modal */}
      <Modal visible={showBackupModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Backup Wallet</Text>
            <TouchableOpacity onPress={() => setShowBackupModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.backupStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>1</Text>
              </View>
              <Text style={styles.stepDescription}>Write down your recovery phrase in a secure location</Text>
            </View>
            <View style={styles.backupStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>2</Text>
              </View>
              <Text style={styles.stepDescription}>Store it offline, never on your device or cloud</Text>
            </View>
            <View style={styles.backupStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>3</Text>
              </View>
              <Text style={styles.stepDescription}>Keep multiple copies in different secure locations</Text>
            </View>
            <TouchableOpacity 
              style={styles.backupButton}
              onPress={() => {
                setShowBackupModal(false);
                Alert.alert('Backup Created', 'Your wallet backup has been created successfully. Make sure to store it securely!');
              }}
            >
              <Text style={styles.backupButtonText}>Create Backup</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  walletAddress: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1e293b',
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  securityInfo: {
    flex: 1,
    marginLeft: 16,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  securitySubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  networkOption: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedNetwork: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  networkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  selectedNetworkText: {
    color: '#10b981',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  privateKeyContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  privateKeyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  privateKeyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  privateKeyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1e293b',
  },
  copyButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backupStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepDescription: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  backupButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  backupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});