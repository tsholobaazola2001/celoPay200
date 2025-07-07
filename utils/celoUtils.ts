import Web3 from 'web3';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Mock ContractKit for web compatibility
let ContractKit: any = null;
let newKitFromWeb3: any = null;

if (Platform.OS !== 'web') {
  try {
    const celoContractKit = require('@celo/contractkit');
    ContractKit = celoContractKit.ContractKit;
    newKitFromWeb3 = celoContractKit.newKitFromWeb3;
  } catch (error) {
    console.warn('Celo ContractKit not available:', error);
  }
}

// Celo Alfajores testnet configuration
const CELO_ALFAJORES_RPC = 'https://alfajores-forno.celo-testnet.org';
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual contract address

// Mock wallet for demo purposes - in production, use proper wallet management
const DEMO_PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234'; // Replace with actual private key

let web3: Web3;
let kit: any;

// Initialize Web3 and ContractKit
const initializeCelo = () => {
  if (Platform.OS === 'web') {
    // For web, we'll use a mock implementation
    web3 = new Web3();
    return;
  }

  try {
    web3 = new Web3(CELO_ALFAJORES_RPC);
    if (newKitFromWeb3) {
      kit = newKitFromWeb3(web3);
    }
  } catch (error) {
    console.error('Failed to initialize Celo:', error);
  }
};

initializeCelo();

export const validateAddress = (address: string): boolean => {
  if (!address || address.length !== 42) {
    return false;
  }
  
  if (!address.startsWith('0x')) {
    return false;
  }
  
  const hexPattern = /^0x[a-fA-F0-9]{40}$/;
  return hexPattern.test(address);
};

export const sendPayment = async (recipient: string, amount: string): Promise<string> => {
  if (Platform.OS === 'web') {
    // Mock implementation for web
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('0x' + Math.random().toString(16).substr(2, 64));
      }, 2000);
    });
  }

  if (!kit || !web3) {
    throw new Error('Celo not initialized');
  }

  try {
    // Add the demo account to the kit
    kit.connection.addAccount(DEMO_PRIVATE_KEY);
    
    // Contract ABI for the sendPayment function
    const contractABI = [
      {
        "constant": false,
        "inputs": [
          { "name": "to", "type": "address" },
          { "name": "amount", "type": "uint256" }
        ],
        "name": "sendPayment",
        "outputs": [],
        "type": "function"
      }
    ];

    const contract = new kit.web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
    
    // Convert amount to Wei (assuming 18 decimals)
    const amountWei = web3.utils.toWei(amount, 'ether');
    
    // Send the transaction
    const tx = await contract.methods.sendPayment(recipient, amountWei).send({
      from: kit.defaultAccount,
      gas: 200000,
      gasPrice: '1000000000'
    });

    return tx.transactionHash;
  } catch (error) {
    console.error('Payment failed:', error);
    throw new Error('Failed to send payment');
  }
};

export const getBalance = async (address: string): Promise<string> => {
  if (Platform.OS === 'web') {
    // Mock implementation for web
    return '10.5';
  }

  if (!kit || !web3) {
    throw new Error('Celo not initialized');
  }

  try {
    const goldToken = await kit.contracts.getGoldToken();
    const balance = await goldToken.balanceOf(address);
    return web3.utils.fromWei(balance.toString(), 'ether');
  } catch (error) {
    console.error('Failed to get balance:', error);
    throw new Error('Failed to get balance');
  }
};

export const getTransactionHistory = async (): Promise<any[]> => {
  // Mock transaction history for demo
  const mockTransactions = [
    {
      id: '1',
      type: 'sent',
      amount: '2.5',
      address: '0x1234567890123456789012345678901234567890',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      status: 'confirmed'
    },
    {
      id: '2',
      type: 'received',
      amount: '5.0',
      address: '0x0987654321098765432109876543210987654321',
      timestamp: new Date('2024-01-14T15:45:00Z'),
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: 'confirmed'
    },
    {
      id: '3',
      type: 'sent',
      amount: '1.0',
      address: '0x5555555555555555555555555555555555555555',
      timestamp: new Date('2024-01-13T08:20:00Z'),
      hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      status: 'pending'
    },
    {
      id: '4',
      type: 'received',
      amount: '3.2',
      address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      timestamp: new Date('2024-01-12T14:15:00Z'),
      hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      status: 'confirmed'
    },
    {
      id: '5',
      type: 'sent',
      amount: '0.5',
      address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      timestamp: new Date('2024-01-11T09:30:00Z'),
      hash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      status: 'failed'
    }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTransactions);
    }, 1000);
  });
};

export const generateWallet = (): { address: string; privateKey: string } => {
  if (Platform.OS === 'web') {
    // Mock implementation for web
    return {
      address: '0x' + Math.random().toString(16).substr(2, 40),
      privateKey: '0x' + Math.random().toString(16).substr(2, 64)
    };
  }

  if (!web3) {
    throw new Error('Web3 not initialized');
  }

  try {
    const account = web3.eth.accounts.create();
    return {
      address: account.address,
      privateKey: account.privateKey
    };
  } catch (error) {
    console.error('Failed to generate wallet:', error);
    throw new Error('Failed to generate wallet');
  }
};