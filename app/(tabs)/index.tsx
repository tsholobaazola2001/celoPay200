import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Nfc, Loader, QrCode, Copy } from 'lucide-react-native';
import { writeNfcData, initializeNfc } from '@/utils/nfcUtils';
import { validateAddress, generateWallet } from '@/utils/celoUtils';

export default function SendScreen() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    checkNfcSupport();
    generateDemoWallet();
  }, []);

  const checkNfcSupport = async () => {
    if (Platform.OS !== 'web') {
      const supported = await initializeNfc();
      setNfcSupported(supported);
    }
  };

  const generateDemoWallet = () => {
    const wallet = generateWallet();
    setWalletAddress(wallet.address);
  };

  const handleWriteNfc = async () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill in both recipient address and amount');
      return;
    }

    if (!validateAddress(recipient)) {
      Alert.alert('Error', 'Please enter a valid Celo address (0x...)');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert('NFC Not Available', 'NFC functionality is not available on web platform. Use a mobile device for NFC features.');
      return;
    }

    if (!nfcSupported) {
      Alert.alert('NFC Not Supported', 'NFC is not supported on this device');
      return;
    }

    setIsWriting(true);
    try {
      await writeNfcData(recipient, amount);
      Alert.alert('Success', 'Payment data written to NFC successfully!');
      setRecipient('');
      setAmount('');
    } catch (error) {
      Alert.alert('Error', 'Failed to write NFC data. Please try again.');
    } finally {
      setIsWriting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    // For web compatibility, we'll show an alert instead of copying
    Alert.alert('Address', text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Payment</Text>
          <Text style={styles.subtitle}>Create NFC payment data</Text>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Your Wallet Address</Text>
          <TouchableOpacity 
            style={styles.addressContainer}
            onPress={() => copyToClipboard(walletAddress)}
          >
            <Text style={styles.addressText} numberOfLines={1}>
              {walletAddress}
            </Text>
            <Copy size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Recipient Address</Text>
            <TextInput
              style={styles.input}
              placeholder="0x1234567890123456789012345678901234567890"
              value={recipient}
              onChangeText={setRecipient}
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount (CELO)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isWriting && styles.buttonDisabled]}
            onPress={handleWriteNfc}
            disabled={isWriting}
          >
            <View style={styles.buttonContent}>
              {isWriting ? (
                <Loader size={20} color="#fff" />
              ) : (
                <Nfc size={20} color="#fff" />
              )}
              <Text style={styles.buttonText}>
                {isWriting ? 'Writing to NFC...' : 'Write to NFC Tag'}
              </Text>
            </View>
          </TouchableOpacity>

          {Platform.OS === 'web' && (
            <View style={styles.webNotice}>
              <QrCode size={24} color="#92400e" />
              <Text style={styles.webNoticeText}>
                NFC functionality requires a mobile device. On web, you can copy the payment data manually.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to Use</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>1</Text>
              </View>
              <Text style={styles.instructionText}>Enter the recipient's Celo wallet address</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>2</Text>
              </View>
              <Text style={styles.instructionText}>Specify the amount of CELO to send</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>3</Text>
              </View>
              <Text style={styles.instructionText}>Tap "Write to NFC Tag" and hold your phone near an NFC tag</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>4</Text>
              </View>
              <Text style={styles.instructionText}>The payment data will be stored on the NFC tag</Text>
            </View>
          </View>
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
  walletCard: {
    backgroundColor: '#fff',
    margin: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  walletLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1e293b',
  },
  form: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  webNotice: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  webNoticeText: {
    color: '#92400e',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  instructions: {
    backgroundColor: '#fff',
    margin: 24,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
});