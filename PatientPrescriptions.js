import React, { useEffect, useState } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { Card, Text, Divider, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function PatientPrescriptions({ route }) {
  // Debug print
  console.log('PatientPrescriptions route.params:', route?.params);

  // Get patient email from navigation params or profile context
  const patientProfile = route?.params?.profile || {};
  const patientEmail = patientProfile.email || '';
  const patientName = patientProfile.name || 'Patient';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchPrescriptions = async () => {
    if (!patientEmail) {
      setError('No patient email provided');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching prescriptions for patient email:', patientEmail);
      const { data, error: fetchError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_email', patientEmail)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching prescriptions:', fetchError);
        setError(`Failed to fetch prescriptions: ${fetchError.message}`);
        setPrescriptions([]);
      } else {
        console.log('Fetched prescriptions:', data);
        setError('');
        setPrescriptions(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`Unexpected error: ${err.message}`);
      setPrescriptions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [patientEmail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrescriptions();
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const renderMedicines = (medicines) => {
    console.log('Rendering medicines:', medicines, 'Type:', typeof medicines);
    
    if (!medicines) {
      return <Text style={{ marginLeft: 8, fontStyle: 'italic', color: '#666' }}>No medicines prescribed</Text>;
    }

    // If medicines is already an array
    if (Array.isArray(medicines)) {
      return medicines.length > 0 ? medicines.map((med, i) => (
        <View key={i} style={{ marginLeft: 8, marginBottom: 4 }}>
          <Text style={{ fontWeight: '500' }}>• {med.name || 'Unknown medicine'}</Text>
          <Text style={{ color: '#666', fontSize: 13, marginLeft: 12 }}>
            {med.dosage || 'No dosage'} - {med.frequency || 'No frequency'}
          </Text>
        </View>
      )) : <Text style={{ marginLeft: 8, fontStyle: 'italic', color: '#666' }}>No medicines listed</Text>;
    }

    // If medicines is a string, try to parse it
    if (typeof medicines === 'string') {
      try {
        const parsed = JSON.parse(medicines);
        return renderMedicines(parsed); // Recursive call with parsed data
      } catch (e) {
        // If parsing fails, show as plain text
        return <Text style={{ marginLeft: 8 }}>{medicines}</Text>;
      }
    }

    // If it's a single medicine object
    if (typeof medicines === 'object' && medicines.name) {
      return (
        <View style={{ marginLeft: 8, marginBottom: 4 }}>
          <Text style={{ fontWeight: '500' }}>• {medicines.name}</Text>
          <Text style={{ color: '#666', fontSize: 13, marginLeft: 12 }}>
            {medicines.dosage || 'No dosage'} - {medicines.frequency || 'No frequency'}
          </Text>
        </View>
      );
    }

    return <Text style={{ marginLeft: 8, fontStyle: 'italic', color: '#666' }}>Unable to display medicines</Text>;
  };

  const parsePrescriptionData = (prescriptionData) => {
    if (!prescriptionData) return null;
    
    if (typeof prescriptionData === 'string') {
      try {
        return JSON.parse(prescriptionData);
      } catch (e) {
        return null;
      }
    }
    
    return prescriptionData;
  };

  const renderAyurvedicAssessment = (prescData) => {
    if (!prescData) return null;

    return (
      <>
        <Divider style={{ marginVertical: 12 }} />
        <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#1976d2', fontSize: 16 }}>
          Ayurvedic Assessment
        </Text>

        {/* Patient Details */}
        {(prescData.age || prescData.weight || prescData.phoneNo) && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#2e7d32' }}>Patient Details:</Text>
            <View style={{ marginLeft: 8, marginBottom: 8 }}>
              {prescData.age && <Text style={{ color: '#666', marginBottom: 2 }}>Age: {prescData.age}</Text>}
              {prescData.weight && <Text style={{ color: '#666', marginBottom: 2 }}>Weight: {prescData.weight} kg</Text>}
              {prescData.phoneNo && <Text style={{ color: '#666', marginBottom: 2 }}>Phone: {prescData.phoneNo}</Text>}
              {prescData.date && <Text style={{ color: '#666', marginBottom: 2 }}>Assessment Date: {prescData.date}</Text>}
            </View>
          </>
        )}

        {/* Naadi (Pulse) */}
        {prescData.naadi && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#2e7d32' }}>Naadi (Pulse):</Text>
            <Text style={{ marginLeft: 8, color: '#666', marginBottom: 8 }}>{prescData.naadi}</Text>
          </>
        )}

        {/* Sapta Dhatu (Seven Tissues) */}
        {(prescData.rasa || prescData.rakta || prescData.mansa || prescData.meda || prescData.asthi || prescData.majja || prescData.shukra) && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#2e7d32' }}>Sapta Dhatu (Seven Tissues):</Text>
            <View style={{ marginLeft: 8, marginBottom: 8 }}>
              {prescData.rasa && <Text style={{ color: '#666', marginBottom: 2 }}>Rasa: {prescData.rasa}</Text>}
              {prescData.rakta && <Text style={{ color: '#666', marginBottom: 2 }}>Rakta: {prescData.rakta}</Text>}
              {prescData.mansa && <Text style={{ color: '#666', marginBottom: 2 }}>Mansa: {prescData.mansa}</Text>}
              {prescData.meda && <Text style={{ color: '#666', marginBottom: 2 }}>Meda: {prescData.meda}</Text>}
              {prescData.asthi && <Text style={{ color: '#666', marginBottom: 2 }}>Asthi: {prescData.asthi}</Text>}
              {prescData.majja && <Text style={{ color: '#666', marginBottom: 2 }}>Majja: {prescData.majja}</Text>}
              {prescData.shukra && <Text style={{ color: '#666', marginBottom: 2 }}>Shukra: {prescData.shukra}</Text>}
            </View>
          </>
        )}

        {/* Dosha Assessment */}
        {(prescData.vata || prescData.pitta || prescData.kapha) && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#2e7d32' }}>Dosha Assessment:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 8, marginBottom: 8 }}>
              {prescData.vata && (
                <Chip style={{ margin: 2, backgroundColor: '#e8f5e8' }} textStyle={{ color: '#2e7d32' }}>
                  Vata: {prescData.vata}
                </Chip>
              )}
              {prescData.pitta && (
                <Chip style={{ margin: 2, backgroundColor: '#fff3e0' }} textStyle={{ color: '#f57c00' }}>
                  Pitta: {prescData.pitta}
                </Chip>
              )}
              {prescData.kapha && (
                <Chip style={{ margin: 2, backgroundColor: '#e3f2fd' }} textStyle={{ color: '#1976d2' }}>
                  Kapha: {prescData.kapha}
                </Chip>
              )}
            </View>
          </>
        )}

        {/* Mala (Waste Products) */}
        {(prescData.stool || prescData.urine || prescData.sweat) && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#2e7d32' }}>Mala (Waste Products):</Text>
            <View style={{ marginLeft: 8, marginBottom: 8 }}>
              {prescData.stool && <Text style={{ color: '#666', marginBottom: 2 }}>Stool: {prescData.stool}</Text>}
              {prescData.urine && <Text style={{ color: '#666', marginBottom: 2 }}>Urine: {prescData.urine}</Text>}
              {prescData.sweat && <Text style={{ color: '#666', marginBottom: 2 }}>Sweat: {prescData.sweat}</Text>}
            </View>
          </>
        )}

        {/* Srotas (Channels) */}
        {prescData.srotas && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#2e7d32' }}>Srotas (Channels):</Text>
            <Text style={{ marginLeft: 8, color: '#666', marginBottom: 8, lineHeight: 20 }}>{prescData.srotas}</Text>
          </>
        )}

        {/* Nidana (Diagnosis) */}
        {prescData.nidana && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#2e7d32' }}>Nidana (Diagnosis):</Text>
            <Text style={{ marginLeft: 8, color: '#666', marginBottom: 8, lineHeight: 20 }}>{prescData.nidana}</Text>
          </>
        )}

        {/* Pathyapathya (Dietary & Lifestyle Recommendations) */}
        {prescData.pathyapathya && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#2e7d32' }}>Pathyapathya (Dietary & Lifestyle):</Text>
            <Text style={{ marginLeft: 8, color: '#666', marginBottom: 8, lineHeight: 20 }}>{prescData.pathyapathya}</Text>
          </>
        )}

        {/* Chikitsa (Treatment) */}
        {prescData.chikitsa && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#2e7d32' }}>Chikitsa (Treatment Plan):</Text>
            <Text style={{ marginLeft: 8, color: '#666', marginBottom: 8, lineHeight: 20 }}>{prescData.chikitsa}</Text>
          </>
        )}
      </>
    );
  };

  if (!patientEmail) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa', padding: 20 }}>
        <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 8 }}>
          No patient email found!
        </Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>
          Please make sure you're logged in properly.
        </Text>
        <Text style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
          Debug: {JSON.stringify(route?.params)}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa' }}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading prescriptions...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={{ padding: 16, backgroundColor: '#f3f6fa', flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4caf50']} />}
    >
      {/* Header Card */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Card.Content>
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#2e7d32', marginBottom: 4 }}>
            My Ayurvedic Prescriptions
          </Text>
          <Text style={{ color: '#666', fontSize: 16 }}>Patient: {patientName}</Text>
          <Text style={{ color: '#666', fontSize: 14 }}>Email: {patientEmail}</Text>
        </Card.Content>
      </Card>

      {/* Error Card */}
      {error ? (
        <Card style={{ marginBottom: 16, borderRadius: 12, backgroundColor: '#ffebee' }}>
          <Card.Content>
            <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Error</Text>
            <Text style={{ color: '#d32f2f', marginBottom: 12 }}>{error}</Text>
            <Button mode="outlined" onPress={fetchPrescriptions} textColor="#d32f2f">
              Retry
            </Button>
          </Card.Content>
        </Card>
      ) : null}

      {/* Prescriptions */}
      {prescriptions.length === 0 ? (
        <Card style={{ borderRadius: 12 }}>
          <Card.Content style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 8 }}>
              No prescriptions found
            </Text>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 }}>
              Your doctor hasn't sent any prescriptions yet.
            </Text>
            <Button mode="contained" onPress={onRefresh} style={{ backgroundColor: '#4caf50' }}>
              Refresh
            </Button>
          </Card.Content>
        </Card>
      ) : (
        prescriptions.map((presc, idx) => {
          const prescData = parsePrescriptionData(presc.prescription_data);
          
          return (
            <Card key={presc.id || idx} style={{ marginBottom: 16, borderRadius: 12, elevation: 3 }}>
              <Card.Content>
                {/* Header with Doctor and Date */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#2e7d32' }}>
                      Dr. {presc.doctor_name || 'Unknown Doctor'}
                    </Text>
                    <Text style={{ color: '#666', fontSize: 14, marginTop: 2 }}>
                      Ayurvedic Consultation
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>
                      {formatDate(presc.created_at)}
                    </Text>
                  </View>
                </View>
                
                <Divider style={{ marginVertical: 8, backgroundColor: '#e0e0e0' }} />
                
                {/* Medicines Section */}
                <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#1976d2', fontSize: 16 }}>
                  Prescribed Medicines:
                </Text>
                {renderMedicines(presc.medicines)}
                
                {/* Additional Advice */}
                {presc.advice && (
                  <>
                    <Divider style={{ marginVertical: 12 }} />
                    <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#1976d2', fontSize: 16 }}>
                      Additional Instructions:
                    </Text>
                    <Text style={{ marginLeft: 8, color: '#666', lineHeight: 20, fontStyle: 'italic' }}>
                      {presc.advice}
                    </Text>
                  </>
                )}

                {/* Ayurvedic Assessment Details */}
                {renderAyurvedicAssessment(prescData)}

                {/* Footer */}
                <Divider style={{ marginVertical: 12 }} />
                <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', fontStyle: 'italic' }}>
                  Prescription ID: {presc.id} • Keep this for your records
                </Text>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}
