import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Provider as PaperProvider, Dropdown, Modal, Portal, Menu, Divider } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function PatientAppointmentScreen({ navigation, route }) {
  const { patientEmail } = route.params;
  const [doctors, setDoctors] = useState([]);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Date and Time Picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Helper function to generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 9; hour <= 18; hour++) { // 9 AM to 6 PM
      for (let minute = 0; minute < 60; minute += 30) { // Every 30 minutes
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  // Helper function to generate date options (next 30 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) { // Start from tomorrow
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().slice(0, 10);
      const displayDate = date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      dates.push({ value: dateString, label: displayDate });
    }
    return dates;
  };

  const timeOptions = generateTimeOptions();
  const dateOptions = generateDateOptions();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const { data, error } = await supabase.from('doctors').select('email,name');
    if (!error) setDoctors(data || []);
  };

  const handleSubmit = async () => {
    if (!doctorEmail || !appointmentDate || !appointmentTime) {
      alert('Please select doctor, date, and time.');
      return;
    }
    
    // Combine date and time
    const requestedDateTime = `${appointmentDate}T${appointmentTime}:00`;
    console.log('Submitting appointment request:', {
      patientEmail,
      doctorEmail,
      appointmentDate,
      appointmentTime,
      requestedDateTime,
      notes
    });
    
    setLoading(true);
    const { error } = await supabase.from('appointments').insert([{
      patient_email: patientEmail,
      doctor_email: doctorEmail,
      requested_time: requestedDateTime,
      notes,
      status: 'pending',
      created_at: new Date().toISOString()
    }]);
    setLoading(false);
    if (error) {
      console.error('Error requesting appointment:', error);
      alert('Failed to request appointment.');
    } else {
      alert('Appointment requested successfully!');
      navigation.goBack();
    }
  };

  return (
    <PaperProvider>
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ padding: 20 }}>
          <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32', textAlign: 'center' }}>
            Request Appointment
          </Text>
          
          <Card style={{ padding: 16, marginBottom: 16, borderRadius: 12 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold', marginBottom: 16, color: '#1976d2' }}>
                Appointment Details
              </Text>
              
              <Text style={{ marginBottom: 8, color: '#666' }}>Select Doctor</Text>
              <TextInput
                label="Doctor Email"
                value={doctorEmail}
                onChangeText={setDoctorEmail}
                placeholder="Enter doctor email"
                style={{ marginBottom: 16 }}
                mode="outlined"
              />
              
              {/* Date Picker */}
              <Text style={{ marginBottom: 8, color: '#666' }}>Select Date</Text>
              <TextInput
                label="Appointment Date"
                value={appointmentDate ? new Date(appointmentDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : ''}
                placeholder="Select appointment date"
                style={{ marginBottom: 8 }}
                mode="outlined"
                right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
                onPressIn={() => setShowDatePicker(true)}
                showSoftInputOnFocus={false}
              />
              
              {/* Time Picker */}
              <Text style={{ marginBottom: 8, color: '#666' }}>Select Time</Text>
              <TextInput
                label="Appointment Time"
                value={appointmentTime ? new Date(`2000-01-01 ${appointmentTime}`).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : ''}
                placeholder="Select appointment time"
                style={{ marginBottom: 16 }}
                mode="outlined"
                right={<TextInput.Icon icon="clock" onPress={() => setShowTimePicker(true)} />}
                onPressIn={() => setShowTimePicker(true)}
                showSoftInputOnFocus={false}
              />
              
              <TextInput
                label="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={{ marginBottom: 20 }}
                mode="outlined"
                placeholder="Any specific notes or requirements"
              />
              
              <Button 
                mode="contained" 
                onPress={handleSubmit} 
                loading={loading} 
                disabled={loading}
                style={{ paddingVertical: 8, backgroundColor: '#2e7d32' }}
                labelStyle={{ fontSize: 16 }}
              >
                Request Appointment
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Date Picker Modal */}
        <Portal>
          <Modal 
            visible={showDatePicker} 
            onDismiss={() => setShowDatePicker(false)} 
            contentContainerStyle={{ 
              backgroundColor: 'white', 
              padding: 20, 
              margin: 20, 
              borderRadius: 12,
              maxHeight: '80%' 
            }}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#1976d2', textAlign: 'center' }}>
              Select Appointment Date
            </Text>
            
            <ScrollView style={{ maxHeight: 400 }}>
              {dateOptions.map((option) => (
                <Button
                  key={option.value}
                  mode={appointmentDate === option.value ? "contained" : "outlined"}
                  onPress={() => {
                    setAppointmentDate(option.value);
                    setShowDatePicker(false);
                  }}
                  style={{ 
                    marginBottom: 8,
                    backgroundColor: appointmentDate === option.value ? '#1976d2' : 'transparent'
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </ScrollView>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowDatePicker(false)}
              style={{ marginTop: 16 }}
            >
              Cancel
            </Button>
          </Modal>
        </Portal>

        {/* Time Picker Modal */}
        <Portal>
          <Modal 
            visible={showTimePicker} 
            onDismiss={() => setShowTimePicker(false)} 
            contentContainerStyle={{ 
              backgroundColor: 'white', 
              padding: 20, 
              margin: 20, 
              borderRadius: 12,
              maxHeight: '80%' 
            }}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#1976d2', textAlign: 'center' }}>
              Select Appointment Time
            </Text>
            
            <ScrollView style={{ maxHeight: 400 }}>
              {timeOptions.map((option) => (
                <Button
                  key={option.value}
                  mode={appointmentTime === option.value ? "contained" : "outlined"}
                  onPress={() => {
                    setAppointmentTime(option.value);
                    setShowTimePicker(false);
                  }}
                  style={{ 
                    marginBottom: 8,
                    backgroundColor: appointmentTime === option.value ? '#1976d2' : 'transparent'
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </ScrollView>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowTimePicker(false)}
              style={{ marginTop: 16 }}
            >
              Cancel
            </Button>
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
}
