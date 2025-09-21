import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Text, Card, Button, Divider, DataTable, Modal, Portal, TextInput, List, Chip } from 'react-native-paper';
import { supabase } from './supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

// Comprehensive Panchkarma treatments data
const PANCHKARMA_TREATMENTS = [
  {
    id: 1,
    name: 'Abhyanga',
    category: 'Snehana',
    description: 'Full body massage with medicated oils',
    duration: '45-60 minutes',
    benefits: 'Improves circulation, reduces stress, nourishes skin',
    precautions: 'Avoid in fever, acute illness',
    procedure: 'Warm oil massage from head to toe with specific strokes'
  },
  {
    id: 2,
    name: 'Shirodhara',
    category: 'Snehana',
    description: 'Continuous pouring of medicated oil on forehead',
    duration: '30-45 minutes',
    benefits: 'Calms nervous system, treats insomnia, reduces anxiety',
    precautions: 'Avoid in fever, pregnant women',
    procedure: 'Steady stream of warm oil poured on forehead'
  },
  {
    id: 3,
    name: 'Panchakarma Detox',
    category: 'Shodhana',
    description: 'Complete five-fold detoxification therapy',
    duration: '7-21 days',
    benefits: 'Deep detoxification, rejuvenation, disease prevention',
    precautions: 'Requires medical supervision',
    procedure: 'Sequential therapies including Vamana, Virechana, Basti, etc.'
  },
  {
    id: 4,
    name: 'Swedana',
    category: 'Swedana',
    description: 'Herbal steam therapy',
    duration: '15-20 minutes',
    benefits: 'Opens pores, eliminates toxins, relieves stiffness',
    precautions: 'Avoid in heart conditions, pregnancy',
    procedure: 'Exposure to herbal steam in specialized chamber'
  },
  {
    id: 5,
    name: 'Nasya',
    category: 'Shodhana',
    description: 'Nasal administration of medicated oils/herbs',
    duration: '15-30 minutes',
    benefits: 'Treats sinusitis, headache, mental clarity',
    precautions: 'Avoid in acute cold, fever',
    procedure: 'Installation of medicated substances through nasal passages'
  },
  {
    id: 6,
    name: 'Virechana',
    category: 'Shodhana',
    description: 'Therapeutic purgation therapy',
    duration: '1 day procedure',
    benefits: 'Eliminates pitta toxins, treats skin diseases',
    precautions: 'Requires proper preparation and supervision',
    procedure: 'Controlled elimination through medicated purgatives'
  },
  {
    id: 7,
    name: 'Basti',
    category: 'Shodhana',
    description: 'Medicated enema therapy',
    duration: '30-45 minutes',
    benefits: 'Treats vata disorders, joint pain, neurological issues',
    precautions: 'Avoid in certain digestive conditions',
    procedure: 'Administration of medicated substances through rectum'
  },
  {
    id: 8,
    name: 'Karna Purana',
    category: 'Kriya',
    description: 'Ear therapy with medicated oils',
    duration: '15-20 minutes',
    benefits: 'Treats ear problems, improves hearing',
    precautions: 'Avoid in ear infections',
    procedure: 'Filling ears with warm medicated oil'
  },
  {
    id: 9,
    name: 'Akshi Tarpana',
    category: 'Kriya',
    description: 'Eye therapy with medicated ghee',
    duration: '20-30 minutes',
    benefits: 'Improves vision, treats eye disorders',
    precautions: 'Requires expert supervision',
    procedure: 'Pooling medicated ghee around eyes'
  },
  {
    id: 10,
    name: 'Udvartana',
    category: 'Rukshana',
    description: 'Herbal powder massage for weight reduction',
    duration: '30-45 minutes',
    benefits: 'Reduces obesity, improves circulation, exfoliates skin',
    precautions: 'Avoid in sensitive skin',
    procedure: 'Upward massage with herbal powders'
  }
];

