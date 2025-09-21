import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

// Data for the 10 basic yoga exercises
const yogaExercises = [
  {
    name: '1. Mountain Pose (Tadasana)',
    instructions: 'Stand tall with feet together, shoulders relaxed, and weight even. Breathe deeply, feeling grounded.'
  },
  {
    name: '2. Downward-Facing Dog (Adho Mukha Svanasana)',
    instructions: 'Start on hands and knees. Lift your hips up and back into an inverted "V" shape. Keep your head between your upper arms.'
  },
  {
    name: '3. Warrior I (Virabhadrasana I)',
    instructions: 'Step one foot back. Bend your front knee to 90 degrees. Raise your arms straight up, palms facing each other.'
  },
  {
    name: '4. Tree Pose (Vrksasana)',
    instructions: 'Place the sole of one foot on your opposite inner thigh or calf (not the knee). Bring hands together at your chest.'
  },
  {
    name: '5. Triangle Pose (Trikonasana)',
    instructions: 'Stand with feet wide. Turn one foot out 90 degrees. Hinge at your hip, bringing one hand to your shin and extending the other arm up.'
  },
  {
    name: '6. Bridge Pose (Setu Bandhasana)',
    instructions: 'Lie on your back with knees bent. Press your feet into the floor and lift your hips toward the ceiling.'
  },
  {
    name: '7. Cobra Pose (Bhujangasana)',
    instructions: 'Lie on your stomach with hands under your shoulders. Slowly lift your head and chest, keeping your hips on the floor.'
  },
  {
    name: '8. Seated Forward Bend (Paschimottanasana)',
    instructions: 'Sit with legs extended. Inhale to lengthen your spine, then exhale and fold forward over your legs.'
  },
  {
    name: '9. Cat-Cow Stretch (Marjaryasana-Bitilasana)',
    instructions: 'On hands and knees, inhale to drop your belly and look up (Cow). Exhale to round your spine (Cat).'
  },
  {
    name: '10. Child\'s Pose (Balasana)',
    instructions: 'Kneel, sit back on your heels, and fold forward, resting your forehead on the floor. Extend arms forward or rest them by your sides.'
  }
];

export default function PatientDashboard({ navigation, route }) {
  const { patientEmail } = route.params;
  // State to control the visibility of the yoga exercises
  const [showYoga, setShowYoga] = React.useState(false);

  return (
    <LinearGradient
      colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🧘‍♀️</Text>
          </View>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome to Your Dashboard
          </Text>
          <Text style={styles.subtitle}>
            Your wellness journey starts here
          </Text>
        </View>
        <Button
          mode="contained"
          style={styles.primaryButton}
          onPress={() => navigation.navigate('PatientAppointment', { patientEmail })}
        >
          Request Appointment
        </Button>
        <Button
          mode="contained"
          style={styles.primaryButton}
          onPress={() => setShowYoga(!showYoga)} // Toggle visibility
        >
          {showYoga ? 'Hide Yoga Exercises' : 'Show Basic Yoga Exercises'}
        </Button>

        {/* Conditionally render the list of yoga exercises */}
        {showYoga && (
          <View style={styles.yogaCard}>
            <Text style={styles.yogaHeader}>10 Basic Yoga Exercises</Text>
            {yogaExercises.map((exercise, index) => (
              <View key={index} style={styles.yogaItem}>
                <Text style={styles.yogaTitle}>{exercise.name}</Text>
                <Text style={styles.yogaInstructions}>{exercise.instructions}</Text>
              </View>
            ))}
          </View>
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
    flexGrow: 1,
    padding: 20,
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
  },
  primaryButton: {
    marginVertical: 8,
    backgroundColor: '#4caf50',
    borderRadius: 25,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  yogaCard: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  yogaHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 15,
  },
  yogaItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  yogaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  yogaInstructions: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});
