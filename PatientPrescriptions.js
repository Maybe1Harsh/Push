import React, { useEffect, useState } from 'react';
import { ScrollView, View, RefreshControl, StyleSheet } from 'react-native';
import { Card, Text, Divider, Button, ActivityIndicator, Chip, SegmentedButtons, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './supabaseClient';

export default function PatientPrescriptions({ route, navigation }) {
  // Debug print
  console.log('PatientPrescriptions route.params:', route?.params);

  // Get patient email from navigation params or profile context
  const patientProfile = route?.params?.profile || {};
  const patientEmail = patientProfile.email || '';
  const patientName = patientProfile.name || 'Patient';

  const [prescriptions, setPrescriptions] = useState([]);
  const [panchkarmaPrescriptions, setPanchkarmaPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('medicines');
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

  const fetchPanchkarmaPrescriptions = async () => {
    if (!patientEmail) {
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('panchkarma_prescriptions')
        .select('*')
        .eq('patient_email', patientEmail)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching Panchkarma prescriptions:', fetchError);
        setPanchkarmaPrescriptions([]);
      } else {
        setPanchkarmaPrescriptions(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching Panchkarma:', err);
      setPanchkarmaPrescriptions([]);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchPanchkarmaPrescriptions();
  }, [patientEmail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrescriptions();
    fetchPanchkarmaPrescriptions();
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

  const renderPanchkarmaTreatments = (treatments) => {
    if (!treatments) return null;
    
    let treatmentArray;
    if (typeof treatments === 'string') {
      try {
        treatmentArray = JSON.parse(treatments);
      } catch (e) {
        return <Text style={{ marginLeft: 8, color: '#666' }}>Unable to parse treatments</Text>;
      }
    } else {
      treatmentArray = treatments;
    }

    if (!Array.isArray(treatmentArray)) return null;

    return treatmentArray.map((treatment, index) => (
      <Card key={index} style={styles.treatmentCard}>
        <Card.Content style={{ paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#2e7d32' }}>
              {treatment.name}
            </Text>
            <Chip size="small" style={styles.categoryChip}>
              {treatment.category}
            </Chip>
          </View>
          <Text style={{ color: '#666', marginBottom: 4, lineHeight: 18 }}>
            {treatment.description}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ color: '#1976d2', fontWeight: '500' }}>
              ⏱️ Duration: {treatment.duration}
            </Text>
          </View>
          {treatment.benefits && (
            <Text style={{ color: '#388e3c', marginTop: 4, fontSize: 12 }}>
              Benefits: {treatment.benefits}
            </Text>
          )}
          {treatment.precautions && (
            <Text style={{ color: '#f57c00', marginTop: 4, fontSize: 12 }}>
              ⚠️ Precautions: {treatment.precautions}
            </Text>
          )}
        </Card.Content>
      </Card>
    ));
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
      <LinearGradient
        colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
        style={[styles.gradient, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}
      >
        <Text style={[styles.errorTitle, { fontSize: 18, textAlign: 'center', marginBottom: 8 }]}>
          No patient email found!
        </Text>
        <Text style={[styles.bodyText, { textAlign: 'center' }]}>
          Please make sure you're logged in properly.
        </Text>
        <Text style={[styles.captionText, { marginTop: 8, textAlign: 'center' }]}>
          Debug: {JSON.stringify(route?.params)}
        </Text>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <LinearGradient
        colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
        style={[styles.gradient, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={[styles.bodyText, { marginTop: 16, textAlign: 'center' }]}>Loading prescriptions...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
      style={styles.gradient}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4caf50']} />}
      >
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <IconButton
          icon="arrow-left"
          iconColor="#2e7d32"
          size={24}
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.backButtonText}>Back</Text>
      </View>

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🩺</Text>
        </View>
        <Text variant="headlineLarge" style={styles.title}>
          My Prescriptions
        </Text>
        <Text style={styles.subtitle}>
          Patient: {patientName}
        </Text>
        <Text style={styles.emailText}>
          {patientEmail}
        </Text>
      </View>

      {/* Tab Navigation */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          {
            value: 'medicines',
            label: 'Medicines',
            icon: 'pill',
          },
          {
            value: 'panchkarma',
            label: 'Panchkarma',
            icon: 'leaf',
          },
        ]}
        style={styles.tabContainer}
        theme={{
          colors: {
            primary: '#000000',
            onPrimary: '#ffffff',
            secondary: '#000000',
            onSecondary: '#ffffff',
            surface: '#ffffff',
            onSurface: '#000000',
            outline: '#000000',
          }
        }}
      />

      {/* Error Card */}
      {error ? (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="outlined" onPress={fetchPrescriptions} style={styles.errorButton} textColor="#d32f2f">
              Retry
            </Button>
          </Card.Content>
        </Card>
      ) : null}

      {/* Prescriptions - Medicines Tab */}
      {activeTab === 'medicines' && (
        <>
          {prescriptions.length === 0 ? (
            <Card style={styles.card}>
              <Card.Content style={styles.emptyCardContent}>
                <Text style={styles.emptyTitle}>
                  No medicine prescriptions found
                </Text>
                <Text style={styles.emptySubtitle}>
                  Your doctor hasn't sent any medicine prescriptions yet.
                </Text>
                <Button mode="contained" onPress={onRefresh} style={styles.primaryButton}>
                  Refresh
                </Button>
              </Card.Content>
            </Card>
          ) : (
            prescriptions.map((presc, idx) => {
              const prescData = parsePrescriptionData(presc.prescription_data);
              
              return (
                <Card key={presc.id || idx} style={styles.card}>
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
        </>
      )}

      {/* Panchkarma Tab Content */}
      {activeTab === 'panchkarma' && (
        <>
          {panchkarmaPrescriptions.length === 0 ? (
            <Card style={styles.card}>
              <Card.Content style={styles.emptyCardContent}>
                <Text style={styles.emptyTitle}>
                  No Panchkarma prescriptions found
                </Text>
                <Text style={styles.emptySubtitle}>
                  Your doctor hasn't prescribed any Panchkarma treatments yet.
                </Text>
                <Button mode="contained" onPress={onRefresh} style={styles.primaryButton}>
                  Refresh
                </Button>
              </Card.Content>
            </Card>
          ) : (
            panchkarmaPrescriptions.map((presc, idx) => (
              <Card key={presc.id || idx} style={styles.card}>
                <Card.Content>
                  {/* Header with Doctor and Date */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View>
                      <Text style={styles.prescriptionTitle}>
                        Dr. {presc.doctor_name || 'Unknown Doctor'}
                      </Text>
                      <Text style={styles.bodyText}>
                        🌿 Panchkarma Treatment Plan
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.captionText}>
                        {formatDate(presc.created_at)}
                      </Text>
                      <Chip size="small" style={styles.statusChip}>
                        {presc.status || 'Prescribed'}
                      </Chip>
                    </View>
                  </View>
                  
                  <Divider style={{ marginVertical: 8, backgroundColor: '#e0e0e0' }} />
                  
                  {/* Treatments Section */}
                  <Text style={styles.sectionTitle}>
                    🌿 Prescribed Treatments:
                  </Text>
                  {renderPanchkarmaTreatments(presc.treatments)}
                  
                  {/* Additional Notes */}
                  {presc.notes && (
                    <>
                      <Divider style={{ marginVertical: 12 }} />
                      <Text style={styles.sectionTitle}>
                        Doctor's Notes:
                      </Text>
                      <Text style={[styles.bodyText, { marginLeft: 8, fontStyle: 'italic' }]}>
                        {presc.notes}
                      </Text>
                    </>
                  )}

                  {/* Footer */}
                  <Divider style={{ marginVertical: 12 }} />
                  <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', fontStyle: 'italic' }}>
                    Panchkarma Prescription ID: {presc.id} • Follow treatments as prescribed
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
        </>
      )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 35,
  },
  title: {
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  tabContainer: {
    marginBottom: 16,
    marginHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  errorCard: {
    marginBottom: 16,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 235, 238, 0.95)',
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  errorTitle: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 12,
  },
  errorButton: {
    borderColor: '#d32f2f',
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#4caf50',
    borderRadius: 25,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Text styles for better consistency
  bodyText: {
    color: '#424242',
    fontSize: 14,
    lineHeight: 20,
  },
  captionText: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  prescriptionTitle: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 18,
  },
  doctorName: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4caf50',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    margin: 0,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginLeft: 4,
  },
  treatmentCard: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  categoryChip: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
});
