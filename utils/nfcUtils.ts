import { Platform } from 'react-native';

// Mock NFC manager for web compatibility
let NfcManager: any = null;
let Ndef: any = null;

if (Platform.OS !== 'web') {
  try {
    NfcManager = require('react-native-nfc-manager').default;
    Ndef = require('react-native-nfc-manager').Ndef;
  } catch (error) {
    console.warn('NFC Manager not available:', error);
  }
}

export const initializeNfc = async (): Promise<boolean> => {
  if (Platform.OS === 'web' || !NfcManager) {
    return false;
  }

  try {
    await NfcManager.start();
    const isSupported = await NfcManager.isSupported();
    const isEnabled = await NfcManager.isEnabled();
    return isSupported && isEnabled;
  } catch (error) {
    console.error('NFC initialization failed:', error);
    return false;
  }
};

export const writeNfcData = async (recipient: string, amount: string): Promise<void> => {
  if (Platform.OS === 'web' || !NfcManager || !Ndef) {
    throw new Error('NFC not supported on this platform');
  }

  try {
    const paymentData = JSON.stringify({ recipient, amount, timestamp: Date.now() });
    const bytes = Ndef.encodeMessage([Ndef.textRecord(paymentData)]);
    
    await NfcManager.requestTechnology(NfcManager.NfcTech.Ndef);
    await NfcManager.writeNdefMessage(bytes);
    
    if (Platform.OS === 'ios') {
      await NfcManager.setAlertMessageIOS('Payment data written successfully!');
    }
  } catch (error) {
    console.error('NFC write failed:', error);
    throw error;
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (cancelError) {
      console.warn('Failed to cancel NFC request:', cancelError);
    }
  }
};

export const readNfcData = async (): Promise<{recipient: string, amount: string} | null> => {
  if (Platform.OS === 'web' || !NfcManager || !Ndef) {
    throw new Error('NFC not supported on this platform');
  }

  try {
    await NfcManager.requestTechnology(NfcManager.NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    
    if (tag.ndefMessage && tag.ndefMessage.length > 0) {
      const text = Ndef.text.decodePayload(tag.ndefMessage[0].payload);
      
      try {
        // Try to parse as JSON first (new format)
        const data = JSON.parse(text);
        if (data.recipient && data.amount) {
          return { recipient: data.recipient, amount: data.amount };
        }
      } catch {
        // Fall back to old format (recipient:amount)
        const [recipient, amount] = text.split(':');
        if (recipient && amount) {
          return { recipient, amount };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('NFC read failed:', error);
    throw error;
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (cancelError) {
      console.warn('Failed to cancel NFC request:', cancelError);
    }
  }
};

export const cleanupNfc = async (): Promise<void> => {
  if (Platform.OS === 'web' || !NfcManager) {
    return;
  }

  try {
    await NfcManager.stop();
  } catch (error) {
    console.warn('NFC cleanup failed:', error);
  }
};