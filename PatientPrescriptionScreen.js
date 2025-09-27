import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Card, Text, Divider, Button, IconButton, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './supabaseClient';

export default function PatientPrescriptionScreen({ route, navigation }) {
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
      <LinearGradient
        colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
        style={styles.gradient}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
      style={styles.gradient}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4caf50']} />}
      >
        {/* Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
          <IconButton
            icon="arrow-left"
            iconColor="#2e7d32"
            size={24}
            onPress={() => navigation?.goBack()}
            style={{ margin: 0 }}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2e7d32' }}>Back</Text>
        </View>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>💊</Text>
          </View>
          <Text variant="headlineLarge" style={styles.title}>
            My Prescriptions
          </Text>
          <Text style={styles.subtitle}>
            Patient: {patientName}
          </Text>
          <Text style={styles.emailText}>
            {patientEmail}
          </Text>
        </View>

      {error ? (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="outlined" onPress={fetchPrescriptions} style={styles.errorButton}>
              Retry
            </Button>
          </Card.Content>
        </Card>
      ) : null}

      {prescriptions.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content style={styles.emptyCardContent}>
            <Text style={styles.emptyTitle}>
              No prescriptions found.
            </Text>
            <Text style={styles.emptySubtitle}>
              Pull down to refresh or contact your doctor.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        prescriptions.map((prescription, index) => (
          <Card key={prescription.id || index} style={styles.card}>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 35,
  },
  title: {
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#424242',
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  errorCard: {
    marginBottom: 16,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 235, 238, 0.95)',
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  errorTitle: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 12,
  },
  errorButton: {
    borderColor: '#d32f2f',
    marginTop: 8,
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
