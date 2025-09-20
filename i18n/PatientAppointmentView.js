import * as React from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { Text, Button, Card, Appbar, FAB } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function PatientAppointmentsViewScreen({ navigation, route }) {
  const profile = route.params?.profile;
  const [scheduledAppointments, setScheduledAppointments] = React.useState([]);
  const [loadingAppointments, setLoadingAppointments] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch scheduled appointments for the patient
  const fetchScheduledAppointments = React.useCallback(async () => {
    if (!profile?.email) return;

    setLoadingAppointments(true);
    try {
      console.log('Fetching scheduled appointments for patient:', profile.email);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_email', profile.email)
        .eq('status', 'accepted')
        .order('final_time', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled appointments:', error);
        setScheduledAppointments([]);
      } else {
        console.log('Fetched scheduled appointments:', data);
        
        // Filter for future appointments
        const now = new Date().toISOString();
        const futureAppointments = data.filter(appointment => {
          const appointmentTime = appointment.final_time || appointment.requested_time;
          return appointmentTime && appointmentTime > now;
        });
        
        setScheduledAppointments(futureAppointments);
      }
    } catch (error) {
      console.error('Error fetching scheduled appointments:', error);
      setScheduledAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, [profile]);

  React.useEffect(() => {
    fetchScheduledAppointments();
  }, [fetchScheduledAppointments]);

  // Set up real-time subscription for appointment changes
  React.useEffect(() => {
    if (!profile?.email) return;

    const appointmentSubscription = supabase
      .channel('patient-appointments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `patient_email=eq.${profile.email}`
      }, (payload) => {
        console.log('Appointment change detected:', payload);
        fetchScheduledAppointments();
      })
      .subscribe();

    return () => {
      appointmentSubscription.unsubscribe();
    };
  }, [profile?.email, fetchScheduledAppointments]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchScheduledAppointments();
    setRefreshing(false);
  }, [fetchScheduledAppointments]);

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const formatAppointmentTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getAppointmentStatus = (dateString) => {
    const appointmentTime = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (appointmentTime.toDateString() === today.toDateString()) {
      return { label: 'TODAY', color: '#ff9800', bgColor: '#fff3e0' };
    } else if (appointmentTime.toDateString() === tomorrow.toDateString()) {
      return { label: 'TOMORROW', color: '#4caf50', bgColor: '#e8f5e8' };
    } else {
      return { label: 'UPCOMING', color: '#2196f3', bgColor: '#e3f2fd' };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <Appbar.Header style={{ backgroundColor: '#1976d2' }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
        <Appbar.Content title="Your Appointments" titleStyle={{ color: 'white', fontWeight: 'bold' }} />
        <Appbar.Action 
          icon="refresh" 
          onPress={onRefresh} 
          color="white"
          disabled={loadingAppointments || refreshing}
        />
      </Appbar.Header>

      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Stats */}
        <Card style={{ 
          marginBottom: 20, 
          backgroundColor: '#e3f2fd',
          borderLeftWidth: 4,
          borderLeftColor: '#1976d2'
        }}>
          <Card.Content>
            <Text variant="titleLarge" style={{ 
              fontWeight: 'bold', 
              color: '#1976d2', 
              textAlign: 'center',
              marginBottom: 8
            }}>
              📅 Upcoming Appointments
            </Text>
            <Text style={{ 
              textAlign: 'center', 
              color: '#666',
              fontSize: 16
            }}>
              {loadingAppointments ? 'Loading...' : 
               scheduledAppointments.length === 0 ? 'No upcoming appointments' :
               `${scheduledAppointments.length} appointment${scheduledAppointments.length !== 1 ? 's' : ''} scheduled`}
            </Text>
          </Card.Content>
        </Card>

        {/* Appointments List */}
        {loadingAppointments ? (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: '#666', fontSize: 16 }}>
                  Loading your appointments...
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : scheduledAppointments.length === 0 ? (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ 
                  fontSize: 60, 
                  marginBottom: 16,
                  opacity: 0.3 
                }}>
                  📅
                </Text>
                <Text style={{ 
                  color: '#666', 
                  fontSize: 18, 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  No upcoming appointments
                </Text>
                <Text style={{ 
                  color: '#999', 
                  fontSize: 14, 
                  textAlign: 'center',
                  marginBottom: 20
                }}>
                  Request an appointment with your doctor to get started
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PatientAppointment', { patientEmail: profile?.email })}
                  style={{ backgroundColor: '#1976d2' }}
                  icon="calendar-plus"
                >
                  Request Appointment
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          scheduledAppointments.map((appointment, index) => {
            const appointmentTime = new Date(appointment.final_time || appointment.requested_time);
            const status = getAppointmentStatus(appointment.final_time || appointment.requested_time);
            
            return (
              <Card 
                key={appointment.id}
                style={{ 
                  marginBottom: 16,
                  backgroundColor: status.bgColor,
                  borderLeftWidth: 4,
                  borderLeftColor: status.color,
                  elevation: 2
                }}
              >
                <Card.Content>
                  {/* Status Badge */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: 12
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={{ 
                        fontWeight: 'bold', 
                        color: '#333',
                        marginBottom: 4
                      }}>
                        Dr. {appointment.doctor_name || 'Unknown Doctor'}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: status.color,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginLeft: 10
                    }}>
                      <Text style={{ 
                        color: 'white', 
                        fontSize: 10, 
                        fontWeight: 'bold' 
                      }}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {/* Appointment Details */}
                  <View style={{ 
                    backgroundColor: 'rgba(255,255,255,0.7)', 
                    borderRadius: 8, 
                    padding: 12,
                    marginBottom: 8
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontSize: 16, marginRight: 8 }}>📅</Text>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: 'bold', 
                        color: '#333',
                        flex: 1
                      }}>
                        {formatAppointmentDate(appointment.final_time || appointment.requested_time)}
                      </Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontSize: 16, marginRight: 8 }}>🕐</Text>
                      <Text style={{ 
                        fontSize: 16, 
                        color: '#666',
                        flex: 1
                      }}>
                        {formatAppointmentTime(appointment.final_time || appointment.requested_time)}
                      </Text>
                    </View>

                    {appointment.symptoms && (
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 16, marginRight: 8, marginTop: 2 }}>💬</Text>
                        <Text style={{ 
                          fontSize: 14, 
                          color: '#666',
                          flex: 1,
                          fontStyle: 'italic'
                        }}>
                          Symptoms: {appointment.symptoms}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Appointment Number */}
                  <Text style={{ 
                    textAlign: 'right', 
                    color: '#999', 
                    fontSize: 12,
                    marginTop: 4
                  }}>
                    Appointment #{index + 1}
                  </Text>
                </Card.Content>
              </Card>
            );
          })
        )}

        {/* Bottom spacing for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="calendar-plus"
        label="Request Appointment"
        onPress={() => navigation.navigate('PatientAppointment', { patientEmail: profile?.email })}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#1976d2'
        }}
      />
    </View>
  );
}
