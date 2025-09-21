import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function TestComponent({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Component Working!</Text>
      <Text style={styles.subtitle}>If you see this, the app is rendering correctly</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Landing')}>
        Go to Landing Page
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});