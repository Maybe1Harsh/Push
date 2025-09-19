import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { Text, Card, Button, Divider } from "react-native-paper";
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from "./supabaseClient";

export default function DoctorDashboardScreen({ route, navigation }) {
  const [fatalError, setFatalError] = useState(null);

  // Defensive: fallback for route and navigation
  const safeRoute = route || {};
  const safeParams = safeRoute.params || {};
  const safeProfile = safeParams.profile || {};
  const doctorEmail = safeProfile.email || "";
  const doctorName = safeProfile.name || "";
  const [patients, setPatients] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch patients assigned to this doctor
  const fetchPatients = useCallback(() => {
    if (!doctorEmail) return;
    supabase
      .from("patients")
      .select("*")
      .eq("doctor_email", doctorEmail)
      .then(({ data, error }) => {
        if (error) setPatients([]);
        else setPatients(data || []);
      })
      .catch(() => setPatients([]));
  }, [doctorEmail]);

  useFocusEffect(fetchPatients);

  // Real-time subscription for patients
  useEffect(() => {
    if (!doctorEmail) return;
    const channel = supabase
      .channel('patients_changes_' + doctorEmail)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, fetchPatients)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [doctorEmail, fetchPatients]);

  // Real-time subscription for rejected requests
  useEffect(() => {
    if (!doctorEmail) return;
    const channel = supabase
      .channel('rejected_requests_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patient_requests' }, (payload) => {
        if (payload.new && payload.new.status === 'rejected' && payload.new.doctor_email === doctorEmail) {
          alert(`Patient ${payload.new.patient_email} has rejected your request.`);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [doctorEmail]);

  // Check for declined requests and notify doctor
  useEffect(() => {
    if (!doctorEmail) return;
    const checkDeclinedRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('patient_requests')
          .select('id, patient_email')
          .eq('doctor_email', doctorEmail)
          .eq('status', 'declined');
        if (!error && data && data.length > 0) {
          const declinedPatients = data.map(req => req.patient_email).join(', ');
          alert(`The following patients have declined your request: ${declinedPatients}`);
        }
      } catch {}
    };
    checkDeclinedRequests();
  }, [doctorEmail]);

  // Fetch today's schedule
  useEffect(() => {
    if (!doctorEmail) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("schedule")
      .select("*")
      .eq("doctor_email", doctorEmail)
      .eq("date", today)
      .then(({ data, error }) => {
        if (error) setSchedule([]);
        else setSchedule(data || []);
      })
      .catch(() => setSchedule([]));
  }, [doctorEmail]);

  // Fetch pending appointment requests
  useEffect(() => {
    if (!doctorEmail) return;
    const fetchAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('doctor_email', doctorEmail)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        if (!error) setAppointments(data || []);
        else setAppointments([]);
      } catch {
        setAppointments([]);
      }
    };
    fetchAppointments();
  }, [doctorEmail]);

  const handleAccept = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('appointments').update({ status: 'accepted' }).eq('id', id);
      if (!error) setAppointments(prev => prev.filter(app => app.id !== id));
    } catch {}
    setLoading(false);
  };

  const handleReject = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('appointments').update({ status: 'rejected' }).eq('id', id);
      if (!error) setAppointments(prev => prev.filter(app => app.id !== id));
    } catch {}
    setLoading(false);
  };

  const COLORS = {
    greenDark: "#1b5e20",
    green: "#2e7d32",
    greenLight: "#43a047",
    greenPale: "#e8f5e9",
    white: "#ffffff",
    border: "#dfe5dd",
    divider: "#e0e0e0",
    textMuted: "#4f5b5f",
    purple: "#9c27b0",
    orange: "#ff5722",
    blue: "#1976d2"
  };

  const containerStyle = {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f1f8e9"
  };

  const headerCardStyle = {
    marginBottom: 24,
    backgroundColor: COLORS.green,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  };

  const sectionCardStyle = {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  };

  const itemCardStyle = {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1
  };

  const accentItemCardStyle = {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: COLORS.greenPale,
    borderWidth: 1,
    borderColor: COLORS.green,
    elevation: 1
  };

  const sectionTitleStyle = {
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.greenDark,
    fontSize: 18
  };

  const subtle = { color: COLORS.textMuted };

  if (fatalError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff" }}>
        <Text style={{ color: 'red', fontSize: 18, marginBottom: 12 }}>Something went wrong.</Text>
        <Text>{fatalError.toString()}</Text>
      </View>
    );
  }

  if (!navigation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff" }}>
        <Text style={{ color: 'red', fontSize: 18 }}>Navigation not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={containerStyle}>
      {/* Header */}
      <Card style={headerCardStyle}>
        <Card.Content style={{ padding: 24 }}>
          <Text
            variant="headlineMedium"
            style={{ color: COLORS.white, fontWeight: "bold", marginBottom: 8 }}
          >
            Welcome, Dr. {doctorName}
          </Text>
          <Text style={{ color: COLORS.white, fontSize: 16, opacity: 0.9 }}>
            Managing {patients.length} patients • {appointments.filter(app => app.status === 'pending').length} pending requests
          </Text>
        </Card.Content>
      </Card>

      {/* Quick Actions Grid */}
      <Card style={sectionCardStyle}>
        <Card.Content style={{ padding: 20 }}>
          <Text variant="titleLarge" style={{ ...sectionTitleStyle, marginBottom: 20 }}>
            🚀 Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("AddPatient", { doctorEmail })}
              style={{
                flex: 1,
                marginRight: 8,
                backgroundColor: COLORS.green,
                borderRadius: 16,
                paddingVertical: 8
              }}
              labelStyle={{ fontSize: 14, color: COLORS.white, fontWeight: 'bold' }}
              contentStyle={{ paddingVertical: 4 }}
            >
              ➕ Add Patient
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("DoctorPrescriptions", { profile: route.params?.profile })}
              style={{
                flex: 1,
                marginLeft: 8,
                backgroundColor: COLORS.blue,
                borderRadius: 16,
                paddingVertical: 8
              }}
              labelStyle={{ fontSize: 14, color: COLORS.white, fontWeight: 'bold' }}
              contentStyle={{ paddingVertical: 4 }}
            >
              📝 Prescriptions
            </Button>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("ExerciseManagement", { profile: route.params?.profile })}
              style={{
                flex: 1,
                marginRight: 8,
                backgroundColor: COLORS.purple,
                borderRadius: 16,
                paddingVertical: 8
              }}
              labelStyle={{ fontSize: 14, color: COLORS.white, fontWeight: 'bold' }}
              contentStyle={{ paddingVertical: 4 }}
            >
              🧘‍♀️ Exercises
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("DietChartTemplates", { profile: route.params?.profile })}
              style={{
                flex: 1,
                marginLeft: 8,
                backgroundColor: COLORS.orange,
                borderRadius: 16,
                paddingVertical: 8
              }}
              labelStyle={{ fontSize: 14, color: COLORS.white, fontWeight: 'bold' }}
              contentStyle={{ paddingVertical: 4 }}
            >
              🍽 Diet Charts
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Today's Schedule */}
      <Card style={sectionCardStyle}>
        <Card.Content style={{ padding: 20 }}>
          <Text variant="titleLarge" style={sectionTitleStyle}>
            📅 Today's Schedule
          </Text>
          <Divider style={{ marginBottom: 16, backgroundColor: COLORS.divider }} />
          {schedule.length === 0 ? (
            <View style={{ 
              backgroundColor: COLORS.greenPale, 
              padding: 20, 
              borderRadius: 12, 
              alignItems: 'center' 
            }}>
              <Text style={{ ...subtle, fontSize: 16, textAlign: 'center' }}>
                No appointments scheduled for today
              </Text>
            </View>
          ) : (
            schedule.map((item) => (
              <Card key={item.id} style={accentItemCardStyle}>
                <Card.Content style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ 
                      fontWeight: "bold", 
                      color: COLORS.greenDark, 
                      fontSize: 16,
                      marginRight: 12
                    }}>
                      🕒 {item.time}
                    </Text>
                    <View style={{
                      backgroundColor: COLORS.green,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8
                    }}>
                      <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: 'bold' }}>
                        SCHEDULED
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                    {item.patient_name}
                  </Text>
                  {!!item.notes && (
                    <Text style={{ ...subtle, fontSize: 14, fontStyle: 'italic' }}>
                      📝 {item.notes}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Patients List */}
      <Card style={sectionCardStyle}>
        <Card.Content>
          <Text variant="titleMedium" style={sectionTitleStyle}>
            👥 Patients List
          </Text>
          <Divider style={{ marginBottom: 12, backgroundColor: COLORS.divider }} />
          {patients.length === 0 ? (
            <Text style={subtle}>No patients assigned yet.</Text>
          ) : (
            patients.map((patient) => (
              <Card
                key={patient.id}
                style={{
                  ...itemCardStyle,
                  borderLeftWidth: 4,
                  borderLeftColor: COLORS.green
                }}
              >
                <Card.Content>
                  <Text style={{ fontWeight: "bold", color: COLORS.greenDark }}>
                    {patient.name}
                  </Text>
                  <Text style={{ marginTop: 2 }}>{patient.email}</Text>
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Appointment Requests */}
      <Card style={sectionCardStyle}>
        <Card.Content style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text variant="titleLarge" style={sectionTitleStyle}>
              📋 Appointment Requests
            </Text>
            {appointments.filter(app => app.status === 'pending').length > 0 && (
              <View style={{
                backgroundColor: '#ffebee',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20
              }}>
                <Text style={{ color: '#c62828', fontWeight: 'bold' }}>
                  {appointments.filter(app => app.status === 'pending').length} Pending
                </Text>
              </View>
            )}
          </View>
          <Divider style={{ marginBottom: 16, backgroundColor: COLORS.divider }} />
          {appointments.filter(app => app.status === 'pending').length === 0 ? (
            <View style={{ 
              backgroundColor: COLORS.greenPale, 
              padding: 20, 
              borderRadius: 12, 
              alignItems: 'center' 
            }}>
              <Text style={{ ...subtle, fontSize: 16, textAlign: 'center' }}>
                No pending appointment requests at the moment
              </Text>
            </View>
          ) : (
            appointments
              .filter(app => app.status === 'pending')
              .map(app => (
                <Card key={app.id} style={{
                  ...itemCardStyle,
                  borderLeftWidth: 4,
                  borderLeftColor: '#ff9800'
                }}>
                  <Card.Content style={{ padding: 16 }}>
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4 }}>
                        Patient: <Text style={subtle}>{app.patient_email}</Text>
                      </Text>
                      <Text style={{ fontSize: 14, marginBottom: 4 }}>
                        Requested Time: <Text style={{ fontWeight: '600' }}>{app.requested_time}</Text>
                      </Text>
                      {app.notes && (
                        <Text style={{ fontSize: 14, fontStyle: 'italic', color: COLORS.textMuted }}>
                          Notes: {app.notes}
                        </Text>
                      )}
                    </View>
                  </Card.Content>
                  <Card.Actions style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                    <Button
                      onPress={() => handleAccept(app.id)}
                      loading={loading}
                      disabled={loading}
                      style={{ 
                        backgroundColor: COLORS.greenLight, 
                        borderRadius: 12, 
                        marginRight: 8,
                        flex: 1
                      }}
                      labelStyle={{ color: COLORS.white, fontWeight: 'bold' }}
                      mode="contained"
                      contentStyle={{ paddingVertical: 4 }}
                    >
                      ✅ Accept
                    </Button>
                    <Button
                      onPress={() => handleReject(app.id)}
                      loading={loading}
                      disabled={loading}
                      style={{ 
                        backgroundColor: "#c62828", 
                        borderRadius: 12,
                        flex: 1
                      }}
                      labelStyle={{ color: COLORS.white, fontWeight: 'bold' }}
                      mode="contained"
                      contentStyle={{ paddingVertical: 4 }}
                    >
                      ❌ Reject
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
