import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, Nfc, Loader, CircleCheck as CheckCircle, Send, Smartphone } from 'lucide-react-native';
import { readNfcData, initializeNfc } from '@/utils/nfcUtils';
import { sendPayment } from '@/utils/celoUtils';

export default function ReceiveScreen() {
  const [isReading, setIsReading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [paymentData, setPaymentData] = useState<{recipient: string, amount: string} | null>(null);

  useEffect(() => {
    checkNfcSupport();
  }, []);

  const checkNfcSupport = async () => {
    if (Platform.OS !== 'web') {
      const supported = await initializeNfc();
      setNfcSupported(supported);
    }
  };

  const handleReadNfc = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('NFC Not Available', 'NFC functionality is not available on web platform. Use a mobile device for NFC features.');
      return;
    }

    if (!nfcSupported) {
      Alert.alert('NFC Not Supported', 'NFC is not supported on this device');
      return;
    }

    setIsReading(true);
    try {
      const data = await readNfcData();
      if (data) {
        setPaymentData(data);
        Alert.alert(
          'Payment Data Read Successfully',
          `Recipient: ${data.recipient.substring(0, 10)}...\nAmount: ${data.amount} CELO`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Send Payment', onPress: handleSendPayment }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read NFC data. Please try again.');
    } finally {
      setIsReading(false);
    }
  };

  const handleSendPayment = async () => {
    if (!paymentData) return;

    setIsSending(true);
    try {
      const txHash = await sendPayment(paymentData.recipient, paymentData.amount);
      Alert.alert(
        'Payment Sent Successfully!',
        `Transaction Hash: ${txHash.substring(0, 20)}...`,
        [{ text: 'OK', onPress: () => setPaymentData(null) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send payment. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Receive Payment</Text>
          <Text style={styles.subtitle}>Read payment data from NFC</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.nfcArea}>
            <View style={styles.nfcIconContainer}>
              <Nfc size={64} color="#10b981" />
              {isReading && (
                <View style={styles.pulseRing} />
              )}
            </View>
            <Text style={styles.nfcText}>
              {isReading ? 'Reading NFC tag...' : 'Tap to read NFC payment data'}
            </Text>
            <Text style={styles.nfcSubtext}>
              Hold your phone near an NFC tag with payment information
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, (isReading || isSending) && styles.buttonDisabled]}
            onPress={handleReadNfc}
            disabled={isReading || isSending}
          >
            <View style={styles.buttonContent}>
              {isReading ? (
                <Loader size={20} color="#fff" />
              ) : (
                <Smartphone size={20} color="#fff" />
              )}
              <Text style={styles.buttonText}>
                {isReading ? 'Reading NFC...' : 'Read NFC Payment'}
              </Text>
            </View>
          </TouchableOpacity>

          {paymentData && (
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <CheckCircle size={24} color="#10b981" />
                <Text style={styles.paymentTitle}>Payment Data Retrieved</Text>
              </View>
              
              <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Recipient Address:</Text>
                  <Text style={styles.detailValue}>{formatAddress(paymentData.recipient)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount:</Text>
                  <Text style={styles.amountValue}>{paymentData.amount} CELO</Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.sendButton, isSending && styles.buttonDisabled]}
                onPress={handleSendPayment}
                disabled={isSending}
              >
                <View style={styles.buttonContent}>
                  {isSending ? (
                    <Loader size={20} color="#fff" />
                  ) : (
                    <Send size={20} color="#fff" />
                  )}
                  <Text style={styles.buttonText}>
                    {isSending ? 'Sending Payment...' : 'Send Payment'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {Platform.OS === 'web' && (
            <View style={styles.webNotice}>
              <Smartphone size={24} color="#92400e" />
              <Text style={styles.webNoticeText}>
                NFC functionality requires a mobile device. Please use the mobile app to read NFC payment data.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How it Works</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>1</Text>
              </View>
              <Text style={styles.instructionText}>Tap "Read NFC Payment" button</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>2</Text>
              </View>
              <Text style={styles.instructionText}>Hold your phone near an NFC tag with payment data</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>3</Text>
              </View>
              <Text style={styles.instructionText}>Review the payment details</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>4</Text>
              </View>
              <Text style={styles.instructionText}>Confirm to send the payment on Celo blockchain</Text>
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
  content: {
    padding: 24,
  },
  nfcArea: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nfcIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#10b981',
    opacity: 0.3,
  },
  nfcText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  nfcSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
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
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  paymentDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    fontFamily: 'monospace',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  webNotice: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
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
    marginTop: 0,
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