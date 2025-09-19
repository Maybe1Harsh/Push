import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Text, Divider } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function PatientPrescriptions({ route }) {
  // Debug print
  console.log('PatientPrescriptions route.params:', route?.params);

  // Get patient email from navigation params or profile context
  const patientProfile = route?.params?.profile || {};
  const patientEmail = patientProfile.email || '';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientEmail) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_email', patientEmail)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) {
          setPrescriptions([]);
        } else {
          setPrescriptions(data || []);
        }
      });
  }, [patientEmail]);

  if (!patientEmail) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>No patient email found!</Text>
        <Text>route.params: {JSON.stringify(route?.params)}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#f3f6fa', flexGrow: 1 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>Your Prescriptions</Text>
      {loading && <Text>Loading...</Text>}
      {!loading && prescriptions.length === 0 && (
        <Text>No prescriptions found.</Text>
      )}
      {prescriptions.map((presc, idx) => (
        <Card key={presc.id || idx} style={{ marginBottom: 16, borderRadius: 12, padding: 12 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
            From: Dr. {presc.doctor_name}
          </Text>
          <Text style={{ color: '#388e3c', marginBottom: 4 }}>
            Date: {new Date(presc.created_at).toLocaleDateString()}
          </Text>
          <Divider style={{ marginVertical: 6 }} />
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Medicines:</Text>
          {
            (() => {
              let meds = presc.medicines;
              // If medicines is a string, try to parse it as JSON
              if (typeof meds === 'string') {
                try {
                  meds = JSON.parse(meds);
                } catch (e) {
                  // If parsing fails, fallback to showing as plain text
                  meds = meds;
                }
              }
              if (Array.isArray(meds)) {
                return meds.length > 0 ? meds.map((med, i) => (
                  <Text key={i} style={{ marginLeft: 8 }}>
                    • {med.name} - {med.dosage} - {med.frequency}
                  </Text>
                )) : <Text style={{ marginLeft: 8 }}>No medicines listed.</Text>;
              } else if (typeof meds === 'object' && meds !== null) {
                // If it's a single medicine object
                return (
                  <Text style={{ marginLeft: 8 }}>
                    • {meds.name} - {meds.dosage} - {meds.frequency}
                  </Text>
                );
              } else if (typeof meds === 'string') {
                // If it's a plain string
                return <Text style={{ marginLeft: 8 }}>{meds}</Text>;
              } else {
                return <Text style={{ marginLeft: 8 }}>No medicines listed.</Text>;
              }
            })()
          }
          {presc.advice && (
            <>
              <Divider style={{ marginVertical: 6 }} />
              <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Advice:</Text>
              <Text style={{ marginLeft: 8 }}>{presc.advice}</Text>
            </>
          )}
        </Card>
      ))}
    </ScrollView>
  );
}