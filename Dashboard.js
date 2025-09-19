import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from './hooks/useTranslation';

export default function DashboardScreen({ navigation, route }) {
  const { t } = useTranslation();
  const profile = route.params?.profile;
  const [pendingRequests, setPendingRequests] = React.useState([]);
  const [assignedDoctor, setAssignedDoctor] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

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

  React.useEffect(() => {
    fetchPendingRequests();
    fetchAssignedDoctor();
  }, [fetchPendingRequests, fetchAssignedDoctor, profile]);

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.email, fetchPendingRequests]);

  // Fix: handleApprove now accepts 'request' as an argument
  const handleApprove = async (request) => {
    if (!request) return;
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('patients')
        .insert([
          {
            name: profile.name,
            email: profile.email,
            doctor_email: request.doctor_email, // Use 'request' instead of 'selectedRequest'
            age: profile.age,
          },
        ]);

      if (insertError) {
        throw new Error('Failed to add you to the doctor\'s patient list. Please try again.');
      }

      const { error: updateError } = await supabase
        .from('patient_requests')
        // Fix: Use 'accepted' to match your workflow, or change workflow to 'approved'
        .update({ status: 'accepted' })
        .eq('id', request.id);

      if (updateError) {
        throw new Error('Failed to update request status. Please try again.');
      }

      await fetchPendingRequests();
      await fetchAssignedDoctor();
      alert('You have approved the doctor\'s request and are now added to their patient list.');
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: '#f3f6fa' }}>
        <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32' }}>
          {profile?.name ? t.dashWelcomeName.replace('{name}', profile.name) : t.dashWelcome}
        </Text>
        <Button mode="outlined" onPress={handleLogout} style={{ alignSelf: 'flex-end', marginBottom: 10 }}>{t.commonLogout}</Button>
        
        <Card style={{
          width: '100%',
          marginBottom: 15,
          borderRadius: 16,
          backgroundColor: '#e8f5e8',
          borderWidth: 2,
          borderColor: '#4caf50'
        }}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#2e7d32',
              textAlign: 'center'
            }}>
              {assignedDoctor ? `🎉 Your Doctor: Dr. ${assignedDoctor.name}` : 'No doctor assigned yet'}
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#388e3c',
              textAlign: 'center',
              marginTop: 5
            }}>
              {assignedDoctor ? `You are now under Dr. ${assignedDoctor.name}'s care` : 'Approve a request to connect with a doctor.'}
            </Text>
          </Card.Content>
        </Card>
        {/* Add Request Appointment button here */}
        <Button
          mode="contained"
          style={{ marginBottom: 15, backgroundColor: '#2e7d32' }}
          onPress={() => navigation.navigate('PatientAppointment', { patientEmail: profile?.email })}
        >
          Request Appointment
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('PatientPrescriptions', { profile })}
          style={{ marginBottom: 10, backgroundColor: '#1976d2' }}
        >
          {t.dashViewPrescriptions}
        </Button>

        <Card style={{ width: '100%', marginBottom: 15, borderRadius: 16 }}>
          <Card.Title title={t.dashDoctorRequests} />
          <Card.Content>
            {pendingRequests.length === 0 ? (
              <Text>{t.dashNoRequests}</Text>
            ) : (
              <>
                <Text>{t.dashYouHaveRequests}</Text>
                {pendingRequests.map((request) => (
                  <View key={request.id} style={{ marginTop: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
                    <Text style={{ fontWeight: 'bold' }}>Dr. {request.doctor.name}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                      <Button
                        mode="contained"
                        // Fix: Pass the request directly to the handler
                        onPress={() => handleApprove(request)}
                        loading={loading}
                        disabled={loading}
                        style={{ flex: 1, marginRight: 5 }}
                      >
                        {t.commonApprove}
                      </Button>
                      <Button
                        mode="outlined"
                        // Fix: Pass the request directly to the handler
                        onPress={() => handleReject(request)}
                        disabled={loading}
                        style={{ flex: 1, marginLeft: 5 }}
                      >
                        {t.commonReject}
                      </Button>
                    </View>
                  </View>
                ))}
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={{ width: '100%', marginBottom: 15, borderRadius: 16 }}>
          <Card.Title title={t.dashPrakritiTitle} />
          <Card.Content>
            <Text>{t.dashPrakritiSubtitle}</Text>
            </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('PrakritiGuesser')}
            >
              {t.commonStart}
            </Button>
          </Card.Actions>
        </Card>
        <Card style={{ width: '100%', marginBottom: 15, borderRadius: 16 }}>
          <Card.Title title={t.dashNearbyReco} />
          <Card.Content>
            <Text>{t.dashNearbyDesc}</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => navigation.navigate('NearbyDieticiansScreen')}>{t.commonShow}</Button>
          </Card.Actions>
        </Card>
        
        {/* Calorie Counter Integration */}
        <Card style={{ width: '100%', marginBottom: 15, borderRadius: 16 }}>
          <Card.Title title={t.dashCalorieTitle} />
          <Card.Content>
            <Text>{t.dashCalorieDesc}</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => navigation.navigate('CalorieCounter')}>
              {t.commonOpen}
            </Button>
          </Card.Actions>
        </Card>

        <Card style={{ width: '100%', marginBottom: 15, borderRadius: 16 }}>
          <Card.Title title={t.dashRemediesTitle} />
          <Card.Content>
              <Text>{t.dashRemediesDesc}</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => navigation.navigate('AyurvedicRemedies')}>{t.commonShow}</Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </>
  );
}