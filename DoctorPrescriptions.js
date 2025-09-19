import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal, Provider as PaperProvider, Divider, Chip, IconButton, Menu } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { supabase } from './supabaseClient';
import { useTranslation } from './hooks/useTranslation';

// Medicine list for dropdown
const medicineList = [
  'Ashwagandha', 'Triphala', 'Brahmi', 'Giloy', 'Shatavari', 'Neem', 'Arogyavardhini', 'Liv 52', 'Chyawanprash', 'Sitopaladi',
  'Kumari Asava', 'Punarnava', 'Haritaki', 'Amalaki', 'Guduchi', 'Yashtimadhu', 'Dashmool', 'Guggulu', 'Arjuna', 'Musta'
];
const dosageOptions = ['1 tablet', '2 tablets', '3 tablets', '4 tablets', '5 ml', '10 ml', '15 ml'];
const frequencyOptions = [
  'Once daily', 'Twice daily', 'Thrice daily', 'After lunch', 'Before dinner', 'After breakfast', 'At bedtime'
];

export default function DoctorPrescriptionsScreen({ navigation, route }) {
  const { t } = useTranslation();
  
  // Debug the route params
  console.log('Route params:', route.params);
  const doctorEmail = route.params?.profile?.email || route.params?.doctorEmail || '';
  const doctorName = route.params?.profile?.name || route.params?.doctorName || 'Doctor';
  
  console.log('Doctor Email in DoctorPrescriptions:', doctorEmail);
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
    stool: '',
    urine: '',
    sweat: '',
    srotas: '',
    nidana: '',
    pathyapathya: '',
    
    // Treatment
    chikitsa: ''
  });

  // Medicine management states
  const [search, setSearch] = useState('');
  const [filteredMeds, setFilteredMeds] = useState(medicineList);
  const [selectedMed, setSelectedMed] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [dosageMenuVisible, setDosageMenuVisible] = useState(false);
  const [frequencyMenuVisible, setFrequencyMenuVisible] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [otherAdvice, setOtherAdvice] = useState('');

  // Dropdown options
  const doshaOptions = ['Balanced', 'Increased', 'Decreased', 'Normal'];
  const dhaatuOptions = ['Normal', 'Deficient', 'Excessive', 'Vitiated'];
  const naadiOptions = ['Vata (Snake-like)', 'Pitta (Frog-like)', 'Kapha (Swan-like)', 'Mixed'];
  const malaOptions = ['Normal', 'Constipated', 'Loose', 'Irregular'];
  const urineOptions = ['Normal', 'Scanty', 'Excessive', 'Burning'];
  const sweatOptions = ['Normal', 'Excessive', 'Scanty', 'Absent'];

  // Diet chart states
  const [dietChartText, setDietChartText] = useState('');
  const [dietModalVisible, setDietModalVisible] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [doctorEmail]);

  const fetchPatients = async () => {
    if (!doctorEmail) {
      console.log('No doctor email provided');
      return;
    }
    
    try {
      console.log('Fetching patients for doctor:', doctorEmail);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_email', doctorEmail);

      if (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }
      
      console.log('Fetched patients:', data);
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert(`Failed to fetch patients: ${error.message}`);
    }
  };

  const handleWritePrescription = (patient) => {
    console.log('handleWritePrescription called with patient:', patient);
    console.log('Setting modalVisible to true');
    
    setSelectedPatient(patient);
    setPrescriptionForm({
      ...prescriptionForm,
      patientName: patient.name,
      age: patient.age?.toString() || '',
      phoneNo: patient.phone || '',
      date: new Date().toISOString().split('T')[0]
    });
    // Reset medicine form
    setPrescriptions([]);
    setOtherAdvice('');
    setSearch('');
    setSelectedMed('');
    setDosage('');
    setFrequency('');
    setFilteredMeds(medicineList);
    setModalVisible(true);
    
    console.log('Modal should now be visible');
  };

  const updateFormField = (field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Medicine management functions
  const handleSearch = (text) => {
    setSearch(text);
    setFilteredMeds(medicineList.filter(med => med.toLowerCase().includes(text.toLowerCase())));
  };

  const handleAddMedicine = () => {
    if (selectedMed && dosage && frequency && prescriptions.length < 20) {
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

  const handleRemoveMedicine = (idx) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient) return;

    setLoading(true);
    try {
      const prescriptionData = {
        patient_email: selectedPatient.email,
        doctor_email: doctorEmail,
        doctor_name: doctorName,
        patient_name: selectedPatient.name,
        prescription_data: JSON.stringify(prescriptionForm),
        medicines: prescriptions,
        advice: otherAdvice,
        created_at: new Date().toISOString()
      };
      
      console.log('Prescription payload:', prescriptionData);
      const { error } = await supabase
        .from('prescriptions')
        .insert([prescriptionData]);

      if (error) {
        console.error('Supabase prescription insert error:', error);
        alert(`Failed to save prescription: ${JSON.stringify(error)}`);
        return;
      }

      setModalVisible(false);
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
        stool: '',
        urine: '',
        sweat: '',
        srotas: '',
        nidana: '',
        pathyapathya: '',
        chikitsa: ''
      });
      setPrescriptions([]);
      setOtherAdvice('');
      setSelectedPatient(null);
      alert('Prescription saved successfully!');
    } catch (error) {
      console.error('Unexpected error saving prescription:', error);
      alert(`Failed to save prescription: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Diet chart handlers
  const handleAssignDietChart = (patient) => {
    setSelectedPatient(patient);
    setDietChartText('');
    setDietModalVisible(true);
  };

  const handleSaveDietChart = async () => {
    if (!dietChartText.trim() || !selectedPatient) return;

    setLoading(true);
    try {
      const payload = {
        doctor_email: doctorEmail,
        patient_email: selectedPatient.email,
        diet_chart_text: dietChartText.trim(),
        created_at: new Date().toISOString()
      };
      console.log('Diet chart payload:', payload);
      const { error } = await supabase
        .from('diet_charts')
        .insert([payload]);
      if (error) {
        console.error('Supabase diet chart insert error:', error);
        alert(`Failed to assign diet chart: ${JSON.stringify(error)}`);
        return;
      }
      setDietModalVisible(false);
      setDietChartText('');
      setSelectedPatient(null);
      alert('Diet chart assigned successfully!');
    } catch (error) {
      console.error('Unexpected error saving diet chart:', error);
      alert(`Failed to assign diet chart: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <ScrollView style={{ flex: 1, backgroundColor: '#f3f6fa' }}>
        <View style={{ padding: 20 }}>
          <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32', textAlign: 'center' }}>
            Write Prescriptions & Assign Diet Charts
          </Text>

          {patients.length === 0 ? (
            <Card style={{ padding: 20, borderRadius: 16, backgroundColor: '#fff' }}>
              <Text style={{ textAlign: 'center', color: '#666' }}>
                No patients assigned yet. Add patients to write prescriptions.
              </Text>
            </Card>
          ) : (
            patients.map((patient) => (
              <Card key={patient.id} style={{ marginBottom: 15, borderRadius: 16, backgroundColor: '#fff' }}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: '#2e7d32', marginBottom: 8 }}>
                    {patient.name}
                  </Text>
                  <Text style={{ color: '#666', marginBottom: 12 }}>
                    Email: {patient.email}
                  </Text>
                  <Text style={{ color: '#666', marginBottom: 12 }}>
                    Age: {patient.age}
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="contained"
                    onPress={() => handleWritePrescription(patient)}
                    style={{ backgroundColor: '#4caf50', marginRight: 8 }}
                  >
                    Write Prescription
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleAssignDietChart(patient)}
                    style={{ backgroundColor: '#2196f3' }}
                  >
                    Assign Diet Chart
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
        </View>

        {/* Ayurvedic Prescription Modal */}
        <Portal>
          <Modal 
            visible={modalVisible} 
            onDismiss={() => {
              console.log('Modal dismissed');
              setModalVisible(false);
            }}
            contentContainerStyle={styles.modalContainer}
          >
            {console.log('Modal rendering, visible:', modalVisible)}
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                Ayurvedic Prescription for {selectedPatient?.name || 'Unknown Patient'}
              </Text>

              {/* Patient Details Section */}
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Patient Details</Text>
                  <Divider style={styles.divider} />
                  
                  <TextInput
                    label="Patient Name"
                    value={prescriptionForm.patientName}
                    onChangeText={(value) => updateFormField('patientName', value)}
                    mode="outlined"
                    style={styles.input}
                  />
                  
                  <View style={styles.row}>
                    <TextInput
                      label="Age"
                      value={prescriptionForm.age}
                      onChangeText={(value) => updateFormField('age', value)}
                      mode="outlined"
                      style={[styles.input, styles.halfWidth]}
                      keyboardType="numeric"
                    />
                    <TextInput
                      label="Weight (kg)"
                      value={prescriptionForm.weight}
                      onChangeText={(value) => updateFormField('weight', value)}
                      mode="outlined"
                      style={[styles.input, styles.halfWidth]}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.row}>
                    <TextInput
                      label="Date"
                      value={prescriptionForm.date}
                      onChangeText={(value) => updateFormField('date', value)}
                      mode="outlined"
                      style={[styles.input, styles.halfWidth]}
                    />
                    <TextInput
                      label="Phone Number"
                      value={prescriptionForm.phoneNo}
                      onChangeText={(value) => updateFormField('phoneNo', value)}
                      mode="outlined"
                      style={[styles.input, styles.halfWidth]}
                      keyboardType="phone-pad"
                    />
                  </View>
                </Card.Content>
              </Card>

              {/* Ayurvedic Assessment Section */}
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Ayurvedic Assessment</Text>
                  <Divider style={styles.divider} />
                  
                  {/* Naadi */}
                  <Text style={styles.fieldLabel}>Naadi (Pulse)</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={prescriptionForm.naadi}
                      style={styles.picker}
                      onValueChange={(value) => updateFormField('naadi', value)}
                    >
                      <Picker.Item label="Select Naadi" value="" />
                      {naadiOptions.map((option, index) => (
                        <Picker.Item key={index} label={option} value={option} />
                      ))}
                    </Picker>
                  </View>

                  {/* Sapta Dhatu */}
                  <Text style={[styles.fieldLabel, styles.subSectionTitle]}>Sapta Dhatu (Seven Tissues)</Text>
                  
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <Text style={styles.fieldLabel}>Rasa</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={prescriptionForm.rasa}
                          style={styles.picker}
                          onValueChange={(value) => updateFormField('rasa', value)}
                        >
                          <Picker.Item label="Select" value="" />
                          {dhaatuOptions.map((option, index) => (
                            <Picker.Item key={index} label={option} value={option} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    
                    <View style={styles.halfWidth}>
                      <Text style={styles.fieldLabel}>Rakta</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={prescriptionForm.rakta}
                          style={styles.picker}
                          onValueChange={(value) => updateFormField('rakta', value)}
                        >
                          <Picker.Item label="Select" value="" />
                          {dhaatuOptions.map((option, index) => (
                            <Picker.Item key={index} label={option} value={option} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>

                  {/* Dosha */}
                  <Text style={[styles.fieldLabel, styles.subSectionTitle]}>Dosha Assessment</Text>
                  
                  <View style={styles.row}>
                    <View style={styles.thirdWidth}>
                      <Text style={styles.fieldLabel}>Vata</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={prescriptionForm.vata}
                          style={styles.picker}
                          onValueChange={(value) => updateFormField('vata', value)}
                        >
                          <Picker.Item label="Select" value="" />
                          {doshaOptions.map((option, index) => (
                            <Picker.Item key={index} label={option} value={option} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    
                    <View style={styles.thirdWidth}>
                      <Text style={styles.fieldLabel}>Pitta</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={prescriptionForm.pitta}
                          style={styles.picker}
                          onValueChange={(value) => updateFormField('pitta', value)}
                        >
                          <Picker.Item label="Select" value="" />
                          {doshaOptions.map((option, index) => (
                            <Picker.Item key={index} label={option} value={option} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    
                    <View style={styles.thirdWidth}>
                      <Text style={styles.fieldLabel}>Kapha</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={prescriptionForm.kapha}
                          style={styles.picker}
                          onValueChange={(value) => updateFormField('kapha', value)}
                        >
                          <Picker.Item label="Select" value="" />
                          {doshaOptions.map((option, index) => (
                            <Picker.Item key={index} label={option} value={option} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>

                  {/* Additional Assessment Fields */}
                  <TextInput
                    label="Srotas (Channels)"
                    value={prescriptionForm.srotas}
                    onChangeText={(value) => updateFormField('srotas', value)}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={2}
                  />

                  <TextInput
                    label="Nidana (Diagnosis)"
                    value={prescriptionForm.nidana}
                    onChangeText={(value) => updateFormField('nidana', value)}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                  />

                  <TextInput
                    label="Pathyapathya (Dietary & Lifestyle Recommendations)"
                    value={prescriptionForm.pathyapathya}
                    onChangeText={(value) => updateFormField('pathyapathya', value)}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={4}
                  />
                </Card.Content>
              </Card>

              {/* Treatment Section */}
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Chikitsa (Treatment)</Text>
                  <Divider style={styles.divider} />
                  
                  <TextInput
                    label="Treatment Plan"
                    value={prescriptionForm.chikitsa}
                    onChangeText={(value) => updateFormField('chikitsa', value)}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={6}
                    placeholder="Enter detailed treatment plan, medications, procedures, follow-up instructions..."
                  />
                </Card.Content>
              </Card>

              {/* Medication Section */}
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Medicines & Dosage</Text>
                  <Divider style={styles.divider} />
                  
                  {/* Medicine Search */}
                  <TextInput
                    label="Search Medicine"
                    value={search}
                    onChangeText={handleSearch}
                    mode="outlined"
                    style={styles.input}
                    placeholder="Type to search medicines..."
                  />
                  
                  {/* Medicine Selection Chips */}
                  <View style={styles.chipContainer}>
                    <Text style={styles.fieldLabel}>Select Medicine:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
                      {filteredMeds.slice(0, 10).map((med, idx) => (
                        <Chip
                          key={idx}
                          style={[styles.chip, selectedMed === med && styles.selectedChip]}
                          selected={selectedMed === med}
                          onPress={() => setSelectedMed(med)}
                          textStyle={selectedMed === med ? styles.selectedChipText : styles.chipText}
                        >
                          {med}
                        </Chip>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Dosage and Frequency Selection */}
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <Text style={styles.fieldLabel}>Dosage:</Text>
                      <Menu
                        visible={dosageMenuVisible}
                        onDismiss={() => setDosageMenuVisible(false)}
                        anchor={
                          <Button 
                            mode="outlined" 
                            onPress={() => setDosageMenuVisible(true)}
                            style={styles.menuButton}
                          >
                            {dosage || 'Select Dosage'}
                          </Button>
                        }
                      >
                        {dosageOptions.map((opt, idx) => (
                          <Menu.Item 
                            key={idx} 
                            onPress={() => { 
                              setDosage(opt); 
                              setDosageMenuVisible(false); 
                            }} 
                            title={opt} 
                          />
                        ))}
                      </Menu>
                    </View>
                    
                    <View style={styles.halfWidth}>
                      <Text style={styles.fieldLabel}>Frequency:</Text>
                      <Menu
                        visible={frequencyMenuVisible}
                        onDismiss={() => setFrequencyMenuVisible(false)}
                        anchor={
                          <Button 
                            mode="outlined" 
                            onPress={() => setFrequencyMenuVisible(true)}
                            style={styles.menuButton}
                          >
                            {frequency || 'Select Frequency'}
                          </Button>
                        }
                      >
                        {frequencyOptions.map((opt, idx) => (
                          <Menu.Item 
                            key={idx} 
                            onPress={() => { 
                              setFrequency(opt); 
                              setFrequencyMenuVisible(false); 
                            }} 
                            title={opt} 
                          />
                        ))}
                      </Menu>
                    </View>
                  </View>

                  <Button 
                    mode="contained" 
                    onPress={handleAddMedicine} 
                    disabled={!selectedMed || !dosage || !frequency || prescriptions.length >= 20}
                    style={[styles.addMedicineButton, { backgroundColor: '#ff9800' }]}
                  >
                    Add Medicine
                  </Button>
                  
                  <Text style={styles.medicineCounter}>
                    {prescriptions.length} / 20 medicines added
                  </Text>

                  {/* Prescription List */}
                  {prescriptions.length > 0 && (
                    <View style={styles.prescriptionList}>
                      <Text style={[styles.fieldLabel, styles.subSectionTitle]}>Added Medicines:</Text>
                      {prescriptions.map((med, idx) => (
                        <View key={idx} style={styles.medicineItem}>
                          <View style={styles.medicineInfo}>
                            <Text style={styles.medicineName}>{med.name}</Text>
                            <Text style={styles.medicineDetails}>{med.dosage} - {med.frequency}</Text>
                          </View>
                          <IconButton 
                            icon="delete" 
                            iconColor="#d32f2f" 
                            size={20}
                            onPress={() => handleRemoveMedicine(idx)} 
                          />
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Other Advice */}
                  <TextInput
                    label="Additional Advice & Instructions"
                    value={otherAdvice}
                    onChangeText={setOtherAdvice}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    placeholder="Enter additional advice, lifestyle recommendations, follow-up instructions..."
                  />
                </Card.Content>
              </Card>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={[styles.button, styles.cancelButton]}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSavePrescription}
                  loading={loading}
                  disabled={loading}
                  style={[styles.button, styles.saveButton]}
                >
                  Save Prescription
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>

        {/* Diet Chart Modal */}
        <Portal>
          <Modal visible={dietModalVisible} onDismiss={() => setDietModalVisible(false)}
            contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32' }}>
              Assign Diet Chart to {selectedPatient?.name}
            </Text>
            <TextInput
              label="Diet Chart Details"
              value={dietChartText}
              onChangeText={setDietChartText}
              multiline
              numberOfLines={8}
              mode="outlined"
              style={{ marginBottom: 16 }}
              placeholder="Enter diet chart instructions..."
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => setDietModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveDietChart}
                loading={loading}
                disabled={loading || !dietChartText.trim()}
                style={{ flex: 1, marginLeft: 8, backgroundColor: '#2196f3' }}
              >
                Assign Diet Chart
              </Button>
            </View>
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 16,
    maxHeight: '90%',
  },
  modalScrollView: {
    padding: 20,
  },
  modalTitle: {
    marginBottom: 20,
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    color: '#2e7d32',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subSectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#1976d2',
  },
  divider: {
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  halfWidth: {
    flex: 0.48,
  },
  thirdWidth: {
    flex: 0.32,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    flex: 0.48,
  },
  cancelButton: {
    borderColor: '#666',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  // Medication section styles
  chipContainer: {
    marginBottom: 12,
  },
  chipScrollView: {
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 6,
    backgroundColor: '#f5f5f5',
  },
  selectedChip: {
    backgroundColor: '#4caf50',
  },
  chipText: {
    color: '#666',
  },
  selectedChipText: {
    color: 'white',
  },
  menuButton: {
    marginBottom: 12,
  },
  addMedicineButton: {
    marginTop: 12,
    marginBottom: 8,
  },
  medicineCounter: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
  },
  prescriptionList: {
    marginTop: 16,
    marginBottom: 16,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontWeight: 'bold',
    color: '#2e7d32',
    fontSize: 16,
  },
  medicineDetails: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
});
