import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';

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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome to Your Dashboard
        </Text>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => navigation.navigate('PatientAppointment', { patientEmail })}
        >
          Request Appointment
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => setShowYoga(!showYoga)} // Toggle visibility
        >
          {showYoga ? 'Hide Yoga Exercises' : 'Show Basic Yoga Exercises'}
        </Button>

        {/* Conditionally render the list of yoga exercises */}
        {showYoga && (
          <View style={styles.yogaSection}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e8f5e9', // Light green background
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#1b5e20', // Darker green for text
  },
  button: {
    marginVertical: 8,
    backgroundColor: '#2e7d32', // A pleasant, medium green
  },
  yogaSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a5d6a7', // Light green border
  },
  yogaHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 15,
  },
  yogaItem: {
    marginBottom: 15,
  },
  yogaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32', // Medium green for pose names
  },
  yogaInstructions: {
    fontSize: 14,
    color: '#388e3c', // Lighter, readable green for instructions
    marginTop: 4,
    lineHeight: 20,
  },
});
