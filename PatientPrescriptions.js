import * as React from 'react';
import { ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function PatientPrescriptionsScreen({ route }) {
  const patientEmail = route.params?.profile?.email || '';
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [dietCharts, setDietCharts] = React.useState([]);

  React.useEffect(() => {
    // Fetch prescriptions
    supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_email', patientEmail)
      .then(({ data }) => setPrescriptions(data || []));
    supabase
      .from('diet_charts')
      .select('*')
      .eq('patient_email', patientEmail)
      .then(({ data }) => setDietCharts(data || []));
  }, [patientEmail]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#1565c0' }}>
        Your Prescriptions
      </Text>
      {prescriptions.map((item) => (
        <Card key={item.id} style={{ marginBottom: 15, padding: 10 }}>
          <Text>From: {item.doctor_email}</Text>
          <Text>{item.prescription_text}</Text>
          <Text style={{ fontSize: 12, color: '#888' }}>{item.created_at}</Text>
        </Card>
      ))}
      <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#1565c0', marginTop: 30 }}>
        Your Diet Charts
      </Text>
      {dietCharts.map((item) => (
        <Card key={item.id} style={{ marginBottom: 15, padding: 10 }}>
          <Text>From: {item.doctor_email}</Text>
          <Text>{item.diet_chart_text}</Text>
          <Text style={{ fontSize: 12, color: '#888' }}>{item.created_at}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}