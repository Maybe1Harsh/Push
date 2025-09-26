import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, Chip, IconButton, Divider, Menu } from 'react-native-paper';
import { supabase } from './supabaseClient';

const medicineList = [
  'Ashwagandha', 'Triphala', 'Brahmi', 'Giloy', 'Shatavari', 'Neem', 'Arogyavardhini', 'Liv 52', 'Chyawanprash', 'Sitopaladi',
  'Kumari Asava', 'Punarnava', 'Haritaki', 'Amalaki', 'Guduchi', 'Yashtimadhu', 'Dashmool', 'Guggulu', 'Arjuna', 'Musta'
];
const dosageOptions = ['1 tablet', '2 tablets', '3 tablets', '4 tablets', '5 ml', '10 ml', '15 ml'];
const frequencyOptions = [
  'Once daily', 'Twice daily', 'Thrice daily', 'After lunch', 'Before dinner', 'After breakfast', 'At bedtime'
];

export default function PrescriptionPage({ route }) {
  // Get doctor details from navigation params (passed from DoctorDashboard)
  const doctorProfile = route?.params?.profile || {};
  const doctorEmail = doctorProfile.email || '';
  const doctorName = doctorProfile.name || 'Doctor';
  const doctorClinic = doctorProfile.clinic || 'Clinic';
  
  // Get pre-selected patient from dashboard
  const preSelectedPatient = route?.params?.selectedPatient || null;

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(preSelectedPatient);
  const [patientMenuVisible, setPatientMenuVisible] = useState(false);
  const [fetchDebug, setFetchDebug] = useState({ doctorEmail: '', error: '', data: null });

  // Fetch patients from Supabase for this doctor
  useEffect(() => {
    if (!doctorEmail) return;
    setFetchDebug({ doctorEmail, error: '', data: null }); // set doctorEmail for debug
    supabase
      .from('patients')
      .select('*')
      .eq('doctor_email', doctorEmail)
      .then(({ data, error }) => {
        if (error) {
          setFetchDebug(prev => ({ ...prev, error: error.message, data: null }));
          setPatients([]);
        } else {
          setFetchDebug(prev => ({ ...prev, error: '', data }));
          setPatients(data || []);
        }
      });
  }, [doctorEmail]);

  const [search, setSearch] = useState('');
  const [filteredMeds, setFilteredMeds] = useState(medicineList);
  const [selectedMed, setSelectedMed] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [dosageMenuVisible, setDosageMenuVisible] = useState(false);
  const [frequencyMenuVisible, setFrequencyMenuVisible] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [otherAdvice, setOtherAdvice] = useState('');

  // Filter medicines as user types
  const handleSearch = (text) => {
    setSearch(text);
    setFilteredMeds(medicineList.filter(med => med.toLowerCase().includes(text.toLowerCase())));
  };

  // Add medicine to prescription list
  const handleAddMedicine = () => {
    if (selectedMed && dosage && frequency && prescriptions.length < 100) {
      setPrescriptions([
        ...prescriptions,
        { name: selectedMed, dosage, frequency }
      ]);
      setSelectedMed('');
      setDosage('');
      setFrequency('');
      setSearch('');
      setFilteredMeds(medicineList);
    }
  };

  // Remove medicine
  const handleRemoveMedicine = (idx) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  // Save/send prescription
  const handleSend = async () => {
    if (!selectedPatient) {
      alert('Please select a patient.');
      return;
    }
    if (prescriptions.length === 0) {
      alert('Please add at least one medicine.');
      return;
    }
    const { error, data } = await supabase
      .from('prescriptions')
      .insert([{
        doctor_email: doctorEmail,
        doctor_name: doctorName,
        patient_email: selectedPatient.email,
        patient_name: selectedPatient.name,
        medicines: prescriptions,
        advice: otherAdvice,
        created_at: new Date().toISOString()
      }]);
    if (error) {
      console.error('Supabase insert error:', error); // DEBUG
      alert('Failed to send prescription.\n' + error.message);
    } else {
      alert(`Prescription sent to ${selectedPatient.name}!`);
      setPrescriptions([]);
      setOtherAdvice('');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#f3f6fa', flexGrow: 1 }}>
      
      
      <Card style={{ marginBottom: 12, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{doctorName}</Text>
        <Text style={{ color: '#388e3c', marginBottom: 4 }}>{doctorClinic}</Text>
        <Divider style={{ marginVertical: 6 }} />
        
        {/* Only show selected patient info - no selection mechanism */}
        {selectedPatient ? (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 8,
            backgroundColor: '#e8f5e8',
            padding: 10,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#4caf50'
          }}>
            <Text style={{ marginRight: 8, fontWeight: 'bold' }}>Patient:</Text>
            <Text style={{ flex: 1, fontSize: 16, color: '#000000' }}>
              {selectedPatient.name} ({selectedPatient.email})
            </Text>
          </View>
        ) : (
          <View style={{ 
            backgroundColor: '#ffebee',
            padding: 10,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#f44336',
            marginBottom: 8
          }}>
            <Text style={{ color: '#d32f2f', fontWeight: 'bold' }}>
              No patient selected. Please select a patient from the dashboard first.
            </Text>
          </View>
        )}
        
        {/* Remove the patient selection list entirely */}
        {/* Remove the patient selection list entirely */}
        
        {selectedPatient && (
          <>
            <Text>Age: {selectedPatient.age} | Gender: {selectedPatient.gender}</Text>
            <Text>Email: {selectedPatient.email}</Text>
            <Text>Date: {new Date().toLocaleDateString()}</Text>
            <Text>Prakriti: <Text style={{ color: '#1976d2' }}>{selectedPatient.prakriti || '-'}</Text></Text>
            <Text>Previous Treatments: {selectedPatient.previous_treatments || '-'}</Text>
          </>
        )}
      </Card>
      <Card style={{ marginBottom: 12, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Add Prescription</Text>
        <TextInput
          label="Search Medicine"
          value={search}
          onChangeText={handleSearch}
          style={{ marginBottom: 8 }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {filteredMeds.map((med, idx) => (
            <Chip
              key={idx}
              style={{ marginRight: 6, marginBottom: 6 }}
              selected={selectedMed === med}
              onPress={() => setSelectedMed(med)}
            >
              {med}
            </Chip>
          ))}
        </View>
        {/* Dosage dropdown */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ marginRight: 8 }}>Dosage:</Text>
          <View style={{ position: 'relative' }}>
            <Menu
              visible={dosageMenuVisible}
              onDismiss={() => setDosageMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setDosageMenuVisible(true)}>
                  {dosage || 'Select Dosage'}
                </Button>
              }
            >
              {dosageOptions.map((opt, idx) => (
                <Menu.Item key={idx} onPress={() => { setDosage(opt); setDosageMenuVisible(false); }} title={opt} />
              ))}
            </Menu>
          </View>
        </View>
        {/* Frequency dropdown */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ marginRight: 8 }}>Frequency:</Text>
          <View style={{ position: 'relative' }}>
            <Menu
              visible={frequencyMenuVisible}
              onDismiss={() => setFrequencyMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setFrequencyMenuVisible(true)}>
                  {frequency || 'Select Frequency'}
                </Button>
              }
            >
              {frequencyOptions.map((opt, idx) => (
                <Menu.Item key={idx} onPress={() => { setFrequency(opt); setFrequencyMenuVisible(false); }} title={opt} />
              ))}
            </Menu>
          </View>
        </View>
        <Button mode="contained" onPress={handleAddMedicine} disabled={!selectedMed || !dosage || !frequency || prescriptions.length >= 100}>
          Add Medicine
        </Button>
        <Text style={{ marginTop: 6, color: '#888' }}>
          {prescriptions.length} / 100 medicines added
        </Text>
      </Card>
      <Card style={{ marginBottom: 12, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Prescription List</Text>
        {prescriptions.length === 0 && <Text>No medicines added yet.</Text>}
        {prescriptions.map((med, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ flex: 1 }}>{med.name} - {med.dosage} - {med.frequency}</Text>
            <IconButton icon="delete" iconColor="#d32f2f" onPress={() => handleRemoveMedicine(idx)} />
          </View>
        ))}
      </Card>
      <Card style={{ marginBottom: 12, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Other Treatments / Advice</Text>
        <TextInput
          label="Advice or Notes"
          value={otherAdvice}
          onChangeText={setOtherAdvice}
          multiline
          numberOfLines={3}
        />
      </Card>
      <Button mode="contained" onPress={handleSend}>
        Send Prescription
      </Button>
    </ScrollView>
  );
}
