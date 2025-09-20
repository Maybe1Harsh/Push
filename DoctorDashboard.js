import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Dimensions } from "react-native";
import { Text, Card, Button, Divider, TextInput, Modal, Portal, Provider as PaperProvider } from "react-native-paper";
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from "./supabaseClient";

export default function DoctorDashboardScreen({ route, navigation }) {
  const doctorEmail = route.params?.profile?.email || "";
  const doctorName = route.params?.profile?.name || "Doctor";

  if (!doctorEmail) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa' }}>
        <Text style={{ color: '#d32f2f', fontSize: 18 }}>No doctor profile found. Please log in again.</Text>
      </View>
    );
  }

  const [patients, setPatients] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Debug function to check appointments
  const debugAppointments = useCallback(async () => {
    console.log('=== DEBUG: Checking all appointments ===');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_email', doctorEmail);
    
    console.log('All appointments for doctor:', data);
    console.log('Error (if any):', error);
    
    const acceptedOnes = data?.filter(app => app.status === 'accepted');
    console.log('Accepted appointments:', acceptedOnes);
    
    const today = new Date().toISOString().slice(0, 10);
    console.log('Today date:', today);
    
    acceptedOnes?.forEach(app => {
      const finalDate = app.final_time ? new Date(app.final_time).toISOString().slice(0, 10) : 'N/A';
      const requestedDate = app.requested_time ? new Date(app.requested_time).toISOString().slice(0, 10) : 'N/A';
      console.log(`Appointment ${app.id}: final_time date=${finalDate}, requested_time date=${requestedDate}`);
    });
  }, [doctorEmail]);

  // Handle date change and refresh schedule
  const handleDateChange = (newDate) => {
    console.log('Date change requested:', newDate);
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      alert('Please enter date in YYYY-MM-DD format (e.g., 2025-09-20)');
      return;
    }
    
    // Validate if it's a real date
    const dateObj = new Date(newDate);
    if (isNaN(dateObj.getTime()) || dateObj.toISOString().slice(0, 10) !== newDate) {
      alert('Please enter a valid date');
      return;
    }
    
    console.log('Date changed to:', newDate);
    setSelectedDate(newDate);
    setShowDatePicker(false);
    // Fetch schedule for the new date
    fetchScheduleForDate(newDate);
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    if (dateString === today) {
      return `Today (${date.toLocaleDateString('en-IN')})`;
    } else if (dateString === tomorrow) {
      return `Tomorrow (${date.toLocaleDateString('en-IN')})`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Fetch patients assigned to this doctor
  const fetchPatients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_email", doctorEmail);

      if (error) {
        console.error('Error fetching patients:', error);
      } else {
        console.log('Fetched patients:', data);
        setPatients(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching patients:', err);
    }
  }, [doctorEmail]);

  // Fetch schedule for a specific date (manual schedule + accepted appointments)
  const fetchScheduleForDate = useCallback(async (targetDate = null) => {
    try {
      const dateToFetch = targetDate || selectedDate;
      console.log('Fetching schedule for date:', dateToFetch);
      
      // Fetch manual schedule entries for the selected date
      const { data: manualSchedule, error: scheduleError } = await supabase
        .from("doctor_schedule")
        .select("*")
        .eq("doctor_email", doctorEmail)
        .eq("date", dateToFetch)
        .order('start_time', { ascending: true });

      if (scheduleError) {
        console.error('Error fetching manual schedule:', scheduleError);
      } else {
        console.log('Manual schedule data for', dateToFetch, ':', manualSchedule);
      }

      // Fetch ALL accepted appointments for this doctor
      const { data: allAcceptedAppointments, error: appointmentError } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_email", doctorEmail)
        .eq("status", "accepted");

      if (appointmentError) {
        console.error('Error fetching accepted appointments:', appointmentError);
      } else {
        console.log('All accepted appointments:', allAcceptedAppointments);
      }

      // Filter appointments for the selected date manually
      let selectedDateAppointments = [];
      if (allAcceptedAppointments) {
        selectedDateAppointments = allAcceptedAppointments.filter(appointment => {
          // Check both final_time and requested_time
          const timeToCheck = appointment.final_time || appointment.requested_time;
          if (!timeToCheck) return false;
          
          const appointmentDate = new Date(timeToCheck).toISOString().slice(0, 10);
          console.log('Comparing dates - Target:', dateToFetch, 'Appointment:', appointmentDate, 'Time:', timeToCheck);
          return appointmentDate === dateToFetch;
        });
        console.log('Filtered appointments for', dateToFetch, ':', selectedDateAppointments);
      }

      // Combine and format the schedule data
      const combinedSchedule = [];
      
      // Add manual schedule entries
      if (manualSchedule && manualSchedule.length > 0) {
        manualSchedule.forEach(slot => {
          combinedSchedule.push({
            ...slot,
            type: 'manual_schedule',
            display_time: `${slot.start_time} - ${slot.end_time}`,
            title: 'Available Time',
            status: slot.status || 'available'
          });
        });
      }

      // Add accepted appointments
      if (selectedDateAppointments && selectedDateAppointments.length > 0) {
        selectedDateAppointments.forEach(appointment => {
          const timeToUse = appointment.final_time || appointment.requested_time;
          const appointmentTime = new Date(timeToUse);
          const timeStr = appointmentTime.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          });
          
          combinedSchedule.push({
            id: `appointment_${appointment.id}`,
            type: 'appointment',
            display_time: timeStr,
            title: `Appointment: ${appointment.patient_email}`,
            status: 'booked',
            patient_email: appointment.patient_email,
            notes: appointment.notes,
            appointment_id: appointment.id,
            final_time: timeToUse
          });
        });
      }

      console.log('Combined schedule before sorting:', combinedSchedule);

      // Sort by time (simpler sorting)
      combinedSchedule.sort((a, b) => {
        let timeA, timeB;
        
        if (a.type === 'manual_schedule') {
          timeA = new Date(`${dateToFetch}T${a.start_time}`);
        } else {
          timeA = new Date(a.final_time);
        }
        
        if (b.type === 'manual_schedule') {
          timeB = new Date(`${dateToFetch}T${b.start_time}`);
        } else {
          timeB = new Date(b.final_time);
        }
        
        return timeA - timeB;
      });

      console.log('Final combined schedule for', dateToFetch, ':', combinedSchedule);
      setTodaySchedule(combinedSchedule);
    } catch (err) {
      console.error('Unexpected error fetching schedule:', err);
    }
  }, [doctorEmail, selectedDate]);

  // Fetch pending appointments
  const fetchAppointments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_email', doctorEmail)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5); // Show only latest 5

      if (error) {
        console.error('Error fetching appointments:', error);
      } else {
        setAppointments(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching appointments:', err);
    }
  }, [doctorEmail]);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
      fetchScheduleForDate();
      fetchAppointments();
    }, [fetchPatients, fetchScheduleForDate, fetchAppointments])
  );

  // Real-time subscriptions for schedule updates
  React.useEffect(() => {
    const appointmentsChannel = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('=== REAL-TIME: Appointments change received! ===', payload);
          // Refresh schedule if it's this doctor's appointment
          if (payload.new?.doctor_email === doctorEmail || payload.old?.doctor_email === doctorEmail) {
            console.log('This doctor affected, refreshing...');
            setTimeout(() => {
              fetchScheduleForDate(); // Refresh schedule
              fetchAppointments(); // Refresh appointment requests
              debugAppointments(); // Debug current state
            }, 1000); // Small delay to ensure DB is updated
          }
        }
      )
      .subscribe();

    const scheduleChannel = supabase
      .channel('schedule_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_schedule',
        },
        (payload) => {
          console.log('Schedule change received!', payload);
          // Refresh schedule if it's this doctor's schedule
          if (payload.new?.doctor_email === doctorEmail || payload.old?.doctor_email === doctorEmail) {
            fetchScheduleForDate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(scheduleChannel);
    };
  }, [doctorEmail, fetchScheduleForDate, fetchAppointments, debugAppointments]);

  // Remove the old patients subscription and replace with this enhanced one
  React.useEffect(() => {
    const patientsChannel = supabase
      .channel('patients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
        },
        (payload) => {
          console.log('Patients change received!', payload);
          fetchPatients(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(patientsChannel);
    };
  }, [fetchPatients]);

  // Fix the declined requests query - remove the invalid join
  React.useEffect(() => {
    const checkDeclinedRequests = async () => {
      // Check if patient_requests table exists and has the right structure
      const { data, error } = await supabase
        .from('patient_requests')
        .select('id, patient_email') // Remove invalid join
        .eq('doctor_email', doctorEmail)
        .eq('status', 'declined');

      if (error) {
        console.error('Error fetching declined requests:', error);
        return;
      }

      if (data && data.length > 0) {
        const declinedPatients = data.map(req => req.patient_email).join(', ');
        alert(`The following patients have declined your request: ${declinedPatients}`);
      }
    };

    if (doctorEmail) {
      checkDeclinedRequests();
    }
  }, [doctorEmail]);

  const handleAccept = async (id) => {
    setLoading(true);
    try {
      // First get the appointment to check its requested_time
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching appointment:', fetchError);
        alert('Failed to fetch appointment details.');
        setLoading(false);
        return;
      }

      console.log('Accepting appointment:', appointment);

      // Update appointment status and set final_time to requested_time if not already set
      const updateData = { 
        status: 'accepted',
        final_time: appointment.final_time || appointment.requested_time || new Date().toISOString()
      };

      console.log('Updating appointment with data:', updateData);

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error accepting appointment:', error);
        alert('Failed to accept appointment.');
      } else {
        alert('Appointment accepted.');
        fetchAppointments(); // Refresh appointments
        fetchScheduleForDate(); // Refresh today's schedule to show the new appointment
      }
    } catch (err) {
      console.error('Unexpected error accepting appointment:', err);
      alert('Unexpected error occurred.');
    }
    setLoading(false);
  };

  const handleReject = async (id) => {
    setLoading(true);
    const { error } = await supabase.from('appointments').update({ status: 'rejected' }).eq('id', id);
    if (error) {
      alert('Failed to reject appointment.');
    } else {
      alert('Appointment rejected.');
      fetchAppointments(); // Refresh appointments
      fetchScheduleForDate(); // Refresh today's schedule to remove the rejected appointment
    }
    setLoading(false);
  };

  const formatTime = (timeString) => {
    try {
      return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return timeString;
    }
  };

  return (
    <PaperProvider>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          backgroundColor: "#f9fafc",
        }}
      >
      {/* Header */}
      <Card style={{ marginBottom: 20, backgroundColor: "#1976d2" }}>
        <Card.Content>
          <Text
            variant="headlineMedium"
            style={{ color: "white", fontWeight: "bold" }}
          >
            Welcome, Dr. {doctorName}
          </Text>
          <Text style={{ color: "white", marginTop: 5, fontSize: 16 }}>
            Total patients in system: {patients.length}
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("AddPatient", { doctorEmail })}
          style={{
            flex: 1,
            marginRight: 8,
            backgroundColor: "#388e3c",
            borderRadius: 10,
            paddingVertical: 5,
          }}
          labelStyle={{ fontSize: 14 }}
        >
          ➕ Add Patient
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("DoctorPrescriptions", { profile: route.params?.profile })}
          style={{
            flex: 1,
            marginLeft: 8,
            backgroundColor: "#1976d2",
            borderRadius: 10,
            paddingVertical: 5,
          }}
          labelStyle={{ fontSize: 14 }}
        >
          📝 Prescriptions
        </Button>
      </View>
      
      {/* Second row of action buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("DietChartTemplates", { profile: route.params?.profile })}
          style={{
            flex: 1,
            marginRight: 8,
            backgroundColor: "#ff9800",
            borderRadius: 10,
            paddingVertical: 5,
          }}
          labelStyle={{ fontSize: 14 }}
        >
          🍽️ Diet Charts
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("PanchkarmaScreen", { profile: route.params?.profile })}
          style={{
            flex: 1,
            marginLeft: 8,
            backgroundColor: "#4caf50",
            borderRadius: 10,
            paddingVertical: 5,
          }}
          labelStyle={{ fontSize: 14 }}
        >
          🌿 Panchkarma
        </Button>
      </View>

      {/* Patients Section */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginBottom: 10 }}
          >
            👥 All Patients
          </Text>
          <Divider style={{ marginBottom: 10 }} />
          {patients.length === 0 ? (
            <Text>No patients found.</Text>
          ) : (
            patients.map((patient) => (
              <Card
                key={patient.id}
                style={{
                  marginBottom: 10,
                  borderRadius: 10,
                  backgroundColor: "#fff3e0",
                }}
              >
                <Card.Content>
                  <Text style={{ fontWeight: "bold" }}>
                    {patient.name}
                  </Text>
                  <Text>{patient.email}</Text>
                  <Text>Age: {patient.age}</Text>
                  {patient.phone && <Text>Phone: {patient.phone}</Text>}
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Today's Schedule Section */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold" }}
            >
              📅 Schedule
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                mode="text"
                onPress={() => {
                  console.log('Debug appointments triggered');
                  debugAppointments();
                }}
                compact
                icon="bug"
              >
                Debug
              </Button>
              <Button
                mode="text"
                onPress={() => {
                  console.log('Manual refresh triggered');
                  fetchScheduleForDate();
                }}
                compact
                icon="refresh"
              >
                Refresh
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  console.log('Navigating to DoctorSchedule with params:', route.params);
                  navigation.navigate("DoctorSchedule", { 
                    profile: route.params?.profile,
                    doctorEmail: doctorEmail,
                    doctorName: doctorName
                  });
                }}
                compact
              >
                Manage Schedule
              </Button>
            </View>
          </View>

          {/* Date Selector */}
          <View style={{ 
            backgroundColor: '#e3f2fd', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Viewing Schedule For:</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1976d2' }}>
                {formatDateForDisplay(selectedDate)}
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => setShowDatePicker(true)}
              compact
              style={{ backgroundColor: '#1976d2' }}
            >
              Change Date
            </Button>
          </View>

          {/* Quick Date Buttons */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-around', 
            marginBottom: 10,
            gap: 8
          }}>
            <Button
              mode={selectedDate === new Date().toISOString().slice(0, 10) ? "contained" : "outlined"}
              onPress={() => handleDateChange(new Date().toISOString().slice(0, 10))}
              compact
              style={{ flex: 1 }}
            >
              Today
            </Button>
            <Button
              mode={selectedDate === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) ? "contained" : "outlined"}
              onPress={() => handleDateChange(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10))}
              compact
              style={{ flex: 1 }}
            >
              Tomorrow
            </Button>
            <Button
              mode={selectedDate === new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) ? "contained" : "outlined"}
              onPress={() => handleDateChange(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))}
              compact
              style={{ flex: 1 }}
            >
              Day After
            </Button>
          </View>
          
          {/* Schedule Summary */}
          {todaySchedule.length > 0 && (
            <View style={{ 
              backgroundColor: '#f5f5f5', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', color: '#4caf50' }}>
                  {todaySchedule.filter(item => item.type === 'manual_schedule').length}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Available Slots</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', color: '#ff9800' }}>
                  {todaySchedule.filter(item => item.type === 'appointment').length}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Appointments</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', color: '#2196f3' }}>
                  {todaySchedule.length}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Total Items</Text>
              </View>
            </View>
          )}
          
          <Divider style={{ marginBottom: 10 }} />
          {todaySchedule.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ color: '#666', marginBottom: 12, textAlign: 'center' }}>
                No schedule found for {formatDateForDisplay(selectedDate).toLowerCase()}.
              </Text>
              <Button
                mode="contained"
                onPress={() => {
                  console.log('Navigating to DoctorSchedule with params:', route.params);
                  navigation.navigate("DoctorSchedule", { 
                    profile: route.params?.profile,
                    doctorEmail: doctorEmail,
                    doctorName: doctorName
                  });
                }}
                style={{ backgroundColor: '#1976d2' }}
              >
                Add Schedule
              </Button>
            </View>
          ) : (
            todaySchedule.map((item, index) => (
              <Card
                key={item.id || `schedule_${index}`}
                style={{
                  marginBottom: 8,
                  backgroundColor: item.type === 'appointment' 
                    ? '#fff3e0' 
                    : item.status === 'available' 
                      ? '#e8f5e8' 
                      : '#f3e5f5',
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: item.type === 'appointment' 
                    ? '#ff9800' 
                    : item.status === 'available' 
                      ? '#4caf50' 
                      : '#9c27b0'
                }}
              >
                <Card.Content style={{ paddingVertical: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                          {item.display_time}
                        </Text>
                        <View style={{
                          marginLeft: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 12,
                          backgroundColor: item.type === 'appointment' ? '#ff9800' : '#4caf50'
                        }}>
                          <Text style={{ 
                            color: 'white', 
                            fontSize: 10, 
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            {item.type === 'appointment' ? 'APPOINTMENT' : 'AVAILABLE'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={{ 
                        color: '#333', 
                        fontSize: 14,
                        marginBottom: 2
                      }}>
                        {item.title}
                      </Text>
                      
                      {item.type === 'manual_schedule' && item.break_start && (
                        <Text style={{ color: '#666', fontSize: 12 }}>
                          Break: {formatTime(item.break_start)} - {formatTime(item.break_end)}
                        </Text>
                      )}
                      
                      {item.type === 'appointment' && item.notes && (
                        <Text style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
                          Notes: {item.notes}
                        </Text>
                      )}
                    </View>
                    
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ 
                        color: item.type === 'appointment' 
                          ? '#f57c00' 
                          : item.status === 'available' 
                            ? '#2e7d32' 
                            : '#7b1fa2',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                        fontSize: 12
                      }}>
                        {item.type === 'appointment' ? 'Booked' : item.status}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Appointment Requests Section */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold" }}
            >
              📋 Appointment Requests ({appointments.length})
            </Text>
            <Button
              mode="outlined"
              onPress={() => {
                console.log('Navigating to DoctorSchedule with params:', route.params);
                navigation.navigate("DoctorSchedule", { 
                  profile: route.params?.profile,
                  doctorEmail: doctorEmail,
                  doctorName: doctorName
                });
              }}
              compact
            >
              View All
            </Button>
          </View>
          <Divider style={{ marginBottom: 10 }} />
          {appointments.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#666', paddingVertical: 16 }}>
              No pending appointment requests.
            </Text>
          ) : (
            appointments.map((app) => (
              <Card
                key={app.id}
                style={{
                  marginBottom: 12,
                  backgroundColor: '#fff3e0',
                  borderRadius: 8
                }}
              >
                <Card.Content>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    Patient: {app.patient_email}
                  </Text>
                  <Text style={{ color: '#666', marginBottom: 4 }}>
                    Requested: {new Date(app.requested_time).toLocaleString('en-IN')}
                  </Text>
                  {app.notes && (
                    <Text style={{ color: '#666', fontStyle: 'italic', marginBottom: 8 }}>
                      Notes: {app.notes}
                    </Text>
                  )}
                </Card.Content>
                <Card.Actions>
                  <Button 
                    mode="contained" 
                    onPress={() => handleAccept(app.id)}
                    style={{ backgroundColor: '#4caf50', marginRight: 8 }}
                    loading={loading}
                    compact
                  >
                    Accept
                  </Button>
                  <Button 
                    mode="outlined" 
                    onPress={() => handleReject(app.id)}
                    textColor="#f44336"
                    loading={loading}
                    compact
                  >
                    Reject
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>
      
      {/* Date Picker Modal */}
      <Portal>
        <Modal 
          visible={showDatePicker} 
          onDismiss={() => setShowDatePicker(false)} 
          contentContainerStyle={{ 
            backgroundColor: 'white', 
            padding: 24, 
            margin: 24, 
            borderRadius: 16 
          }}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16, color: '#1976d2', textAlign: 'center' }}>
            Select Date for Schedule
          </Text>
          
          <Text style={{ marginBottom: 12, color: '#666', textAlign: 'center' }}>
            Enter date manually or use quick select buttons below
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TextInput
              label="Date (YYYY-MM-DD)"
              value={selectedDate}
              onChangeText={(text) => {
                // Allow typing any text, validate later
                setSelectedDate(text);
              }}
              placeholder="2025-09-20"
              style={{ flex: 1, marginRight: 8 }}
              mode="outlined"
              keyboardType="numeric"
            />
            <Button
              mode="outlined"
              onPress={() => setSelectedDate('')}
              compact
            >
              Clear
            </Button>
          </View>
          
          <Text style={{ fontSize: 12, color: '#999', marginBottom: 20, textAlign: 'center' }}>
            Format: Year-Month-Day (e.g., 2025-09-20)
          </Text>
          
          <Text style={{ marginBottom: 12, color: '#666', textAlign: 'center' }}>
            Quick Select:
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            <Button
              mode="outlined"
              onPress={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              compact
            >
              Today
            </Button>
            <Button
              mode="outlined"
              onPress={() => setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10))}
              compact
            >
              Tomorrow
            </Button>
            <Button
              mode="outlined"
              onPress={() => setSelectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))}
              compact
            >
              Next Week
            </Button>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button 
              mode="outlined" 
              onPress={() => setShowDatePicker(false)}
              style={{ flex: 1, marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={() => handleDateChange(selectedDate)}
              style={{ flex: 1, marginLeft: 8, backgroundColor: '#1976d2' }}
            >
              View Schedule
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
    </PaperProvider>
  );
}

