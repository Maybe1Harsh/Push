import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal, Provider as PaperProvider } from 'react-native-paper';
import { supabase } from './supabaseClient';
import { useTranslation } from './hooks/useTranslation';

console.log('CustomizeDietChart.js loaded');

export default function CustomizeDietChartScreen({ navigation, route }) {
  try {
    const { t } = useTranslation();
    const params = route?.params || {};
    const template = params.template;
    // fallback for doctorEmail for testing
    const doctorEmail = params.doctorEmail || 'test@doctor.com';

    // Debug log
    console.log('CustomizeDietChartScreen route.params:', params);

    // Fallback UI for direct testing (no navigation)
    if (!route) {
      return (
        <PaperProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa' }}>
            <Text style={{ color: '#d32f2f', fontSize: 18 }}>No navigation object received!</Text>
          </View>
        </PaperProvider>
      );
    }

    if (!params || !template || !template.meals) {
      return (
        <PaperProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa' }}>
            <Text variant="headlineMedium" style={{ color: '#d32f2f', marginBottom: 16 }}>
              Error: Diet template not found.
            </Text>
            <Text style={{ color: '#666', textAlign: 'center' }}>
              Please go back and select a diet template again.
            </Text>
            <Button mode="contained" style={{ marginTop: 24 }} onPress={() => navigation?.goBack && navigation.goBack()}>
              Go Back
            </Button>
          </View>
        </PaperProvider>
      );
    }

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [customizedDiet, setCustomizedDiet] = useState({
      breakfast: template.meals.breakfast,
      lunch: template.meals.lunch,
      dinner: template.meals.dinner,
      snacks: template.meals.snacks,
      guidelines: template.guidelines,
      additionalNotes: ''
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      fetchPatients();
    }, [doctorEmail]);

    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('doctor_email', doctorEmail);

        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    const handleAssignDiet = (patient) => {
      setSelectedPatient(patient);
      setModalVisible(true);
    };

    const handleSaveDietChart = async () => {
      if (!selectedPatient) return;

      setLoading(true);
      try {
        const dietText = `
Diet Chart: ${template.name}

BREAKFAST:
${customizedDiet.breakfast}

LUNCH:
${customizedDiet.lunch}

DINNER:
${customizedDiet.dinner}

SNACKS:
${customizedDiet.snacks}

GUIDELINES:
${customizedDiet.guidelines}

${customizedDiet.additionalNotes ? `ADDITIONAL NOTES:\n${customizedDiet.additionalNotes}` : ''}
        `.trim();

        const { error } = await supabase
          .from('diet_charts')
          .insert([{
            patient_email: selectedPatient.email,
            diet_chart_text: dietText,
            created_at: new Date().toISOString(),
            doctor_email: doctorEmail
          }]);

        if (error) throw error;

        setModalVisible(false);
        alert('Diet chart assigned successfully!');
      } catch (error) {
        console.error('Error saving diet chart:', error);
        alert('Failed to assign diet chart. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    console.log('CustomizeDietChart props:', { template, doctorEmail, patients, selectedPatient, customizedDiet });

    return (
      <PaperProvider>
        <ScrollView style={{ flex: 1, backgroundColor: '#f3f6fa' }}>
          <View style={{ padding: 20 }}>
            <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32', textAlign: 'center' }}>
              Customize Diet Chart
            </Text>
            
            <Card style={{ marginBottom: 20, borderRadius: 16, backgroundColor: '#fff' }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ color: '#2e7d32', marginBottom: 16 }}>
                  Template: {template.name}
                </Text>
                
                <TextInput
                  label="Breakfast"
                  value={customizedDiet.breakfast}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, breakfast: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                />
                
                <TextInput
                  label="Lunch"
                  value={customizedDiet.lunch}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, lunch: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                />
                
                <TextInput
                  label="Dinner"
                  value={customizedDiet.dinner}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, dinner: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                />
                
                <TextInput
                  label="Snacks"
                  value={customizedDiet.snacks}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, snacks: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                />
                
                <TextInput
                  label="Guidelines"
                  value={customizedDiet.guidelines}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, guidelines: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                />
                
                <TextInput
                  label="Additional Notes (Optional)"
                  value={customizedDiet.additionalNotes}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, additionalNotes: text})}
                  multiline
                  numberOfLines={3}
                  mode="outlined"
                  style={{ marginBottom: 16 }}
                  placeholder="Add any specific instructions or modifications..."
                />
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={{ marginBottom: 16, color: '#2e7d32' }}>
              Assign to Patient:
            </Text>
            
            {patients.length === 0 ? (
              <Card style={{ padding: 20, borderRadius: 16, backgroundColor: '#fff' }}>
                <Text style={{ textAlign: 'center', color: '#666' }}>
                  No patients assigned yet. Add patients to assign diet charts.
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
                      onPress={() => handleAssignDiet(patient)}
                      style={{ backgroundColor: '#4caf50' }}
                    >
                      Assign Diet Chart
                    </Button>
                  </Card.Actions>
                </Card>
              ))
            )}
          </View>

          <Portal>
            <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} 
                   contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16 }}>
              <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32' }}>
                Assign Diet Chart to {selectedPatient?.name}
              </Text>
              
              <Text style={{ marginBottom: 16, color: '#666' }}>
                Are you sure you want to assign this customized diet chart to {selectedPatient?.name}?
              </Text>
              
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
                  onPress={handleSaveDietChart}
                  loading={loading}
                  disabled={loading}
                  style={{ flex: 1, marginLeft: 8, backgroundColor: '#4caf50' }}
                >
                  Assign Diet Chart
                </Button>
              </View>
            </Modal>
          </Portal>
        </ScrollView>
      </PaperProvider>
    );
  } catch (err) {
    // Catch any unexpected error and show it
    return (
      <PaperProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa' }}>
          <Text style={{ color: '#d32f2f', fontSize: 18 }}>Unexpected error: {String(err.message || err)}</Text>
        </View>
      </PaperProvider>
    );
  }
}
