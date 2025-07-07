import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Loader } from 'lucide-react-native';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export default function LoadingSpinner({ size = 24, color = '#10b981' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <Loader size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});