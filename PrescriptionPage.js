import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Text, TextInput, Button, Chip, IconButton, Divider, Menu, Modal, Portal, RadioButton, PaperProvider } from 'react-native-paper';
import { supabase } from './supabaseClient';

const medicineList = [
  'Ashwagandha', 'Triphala', 'Brahmi', 'Giloy', 'Shatavari', 'Neem', 'Arogyavardhini', 'Liv 52', 'Chyawanprash', 'Sitopaladi',
  'Kumari Asava', 'Punarnava', 'Haritaki', 'Amalaki', 'Guduchi', 'Yashtimadhu', 'Dashmool', 'Guggulu', 'Arjuna', 'Musta'
];
const dosageOptions = ['1 tablet', '2 tablets', '3 tablets', '4 tablets', '5 ml', '10 ml', '15 ml'];
const frequencyOptions = [
  'Once daily', 'Twice daily', 'Thrice daily', 'After lunch', 'Before dinner', 'After breakfast', 'At bedtime'
];

export default function PrescriptionPage({ route, navigation }) {
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

  // Ayurvedic Prescription Form States
  const [prescriptionForm, setPrescriptionForm] = useState({
    // Patient Details
    patientName: '',
    age: '',
    weight: '',
    date: new Date().toISOString().split('T')[0],
    phoneNo: '',
    
    // Ayurvedic Assessment
    naadi: '',
    rasa: '',
    rakta: '',
    mansa: '',
    meda: '',
    asthi: '',
    majja: '',
    shukra: '',
    vata: '',
    pitta: '',
    kapha: '',
    purisha: '',
    mutra: '',
    
    // Case Study/Symptoms
    caseStudy: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medicines: [],
    advice: ''
  });

  // Modal and UI States
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // Enhanced Assessment Form Handlers
  const updateFormField = (field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openAssessmentModal = () => {
    // Pre-fill patient data if selected
    if (selectedPatient) {
      setPrescriptionForm(prev => ({
        ...prev,
        patientName: selectedPatient.name || '',
        age: selectedPatient.age?.toString() || '',
        phoneNo: selectedPatient.phone || ''
      }));
    }
    setModalVisible(true);
  };

  const handleSendComprehensive = async () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient first');
      return;
    }

    setLoading(true);
    try {
      const comprehensiveData = {
        ...prescriptionForm,
        medicines: prescriptions,
        patient_id: selectedPatient.id,
        doctor_email: doctorEmail,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('comprehensive_prescriptions')
        .insert([comprehensiveData]);

      if (error) throw error;

      Alert.alert('Success', 'Comprehensive assessment sent successfully!');
      
      // Reset form
      setPrescriptionForm({
        patientName: '',
        age: '',
        weight: '',
        date: new Date().toISOString().split('T')[0],
        phoneNo: '',
        naadi: '',
        rasa: '',
        rakta: '',
        mansa: '',
        meda: '',
        asthi: '',
        majja: '',
        shukra: '',
        vata: '',
        pitta: '',
        kapha: '',
        purisha: '',
        mutra: '',
        caseStudy: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        medicines: [],
        advice: ''
      });
      setPrescriptions([]);
      setModalVisible(false);
      
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
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
    <PaperProvider>
      <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#F1F0E8', flexGrow: 1 }}>
        {/* Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <IconButton
            icon="arrow-left"
            iconColor="#2C3E50"
            size={24}
            onPress={() => navigation?.goBack()}
            style={{ margin: 0 }}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2C3E50' }}>Back</Text>
        </View>
        
        
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
              backgroundColor: '#EEE0C9',
              padding: 10,
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: '#96B6C5'
            }}>
              <Text style={{ marginRight: 8, fontWeight: 'bold', color: '#2C3E50' }}>Patient:</Text>
              <Text style={{ flex: 1, fontSize: 16, color: '#2C3E50' }}>
                {selectedPatient.name} ({selectedPatient.email})
              </Text>
            </View>
        ) : (
          <View style={{ 
            backgroundColor: '#ADC4CE',
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

      {/* Comprehensive Assessment Button */}
      {selectedPatient && (
        <Card style={{ marginBottom: 12, borderRadius: 12, padding: 12, backgroundColor: '#ADC4CE', elevation: 3 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#2C3E50' }}>Ayurvedic Assessment</Text>
          <Text style={{ marginBottom: 8, color: '#2C3E50' }}>
            Complete comprehensive assessment including Naadi, Sapta Dhatu, Tridosha, and case study.
          </Text>
          <Button 
            mode="contained" 
            onPress={openAssessmentModal}
            style={{ backgroundColor: '#96B6C5' }}
            labelStyle={{ color: '#2C3E50' }}
          >
            Open Comprehensive Assessment
          </Button>
        </Card>
      )}

      <Card style={{ marginBottom: 12, borderRadius: 12, padding: 12, backgroundColor: '#ADC4CE', elevation: 3 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#2C3E50', fontSize: 16 }}>Add Prescription</Text>
        <TextInput
          label="Search Medicine"
          value={search}
          onChangeText={handleSearch}
          style={{ marginBottom: 8, backgroundColor: '#F1F0E8' }}
          textColor="#2C3E50"
          outlineColor="#96B6C5"
          activeOutlineColor="#96B6C5"
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {filteredMeds.map((med, idx) => (
            <Chip
              key={idx}
              style={{ 
                marginRight: 6, 
                marginBottom: 6,
                backgroundColor: selectedMed === med ? '#96B6C5' : '#F1F0E8'
              }}
              textStyle={{ 
                color: selectedMed === med ? '#2C3E50' : '#2C3E50'
              }}
              selected={selectedMed === med}
              onPress={() => setSelectedMed(med)}
            >
              {med}
            </Chip>
          ))}
        </View>
        {/* Dosage dropdown */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ marginRight: 8, color: '#2C3E50', fontWeight: '600' }}>Dosage:</Text>
          <View style={{ position: 'relative' }}>
            <Menu
              visible={dosageMenuVisible}
              onDismiss={() => setDosageMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setDosageMenuVisible(true)}
                  style={{ borderColor: '#96B6C5' }}
                  textColor="#2C3E50"
                >
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
          <Text style={{ marginRight: 8, color: '#2C3E50', fontWeight: '600' }}>Frequency:</Text>
          <View style={{ position: 'relative' }}>
            <Menu
              visible={frequencyMenuVisible}
              onDismiss={() => setFrequencyMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setFrequencyMenuVisible(true)}
                  style={{ borderColor: '#96B6C5' }}
                  textColor="#2C3E50"
                >
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
        <Button 
          mode="contained" 
          onPress={handleAddMedicine} 
          disabled={!selectedMed || !dosage || !frequency || prescriptions.length >= 100}
          style={{ 
            backgroundColor: !selectedMed || !dosage || !frequency || prescriptions.length >= 100 ? '#ccc' : '#96B6C5',
            marginTop: 8 
          }}
          labelStyle={{ color: '#2C3E50' }}
        >
          Add Medicine
        </Button>
        <Text style={{ marginTop: 6, color: '#2C3E50', fontSize: 12, textAlign: 'center' }}>
          {prescriptions.length} / 100 medicines added
        </Text>
      </Card>
      <Card style={{ marginBottom: 12, borderRadius: 12, padding: 12, backgroundColor: '#EEE0C9', elevation: 3 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#2C3E50', fontSize: 16 }}>Prescription List</Text>
        {prescriptions.length === 0 && <Text style={{ color: '#2C3E50', fontStyle: 'italic' }}>No medicines added yet.</Text>}
        {prescriptions.map((med, idx) => (
          <View key={idx} style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 6, 
            backgroundColor: '#F1F0E8', 
            borderRadius: 8, 
            padding: 8 
          }}>
            <Text style={{ flex: 1, color: '#2C3E50' }}>{med.name} - {med.dosage} - {med.frequency}</Text>
            <IconButton icon="delete" iconColor="#d32f2f" onPress={() => handleRemoveMedicine(idx)} />
          </View>
        ))}
      </Card>
      <Card style={{ marginBottom: 12, borderRadius: 12, padding: 12, backgroundColor: '#ADC4CE', elevation: 3 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#2C3E50', fontSize: 16 }}>Other Treatments / Advice</Text>
        <TextInput
          label="Advice or Notes"
          value={otherAdvice}
          onChangeText={setOtherAdvice}
          multiline
          numberOfLines={3}
          style={{ backgroundColor: '#F1F0E8' }}
          textColor="#2C3E50"
          outlineColor="#96B6C5"
          activeOutlineColor="#96B6C5"
        />
      </Card>
      <Button 
        mode="contained" 
        onPress={handleSend}
        style={{ 
          backgroundColor: '#96B6C5',
          borderRadius: 12,
          paddingVertical: 8
        }}
        labelStyle={{ color: '#2C3E50', fontSize: 16, fontWeight: 'bold' }}
      >
        Send Prescription
      </Button>

        {/* Comprehensive Assessment Modal */}
        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Comprehensive Ayurvedic Assessment</Text>
              
              {/* Patient Details Section */}
              <Text style={styles.sectionTitle}>Patient Information</Text>
              <TextInput
                label="Patient Name"
                value={prescriptionForm.patientName}
                onChangeText={(text) => updateFormField('patientName', text)}
                mode="outlined"
                style={styles.input}
              />
              
              <View style={styles.row}>
                <TextInput
                  label="Age"
                  value={prescriptionForm.age}
                  onChangeText={(text) => updateFormField('age', text)}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                />
                <TextInput
                  label="Weight (kg)"
                  value={prescriptionForm.weight}
                  onChangeText={(text) => updateFormField('weight', text)}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                />
              </View>

              <TextInput
                label="Phone Number"
                value={prescriptionForm.phoneNo}
                onChangeText={(text) => updateFormField('phoneNo', text)}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
              />

              <TextInput
                label="Date"
                value={prescriptionForm.date}
                onChangeText={(text) => updateFormField('date', text)}
                mode="outlined"
                style={styles.input}
              />

              {/* Naadi Assessment */}
              <Text style={styles.sectionTitle}>Naadi Pariksha (Pulse Examination)</Text>
              <View style={styles.radioGroup}>
                {['Vata Naadi', 'Pitta Naadi', 'Kapha Naadi', 'Mixed'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.naadi === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('naadi', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Sapta Dhatu Assessment */}
              <Text style={styles.sectionTitle}>Sapta Dhatu Assessment</Text>
              
              {/* Rasa */}
              <Text style={styles.subTitle}>Rasa (Plasma)</Text>
              <View style={styles.radioGroup}>
                {['Normal', 'Increased', 'Decreased', 'Vitiated'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.rasa === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('rasa', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Rakta */}
              <Text style={styles.subTitle}>Rakta (Blood)</Text>
              <View style={styles.radioGroup}>
                {['Normal', 'Increased', 'Decreased', 'Vitiated'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.rakta === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('rakta', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Mansa */}
              <Text style={styles.subTitle}>Mansa (Muscle)</Text>
              <View style={styles.radioGroup}>
                {['Normal', 'Increased', 'Decreased', 'Vitiated'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.mansa === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('mansa', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Meda */}
              <Text style={styles.subTitle}>Meda (Fat)</Text>
              <View style={styles.radioGroup}>
                {['Normal', 'Increased', 'Decreased', 'Vitiated'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.meda === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('meda', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Asthi */}
              <Text style={styles.subTitle}>Asthi (Bone)</Text>
              <View style={styles.radioGroup}>
                {['Normal', 'Increased', 'Decreased', 'Vitiated'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.asthi === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('asthi', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Majja */}
              <Text style={styles.subTitle}>Majja (Nervous System)</Text>
              <View style={styles.radioGroup}>
                {['Normal', 'Increased', 'Decreased', 'Vitiated'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.majja === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('majja', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Shukra */}
              <Text style={styles.subTitle}>Shukra (Reproductive)</Text>
              <View style={styles.radioGroup}>
                {['Normal', 'Increased', 'Decreased', 'Vitiated'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.shukra === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('shukra', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Tridosha Assessment */}
              <Text style={styles.sectionTitle}>Tridosha Assessment</Text>
              
              {/* Vata */}
              <Text style={styles.subTitle}>Vata</Text>
              <View style={styles.radioGroup}>
                {['Balanced', 'Increased', 'Decreased'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.vata === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('vata', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Pitta */}
              <Text style={styles.subTitle}>Pitta</Text>
              <View style={styles.radioGroup}>
                {['Balanced', 'Increased', 'Decreased'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.pitta === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('pitta', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Kapha */}
              <Text style={styles.subTitle}>Kapha</Text>
              <View style={styles.radioGroup}>
                {['Balanced', 'Increased', 'Decreased'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.kapha === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('kapha', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Mala Assessment */}
              <Text style={styles.sectionTitle}>Mala Assessment</Text>
              
              {/* Purisha */}
              <Text style={styles.subTitle}>Purisha (Stool)</Text>
              <View style={styles.radioGroup}>
                {['Normal', 'Hard', 'Loose', 'Irregular'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.purisha === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('purisha', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Mutra */}
              <Text style={styles.subTitle}>Mutra (Urine)</Text>
              <View style={styles.radioGroup}>
                {['Normal', 'Dark', 'Clear', 'Frequent', 'Scanty'].map((option) => (
                  <View key={option} style={styles.radioItem}>
                    <RadioButton
                      value={option}
                      status={prescriptionForm.mutra === option ? 'checked' : 'unchecked'}
                      onPress={() => updateFormField('mutra', option)}
                    />
                    <Text style={styles.radioLabel}>{option}</Text>
                  </View>
                ))}
              </View>

              {/* Case Study and Clinical Information */}
              <Text style={styles.sectionTitle}>Clinical Assessment</Text>
              
              <TextInput
                label="Case Study / Chief Complaint"
                value={prescriptionForm.caseStudy}
                onChangeText={(text) => updateFormField('caseStudy', text)}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
              />

              <TextInput
                label="Symptoms"
                value={prescriptionForm.symptoms}
                onChangeText={(text) => updateFormField('symptoms', text)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <TextInput
                label="Diagnosis"
                value={prescriptionForm.diagnosis}
                onChangeText={(text) => updateFormField('diagnosis', text)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <TextInput
                label="Treatment Plan"
                value={prescriptionForm.treatment}
                onChangeText={(text) => updateFormField('treatment', text)}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
              />

              <TextInput
                label="Additional Advice"
                value={prescriptionForm.advice}
                onChangeText={(text) => updateFormField('advice', text)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={[styles.button, styles.cancelButton]}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSendComprehensive}
                  loading={loading}
                  disabled={loading}
                  style={[styles.button, styles.saveButton]}
                >
                  Save Assessment & Send
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#F1F0E8',
    margin: 10,
    borderRadius: 16,
    padding: 16,
    maxHeight: '90%'
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#96B6C5',
    paddingBottom: 4
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 8
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#F1F0E8'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfInput: {
    width: '48%'
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 4
  },
  radioLabel: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 8
  },
  button: {
    flex: 1,
    marginHorizontal: 6
  },
  cancelButton: {
    borderColor: '#96B6C5'
  },
  saveButton: {
    backgroundColor: '#96B6C5'
  }
});