export default function PanchkarmaScreen({ route, navigation }) {
  const doctorEmail = route.params?.profile?.email || "";
  const doctorName = route.params?.profile?.name || "Doctor";
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sentPrescriptions, setSentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New search states for modal
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [treatmentSearchQuery, setTreatmentSearchQuery] = useState('');

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
        setPatients(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching patients:', err);
    }
  }, [doctorEmail]);

  // Fetch sent Panchkarma prescriptions
  const fetchPanchkarmaPrescriptions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("panchkarma_prescriptions")
        .select("*")
        .eq("doctor_email", doctorEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching panchkarma prescriptions:', error);
        setSentPrescriptions([]);
      } else {
        setSentPrescriptions(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching prescriptions:', err);
      setSentPrescriptions([]);
    }
  }, [doctorEmail]);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
      fetchPanchkarmaPrescriptions();
    }, [fetchPatients, fetchPanchkarmaPrescriptions])
  );

  const categories = ['All', 'Snehana', 'Shodhana', 'Swedana', 'Kriya', 'Rukshana'];

  const filteredTreatments = PANCHKARMA_TREATMENTS.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         treatment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || treatment.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter patients for modal search
  const filteredPatients = patients.filter(patient => {
    return patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
           patient.email.toLowerCase().includes(patientSearchQuery.toLowerCase());
  });

  // Filter treatments for modal search
  const filteredModalTreatments = PANCHKARMA_TREATMENTS.filter(treatment => {
    return treatment.name.toLowerCase().includes(treatmentSearchQuery.toLowerCase()) ||
           treatment.description.toLowerCase().includes(treatmentSearchQuery.toLowerCase()) ||
           treatment.category.toLowerCase().includes(treatmentSearchQuery.toLowerCase());
  });

  const toggleTreatmentSelection = (treatment) => {
    setSelectedTreatments(prev => {
      const isSelected = prev.find(t => t.id === treatment.id);
      if (isSelected) {
        return prev.filter(t => t.id !== treatment.id);
      } else {
        return [...prev, treatment];
      }
    });
  };

  const sendPanchkarmaPrescription = async () => {
    if (!selectedPatient || selectedTreatments.length === 0) {
      Alert.alert('Error', 'Please select a patient and at least one treatment.');
      return;
    }

    setLoading(true);
    
    try {
      const prescriptionData = {
        doctor_email: doctorEmail,
        doctor_name: doctorName,
        patient_email: selectedPatient.email,
        patient_name: selectedPatient.name,
        treatments: JSON.stringify(selectedTreatments),
        notes: prescriptionNotes,
        status: 'prescribed',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('panchkarma_prescriptions')
        .insert([prescriptionData])
        .select();

      if (error) {
        console.error('Error sending Panchkarma prescription:', error);
        throw error;
      }

      console.log('Panchkarma prescription sent successfully');
      Alert.alert('Success', 'Panchkarma prescription sent successfully!');
      setModalVisible(false);
      setSelectedPatient(null);
      setSelectedTreatments([]);
      setPrescriptionNotes('');
      fetchPanchkarmaPrescriptions();
    } catch (error) {
      console.error('Error sending prescription:', error);
      Alert.alert('Error', `Failed to send prescription: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openPrescriptionModal = () => {
    setModalVisible(true);
    // Clear search states when modal opens
    setPatientSearchQuery('');
    setTreatmentSearchQuery('');
    setSelectedPatient(null);
    setSelectedTreatments([]);
    setPrescriptionNotes('');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafc' }}>
      {/* Header */}
      <Card style={{ margin: 16, backgroundColor: '#4caf50' }}>
        <Card.Content>
          <Text variant="headlineMedium" style={{ color: 'white', fontWeight: 'bold' }}>
            🌿 Panchkarma Center
          </Text>
          <Text style={{ color: 'white', marginTop: 5 }}>
            Prescribe traditional Ayurvedic treatments
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', margin: 16, gap: 10 }}>
        <Button
          mode="contained"
          onPress={openPrescriptionModal}
          style={{ flex: 1, backgroundColor: '#4caf50' }}
          icon="plus"
        >
          New Prescription
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={{ flex: 1 }}
        >
          Back to Dashboard
        </Button>
      </View>

      {/* Treatments Library */}
      <Card style={{ margin: 16 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            📚 Panchkarma Treatments Library
          </Text>
          
          {/* Search and Filter */}
          <TextInput
            label="Search treatments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            style={{ marginBottom: 12 }}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {categories.map(category => (
              <Chip
                key={category}
                selected={filterCategory === category}
                onPress={() => setFilterCategory(category)}
                style={{ marginRight: 8 }}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>

          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Treatment</DataTable.Title>
              <DataTable.Title>Category</DataTable.Title>
              <DataTable.Title>Duration</DataTable.Title>
            </DataTable.Header>

            {filteredTreatments.map(treatment => (
              <DataTable.Row key={treatment.id}>
                <DataTable.Cell style={{ flex: 2 }}>
                  <View>
                    <Text style={{ fontWeight: 'bold' }}>{treatment.name}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }} numberOfLines={2}>
                      {treatment.description}
                    </Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Chip size="small">{treatment.category}</Chip>
                </DataTable.Cell>
                <DataTable.Cell>{treatment.duration}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      {/* Recent Prescriptions */}
      <Card style={{ margin: 16 }}>
        <Card.Content>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
            📋 Recent Prescriptions ({sentPrescriptions.length})
          </Text>
          
          {sentPrescriptions.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#666', paddingVertical: 20 }}>
              No prescriptions sent yet.
            </Text>
          ) : (
            sentPrescriptions.slice(0, 5).map((prescription, index) => (
              <Card key={index} style={{ marginBottom: 12, backgroundColor: '#f0f8f0' }}>
                <Card.Content>
                  <Text style={{ fontWeight: 'bold' }}>
                    Patient: {prescription.patient_name}
                  </Text>
                  <Text style={{ color: '#666' }}>
                    Email: {prescription.patient_email}
                  </Text>
                  <Text style={{ color: '#666' }}>
                    Date: {new Date(prescription.created_at).toLocaleDateString('en-IN')}
                  </Text>
                  <Text style={{ marginTop: 8 }}>
                    Treatments: {JSON.parse(prescription.treatments).map(t => t.name).join(', ')}
                  </Text>
                  {prescription.notes && (
                    <Text style={{ marginTop: 4, fontStyle: 'italic' }}>
                      Notes: {prescription.notes}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Prescription Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 8,
            maxHeight: '80%'
          }}
        >
          <ScrollView>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: 16 }}>
              Create Panchkarma Prescription
            </Text>

            {/* Patient Selection */}
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              Select Patient:
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Search patients..."
              value={patientSearchQuery}
              onChangeText={setPatientSearchQuery}
              style={{ marginBottom: 12 }}
              left={<TextInput.Icon icon="magnify" />}
            />
            {filteredPatients.map(patient => (
              <List.Item
                key={patient.id}
                title={patient.name}
                description={patient.email}
                left={props => <List.Icon {...props} icon="account" />}
                right={props => selectedPatient?.id === patient.id ? 
                  <List.Icon {...props} icon="check" color="#4caf50" /> : null}
                onPress={() => setSelectedPatient(patient)}
                style={{
                  backgroundColor: selectedPatient?.id === patient.id ? '#e8f5e8' : 'transparent',
                  marginBottom: 4,
                  borderRadius: 8
                }}
              />
            ))}

            <Divider style={{ marginVertical: 16 }} />

            {/* Treatment Selection */}
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              Select Treatments:
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Search treatments..."
              value={treatmentSearchQuery}
              onChangeText={setTreatmentSearchQuery}
              style={{ marginBottom: 12 }}
              left={<TextInput.Icon icon="magnify" />}
            />
            {filteredModalTreatments.map(treatment => {
              const isSelected = selectedTreatments.find(t => t.id === treatment.id);
              return (
                <List.Item
                  key={treatment.id}
                  title={treatment.name}
                  description={`${treatment.category} • ${treatment.duration}`}
                  left={props => <List.Icon {...props} icon="leaf" />}
                  right={props => isSelected ? 
                    <List.Icon {...props} icon="check" color="#4caf50" /> : null}
                  onPress={() => toggleTreatmentSelection(treatment)}
                  style={{
                    backgroundColor: isSelected ? '#e8f5e8' : 'transparent',
                    marginBottom: 4,
                    borderRadius: 8
                  }}
                />
              );
            })}

            <Divider style={{ marginVertical: 16 }} />

            {/* Notes */}
            <TextInput
              label="Additional Notes (Optional)"
              value={prescriptionNotes}
              onChangeText={setPrescriptionNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
            />

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={sendPanchkarmaPrescription}
                loading={loading}
                disabled={!selectedPatient || selectedTreatments.length === 0}
                style={{ flex: 1, marginLeft: 8, backgroundColor: '#4caf50' }}
              >
                Send Prescription
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
}