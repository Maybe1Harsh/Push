import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from './hooks/useTranslation';
import PatientConsentModal from './PatientConsentModal';
import { User, FileText, Calendar, MapPin, Calculator, Leaf, Bell, Clock } from 'lucide-react-native';

export default function DashboardScreen({ navigation, route }) {
  const { t } = useTranslation();
  const profile = route.params?.profile;

  const [pendingRequests, setPendingRequests] = React.useState([]);
  const [assignedDoctor, setAssignedDoctor] = React.useState(null);
  const [scheduledAppointments, setScheduledAppointments] = React.useState([]);
  const [loadingAppointments, setLoadingAppointments] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Consent state
  const [consentModalVisible, setConsentModalVisible] = React.useState(false);
  const [pendingApprovalRequest, setPendingApprovalRequest] = React.useState(null);

  // Fetch functions remain the same as original
  const fetchAssignedDoctor = React.useCallback(async () => {
    // ...existing code...
  }, [profile]);

  const fetchPendingRequests = React.useCallback(async () => {
    // ...existing code...
  }, [profile]);

  const fetchScheduledAppointments = React.useCallback(async () => {
    // ...existing code...
  }, [profile]);

  React.useEffect(() => {
    fetchPendingRequests();
    fetchAssignedDoctor();
    fetchScheduledAppointments();
  }, [fetchPendingRequests, fetchAssignedDoctor, fetchScheduledAppointments, profile]);

  React.useEffect(() => {
    if (!profile?.email) return;

    const channel = supabase
      .channel('patient_requests_changes_' + profile.email)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_requests',
        },
        (payload) => {
          if (payload.new && payload.new.patient_email === profile.email) {
            fetchPendingRequests();
          } else if (payload.old && payload.old.patient_email === profile.email) {
            fetchPendingRequests();
          }
        }
      )
      .subscribe();

    const appointmentsChannel = supabase
      .channel('patient_appointments_changes_' + profile.email)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          if (payload.new && payload.new.patient_email === profile.email) {
            console.log('Appointment change detected for patient:', payload);
            fetchScheduledAppointments();
          } else if (payload.old && payload.old.patient_email === profile.email) {
            fetchScheduledAppointments();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(appointmentsChannel);
    };
  }, [profile?.email, fetchPendingRequests, fetchScheduledAppointments]);

  const handleApprove = async (request) => {
    if (!request) return;

    setPendingApprovalRequest(request);
    setConsentModalVisible(true);
  };

  const handleApprovalAfterConsent = async (request, consentGiven) => {
    // ...existing code...
  };

  const handleReject = async (request) => {
    // ...existing code...
  };

  const handleConsentStatusChange = (accepted) => {
    // ...existing code...
  };

  const handleLogout = async () => {
    // ...existing code...
  };

  React.useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('test_table').select('*').limit(1);
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connection successful:', data);
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };

    testSupabaseConnection();
  }, []);

  return (
    <>
      {!profile ? (
        <View style={styles.errorContainer}>
          <Text variant="headlineMedium" style={styles.errorText}>
            Error: No profile data found
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate('Landing')}>
            Go to Landing Page
          </Button>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <Text variant="headlineMedium" style={styles.welcomeText}>
                {profile?.name ? t.dashWelcomeName.replace('{name}', profile.name) : t.dashWelcome}
              </Text>
              <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
                {t.commonLogout}
              </Button>
            </View>

            {/* Your Doctor Card - Prominent */}
            <Card style={[styles.card, styles.prominentCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <User size={24} color="#388e3c" />
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Your Doctor
                  </Text>
                </View>

                {assignedDoctor ? (
                  <View style={styles.doctorContent}>
                    <Text style={styles.doctorName}>Dr. {assignedDoctor.name}</Text>
                    <Text style={styles.doctorStatus}>You are under Dr. {assignedDoctor.name}'s care</Text>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No doctor assigned</Text>
                    <Text style={styles.emptySubtext}>Approve a request to connect with a doctor</Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* Appointments Card */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Calendar size={24} color="#388e3c" />
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Appointments
                  </Text>
                </View>

                {loadingAppointments ? (
                  <Text style={styles.loadingText}>Loading appointments...</Text>
                ) : scheduledAppointments.length > 0 ? (
                  <View>
                    <Text style={styles.appointmentCount}>{scheduledAppointments.length} Upcoming</Text>
                    <View style={styles.nextAppointment}>
                      <Clock size={16} color="#666" />
                      <Text style={styles.nextAppointmentText}>
                        Next: {new Date(scheduledAppointments[0]?.final_time || scheduledAppointments[0]?.requested_time).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No appointments scheduled</Text>
                  </View>
                )}
              </Card.Content>

              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('PatientAppointment', { patientEmail: profile?.email })}
                  style={styles.secondaryButton}
                >
                  Request New
                </Button>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PatientAppointmentsView', { profile })}
                  style={styles.primaryButton}
                >
                  View All
                </Button>
              </Card.Actions>
            </Card>

            {/* Prescriptions Card */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <FileText size={24} color="#388e3c" />
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Prescriptions
                  </Text>
                </View>
                <Text style={styles.cardDescription}>Access your medical prescriptions and treatment plans</Text>
              </Card.Content>

              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PatientPrescriptions', { profile })}
                  style={styles.primaryButton}
                >
                  {t.dashViewPrescriptions}
                </Button>
              </Card.Actions>
            </Card>

            {/* Doctor Requests Card */}
            {pendingRequests.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Bell size={24} color="#9c27b0" />
                    <Text variant="titleLarge" style={styles.cardTitle}>
                      Doctor Requests ({pendingRequests.length})
                    </Text>
                  </View>

                  {pendingRequests.map((request) => (
                    <View key={request.id} style={styles.requestItem}>
                      <Text style={styles.requestText}>Dr. {request.doctor.name}</Text>
                      <View style={styles.requestActions}>
                        <Button
                          mode="contained"
                          onPress={() => handleApprove(request)}
                          loading={loading}
                          disabled={loading}
                          style={styles.approveButton}
                        >
                          {t.commonApprove}
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => handleReject(request)}
                          disabled={loading}
                          style={styles.rejectButton}
                        >
                          {t.commonReject}
                        </Button>
                      </View>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Features Card - Combined */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Features
                </Text>

                <View style={styles.featuresGrid}>
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#e8f5e9' }]}>
                      <Leaf size={24} color="#388e3c" />
                    </View>
                    <Text style={styles.featureTitle}>Dosha Quiz</Text>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('DoshaQuiz')}
                      style={styles.featureButton}
                    >
                      Start
                    </Button>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#e8f5e9' }]}>
                      <MapPin size={24} color="#388e3c" />
                    </View>
                    <Text style={styles.featureTitle}>Nearby Dieticians</Text>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('NearbyDieticiansScreen')}
                      style={styles.featureButton}
                    >
                      View
                    </Button>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#e8f5e9' }]}>
                      <Calculator size={24} color="#388e3c" />
                    </View>
                    <Text style={styles.featureTitle}>Calorie Counter</Text>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('CalorieCounter')}
                      style={styles.featureButton}
                    >
                      Open
                    </Button>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#e8f5e9' }]}>
                      <Leaf size={24} color="#388e3c" />
                    </View>
                    <Text style={styles.featureTitle}>CureVeda Remedies</Text>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('AyurvedicRemedies')}
                      style={styles.featureButton}
                    >
                      Explore
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>

          <PatientConsentModal
            visible={consentModalVisible}
            onClose={() => {
              setConsentModalVisible(false);
              setPendingApprovalRequest(null);
            }}
            patientProfile={profile}
            assignedDoctor={
              pendingApprovalRequest
                ? {
                    email: pendingApprovalRequest.doctor_email,
                    name: pendingApprovalRequest.doctor.name,
                  }
                : null
            }
            onConsentStatusChange={handleConsentStatusChange}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f3f6fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    color: '#388e3c',
    flex: 1,
  },
  logoutButton: {
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  prominentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#388e3c',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#388e3c',
    marginLeft: 8,
    fontWeight: '600',
  },
  cardDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#388e3c',
  },
  secondaryButton: {
    borderColor: '#388e3c',
  },
  approveButton: {
    backgroundColor: '#388e3c',
    marginRight: 8,
    flex: 1,
  },
  rejectButton: {
    borderColor: '#9c27b0',
    flex: 1,
  },
  doctorContent: {
    marginTop: 8,
  },
  doctorName: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorStatus: {
    color: '#666',
    fontSize: 14,
  },
  emptyState: {
    marginTop: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  appointmentCount: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  nextAppointment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextAppointmentText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  requestItem: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f5f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9c27b0',
  },
  requestText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureButton: {
    borderColor: '#388e3c',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    color: '#666',
  },
});