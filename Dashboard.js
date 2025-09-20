import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from './hooks/useTranslation';
import PatientConsentModal from './PatientConsentModal';

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

  const fetchAssignedDoctor = React.useCallback(async () => {
    if (!profile?.email) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('doctor_email')
        .eq('email', profile.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.doctor_email) {
        const { data: doctorData, error: doctorError } = await supabase
          .from('Profiles')
          .select('name')
          .eq('email', data.doctor_email)
          .single();

        if (doctorError) {
          throw doctorError;
        }

        setAssignedDoctor({
          email: data.doctor_email,
          name: doctorData.name,
        });
      } else {
        // Fallback: derive from latest accepted request
        const { data: req, error: reqErr } = await supabase
          .from('patient_requests')
          .select('doctor_email, status')
          .eq('patient_email', profile.email)
          .in('status', ['accepted', 'approved'])
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        if (!reqErr && req && req.doctor_email) {
          const { data: doc, error: docErr } = await supabase
            .from('Profiles')
            .select('name')
            .eq('email', req.doctor_email)
            .single();
          if (!docErr && doc) {
            setAssignedDoctor({ email: req.doctor_email, name: doc.name });
          } else {
            setAssignedDoctor({ email: req.doctor_email, name: 'Doctor' });
          }
        } else {
          setAssignedDoctor(null);
        }
      }
    } catch (error) {
      console.error('Error fetching assigned doctor:', error);
      setAssignedDoctor(null);
    }
  }, [profile]);

  const fetchPendingRequests = React.useCallback(async () => {
    if (!profile?.email) return;
    try {
      const { data, error } = await supabase
        .from('patient_requests')
        .select('id, doctor_email, status')
        .eq('patient_email', profile.email)
        .eq('status', 'pending');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        const doctorEmails = data.map(req => req.doctor_email);
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('Profiles')
          .select('email, name')
          .in('email', doctorEmails);

        if (doctorsError) {
          throw doctorsError;
        }

        const requestsWithDoctorNames = data.map(req => {
          const doctor = doctorsData.find(d => d.email === req.doctor_email);
          return { ...req, doctor: doctor ? { name: doctor.name } : { name: 'Unknown' } };
        });

        setPendingRequests(requestsWithDoctorNames);
      } else {
        setPendingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setPendingRequests([]);
    }
  }, [profile]);

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

    // Also listen for appointment changes
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

  // Fix: handleApprove now shows consent modal first
  const handleApprove = async (request) => {
    if (!request) return;
    
    // Store the request and show consent modal
    setPendingApprovalRequest(request);
    setConsentModalVisible(true);
  };

  // New function to handle the actual approval after consent
  const handleApprovalAfterConsent = async (request, consentGiven) => {
    if (!consentGiven) {
      alert('Consent was declined. Doctor approval cancelled.');
      return;
    }

    setLoading(true);

    try {
      // Add patient to doctor's list
      console.log('Adding patient to doctor list:', {
        patientName: profile.name,
        patientEmail: profile.email,
        doctorEmail: request.doctor_email,
        patientAge: profile.age
      });
      
      const { error: insertError } = await supabase
        .from('patients')
        .insert([
          {
            name: profile.name,
            email: profile.email,
            doctor_email: request.doctor_email,
            age: profile.age,
          },
        ]);

      if (insertError) {
        console.error('Error inserting patient:', insertError);
        throw new Error('Failed to add you to the doctor\'s patient list. Please try again.');
      }

      console.log('Patient successfully added to doctor list');

      // Update request status
      const { error: updateError } = await supabase
        .from('patient_requests')
        .update({ status: 'accepted' })
        .eq('id', request.id);

      if (updateError) {
        throw new Error('Failed to update request status. Please try again.');
      }

      await fetchPendingRequests();
      await fetchAssignedDoctor();
      
      console.log('Patient approval completed successfully');
      alert(`✅ Success! You are now registered as a patient under Dr. ${request.doctor.name}. The doctor can see you in their patient list.`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fix: handleReject now accepts 'request' as an argument
  const handleReject = async (request) => {
    if (!request) return;
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('patient_requests')
        // Fix: Use 'declined' to match your workflow, or change workflow to 'rejected'
        .update({ status: 'declined' })
        .eq('id', request.id);

      if (updateError) {
        throw new Error('Failed to update request status. Please try again.');
      }

      await fetchPendingRequests();
      alert('You have rejected the doctor\'s request. The doctor will be notified.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Consent handlers
  const handleConsentStatusChange = (accepted) => {
    // Always close the modal first
    setConsentModalVisible(false);

    // If this is part of an approval process, complete the approval
    if (pendingApprovalRequest) {
      if (accepted) {
        // Proceed with approval and add to database
        handleApprovalAfterConsent(pendingApprovalRequest, accepted);
      } else {
        // Consent was declined - show message and cancel approval
        alert('❌ Consent declined. You will not be added to the doctor\'s patient list.');
      }
      // Clear the pending request
      setPendingApprovalRequest(null);
    }

    // Always refresh the dashboard data after consent changes
    if (accepted) {
      // Refresh all relevant data
      fetchPendingRequests();
      fetchAssignedDoctor();
      // Show success message
      setTimeout(() => {
        alert('✅ Success! You are now registered with the doctor and will appear in their patient list.');
      }, 500); // Small delay to ensure UI updates
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('profile');
      navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
    } catch (e) {
      // ignore
    }
  };

  return (
    <>
      {!profile ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#ff0000' }}>
            Error: No profile data found
          </Text>
          <Text style={{ marginBottom: 10, color: '#666' }}>
            Debug: Route params = {JSON.stringify(route.params)}
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate('Landing')}>
            Go to Landing Page
          </Button>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: '#f3f6fa' }}>
        <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32' }}>
          {profile?.name ? t.dashWelcomeName.replace('{name}', profile.name) : t.dashWelcome}
        </Text>
        <Button mode="outlined" onPress={handleLogout} style={{ alignSelf: 'flex-end', marginBottom: 10 }}>{t.commonLogout}</Button>
        
        <Card style={{
          width: '100%',
          marginBottom: 15,
          borderRadius: 16,
          backgroundColor: '#fff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Card.Content style={{ paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ 
                  fontWeight: 'bold', 
                  color: '#4caf50', 
                  marginBottom: 8
                }}>
                  👨‍⚕️ Your Doctor
                </Text>
                <Text style={{
                  color: '#333',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 4
                }}>
                  {assignedDoctor ? `Dr. ${assignedDoctor.name}` : 'No doctor assigned'}
                </Text>
                <Text style={{
                  color: '#666',
                  fontSize: 14
                }}>
                  {assignedDoctor ? `You are under Dr. ${assignedDoctor.name}'s care` : 'Approve a request to connect with a doctor'}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: assignedDoctor ? '#e8f5e8' : '#ffebee',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24 }}>
                    {assignedDoctor ? '👨‍⚕️' : '❗'}
                  </Text>
                </View>
                <Text style={{ 
                  color: assignedDoctor ? '#4caf50' : '#f44336', 
                  fontSize: 12, 
                  fontWeight: 'bold' 
                }}>
                  {assignedDoctor ? 'Assigned' : 'Pending'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={{
          width: '100%',
          marginBottom: 15,
          borderRadius: 16,
          backgroundColor: '#fff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Card.Content style={{ paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ 
                  fontWeight: 'bold', 
                  color: '#1976d2', 
                  marginBottom: 8
                }}>
                  💊 Prescriptions
                </Text>
                <Text style={{
                  color: '#333',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 4
                }}>
                  View Your Prescriptions
                </Text>
                <Text style={{
                  color: '#666',
                  fontSize: 14
                }}>
                  Access your medical prescriptions and treatment plans
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#e3f2fd',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24 }}>📋</Text>
                </View>
                <Text style={{ 
                  color: '#1976d2', 
                  fontSize: 12, 
                  fontWeight: 'bold' 
                }}>
                  Tap to view
                </Text>
              </View>
            </View>
          </Card.Content>
          
          <Card.Actions style={{ justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('PatientPrescriptions', { profile })}
              style={{ backgroundColor: '#1976d2', flex: 1 }}
              icon="file-document"
            >
              {t.dashViewPrescriptions}
            </Button>
          </Card.Actions>
        </Card>

        <Card style={{
          width: '100%',
          marginBottom: 15,
          borderRadius: 16,
          backgroundColor: '#fff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Card.Content style={{ paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ 
                  fontWeight: 'bold', 
                  color: '#ff9800', 
                  marginBottom: 8
                }}>
                  📬 Doctor Requests
                </Text>
                <Text style={{
                  color: '#333',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 4
                }}>
                  {pendingRequests.length === 0 ? 'No Pending Requests' : `${pendingRequests.length} Pending Request${pendingRequests.length !== 1 ? 's' : ''}`}
                </Text>
                <Text style={{
                  color: '#666',
                  fontSize: 14
                }}>
                  {pendingRequests.length === 0 ? t.dashNoRequests : t.dashYouHaveRequests}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: pendingRequests.length > 0 ? '#fff3e0' : '#f5f5f5',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24 }}>
                    {pendingRequests.length > 0 ? '🔔' : '📭'}
                  </Text>
                </View>
                <Text style={{ 
                  color: pendingRequests.length > 0 ? '#ff9800' : '#999', 
                  fontSize: 12, 
                  fontWeight: 'bold' 
                }}>
                  {pendingRequests.length > 0 ? 'Action Required' : 'All Clear'}
                </Text>
              </View>
            </View>
            
            {pendingRequests.length > 0 && (
              <View>
                {pendingRequests.map((request) => (
                  <View key={request.id} style={{ 
                    marginTop: 10, 
                    padding: 15, 
                    backgroundColor: '#fff3e0', 
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: '#ff9800'
                  }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333', marginBottom: 8 }}>
                      👨‍⚕️ Dr. {request.doctor.name}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                      <Button
                        mode="contained"
                        onPress={() => handleApprove(request)}
                        loading={loading}
                        disabled={loading}
                        style={{ flex: 1, marginRight: 5, backgroundColor: '#4caf50' }}
                        icon="check"
                      >
                        {t.commonApprove}
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleReject(request)}
                        disabled={loading}
                        style={{ flex: 1, marginLeft: 5, borderColor: '#f44336' }}
                        icon="close"
                        textColor="#f44336"
                      >
                        {t.commonReject}
                      </Button>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={{
          width: '100%',
          marginBottom: 15,
          borderRadius: 16,
          backgroundColor: '#fff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Card.Content style={{ paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ 
                  fontWeight: 'bold', 
                  color: '#9c27b0', 
                  marginBottom: 8
                }}>
                  🧘 Dosha Quiz
                </Text>
                <Text style={{
                  color: '#333',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 4
                }}>
                  {t.dashPrakritiTitle}
                </Text>
                <Text style={{
                  color: '#666',
                  fontSize: 14
                }}>
                  {t.dashPrakritiSubtitle}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#f3e5f5',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24 }}>🧘</Text>
                </View>
                <Text style={{ 
                  color: '#9c27b0', 
                  fontSize: 12, 
                  fontWeight: 'bold' 
                }}>
                  Start Test
                </Text>
              </View>
            </View>
          </Card.Content>
          
          <Card.Actions style={{ justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('PrakritiGuesser')}
              style={{ backgroundColor: '#9c27b0', flex: 1 }}
              icon="play"
            >
              {t.commonStart}
            </Button>
          </Card.Actions>
        </Card>
        
        <Card style={{
          width: '100%',
          marginBottom: 15,
          borderRadius: 16,
          backgroundColor: '#fff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Card.Content style={{ paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ 
                  fontWeight: 'bold', 
                  color: '#00796b', 
                  marginBottom: 8
                }}>
                  🏥 Nearby Dieticians
                </Text>
                <Text style={{
                  color: '#333',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 4
                }}>
                  {t.dashNearbyReco}
                </Text>
                <Text style={{
                  color: '#666',
                  fontSize: 14
                }}>
                  {t.dashNearbyDesc}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#e0f2f1',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24 }}>🗺️</Text>
                </View>
                <Text style={{ 
                  color: '#00796b', 
                  fontSize: 12, 
                  fontWeight: 'bold' 
                }}>
                  Find Now
                </Text>
              </View>
            </View>
          </Card.Content>
          
          <Card.Actions style={{ justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('NearbyDieticiansScreen')}
              style={{ backgroundColor: '#00796b', flex: 1 }}
              icon="map-marker"
            >
              {t.commonShow}
            </Button>
          </Card.Actions>
        </Card>
        
        {/* Calorie Counter Integration */}
        <Card style={{
          width: '100%',
          marginBottom: 15,
          borderRadius: 16,
          backgroundColor: '#fff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Card.Content style={{ paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ 
                  fontWeight: 'bold', 
                  color: '#f57c00', 
                  marginBottom: 8
                }}>
                  🍎 Calorie Counter
                </Text>
                <Text style={{
                  color: '#333',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 4
                }}>
                  {t.dashCalorieTitle}
                </Text>
                <Text style={{
                  color: '#666',
                  fontSize: 14
                }}>
                  {t.dashCalorieDesc}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#fff3e0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24 }}>⚖️</Text>
                </View>
                <Text style={{ 
                  color: '#f57c00', 
                  fontSize: 12, 
                  fontWeight: 'bold' 
                }}>
                  Track Now
                </Text>
              </View>
            </View>
          </Card.Content>
          
          <Card.Actions style={{ justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('CalorieCounter')}
              style={{ backgroundColor: '#f57c00', flex: 1 }}
              icon="calculator"
            >
              {t.commonOpen}
            </Button>
          </Card.Actions>
        </Card>

        <Card style={{
          width: '100%',
          marginBottom: 15,
          borderRadius: 16,
          backgroundColor: '#fff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
          <Card.Content style={{ paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ 
                  fontWeight: 'bold', 
                  color: '#388e3c', 
                  marginBottom: 8
                }}>
                  🌿 CureVeda Remedies
                </Text>
                <Text style={{
                  color: '#333',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 4
                }}>
                  {t.dashRemediesTitle}
                </Text>
                <Text style={{
                  color: '#666',
                  fontSize: 14
                }}>
                  {t.dashRemediesDesc}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#e8f5e8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24 }}>🌱</Text>
                </View>
                <Text style={{ 
                  color: '#388e3c', 
                  fontSize: 12, 
                  fontWeight: 'bold' 
                }}>
                  Explore
                </Text>
              </View>
            </View>
          </Card.Content>
          
          <Card.Actions style={{ justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('AyurvedicRemedies')}
              style={{ backgroundColor: '#388e3c', flex: 1 }}
              icon="leaf"
            >
              {t.commonShow}
            </Button>
          </Card.Actions>
        </Card>

        {/* Main Appointments Card - Clickable */}
        <Card 
          style={{
            width: '100%',
            marginBottom: 15,
            borderRadius: 16,
            backgroundColor: '#fff',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate('PatientAppointmentsView', { profile })}
        >
          <Card.Content style={{ paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={{ 
                  fontWeight: 'bold', 
                  color: '#1976d2', 
                  marginBottom: 8
                }}>
                  🩺 Appointments
                </Text>
                
                {loadingAppointments ? (
                  <Text style={{ color: '#666', fontSize: 16 }}>
                    Loading appointments...
                  </Text>
                ) : (
                  <View>
                    <Text style={{ 
                      color: '#333', 
                      fontSize: 18, 
                      fontWeight: 'bold',
                      marginBottom: 4
                    }}>
                      {scheduledAppointments.length} Upcoming
                    </Text>
                    <Text style={{ color: '#666', fontSize: 14 }}>
                      {scheduledAppointments.length === 0 
                        ? 'No appointments scheduled' 
                        : `Next: ${scheduledAppointments.length > 0 ? 
                            new Date(scheduledAppointments[0]?.final_time || scheduledAppointments[0]?.requested_time)
                              .toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })
                            : 'N/A'}`
                      }
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#e3f2fd',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 24 }}>📅</Text>
                </View>
                <Text style={{ 
                  color: '#1976d2', 
                  fontSize: 12, 
                  fontWeight: 'bold' 
                }}>
                  Tap to view
                </Text>
              </View>
            </View>
          </Card.Content>
          
          <Card.Actions style={{ justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('PatientAppointment', { patientEmail: profile?.email })}
              style={{ borderColor: '#1976d2', marginRight: 8 }}
              icon="calendar-plus"
            >
              Request New
            </Button>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('PatientAppointmentsView', { profile })}
              style={{ backgroundColor: '#1976d2' }}
              icon="eye"
            >
              View All
            </Button>
          </Card.Actions>
        </Card>
          </ScrollView>

          <PatientConsentModal
            visible={consentModalVisible}
            onClose={() => {
              setConsentModalVisible(false);
              setPendingApprovalRequest(null);
            }}
            patientProfile={profile}
            assignedDoctor={pendingApprovalRequest ? {
              email: pendingApprovalRequest.doctor_email,
              name: pendingApprovalRequest.doctor.name
            } : null}
            onConsentStatusChange={handleConsentStatusChange}
          />
        </>
      )}
    </>
  );
}