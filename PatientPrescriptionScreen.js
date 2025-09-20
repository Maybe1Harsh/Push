import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Divider, Button, IconButton, ActivityIndicator } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function PatientPrescriptionScreen({ route }) {
  // Get patient details from navigation params
  const patientProfile = route?.params?.profile || {};
  const patientEmail = patientProfile.email || '';
  const patientName = patientProfile.name || 'Patient';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Fetch prescriptions for this patient
  const fetchPrescriptions = async () => {
    if (!patientEmail) {
      setError('Patient email not found');
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_email', patientEmail)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setPrescriptions([]);
      } else {
        setError('');
        setPrescriptions(data || []);
      }
    } catch (err) {
      setError('Failed to fetch prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [patientEmail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrescriptions();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading prescriptions...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={{ padding: 16, backgroundColor: '#f3f6fa', flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={{ marginBottom: 16, borderRadius: 12, padding: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>My Prescriptions</Text>
        <Text style={{ fontSize: 16, color: '#666' }}>Patient: {patientName}</Text>
        <Text style={{ fontSize: 14, color: '#666' }}>Email: {patientEmail}</Text>
      </Card>

      {error ? (
        <Card style={{ marginBottom: 16, borderRadius: 12, padding: 16, backgroundColor: '#ffebee' }}>
          <Text style={{ color: '#d32f2f', fontWeight: 'bold' }}>Error</Text>
          <Text style={{ color: '#d32f2f' }}>{error}</Text>
          <Button mode="outlined" onPress={fetchPrescriptions} style={{ marginTop: 8 }}>
            Retry
          </Button>
        </Card>
      ) : null}

      {prescriptions.length === 0 ? (
        <Card style={{ borderRadius: 12, padding: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
            No prescriptions found.
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 }}>
            Pull down to refresh or contact your doctor.
          </Text>
        </Card>
      ) : (
        prescriptions.map((prescription, index) => (
          <Card key={prescription.id || index} style={{ marginBottom: 16, borderRadius: 12 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Dr. {prescription.doctor_name}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {formatDate(prescription.created_at)}
                </Text>
              </View>
              
              <Divider style={{ marginVertical: 8 }} />
              
              <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#1976d2' }}>Medicines:</Text>
              {prescription.medicines && prescription.medicines.length > 0 ? (
                prescription.medicines.map((medicine, medIndex) => (
                  <View key={medIndex} style={{ marginBottom: 6, paddingLeft: 8 }}>
                    <Text style={{ fontWeight: '500' }}>• {medicine.name}</Text>
                    <Text style={{ color: '#666', fontSize: 13, marginLeft: 12 }}>
                      {medicine.dosage} - {medicine.frequency}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#666', fontStyle: 'italic' }}>No medicines prescribed</Text>
              )}

              {prescription.advice ? (
                <>
                  <Divider style={{ marginVertical: 8 }} />
                  <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#1976d2' }}>Advice:</Text>
                  <Text style={{ color: '#666' }}>{prescription.advice}</Text>
                </>
              ) : null}
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}
