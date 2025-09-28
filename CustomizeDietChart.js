import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal, Provider as PaperProvider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
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
          <LinearGradient
            colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
            style={styles.gradient}
          >
            <View style={styles.centerContainer}>
              <Text style={styles.errorTitle}>No navigation object received!</Text>
            </View>
          </LinearGradient>
        </PaperProvider>
      );
    }

    if (!params || !template || !template.meals) {
      // Check if we have a pre-selected patient but no template
      if (params.selectedPatient && !template) {
        return (
          <PaperProvider>
            <LinearGradient
              colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
              style={styles.gradient}
            >
              <View style={styles.centerContainer}>
                <Text variant="headlineMedium" style={styles.errorTitle}>
                  No template selected
                </Text>
                <Text style={styles.errorSubtitle}>
                  Please select a diet chart template first or go through the templates screen.
                </Text>
                <Button mode="contained" style={styles.primaryButton} onPress={() => navigation?.navigate('DietChartTemplates', params)}>
                  Choose Template
                </Button>
                <Button mode="outlined" style={[styles.primaryButton, {marginTop: 10}]} onPress={() => navigation?.goBack && navigation.goBack()}>
                  Go Back
                </Button>
              </View>
            </LinearGradient>
          </PaperProvider>
        );
      }
      
      return (
        <PaperProvider>
          <LinearGradient
            colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
            style={styles.gradient}
          >
            <View style={styles.centerContainer}>
              <Text variant="headlineMedium" style={styles.errorTitle}>
                Error: Diet template not found.
              </Text>
              <Text style={styles.errorSubtitle}>
                Please go back and select a diet template again.
              </Text>
              <Button mode="contained" style={styles.primaryButton} onPress={() => navigation?.goBack && navigation.goBack()}>
                Go Back
              </Button>
            </View>
          </LinearGradient>
        </PaperProvider>
      );
    }

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(params.selectedPatient || null);
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
      
      // If a patient was pre-selected from dashboard, show modal directly
      if (params.selectedPatient && template) {
        console.log('Pre-selected patient from dashboard:', params.selectedPatient);
        setModalVisible(true);
      }
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
        <LinearGradient
          colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
          style={styles.gradient}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={28} color="#333" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>🍽️</Text>
              </View>
              <Text variant="headlineLarge" style={styles.title}>
                Customize Diet Chart
              </Text>
              <Text style={styles.subtitle}>
                Template: {template.name}
              </Text>
              {params.selectedPatient && (
                <Text style={[styles.subtitle, { color: '#4caf50', fontWeight: 'bold' }]}>
                  For: {params.selectedPatient.name}
                </Text>
              )}
            </View>
            
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  📋 Diet Plan Customization
                </Text>
                
                <TextInput
                  label="Breakfast"
                  value={customizedDiet.breakfast}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, breakfast: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={styles.textInput}
                  textColor="#2C3E50"
                  contentStyle={{ color: '#000000' }}
                />
                
                <TextInput
                  label="Lunch"
                  value={customizedDiet.lunch}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, lunch: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={styles.textInput}
                  textColor="#2C3E50"
                  contentStyle={{ color: '#000000' }}
                />
                
                <TextInput
                  label="Dinner"
                  value={customizedDiet.dinner}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, dinner: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={styles.textInput}
                  textColor="#2C3E50"
                  contentStyle={{ color: '#000000' }}
                />
                
                <TextInput
                  label="Snacks"
                  value={customizedDiet.snacks}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, snacks: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={styles.textInput}
                  textColor="#2C3E50"
                  contentStyle={{ color: '#000000' }}
                />
                
                <TextInput
                  label="Guidelines"
                  value={customizedDiet.guidelines}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, guidelines: text})}
                  multiline
                  numberOfLines={2}
                  mode="outlined"
                  style={styles.textInput}
                  textColor="#2C3E50"
                  contentStyle={{ color: '#000000' }}
                />
                
                <TextInput
                  label="Additional Notes (Optional)"
                  value={customizedDiet.additionalNotes}
                  onChangeText={(text) => setCustomizedDiet({...customizedDiet, additionalNotes: text})}
                  multiline
                  numberOfLines={3}
                  mode="outlined"
                  style={styles.textInput}
                  placeholder="Add any specific instructions or modifications..."
                  textColor="#2C3E50"
                  contentStyle={{ color: '#000000' }}
                />
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              👤 Assign to Patient:
            </Text>
            
            {/* Show pre-selected patient if available */}
            {params.selectedPatient ? (
              <Card style={[styles.card, { borderColor: '#4caf50', borderWidth: 2 }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.patientName, { color: '#4caf50' }]}>
                    ✓ {params.selectedPatient.name} (Pre-selected)
                  </Text>
                  <Text style={styles.bodyText}>
                    Email: {params.selectedPatient.email}
                  </Text>
                  <Text style={styles.bodyText}>
                    Age: {params.selectedPatient.age}
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <Button 
                    mode="contained" 
                    onPress={() => handleAssignDiet(params.selectedPatient)}
                    style={[styles.primaryButton, { backgroundColor: '#4caf50' }]}
                  >
                    Assign Diet Chart to {params.selectedPatient.name}
                  </Button>
                </Card.Actions>
              </Card>
            ) : patients.length === 0 ? (
              <Card style={styles.card}>
                <Card.Content style={styles.emptyCardContent}>
                  <Text style={styles.emptyTitle}>
                    No patients assigned yet
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Add patients to assign diet charts.
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              patients.map((patient) => (
                <Card key={patient.id} style={styles.card}>
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.patientName}>
                      {patient.name}
                    </Text>
                    <Text style={styles.bodyText}>
                      Email: {patient.email}
                    </Text>
                    <Text style={styles.bodyText}>
                      Age: {patient.age}
                    </Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button 
                      mode="contained" 
                      onPress={() => handleAssignDiet(patient)}
                      style={styles.primaryButton}
                    >
                      Assign Diet Chart
                    </Button>
                  </Card.Actions>
                </Card>
              ))
            )}

          <Portal>
            <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} 
                   contentContainerStyle={styles.modalContent}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Assign Diet Chart to {selectedPatient?.name}
              </Text>
              
              <Text style={styles.modalText}>
                Are you sure you want to assign this customized diet chart to {selectedPatient?.name}?
              </Text>
              
              <View style={styles.modalButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveDietChart}
                  loading={loading}
                  disabled={loading}
                  style={styles.confirmButton}
                >
                  Assign Diet Chart
                </Button>
              </View>
            </Modal>
          </Portal>
          </ScrollView>
        </LinearGradient>
      </PaperProvider>
    );
  } catch (err) {
    // Catch any unexpected error and show it
    return (
      <PaperProvider>
        <LinearGradient
          colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
          style={styles.gradient}
        >
          <View style={styles.centerContainer}>
            <Text style={styles.errorTitle}>Unexpected error: {String(err.message || err)}</Text>
          </View>
        </LinearGradient>
      </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    backgroundColor: '#ffffff',
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
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  sectionTitle: {
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 16,
  },
  textInput: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20,
  },
  patientName: {
    color: '#000000',
    marginBottom: 8,
  },
  bodyText: {
    color: '#000000',
    marginBottom: 8,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#96B6C5',
    borderRadius: 25,
    shadowColor: '#96B6C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContent: {
    backgroundColor: '#F1F0E8',
    padding: 24,
    margin: 24,
    borderRadius: 15,
    shadowColor: '#96B6C5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  modalTitle: {
    marginBottom: 16,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 16,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#96B6C5',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#96B6C5',
  },
  errorTitle: {
    color: '#d32f2f',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorSubtitle: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});
