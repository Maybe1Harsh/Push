import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text, Card, Button, TextInput, Modal, Portal, Provider as PaperProvider } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function DoctorScheduleScreen({ doctorEmail }) {
  const [appointments, setAppointments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [postponeTime, setPostponeTime] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [doctorEmail]);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_email', doctorEmail)
      .order('created_at', { ascending: false });
    if (!error) setAppointments(data || []);
  };

  const handleAction = async (id, status, newTime = null) => {
    const updateObj = { status };
    if (newTime) updateObj.final_time = newTime;
    await supabase.from('appointments').update(updateObj).eq('id', id);
    setModalVisible(false);
    setSelectedAppointment(null);
    setPostponeTime('');
    fetchAppointments();
  };

  return (
    <PaperProvider>
      <View style={{ padding: 20 }}>
        <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32', textAlign: 'center' }}>
          Appointment Requests
        </Text>
        {appointments.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#666' }}>No appointment requests.</Text>
        )}
        {appointments.map(app => (
          <Card key={app.id} style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium">Patient: {app.patient_email}</Text>
              <Text>Status: {app.status}</Text>
              <Text>Requested Time: {app.requested_time}</Text>
              {app.final_time && <Text>Final Time: {app.final_time}</Text>}
              {app.notes && <Text>Notes: {app.notes}</Text>}
            </Card.Content>
            {app.status === 'pending' && (
              <Card.Actions>
                <Button onPress={() => handleAction(app.id, 'accepted')}>Accept</Button>
                <Button onPress={() => { setSelectedAppointment(app); setModalVisible(true); }}>Postpone</Button>
                <Button onPress={() => handleAction(app.id, 'rejected')}>Reject</Button>
              </Card.Actions>
            )}
          </Card>
        ))}
        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>Postpone Appointment</Text>
            <TextInput
              label="New Time"
              value={postponeTime}
              onChangeText={setPostponeTime}
              placeholder="YYYY-MM-DD HH:mm"
              style={{ marginBottom: 16 }}
            />
            <Button mode="contained" onPress={() => handleAction(selectedAppointment.id, 'postponed', postponeTime)} disabled={!postponeTime}>
              Confirm Postpone
            </Button>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
}
