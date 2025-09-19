import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Dimensions } from "react-native";
import { Text, Card, Button, Divider } from "react-native-paper";
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from "./supabaseClient";

export default function DoctorDashboardScreen({ route, navigation }) {
  const doctorEmail = route.params?.profile?.email || "";
  const doctorName = route.params?.profile?.name || "";

  if (!doctorEmail) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa' }}>
        <Text style={{ color: '#d32f2f', fontSize: 18 }}>No doctor profile found. Please log in again.</Text>
      </View>
    );
  }

  const [patients, setPatients] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch patients (all patients or based on your business logic)
  const fetchPatients = useCallback(() => {
    // Since there's no doctor_email field, fetch all patients with Role 'patient'
    // OR modify this based on your actual relationship logic
    supabase
      .from("patients")
      .select("*")
      .eq("Role", "patient") // Get all patients, not filtering by doctor_email
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching patients:', error);
        } else {
          console.log('Fetched patients:', data);
          setPatients(data || []);
        }
      });
  }, []);

  useFocusEffect(fetchPatients);

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

  // Fetch today's schedule (only if schedule table exists)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("schedule")
      .select("*")
      .eq("doctor_email", doctorEmail)
      .eq("date", today)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching schedule:', error);
        } else {
          setSchedule(data || []);
        }
      });
  }, [doctorEmail]);

  // Fetch pending appointment requests (only if appointments table exists)
  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_email', doctorEmail)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching appointments:', error);
      } else {
        setAppointments(data || []);
      }
    };

    if (doctorEmail) fetchAppointments();
  }, [doctorEmail]);

  const handleAccept = async (id) => {
    setLoading(true);
    const { error } = await supabase.from('appointments').update({ status: 'accepted' }).eq('id', id);
    if (error) {
      alert('Failed to accept appointment.');
    } else {
      alert('Appointment accepted.');
      // Optimistically update UI
      setAppointments(prev => prev.filter(app => app.id !== id));
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
      // Optimistically update UI
      setAppointments(prev => prev.filter(app => app.id !== id));
    }
    setLoading(false);
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
      
      <Button
        mode="contained"
        onPress={() => navigation.navigate("DietChartTemplates", { profile: route.params?.profile })}
        style={{
          marginBottom: 20,
          backgroundColor: "#ff9800",
          borderRadius: 10,
          paddingVertical: 5,
        }}
        labelStyle={{ fontSize: 16 }}
      >
        🍽️ Diet Charts
      </Button>

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
                  <Text>Role: {patient.Role}</Text>
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Schedule Section */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginBottom: 10 }}
          >
            📅 Today's Schedule
          </Text>
          <Divider style={{ marginBottom: 10 }} />
          <Text>Schedule feature coming soon...</Text>
        </Card.Content>
      </Card>

      {/* Appointment Requests Section */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginBottom: 10 }}
          >
            📋 Appointment Requests
          </Text>
          <Divider style={{ marginBottom: 10 }} />
          <Text>No appointment system configured yet.</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

