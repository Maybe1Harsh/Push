import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function PatientDashboard({ navigation, route }) {
  const { patientEmail } = route.params;

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome to the Patient Dashboard
      </Text>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate('PatientAppointment', { patientEmail })}
      >
        Request Appointment
      </Button>
      {/* Other components and code for the dashboard */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginVertical: 16,
    backgroundColor: '#2e7d32',
  },
});