import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, Modal, Portal, Provider as PaperProvider, Divider, DataTable, Chip, FAB, Menu, IconButton } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function DoctorScheduleScreen({ route, navigation }) {
  // Get doctor details from route params
  const doctorProfile = route?.params?.profile || {};
  const doctorEmail = doctorProfile.email || '';
  const doctorName = doctorProfile.name || 'Doctor';

  console.log('=== DOCTOR SCHEDULE SCREEN INITIALIZED ===');
  console.log('Route params:', JSON.stringify(route?.params, null, 2));
  console.log('Doctor profile:', JSON.stringify(doctorProfile, null, 2));
  console.log('Doctor email:', doctorEmail);
  console.log('Doctor name:', doctorName);
  console.log('Email is valid:', !!doctorEmail && doctorEmail.includes('@'));

  // Alert if no doctor email found and return early
  if (!doctorEmail || !doctorEmail.includes('@')) {
    console.log('❌ CRITICAL: No valid doctor email found!');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e8', padding: 20 }}>
        <Text style={{ color: '#d32f2f', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          Authentication Error: No valid doctor email found.
        </Text>
        <Text style={{ color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
          Received: "{doctorEmail}"
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: '#4caf50' }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [postponeModalVisible, setPostponeModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [addAppointmentModalVisible, setAddAppointmentModalVisible] = useState(false);

  // Date and Time Picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Form states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [postponeTime, setPostponeTime] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [newAppointmentDate, setNewAppointmentDate] = useState('');
  const [newAppointmentTime, setNewAppointmentTime] = useState('');
  const [newAppointmentPatient, setNewAppointmentPatient] = useState('');
  const [newAppointmentNotes, setNewAppointmentNotes] = useState('');
  const [showAppointmentDateModal, setShowAppointmentDateModal] = useState(false);
  const [showAppointmentTimeModal, setShowAppointmentTimeModal] = useState(false);

  // Helper function to generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
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
    for (let i = 0; i < 30; i++) {
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

  // Test database connection function
  const testDatabaseConnection = async () => {
    console.log('=== TESTING DATABASE CONNECTION ===');
    try {
      // Test basic Supabase connection
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('Auth status:', { authData, authError });

      // Test if doctor_schedule table exists
      console.log('Testing doctor_schedule table access...');
      const { data, error } = await supabase
        .from('doctor_schedule')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ TABLE ACCESS ERROR:', error);
        Alert.alert(
          'Database Error', 
          `Cannot access doctor_schedule table.\n\nError: ${error.message}\n\nCode: ${error.code}\n\nThis table needs to be created in Supabase.`
        );
        return false;
      } else {
        console.log('✅ Table access successful!', data);
        Alert.alert('Success', 'Database connection and table access working correctly!');
        return true;
      }
    } catch (err) {
      console.error('❌ UNEXPECTED ERROR:', err);
      Alert.alert('Error', `Unexpected error: ${err.message}`);
      return false;
    }
  };

  const timeOptions = generateTimeOptions();
  const dateOptions = generateDateOptions();

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
      console.log('=== FETCHING SCHEDULE ===');
      console.log('Fetching schedule for doctor:', doctorEmail);
      
      const { data, error, count } = await supabase
        .from('doctor_schedule')
        .select('*', { count: 'exact' })
        .eq('doctor_email', doctorEmail)
        .order('date', { ascending: true });
      
      console.log('Schedule fetch result:', { data, error, count });
      console.log('Raw data array:', data);
      
      if (error) {
        console.error('Error fetching schedule:', error);
        Alert.alert('Error', `Failed to fetch schedule: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('Fetched schedule successfully:', data);
        console.log('Schedule count:', count);
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
    console.log('=== ADD SCHEDULE ATTEMPT ===');
    console.log('Form data:', { scheduleDate, startTime, endTime, description });
    console.log('Doctor details:', { doctorEmail, doctorName });
    
    // Check if all required fields are filled
    if (!scheduleDate || !startTime || !endTime) {
      console.log('❌ Missing required fields');
      console.log('Missing:', {
        scheduleDate: !scheduleDate ? 'MISSING' : 'OK',
        startTime: !startTime ? 'MISSING' : 'OK', 
        endTime: !endTime ? 'MISSING' : 'OK'
      });
      Alert.alert('Error', 'Please fill all required fields (date, start time, end time)');
      return;
    }
    
    // Validate end time is after start time
    if (startTime && endTime) {
      const startDateTime = new Date(`2000-01-01 ${startTime}`);
      const endDateTime = new Date(`2000-01-01 ${endTime}`);
      
      if (endDateTime <= startDateTime) {
        console.log('❌ End time validation failed:', { startTime, endTime });
        Alert.alert('Invalid Time', 'End time must be after start time. Please select a later end time.');
        return;
      }
    }
    
    // Additional validation
    if (!doctorEmail || !doctorEmail.includes('@')) {
      console.log('❌ Missing or invalid doctor email:', doctorEmail);
      Alert.alert('Error', 'Doctor email is missing or invalid. Please log in again.');
      return;
    }

    console.log('✅ All validations passed, proceeding with database insert...');
    setLoading(true);
    
    try {
      const scheduleData = {
        doctor_email: doctorEmail,
        doctor_name: doctorName,
        date: scheduleDate,
        start_time: startTime,
        end_time: endTime,
        description: description || null,
        status: 'available',
        created_at: new Date().toISOString()
      };
      
      console.log('Inserting schedule data:', scheduleData);
      
      // First, let's check if the table exists by trying a simple query
      console.log('🔍 Testing table access...');
      const { data: testData, error: testError } = await supabase
        .from('doctor_schedule')
        .select('count', { count: 'exact', head: true });
        
      console.log('Table test result:', { testData, testError });
      
      if (testError) {
        console.error('❌ Table access error:', testError);
        Alert.alert(
          'Database Table Missing', 
          `The doctor_schedule table does not exist in the database.\n\nError: ${testError.message}\n\nCode: ${testError.code}\n\nPlease run the SQL script to create the table:\n\n1. Go to Supabase Dashboard\n2. Open SQL Editor\n3. Run the script from create_doctor_schedule_table.sql`
        );
        setLoading(false);
        return;
      }
      
      console.log('✅ Table exists, proceeding with insert...');
      
      const { data, error } = await supabase
        .from('doctor_schedule')
        .insert([scheduleData])
        .select();

      console.log('📤 Supabase insert response:', { data, error });

      if (error) {
        console.error('❌ Database insert error:', error);
        
        // Provide specific error messages based on error type
        let errorMessage = `Failed to add schedule: ${error.message}`;
        
        if (error.code === '23505') {
          errorMessage = 'A schedule already exists for this date and time. Please choose a different time slot.';
        } else if (error.code === '42501') {
          errorMessage = 'Permission denied. Please check your account permissions or contact support.';
        } else if (error.code === '23514') {
          errorMessage = 'Invalid data format. Please check your input values.';
        }
        
        Alert.alert('Database Error', `${errorMessage}\n\nTechnical details:\nCode: ${error.code}\nHint: ${error.hint || 'N/A'}`);
      } else {
        console.log('✅ Schedule added successfully:', data);
        Alert.alert('Success', 'Schedule added successfully!');
        setScheduleModalVisible(false);
        // Reset form and close all pickers
        setScheduleDate('');
        setStartTime('');
        setEndTime('');
        setDescription('');
        setShowDatePicker(false);
        setShowStartTimePicker(false);
        setShowEndTimePicker(false);
        fetchSchedule(); // Refresh the schedule list
      }
    } catch (err) {
      console.error('Unexpected error:', err);
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
    console.log('=== DELETE SCHEDULE ATTEMPT ===');
    console.log('Schedule ID to delete:', scheduleId);
    console.log('Doctor email:', doctorEmail);
    
    // First check if scheduleId is valid
    if (!scheduleId) {
      console.error('❌ No schedule ID provided');
      Alert.alert('Error', 'No schedule ID found. Cannot delete.');
      return;
    }
    
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete this schedule? (ID: ${scheduleId})`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('Delete confirmed, proceeding...');
            setLoading(true);
            
            try {
              // Method 1: Try with .single() to get better error info
              console.log('Attempting delete method 1...');
              const { data: deleteData, error: deleteError } = await supabase
                .from('doctor_schedule')
                .delete()
                .eq('id', scheduleId)
                .select()
                .single();
              
              console.log('Delete method 1 response:', { deleteData, deleteError });
              
              if (deleteError) {
                // Method 2: Try without .single()
                console.log('Method 1 failed, trying method 2...');
                const { data: deleteData2, error: deleteError2 } = await supabase
                  .from('doctor_schedule')
                  .delete()
                  .eq('id', scheduleId);
                
                console.log('Delete method 2 response:', { deleteData2, deleteError2 });
                
                if (deleteError2) {
                  console.error('❌ Both delete methods failed');
                  console.error('Error 1:', deleteError);
                  console.error('Error 2:', deleteError2);
                  Alert.alert('Delete Failed', 
                    `Both delete attempts failed:\n\n` +
                    `Method 1: ${deleteError.message}\n` +
                    `Method 2: ${deleteError2.message}`
                  );
                } else {
                  console.log('✅ Method 2 succeeded');
                  Alert.alert('Success', 'Schedule deleted successfully!');
                  setTimeout(() => fetchSchedule(), 500);
                }
              } else {
                console.log('✅ Method 1 succeeded');
                Alert.alert('Success', 'Schedule deleted successfully!');
                setTimeout(() => fetchSchedule(), 500);
              }
              
            } catch (err) {
              console.error('❌ Unexpected delete error:', err);
              Alert.alert('Error', `Unexpected error: ${err.message}`);
            } finally {
              setLoading(false);
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
      <ScrollView 
        style={{ flex: 1, backgroundColor: '#F1F0E8' }}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: "#F1F0E8",
          padding: 20,
        }}
      >
        {/* Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <IconButton
            icon="arrow-left"
            iconColor="#2e7d32"
            size={24}
            onPress={() => navigation.goBack()}
            style={{ margin: 0 }}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2e7d32' }}>Back</Text>
        </View>
        
        {/* Header Section */}
        <Card style={{ marginBottom: 20, backgroundColor: "#96B6C5", elevation: 4, borderRadius: 12 }}>
          <Card.Content>
            <Text
              variant="headlineMedium"
              style={{ color: "#2C3E50", fontWeight: "bold", textAlign: "center" }}
            >
              Schedule & Appointments
            </Text>
            <Text style={{ color: "white", textAlign: "center", marginTop: 5, fontSize: 16 }}>
              Dr. {doctorName}
            </Text>
            <Text style={{ color: "white", textAlign: "center", marginTop: 2, fontSize: 14 }}>
              {doctorEmail}
            </Text>
          </Card.Content>
        </Card>

          {/* Schedule Management Section */}
          <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#EEE0C9', elevation: 3 }}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", marginBottom: 15, color: '#2C3E50' }}
              >
                📅 My Schedule
              </Text>
              <Divider style={{ marginBottom: 15, backgroundColor: '#96B6C5' }} />
              
              {schedule.length === 0 ? (
                <Text style={{ color: '#666', textAlign: 'center', marginVertical: 16 }}>
                  No schedule set. Add your available time slots.
                </Text>
              ) : (
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Date</DataTable.Title>
                    <DataTable.Title>Time</DataTable.Title>
                    <DataTable.Title>Description</DataTable.Title>
                    <DataTable.Title>Action</DataTable.Title>
                  </DataTable.Header>
                  
                  {schedule.map((slot) => (
                    <DataTable.Row key={slot.id}>
                      <DataTable.Cell>{formatDate(slot.date)}</DataTable.Cell>
                      <DataTable.Cell>
                        {slot.start_time} - {slot.end_time}
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text style={{ 
                          fontSize: 12, 
                          color: '#666',
                          fontStyle: slot.description ? 'normal' : 'italic'
                        }}>
                          {slot.description || 'No description'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Button 
                          mode="outlined" 
                          onPress={() => {
                            console.log('🗑️ Delete button clicked for slot:', slot);
                            console.log('Slot ID:', slot.id);
                            console.log('Slot type:', typeof slot.id);
                            console.log('Full slot object:', JSON.stringify(slot, null, 2));
                            deleteSchedule(slot.id);
                          }} 
                          compact
                          disabled={loading}
                          style={{ borderColor: '#f44336' }}
                          textColor="#f44336"
                        >
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
                style={{ 
                  marginTop: 12, 
                  backgroundColor: '#4caf50',
                  borderRadius: 10,
                  paddingVertical: 5,
                }}
                labelStyle={{ fontSize: 14 }}
              >
                Add Schedule
              </Button>
            </Card.Content>
          </Card>

          {/* Appointment Requests Section */}
          <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#f1f8e9' }}>
            <Card.Content>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", marginBottom: 15, color: '#000000' }}
              >
                📋 Appointment Requests ({appointments.length})
              </Text>
              <Divider style={{ marginBottom: 15 }} />
              
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
            contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16, maxHeight: '90%' }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32', textAlign: 'center' }}>
                Postpone Appointment
              </Text>
              
              {/* Patient Info */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                👤 Patient Details
              </Text>
              <Text style={{ marginBottom: 12, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, color: '#666' }}>
                {selectedAppointment?.patient_email}
              </Text>
              
              {/* New Date & Time */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                📅 New Date & Time
              </Text>
              <TextInput
                label="New Date & Time"
                value={postponeTime}
                onChangeText={setPostponeTime}
                placeholder="YYYY-MM-DD HH:MM"
                style={{ marginBottom: 16 }}
                mode="outlined"
                contentStyle={{ paddingVertical: 8 }}
                theme={{
                  colors: {
                    primary: '#4caf50',
                    outline: '#4caf50',
                    onSurfaceVariant: '#4caf50',
                  }
                }}
                outlineColor="#4caf50"
                activeOutlineColor="#2e7d32"
              />

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Button 
                  mode="outlined" 
                  onPress={() => setPostponeModalVisible(false)}
                  style={{ flex: 1, marginRight: 8, borderColor: '#4caf50' }}
                  textColor="#4caf50"
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => handleAppointmentAction(selectedAppointment?.id, 'postponed', postponeTime)} 
                  disabled={!postponeTime}
                  loading={loading}
                  style={{ flex: 1, marginLeft: 8, backgroundColor: '#4caf50' }}
                >
                  Confirm
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>

        {/* Add Schedule Modal */}
        <Portal>
          <Modal 
            visible={scheduleModalVisible} 
            onDismiss={() => setScheduleModalVisible(false)} 
            contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16, maxHeight: '90%' }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32', textAlign: 'center' }}>
                Add Schedule
              </Text>
              
              {/* Date Picker */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                📅 Select Date
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(!showDatePicker)}
                style={{ marginBottom: 12, borderColor: '#2e7d32' }}
                textColor="#4caf50"
                contentStyle={{ paddingVertical: 8 }}
              >
                {scheduleDate ? 
                  dateOptions.find(d => d.value === scheduleDate)?.label || scheduleDate :
                  'Tap to select date'
                }
              </Button>
              
              {showDatePicker && (
                <ScrollView 
                  style={{ maxHeight: 150, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 12 }}
                  showsVerticalScrollIndicator={true}
                >
                  {dateOptions.map((date) => (
                    <Button
                      key={date.value}
                      mode={scheduleDate === date.value ? "contained" : "text"}
                      onPress={() => {
                        setScheduleDate(date.value);
                        setShowDatePicker(false);
                      }}
                      style={{ 
                        marginVertical: 2,
                        backgroundColor: scheduleDate === date.value ? '#2e7d32' : 'transparent'
                      }}
                      textColor={scheduleDate === date.value ? 'white' : '#333'}
                    >
                      {date.label}
                    </Button>
                  ))}
                </ScrollView>
              )}

              {/* Start Time Picker */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                🕐 Start Time
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowStartTimePicker(!showStartTimePicker)}
                style={{ marginBottom: 12, borderColor: '#4caf50' }}
                textColor="#4caf50"
                contentStyle={{ paddingVertical: 8 }}
              >
                {startTime ? 
                  timeOptions.find(t => t.value === startTime)?.label || startTime :
                  'Tap to select start time'
                }
              </Button>
              
              {showStartTimePicker && (
                <ScrollView 
                  style={{ maxHeight: 150, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 12 }}
                  showsVerticalScrollIndicator={true}
                >
                  {timeOptions.map((time) => (
                    <Button
                      key={`start-${time.value}`}
                      mode={startTime === time.value ? "contained" : "text"}
                      onPress={() => {
                        setStartTime(time.value);
                        setShowStartTimePicker(false);
                      }}
                      style={{ 
                        marginVertical: 1,
                        backgroundColor: startTime === time.value ? '#4caf50' : 'transparent'
                      }}
                      textColor={startTime === time.value ? 'white' : '#333'}
                      compact
                    >
                      {time.label}
                    </Button>
                  ))}
                </ScrollView>
              )}

              {/* End Time Picker */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                🕐 End Time
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowEndTimePicker(!showEndTimePicker)}
                style={{ marginBottom: 12, borderColor: '#4caf50' }}
                textColor="#4caf50"
                contentStyle={{ paddingVertical: 8 }}
              >
                {endTime ? 
                  timeOptions.find(t => t.value === endTime)?.label || endTime :
                  'Tap to select end time'
                }
              </Button>
              
              {showEndTimePicker && (
                <ScrollView 
                  style={{ maxHeight: 150, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 12 }}
                  showsVerticalScrollIndicator={true}
                >
                  {timeOptions
                    .filter(time => {
                      // Only show times that are after the selected start time
                      if (!startTime) return true;
                      const startDateTime = new Date(`2000-01-01 ${startTime}`);
                      const currentTime = new Date(`2000-01-01 ${time.value}`);
                      return currentTime > startDateTime;
                    })
                    .map((time) => (
                    <Button
                      key={`end-${time.value}`}
                      mode={endTime === time.value ? "contained" : "text"}
                      onPress={() => {
                        setEndTime(time.value);
                        setShowEndTimePicker(false);
                      }}
                      style={{ 
                        marginVertical: 1,
                        backgroundColor: endTime === time.value ? '#4caf50' : 'transparent'
                      }}
                      textColor={endTime === time.value ? 'white' : '#333'}
                      compact
                    >
                      {time.label}
                    </Button>
                  ))}
                  {timeOptions.filter(time => {
                    if (!startTime) return false;
                    const startDateTime = new Date(`2000-01-01 ${startTime}`);
                    const currentTime = new Date(`2000-01-01 ${time.value}`);
                    return currentTime <= startDateTime;
                  }).length === timeOptions.length && (
                    <Text style={{ textAlign: 'center', color: '#999', padding: 16 }}>
                      Please select a start time first
                    </Text>
                  )}
                </ScrollView>
              )}

              {/* Description Section */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                📝 Description (Optional)
              </Text>
              <TextInput
                label="Schedule Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes about this schedule (e.g., consultation hours, emergency availability, etc.)"
                multiline
                numberOfLines={3}
                style={{ marginBottom: 16 }}
                mode="outlined"
                contentStyle={{ paddingVertical: 8 }}
                theme={{
                  colors: {
                    primary: '#4caf50',
                    outline: '#4caf50',
                    onSurfaceVariant: '#4caf50',
                  }
                }}
                outlineColor="#4caf50"
                activeOutlineColor="#2e7d32"
              />

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setScheduleModalVisible(false);
                    setShowDatePicker(false);
                    setShowStartTimePicker(false);
                    setShowEndTimePicker(false);
                  }}
                  style={{ flex: 1, marginRight: 8, borderColor: '#4caf50' }}
                  textColor="#4caf50"
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleAddSchedule}
                  loading={loading}
                  style={{ flex: 1, marginLeft: 8, backgroundColor: '#4caf50' }}
                  disabled={!scheduleDate || !startTime || !endTime}
                >
                  Add Schedule
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>

        {/* Add Manual Appointment Modal */}
        <Portal>
          <Modal 
            visible={addAppointmentModalVisible && !showAppointmentDateModal && !showAppointmentTimeModal} 
            onDismiss={() => setAddAppointmentModalVisible(false)} 
            contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16, maxHeight: '90%' }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32', textAlign: 'center' }}>
                Add Appointment
              </Text>
              
              {/* Date Selection */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                📅 Select Date
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  console.log('Date picker clicked!');
                  setShowAppointmentDateModal(true);
                }}
                style={{ 
                  marginBottom: 12, 
                  borderColor: '#2e7d32'
                }}
                textColor="#4caf50"
                contentStyle={{ paddingVertical: 8 }}
              >
                {newAppointmentDate ? 
                  dateOptions.find(d => d.value === newAppointmentDate)?.label || newAppointmentDate :
                  'Tap to select date'
                }
              </Button>

              {/* Time Selection */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                🕐 Select Time
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  console.log('Time picker clicked!');
                  setShowAppointmentTimeModal(true);
                }}
                style={{ 
                  marginBottom: 12, 
                  borderColor: '#4caf50'
                }}
                textColor="#4caf50"
                contentStyle={{ paddingVertical: 8 }}
              >
                {newAppointmentTime ? 
                  timeOptions.find(t => t.value === newAppointmentTime)?.label || newAppointmentTime :
                  'Tap to select time'
                }
              </Button>

              {/* Patient Email */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                📧 Patient Email
              </Text>
              <TextInput
                label="Patient Email"
                value={newAppointmentPatient}
                onChangeText={setNewAppointmentPatient}
                placeholder="patient@email.com"
                style={{ marginBottom: 12 }}
                mode="outlined"
                contentStyle={{ paddingVertical: 8 }}
                theme={{
                  colors: {
                    primary: '#4caf50',
                    outline: '#4caf50',
                    onSurfaceVariant: '#4caf50',
                  }
                }}
                outlineColor="#4caf50"
                activeOutlineColor="#2e7d32"
              />

              {/* Notes */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                📝 Notes (Optional)
              </Text>
              <TextInput
                label="Appointment Notes"
                value={newAppointmentNotes}
                onChangeText={setNewAppointmentNotes}
                placeholder="Add notes about this appointment (e.g., consultation type, special requirements, etc.)"
                multiline
                numberOfLines={3}
                style={{ marginBottom: 16 }}
                mode="outlined"
                contentStyle={{ paddingVertical: 8 }}
                theme={{
                  colors: {
                    primary: '#4caf50',
                    outline: '#4caf50',
                    onSurfaceVariant: '#4caf50',
                  }
                }}
                outlineColor="#4caf50"
                activeOutlineColor="#2e7d32"
              />

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Button 
                  mode="outlined" 
                  onPress={() => setAddAppointmentModalVisible(false)}
                  style={{ flex: 1, marginRight: 8, borderColor: '#4caf50' }}
                  textColor="#4caf50"
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
            </ScrollView>
          </Modal>
        </Portal>

        {/* Date Selection Modal for Add Appointment */}
        <Portal>
          <Modal 
            visible={showAppointmentDateModal} 
            onDismiss={() => setShowAppointmentDateModal(false)} 
            contentContainerStyle={{ 
              backgroundColor: 'white', 
              padding: 24, 
              margin: 24, 
              borderRadius: 16, 
              maxHeight: '80%',
              elevation: 10,
              zIndex: 1000
            }}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32', textAlign: 'center' }}>
              Select Date
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {generateDateOptions().map((dateOption) => (
                <TouchableOpacity
                  key={dateOption.value}
                  onPress={() => {
                    console.log('Date selected:', dateOption.value);
                    setNewAppointmentDate(dateOption.value);
                    setShowAppointmentDateModal(false);
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e0e0e0',
                    backgroundColor: newAppointmentDate === dateOption.value ? '#e8f5e8' : 'transparent'
                  }}
                >
                  <Text style={{ 
                    fontSize: 16,
                    color: newAppointmentDate === dateOption.value ? '#2e7d32' : '#333',
                    fontWeight: newAppointmentDate === dateOption.value ? 'bold' : 'normal',
                    textAlign: 'center'
                  }}>
                    {dateOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button 
              mode="outlined" 
              onPress={() => setShowAppointmentDateModal(false)}
              style={{ marginTop: 16, borderColor: '#4caf50' }}
              textColor="#4caf50"
            >
              Cancel
            </Button>
          </Modal>
        </Portal>

        {/* Time Selection Modal for Add Appointment */}
        <Portal>
          <Modal 
            visible={showAppointmentTimeModal} 
            onDismiss={() => setShowAppointmentTimeModal(false)} 
            contentContainerStyle={{ 
              backgroundColor: 'white', 
              padding: 24, 
              margin: 24, 
              borderRadius: 16, 
              maxHeight: '80%',
              elevation: 10,
              zIndex: 1000
            }}
          >
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32', textAlign: 'center' }}>
              Select Time
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {generateTimeOptions().map((timeOption) => (
                <TouchableOpacity
                  key={timeOption.value}
                  onPress={() => {
                    console.log('Time selected:', timeOption.value);
                    setNewAppointmentTime(timeOption.value);
                    setShowAppointmentTimeModal(false);
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e0e0e0',
                    backgroundColor: newAppointmentTime === timeOption.value ? '#e8f5e8' : 'transparent'
                  }}
                >
                  <Text style={{ 
                    fontSize: 16,
                    color: newAppointmentTime === timeOption.value ? '#2e7d32' : '#333',
                    fontWeight: newAppointmentTime === timeOption.value ? 'bold' : 'normal',
                    textAlign: 'center'
                  }}>
                    {timeOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button 
              mode="outlined" 
              onPress={() => setShowAppointmentTimeModal(false)}
              style={{ marginTop: 16, borderColor: '#4caf50' }}
              textColor="#4caf50"
            >
              Cancel
            </Button>
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
}
