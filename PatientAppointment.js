import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text, TextInput, Button, Card, Provider as PaperProvider, Dropdown } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function PatientAppointmentScreen({ navigation, route }) {
  const { patientEmail } = route.params;
  const [doctors, setDoctors] = useState([]);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [requestedTime, setRequestedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const { data, error } = await supabase.from('doctors').select('email,name');
    if (!error) setDoctors(data || []);
  };

  const handleSubmit = async () => {
    if (!doctorEmail || !requestedTime) {
      alert('Please select doctor and time.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('appointments').insert([{
      patient_email: patientEmail,
      doctor_email: doctorEmail,
      requested_time: requestedTime,
      notes,
      status: 'pending',
      created_at: new Date().toISOString()
    }]);
    setLoading(false);
    if (error) {
      alert('Failed to request appointment.');
    } else {
      alert('Appointment requested!');
      navigation.goBack();
    }
  };

  return (
    <PaperProvider>
      <View style={{ padding: 20 }}>
        <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32', textAlign: 'center' }}>
          Request Appointment
        </Text>
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Card.Content>
            <Text>Select Doctor</Text>
            <TextInput
              label="Doctor Email"
              value={doctorEmail}
              onChangeText={setDoctorEmail}
              placeholder="Enter doctor email"
              style={{ marginBottom: 12 }}
            />
            {/* Optionally, use a dropdown if you want to list doctors */}
            {/* <Dropdown
              label="Doctor"
              data={doctors.map(d => ({ label: d.name, value: d.email }))}
              value={doctorEmail}
              onValueChange={setDoctorEmail}
            /> */}
            <TextInput
              label="Requested Time"
              value={requestedTime}
              onChangeText={setRequestedTime}
              placeholder="YYYY-MM-DD HH:mm"
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              style={{ marginBottom: 12 }}
            />
            <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}>
              Request Appointment
            </Button>
          </Card.Content>
        </Card>
      </View>
    </PaperProvider>
  );
}
