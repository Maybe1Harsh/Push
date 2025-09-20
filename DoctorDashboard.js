import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Dimensions } from "react-native";
import { Text, Card, Button, Divider } from "react-native-paper";
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

  // Fetch today's schedule
  const fetchTodaySchedule = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("doctor_schedule")
        .select("*")
        .eq("doctor_email", doctorEmail)
        .eq("date", today)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching today schedule:', error);
      } else {
        setTodaySchedule(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching schedule:', err);
    }
  }, [doctorEmail]);

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
      fetchTodaySchedule();
      fetchAppointments();
    }, [fetchPatients, fetchTodaySchedule, fetchAppointments])
  );

  // Remove the real-time subscription that filters by doctor_email since that field doesn't exist
  React.useEffect(() => {
    const channel = supabase
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
      supabase.removeChannel(channel);
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
    const { error } = await supabase.from('appointments').update({ status: 'accepted' }).eq('id', id);
    if (error) {
      alert('Failed to accept appointment.');
    } else {
      alert('Appointment accepted.');
      fetchAppointments(); // Refresh appointments
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
              📅 Today's Schedule
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
              Manage Schedule
            </Button>
          </View>
          <Divider style={{ marginBottom: 10 }} />
          {todaySchedule.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ color: '#666', marginBottom: 12 }}>No schedule set for today.</Text>
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
            todaySchedule.map((slot) => (
              <Card
                key={slot.id}
                style={{
                  marginBottom: 8,
                  backgroundColor: slot.status === 'available' ? '#e8f5e8' : '#fff3e0',
                  borderRadius: 8
                }}
              >
                <Card.Content style={{ paddingVertical: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontWeight: 'bold' }}>
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </Text>
                      {slot.break_start && (
                        <Text style={{ color: '#666', fontSize: 12 }}>
                          Break: {formatTime(slot.break_start)} - {formatTime(slot.break_end)}
                        </Text>
                      )}
                    </View>
                    <Text style={{ 
                      color: slot.status === 'available' ? '#2e7d32' : '#f57c00',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}>
                      {slot.status}
                    </Text>
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
    </ScrollView>
  );
}

