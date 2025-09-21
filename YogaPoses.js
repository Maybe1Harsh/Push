import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Image } from 'react-native';
import { Text, Button, Card, Modal, Portal, Provider as PaperProvider } from 'react-native-paper';
import { useTranslation } from './hooks/useTranslation';

const yogaPoses = {
  "Mountain Pose (Tadasana)": {
    description: "A foundational standing pose that improves posture and balance",
    benefits: "Improves posture, strengthens legs and core, calms the mind",
    steps: "1. Stand with feet hip-width apart\n2. Engage thigh muscles and lift kneecaps\n3. Lengthen spine and relax shoulders\n4. Breathe deeply for 30-60 seconds",
    precautions: "Avoid if you have low blood pressure or headaches",
    difficulty: "Beginner",
    duration: "30-60 seconds"
  },
  "Downward Dog (Adho Mukha Svanasana)": {
    description: "An inverted pose that stretches the entire body",
    benefits: "Stretches hamstrings and calves, strengthens arms and shoulders, energizes the body",
    steps: "1. Start on hands and knees\n2. Tuck toes under and lift hips up\n3. Straighten legs and create inverted V shape\n4. Hold for 1-3 minutes",
    precautions: "Avoid if you have wrist injuries or high blood pressure",
    difficulty: "Beginner",
    duration: "1-3 minutes"
  },
  "Child's Pose (Balasana)": {
    description: "A resting pose that gently stretches the back and calms the mind",
    benefits: "Relieves stress and anxiety, stretches hips and thighs, calms the nervous system",
    steps: "1. Kneel on the floor with big toes touching\n2. Sit back on heels and separate knees\n3. Fold forward and rest forehead on floor\n4. Extend arms forward or alongside body",
    precautions: "Avoid if you have knee injuries or pregnancy complications",
    difficulty: "Beginner",
    duration: "1-5 minutes"
  },
  "Warrior I (Virabhadrasana I)": {
    description: "A standing pose that builds strength and stability",
    benefits: "Strengthens legs and core, opens hips and chest, improves balance",
    steps: "1. Step left foot back 3-4 feet\n2. Turn left foot out 45 degrees\n3. Bend right knee over ankle\n4. Raise arms overhead\n5. Hold for 30-60 seconds, repeat other side",
    precautions: "Avoid if you have knee or shoulder injuries",
    difficulty: "Intermediate",
    duration: "30-60 seconds each side"
  },
  "Tree Pose (Vrikshasana)": {
    description: "A balancing pose that improves focus and stability",
    benefits: "Improves balance and concentration, strengthens legs and core, calms the mind",
    steps: "1. Stand with feet hip-width apart\n2. Shift weight to left foot\n3. Place right foot on inner left thigh or calf\n4. Bring palms together at heart center\n5. Hold for 30-60 seconds, repeat other side",
    precautions: "Avoid placing foot on side of knee, use wall for support if needed",
    difficulty: "Intermediate",
    duration: "30-60 seconds each side"
  },
  "Cat-Cow Pose (Marjaryasana-Bitilasana)": {
    description: "A gentle flow between two poses that warms the spine",
    benefits: "Improves spinal flexibility, relieves back tension, calms the mind",
    steps: "1. Start on hands and knees\n2. Inhale, arch back and look up (Cow)\n3. Exhale, round spine and tuck chin (Cat)\n4. Repeat slowly 5-10 times",
    precautions: "Move slowly and avoid if you have neck injuries",
    difficulty: "Beginner",
    duration: "5-10 repetitions"
  },
  "Cobra Pose (Bhujangasana)": {
    description: "A backbend that strengthens the spine and opens the chest",
    benefits: "Strengthens spine, opens chest and shoulders, improves posture",
    steps: "1. Lie face down with palms under shoulders\n2. Press forearms and palms down\n3. Lift chest and head, keeping hips on floor\n4. Hold for 15-30 seconds",
    precautions: "Avoid if you have back injuries or are pregnant",
    difficulty: "Intermediate",
    duration: "15-30 seconds"
  },
  "Seated Forward Bend (Paschimottanasana)": {
    description: "A seated pose that stretches the back body and calms the mind",
    benefits: "Stretches spine and hamstrings, calms nervous system, aids digestion",
    steps: "1. Sit with legs extended straight\n2. Inhale and lengthen spine\n3. Exhale and fold forward from hips\n4. Reach for feet or shins\n5. Hold for 1-3 minutes",
    precautions: "Bend knees if you have tight hamstrings, avoid if you have lower back injuries",
    difficulty: "Intermediate",
    duration: "1-3 minutes"
  }
};

const YogaPoses = () => {
  const { t } = useTranslation();
  const [selectedPose, setSelectedPose] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePoseSelect = (pose) => {
    setSelectedPose(pose);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedPose(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return '#4caf50';
      case 'Intermediate': return '#ff9800';
      case 'Advanced': return '#f44336';
      default: return '#4caf50';
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>🧘‍♀️ Yoga Poses</Text>
        <Text style={styles.subtitle}>Discover ancient poses for modern wellness</Text>
        
        <View style={styles.grid}>
          {Object.entries(yogaPoses).map(([poseName, poseData]) => (
            <Card
              key={poseName}
              style={styles.card}
              onPress={() => handlePoseSelect(poseName)}
            >
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>{poseName}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {poseData.description}
                </Text>
                <View style={styles.difficultyContainer}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(poseData.difficulty) }]}>
                    <Text style={styles.difficultyText}>{poseData.difficulty}</Text>
                  </View>
                  <Text style={styles.durationText}>{poseData.duration}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Portal>
          <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
            {selectedPose && (
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedPose}</Text>
                
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>📖 Description</Text>
                  <Text style={styles.sectionText}>{yogaPoses[selectedPose].description}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>✨ Benefits</Text>
                  <Text style={styles.sectionText}>{yogaPoses[selectedPose].benefits}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>👣 Steps</Text>
                  <Text style={styles.sectionText}>{yogaPoses[selectedPose].steps}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>⚠️ Precautions</Text>
                  <Text style={styles.sectionText}>{yogaPoses[selectedPose].precautions}</Text>
                </View>

                <View style={styles.poseInfo}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(yogaPoses[selectedPose].difficulty) }]}>
                    <Text style={styles.difficultyText}>{yogaPoses[selectedPose].difficulty}</Text>
                  </View>
                  <Text style={styles.durationInfo}>Duration: {yogaPoses[selectedPose].duration}</Text>
                </View>

                <Button 
                  mode="contained" 
                  onPress={hideModal} 
                  style={styles.closeButton}
                  icon="close"
                >
                  Close
                </Button>
              </ScrollView>
            )}
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#e8f5e8',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 16,
    backgroundColor: '#f1f8e9',
    elevation: 4,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 10,
    color: '#000000',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    borderColor: '#4caf50',
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#f1f8e9',
    padding: 10,
    borderRadius: 8,
  },
  poseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  durationInfo: {
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#4caf50',
    marginTop: 10,
  },
});

export default YogaPoses;