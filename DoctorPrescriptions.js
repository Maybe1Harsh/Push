import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal, Provider as PaperProvider } from 'react-native-paper';
import { supabase } from './supabaseClient';
import { useTranslation } from './hooks/useTranslation';

export default function DoctorPrescriptionsScreen({ navigation, route }) {
  const { t } = useTranslation();
  const doctorEmail = route.params?.profile?.email;
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Diet chart states
  const [dietChartText, setDietChartText] = useState('');
  const [dietModalVisible, setDietModalVisible] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [doctorEmail]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_email', doctorEmail);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleWritePrescription = (patient) => {
    setSelectedPatient(patient);
    setPrescriptionText('');
    setModalVisible(true);
  };

  const handleSavePrescription = async () => {
    if (!prescriptionText.trim() || !selectedPatient) return;

    setLoading(true);
    try {
      const payload = {
        patient_email: selectedPatient.email,
        doctor_email: doctorEmail,
        prescription_text: prescriptionText.trim()
      };
      console.log('Prescription payload:', payload);
      const { error } = await supabase
        .from('prescriptions')
        .insert([payload]);

      if (error) {
        console.error('Supabase prescription insert error:', error);
        alert(`Failed to save prescription: ${JSON.stringify(error)}`);
        return;
      }

      setModalVisible(false);
      setPrescriptionText('');
      setSelectedPatient(null);
      alert('Prescription saved successfully!');
    } catch (error) {
      console.error('Unexpected error saving prescription:', error);
      alert(`Failed to save prescription: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Diet chart handlers
  const handleAssignDietChart = (patient) => {
    setSelectedPatient(patient);
    setDietChartText('');
    setDietModalVisible(true);
  };

  const handleSaveDietChart = async () => {
    if (!dietChartText.trim() || !selectedPatient) return;

    setLoading(true);
    try {
      const payload = {
        doctor_email: doctorEmail,
        patient_email: selectedPatient.email,
        diet_chart_text: dietChartText.trim(),
        created_at: new Date().toISOString()
      };
      console.log('Diet chart payload:', payload);
      const { error } = await supabase
        .from('diet_charts')
        .insert([payload]);
      if (error) {
        console.error('Supabase diet chart insert error:', error);
        alert(`Failed to assign diet chart: ${JSON.stringify(error)}`); // Show full error
        return;
      }
      setDietModalVisible(false);
      setDietChartText('');
      setSelectedPatient(null);
      alert('Diet chart assigned successfully!');
    } catch (error) {
      console.error('Unexpected error saving diet chart:', error);
      alert(`Failed to assign diet chart: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <ScrollView style={{ flex: 1, backgroundColor: '#f3f6fa' }}>
        <View style={{ padding: 20 }}>
          <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32', textAlign: 'center' }}>
            Write Prescriptions & Assign Diet Charts
          </Text>

          {patients.length === 0 ? (
            <Card style={{ padding: 20, borderRadius: 16, backgroundColor: '#fff' }}>
              <Text style={{ textAlign: 'center', color: '#666' }}>
                No patients assigned yet. Add patients to write prescriptions.
              </Text>
            </Card>
          ) : (
            patients.map((patient) => (
              <Card key={patient.id} style={{ marginBottom: 15, borderRadius: 16, backgroundColor: '#fff' }}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: '#2e7d32', marginBottom: 8 }}>
                    {patient.name}
                  </Text>
                  <Text style={{ color: '#666', marginBottom: 12 }}>
                    Email: {patient.email}
                  </Text>
                  <Text style={{ color: '#666', marginBottom: 12 }}>
                    Age: {patient.age}
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="contained"
                    onPress={() => handleWritePrescription(patient)}
                    style={{ backgroundColor: '#4caf50', marginRight: 8 }}
                  >
                    Write Prescription
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleAssignDietChart(patient)}
                    style={{ backgroundColor: '#2196f3' }}
                  >
                    Assign Diet Chart
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
        </View>

        {/* Prescription Modal */}
        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}
            contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32' }}>
              Write Prescription for {selectedPatient?.name}
            </Text>
            <TextInput
              label="Prescription Details"
              value={prescriptionText}
              onChangeText={setPrescriptionText}
              multiline
              numberOfLines={8}
              mode="outlined"
              style={{ marginBottom: 16 }}
              placeholder="Enter prescription details, medications, dosages, instructions..."
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSavePrescription}
                loading={loading}
                disabled={loading || !prescriptionText.trim()}
                style={{ flex: 1, marginLeft: 8, backgroundColor: '#4caf50' }}
              >
                Save Prescription
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Diet Chart Modal */}
        <Portal>
          <Modal visible={dietModalVisible} onDismiss={() => setDietModalVisible(false)}
            contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32' }}>
              Assign Diet Chart to {selectedPatient?.name}
            </Text>
            <TextInput
              label="Diet Chart Details"
              value={dietChartText}
              onChangeText={setDietChartText}
              multiline
              numberOfLines={8}
              mode="outlined"
              style={{ marginBottom: 16 }}
              placeholder="Enter diet chart instructions..."
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => setDietModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveDietChart}
                loading={loading}
                disabled={loading || !dietChartText.trim()}
                style={{ flex: 1, marginLeft: 8, backgroundColor: '#2196f3' }}
              >
                Assign Diet Chart
              </Button>
            </View>
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
}