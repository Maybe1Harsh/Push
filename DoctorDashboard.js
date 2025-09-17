import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { Text, Card, Button, Divider } from "react-native-paper";
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from "./supabaseClient";

export default function DoctorDashboardScreen({ route, navigation }) {
  const doctorEmail = route.params?.profile?.email || "";
  const doctorName = route.params?.profile?.name || "";
  const [patients, setPatients] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch patients assigned to this doctor
  const fetchPatients = useCallback(() => {
    supabase
      .from("patients")
      .select("*")
      .eq("doctor_email", doctorEmail)
      .then(({ data }) => setPatients(data || []));
  }, [doctorEmail]);

  useFocusEffect(fetchPatients);

  // Real-time subscription for patients
  React.useEffect(() => {
    if (!doctorEmail) return;

    const channel = supabase
      .channel('patients_changes_' + doctorEmail)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
        },
        (payload) => {
          console.log('Patients change received!', payload);
          // Check if the change affects this doctor
          if (payload.new && payload.new.doctor_email === doctorEmail) {
            fetchPatients();
          } else if (payload.old && payload.old.doctor_email === doctorEmail) {
            fetchPatients();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorEmail, fetchPatients]);

  // Real-time subscription for rejected requests
  React.useEffect(() => {
    if (!doctorEmail) return;

    const channel = supabase
      .channel('rejected_requests_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'patient_requests',
        },
        (payload) => {
          if (payload.new && payload.new.status === 'rejected' && payload.new.doctor_email === doctorEmail) {
            alert(`Patient ${payload.new.patient_email} has rejected your request.`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorEmail]);

  // Check for declined requests and notify doctor
  React.useEffect(() => {
    const checkDeclinedRequests = async () => {
      const { data, error } = await supabase
        .from('patient_requests')
        .select('id, patient_email, doctor:Profiles(name)')
        .eq('doctor_email', doctorEmail)
        .eq('status', 'declined');

      if (error) {
        console.error('Error fetching declined requests:', error);
        return;
      }

      if (data && data.length > 0) {
        const declinedPatients = data.map(req => req.patient_email).join(', ');
        alert(`The following patients have declined your request: ${declinedPatients}`);

        // Optionally, update status to notified or delete the records
        // For now, we'll leave them as is
      }
    };

    if (doctorEmail) {
      checkDeclinedRequests();
    }
  }, [doctorEmail]);

  // Fetch today's schedule
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("schedule")
      .select("*")
      .eq("doctor_email", doctorEmail)
      .eq("date", today)
      .then(({ data }) => setSchedule(data || []));
  }, [doctorEmail]);

  // Fetch pending appointment requests
  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_email', doctorEmail)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (!error) setAppointments(data || []);
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
      fetchAppointments();
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
      fetchAppointments();
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
            You have {patients.length} patients under your care.
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
          {schedule.length === 0 ? (
            <Text>No appointments scheduled for today.</Text>
          ) : (
            schedule.map((item) => (
              <Card
                key={item.id}
                style={{
                  marginBottom: 10,
                  borderRadius: 10,
                  backgroundColor: "#e3f2fd",
                }}
              >
                <Card.Content>
                  <Text style={{ fontWeight: "bold" }}>🕒 {item.time}</Text>
                  <Text>👤 {item.patient_name}</Text>
                  <Text>📝 {item.notes}</Text>
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Patients Section */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginBottom: 10 }}
          >
            👥 Patients List
          </Text>
          <Divider style={{ marginBottom: 10 }} />
          {patients.length === 0 ? (
            <Text>No patients assigned yet.</Text>
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
                </Card.Content>
              </Card>
            ))
          )}
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
          {appointments.filter(app => app.status === 'pending').length === 0 ? (
            <Text>No pending appointment requests.</Text>
          ) : (
            appointments.filter(app => app.status === 'pending').map(app => (
              <Card key={app.id} style={{ marginBottom: 10 }}>
                <Card.Content>
                  <Text>Patient: {app.patient_email}</Text>
                  <Text>Requested Time: {app.requested_time}</Text>
                  {app.notes && <Text>Notes: {app.notes}</Text>}
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => handleAccept(app.id)} loading={loading} disabled={loading}>Accept</Button>
                  <Button onPress={() => handleReject(app.id)} loading={loading} disabled={loading}>Reject</Button>
                </Card.Actions>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

