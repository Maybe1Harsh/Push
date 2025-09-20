import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Modal, Portal, Provider as PaperProvider, Divider, DataTable, Chip, FAB } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function DoctorScheduleScreen({ route, navigation }) {
  // Get doctor details from route params
  const doctorProfile = route?.params?.profile || {};
  const doctorEmail = doctorProfile.email || '';
  const doctorName = doctorProfile.name || 'Doctor';

  console.log('DoctorSchedule received params:', route?.params);
  console.log('Doctor email:', doctorEmail);
  console.log('Doctor name:', doctorName);

  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [postponeModalVisible, setPostponeModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [addAppointmentModalVisible, setAddAppointmentModalVisible] = useState(false);

  // Form states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [postponeTime, setPostponeTime] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakStart, setBreakStart] = useState('');
  const [breakEnd, setBreakEnd] = useState('');
  const [newAppointmentDate, setNewAppointmentDate] = useState('');
  const [newAppointmentTime, setNewAppointmentTime] = useState('');
  const [newAppointmentPatient, setNewAppointmentPatient] = useState('');
  const [newAppointmentNotes, setNewAppointmentNotes] = useState('');

  useEffect(() => {
    console.log('DoctorSchedule useEffect triggered with doctorEmail:', doctorEmail);
    if (doctorEmail) {
      fetchAppointments();
      fetchSchedule();
    }
  }, [doctorEmail]);

  // Add debug logging to fetchAppointments
  const fetchAppointments = async () => {
    try {
      console.log('Fetching appointments for doctor:', doctorEmail);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_email', doctorEmail)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching appointments:', error);
        Alert.alert('Error', `Failed to fetch appointments: ${error.message}`);
      } else {
        console.log('Fetched appointments:', data);
        setAppointments(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', `Unexpected error: ${err.message}`);
    }
  };

  const fetchSchedule = async () => {
    try {
      console.log('Fetching schedule for doctor:', doctorEmail);
      const { data, error } = await supabase
        .from('doctor_schedule')
        .select('*')
        .eq('doctor_email', doctorEmail)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching schedule:', error);
        Alert.alert('Error', `Failed to fetch schedule: ${error.message}`);
      } else {
        console.log('Fetched schedule:', data);
        setSchedule(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', `Unexpected error: ${err.message}`);
    }
  };

  const handleAppointmentAction = async (appointmentId, status, newTime = null) => {
    setLoading(true);
    try {
      const updateObj = { status };
      if (newTime) {
        updateObj.final_time = newTime;
      }
      
      const { error } = await supabase
        .from('appointments')
        .update(updateObj)
        .eq('id', appointmentId);
        
      if (error) {
        Alert.alert('Error', `Failed to ${status} appointment: ${error.message}`);
      } else {
        Alert.alert('Success', `Appointment ${status} successfully!`);
        setPostponeModalVisible(false);
        setSelectedAppointment(null);
        setPostponeTime('');
        fetchAppointments();
      }
    } catch (err) {
      Alert.alert('Error', `Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!scheduleDate || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('doctor_schedule')
        .insert([{
          doctor_email: doctorEmail,
          doctor_name: doctorName,
          date: scheduleDate,
          start_time: startTime,
          end_time: endTime,
          break_start: breakStart || null,
          break_end: breakEnd || null,
          status: 'available',
          created_at: new Date().toISOString()
        }]);

      if (error) {
        Alert.alert('Error', `Failed to add schedule: ${error.message}`);
      } else {
        Alert.alert('Success', 'Schedule added successfully!');
        setScheduleModalVisible(false);
        setScheduleDate('');
        setStartTime('');
        setEndTime('');
        setBreakStart('');
        setBreakEnd('');
        fetchSchedule();
      }
    } catch (err) {
      Alert.alert('Error', `Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async () => {
    if (!newAppointmentDate || !newAppointmentTime || !newAppointmentPatient) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          doctor_email: doctorEmail,
          patient_email: newAppointmentPatient,
          requested_time: `${newAppointmentDate} ${newAppointmentTime}`,
          final_time: `${newAppointmentDate} ${newAppointmentTime}`,
          status: 'accepted',
          notes: newAppointmentNotes,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        Alert.alert('Error', `Failed to add appointment: ${error.message}`);
      } else {
        Alert.alert('Success', 'Appointment added successfully!');
        setAddAppointmentModalVisible(false);
        setNewAppointmentDate('');
        setNewAppointmentTime('');
        setNewAppointmentPatient('');
        setNewAppointmentNotes('');
        fetchAppointments();
      }
    } catch (err) {
      Alert.alert('Error', `Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('doctor_schedule')
              .delete()
              .eq('id', scheduleId);
            if (!error) {
              fetchSchedule();
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      pending: '#ff9800',
      accepted: '#4caf50',
      rejected: '#f44336',
      postponed: '#2196f3',
      completed: '#9c27b0'
    };
    return (
      <Chip style={{ backgroundColor: colors[status] || '#666' }} textStyle={{ color: 'white' }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip>
    );
  };

  // Add error handling for missing doctor email
  if (!doctorEmail) {
    return (
      <PaperProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa', padding: 20 }}>
          <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 8 }}>
            No doctor profile found!
          </Text>
          <Text style={{ color: '#666', textAlign: 'center', marginBottom: 16 }}>
            Please make sure you're logged in properly.
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: '#1976d2' }}
          >
            Go Back
          </Button>
          <Text style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
            Debug: {JSON.stringify(route?.params)}
          </Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <ScrollView style={{ flex: 1, backgroundColor: '#f3f6fa' }}>
        <View style={{ padding: 20 }}>
          <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32', textAlign: 'center' }}>
            Schedule & Appointments
          </Text>

          {/* Doctor Info Card */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#2e7d32' }}>Dr. {doctorName}</Text>
              <Text style={{ color: '#666' }}>Email: {doctorEmail}</Text>
            </Card.Content>
          </Card>

          {/* Schedule Management Section */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1976d2', marginBottom: 12 }}>
                My Schedule
              </Text>
              
              {schedule.length === 0 ? (
                <Text style={{ color: '#666', textAlign: 'center', marginVertical: 16 }}>
                  No schedule set. Add your available time slots.
                </Text>
              ) : (
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Date</DataTable.Title>
                    <DataTable.Title>Time</DataTable.Title>
                    <DataTable.Title>Status</DataTable.Title>
                    <DataTable.Title>Action</DataTable.Title>
                  </DataTable.Header>
                  
                  {schedule.map((slot) => (
                    <DataTable.Row key={slot.id}>
                      <DataTable.Cell>{formatDate(slot.date)}</DataTable.Cell>
                      <DataTable.Cell>
                        {slot.start_time} - {slot.end_time}
                        {slot.break_start && (
                          <Text style={{ fontSize: 10, color: '#666' }}>
                            {'\n'}Break: {slot.break_start} - {slot.break_end}
                          </Text>
                        )}
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Chip style={{ backgroundColor: slot.status === 'available' ? '#4caf50' : '#ff9800' }}>
                          {slot.status}
                        </Chip>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Button mode="outlined" onPress={() => deleteSchedule(slot.id)} compact>
                          Delete
                        </Button>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              )}
              
              <Button 
                mode="contained" 
                onPress={() => setScheduleModalVisible(true)}
                style={{ marginTop: 12, backgroundColor: '#1976d2' }}
              >
                Add Schedule
              </Button>
            </Card.Content>
          </Card>

          {/* Appointment Requests Section */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1976d2', marginBottom: 12 }}>
                Appointment Requests ({appointments.length})
              </Text>
              
              {appointments.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#666', marginVertical: 16 }}>
                  No appointment requests yet.
                </Text>
              ) : (
                appointments.map(app => (
                  <Card key={app.id} style={{ marginBottom: 12, elevation: 2 }}>
                    <Card.Content>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                          Patient: {app.patient_email}
                        </Text>
                        {getStatusChip(app.status)}
                      </View>
                      
                      <Text style={{ color: '#666', marginBottom: 4 }}>
                        Requested Time: {new Date(app.requested_time).toLocaleString('en-IN')}
                      </Text>
                      
                      {app.final_time && (
                        <Text style={{ color: '#2e7d32', marginBottom: 4 }}>
                          Final Time: {new Date(app.final_time).toLocaleString('en-IN')}
                        </Text>
                      )}
                      
                      {app.notes && (
                        <Text style={{ color: '#666', fontStyle: 'italic', marginBottom: 8 }}>
                          Notes: {app.notes}
                        </Text>
                      )}
                      
                      <Text style={{ color: '#999', fontSize: 12 }}>
                        Requested on: {formatDate(app.created_at)}
                      </Text>
                    </Card.Content>
                    
                    {app.status === 'pending' && (
                      <Card.Actions>
                        <Button 
                          mode="contained" 
                          onPress={() => handleAppointmentAction(app.id, 'accepted')}
                          style={{ backgroundColor: '#4caf50', marginRight: 8 }}
                          loading={loading}
                        >
                          Accept
                        </Button>
                        <Button 
                          mode="outlined" 
                          onPress={() => {
                            setSelectedAppointment(app);
                            setPostponeModalVisible(true);
                          }}
                          style={{ marginRight: 8 }}
                        >
                          Postpone
                        </Button>
                        <Button 
                          mode="outlined" 
                          onPress={() => handleAppointmentAction(app.id, 'rejected')}
                          textColor="#f44336"
                          loading={loading}
                        >
                          Reject
                        </Button>
                      </Card.Actions>
                    )}
                  </Card>
                ))
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Floating Action Button */}
        <FAB
          icon="plus"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: '#4caf50'
          }}
          onPress={() => setAddAppointmentModalVisible(true)}
        />

        {/* Postpone Appointment Modal */}
        <Portal>
          <Modal 
            visible={postponeModalVisible} 
            onDismiss={() => setPostponeModalVisible(false)} 
            contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16 }}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32' }}>
              Postpone Appointment
            </Text>
            <Text style={{ marginBottom: 12 }}>
              Patient: {selectedAppointment?.patient_email}
            </Text>
            <TextInput
              label="New Date & Time"
              value={postponeTime}
              onChangeText={setPostponeTime}
              placeholder="YYYY-MM-DD HH:MM"
              style={{ marginBottom: 16 }}
              mode="outlined"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button 
                mode="outlined" 
                onPress={() => setPostponeModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={() => handleAppointmentAction(selectedAppointment?.id, 'postponed', postponeTime)} 
                disabled={!postponeTime}
                loading={loading}
                style={{ flex: 1, marginLeft: 8, backgroundColor: '#2196f3' }}
              >
                Confirm
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Add Schedule Modal */}
        <Portal>
          <Modal 
            visible={scheduleModalVisible} 
            onDismiss={() => setScheduleModalVisible(false)} 
            contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16 }}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32' }}>
              Add Schedule
            </Text>
            <TextInput
              label="Date"
              value={scheduleDate}
              onChangeText={setScheduleDate}
              placeholder="YYYY-MM-DD"
              style={{ marginBottom: 12 }}
              mode="outlined"
            />
            <TextInput
              label="Start Time"
              value={startTime}
              onChangeText={setStartTime}
              placeholder="09:00"
              style={{ marginBottom: 12 }}
              mode="outlined"
            />
            <TextInput
              label="End Time"
              value={endTime}
              onChangeText={setEndTime}
              placeholder="17:00"
              style={{ marginBottom: 12 }}
              mode="outlined"
            />
            <TextInput
              label="Break Start (Optional)"
              value={breakStart}
              onChangeText={setBreakStart}
              placeholder="13:00"
              style={{ marginBottom: 12 }}
              mode="outlined"
            />
            <TextInput
              label="Break End (Optional)"
              value={breakEnd}
              onChangeText={setBreakEnd}
              placeholder="14:00"
              style={{ marginBottom: 16 }}
              mode="outlined"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button 
                mode="outlined" 
                onPress={() => setScheduleModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleAddSchedule}
                loading={loading}
                style={{ flex: 1, marginLeft: 8, backgroundColor: '#1976d2' }}
              >
                Add Schedule
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Add Manual Appointment Modal */}
        <Portal>
          <Modal 
            visible={addAppointmentModalVisible} 
            onDismiss={() => setAddAppointmentModalVisible(false)} 
            contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16 }}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32' }}>
              Add Appointment
            </Text>
            <TextInput
              label="Date"
              value={newAppointmentDate}
              onChangeText={setNewAppointmentDate}
              placeholder="YYYY-MM-DD"
              style={{ marginBottom: 12 }}
              mode="outlined"
            />
            <TextInput
              label="Time"
              value={newAppointmentTime}
              onChangeText={setNewAppointmentTime}
              placeholder="14:30"
              style={{ marginBottom: 12 }}
              mode="outlined"
            />
            <TextInput
              label="Patient Email"
              value={newAppointmentPatient}
              onChangeText={setNewAppointmentPatient}
              placeholder="patient@email.com"
              style={{ marginBottom: 12 }}
              mode="outlined"
            />
            <TextInput
              label="Notes (Optional)"
              value={newAppointmentNotes}
              onChangeText={setNewAppointmentNotes}
              placeholder="Additional notes..."
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
              mode="outlined"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button 
                mode="outlined" 
                onPress={() => setAddAppointmentModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleAddAppointment}
                loading={loading}
                style={{ flex: 1, marginLeft: 8, backgroundColor: '#4caf50' }}
              >
                Add Appointment
              </Button>
            </View>
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
}
