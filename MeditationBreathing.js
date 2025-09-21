import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Vibration } from 'react-native';
import { Text, Button, Card, Modal, Portal, Provider as PaperProvider, ProgressBar } from 'react-native-paper';
import { useTranslation } from './hooks/useTranslation';

const meditationExercises = {
  "Box Breathing": {
    description: "A calming breathing technique used by Navy SEALs",
    benefits: "Reduces stress, improves focus, calms nervous system",
    instructions: "Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat.",
    duration: "5-10 minutes",
    pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    difficulty: "Beginner"
  },
  "4-7-8 Breathing": {
    description: "A powerful technique for relaxation and sleep",
    benefits: "Promotes sleep, reduces anxiety, calms mind",
    instructions: "Inhale for 4 counts, hold for 7, exhale for 8. Repeat 4 cycles.",
    duration: "2-5 minutes",
    pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    difficulty: "Beginner"
  },
  "Mindfulness Meditation": {
    description: "Focus on the present moment without judgment",
    benefits: "Increases awareness, reduces stress, improves emotional regulation",
    instructions: "Sit comfortably, focus on your breath, observe thoughts without judgment",
    duration: "10-20 minutes",
    pattern: null,
    difficulty: "Intermediate"
  },
  "Body Scan": {
    description: "Progressive relaxation through body awareness",
    benefits: "Releases tension, promotes relaxation, improves body awareness",
    instructions: "Focus on each part of your body from toes to head, releasing tension",
    duration: "15-30 minutes",
    pattern: null,
    difficulty: "Beginner"
  },
  "Loving Kindness": {
    description: "Cultivation of compassion and positive emotions",
    benefits: "Increases positive emotions, reduces negative thoughts, improves relationships",
    instructions: "Send loving thoughts to yourself, loved ones, neutral people, and all beings",
    duration: "10-20 minutes",
    pattern: null,
    difficulty: "Intermediate"
  },
  "Alternate Nostril Breathing": {
    description: "Balancing breathing technique from yoga tradition",
    benefits: "Balances nervous system, improves focus, calms mind",
    instructions: "Use thumb and ring finger to alternate blocking nostrils while breathing",
    duration: "5-10 minutes",
    pattern: { inhale: 4, hold1: 2, exhale: 4, hold2: 0 },
    difficulty: "Intermediate"
  }
};

const MeditationBreathing = () => {
  const { t } = useTranslation();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive && selectedExercise) {
      handlePhaseChange();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleExerciseSelect = (exerciseName) => {
    setSelectedExercise(exerciseName);
    setModalVisible(true);
    setIsActive(false);
    setCycleCount(0);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedExercise(null);
    setIsActive(false);
    setTimeLeft(0);
    setCycleCount(0);
  };

  const startExercise = () => {
    const exercise = meditationExercises[selectedExercise];
    if (exercise.pattern) {
      setCurrentPhase('inhale');
      setTimeLeft(exercise.pattern.inhale);
      setTotalTime(exercise.pattern.inhale);
      setIsActive(true);
      setCycleCount(0);
    } else {
      // For meditation exercises without breathing patterns
      setIsActive(true);
      setTimeLeft(10 * 60); // 10 minutes default
      setTotalTime(10 * 60);
    }
  };

  const stopExercise = () => {
    setIsActive(false);
    setTimeLeft(0);
    setCycleCount(0);
  };

  const handlePhaseChange = () => {
    const exercise = meditationExercises[selectedExercise];
    if (!exercise.pattern) return;

    Vibration.vibrate(100);

    switch (currentPhase) {
      case 'inhale':
        if (exercise.pattern.hold1 > 0) {
          setCurrentPhase('hold1');
          setTimeLeft(exercise.pattern.hold1);
          setTotalTime(exercise.pattern.hold1);
        } else {
          setCurrentPhase('exhale');
          setTimeLeft(exercise.pattern.exhale);
          setTotalTime(exercise.pattern.exhale);
        }
        break;
      case 'hold1':
        setCurrentPhase('exhale');
        setTimeLeft(exercise.pattern.exhale);
        setTotalTime(exercise.pattern.exhale);
        break;
      case 'exhale':
        if (exercise.pattern.hold2 > 0) {
          setCurrentPhase('hold2');
          setTimeLeft(exercise.pattern.hold2);
          setTotalTime(exercise.pattern.hold2);
        } else {
          setCurrentPhase('inhale');
          setTimeLeft(exercise.pattern.inhale);
          setTotalTime(exercise.pattern.inhale);
          setCycleCount(prev => prev + 1);
        }
        break;
      case 'hold2':
        setCurrentPhase('inhale');
        setTimeLeft(exercise.pattern.inhale);
        setTotalTime(exercise.pattern.inhale);
        setCycleCount(prev => prev + 1);
        break;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return '#4caf50';
      case 'Intermediate': return '#ff9800';
      case 'Advanced': return '#f44336';
      default: return '#4caf50';
    }
  };

  const getPhaseInstruction = () => {
    switch(currentPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
      default: return 'Meditate';
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>🧘‍♂️ Meditation & Breathing</Text>
        <Text style={styles.subtitle}>Find peace through mindful breathing and meditation</Text>
        
        <View style={styles.grid}>
          {Object.entries(meditationExercises).map(([exerciseName, exerciseData]) => (
            <Card
              key={exerciseName}
              style={styles.card}
              onPress={() => handleExerciseSelect(exerciseName)}
            >
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>{exerciseName}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {exerciseData.description}
                </Text>
                <View style={styles.cardInfo}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exerciseData.difficulty) }]}>
                    <Text style={styles.difficultyText}>{exerciseData.difficulty}</Text>
                  </View>
                  <Text style={styles.durationText}>{exerciseData.duration}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Portal>
          <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
            {selectedExercise && (
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedExercise}</Text>
                
                {isActive && (
                  <View style={styles.activeSession}>
                    <Text style={styles.phaseText}>{getPhaseInstruction()}</Text>
                    {meditationExercises[selectedExercise].pattern && (
                      <>
                        <Text style={styles.timerText}>{timeLeft}</Text>
                        <ProgressBar 
                          progress={1 - (timeLeft / totalTime)} 
                          color="#4caf50" 
                          style={styles.progressBar}
                        />
                        <Text style={styles.cycleText}>Cycle: {cycleCount + 1}</Text>
                      </>
                    )}
                    {!meditationExercises[selectedExercise].pattern && (
                      <>
                        <Text style={styles.timerText}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
                        <ProgressBar 
                          progress={1 - (timeLeft / totalTime)} 
                          color="#4caf50" 
                          style={styles.progressBar}
                        />
                      </>
                    )}
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>📖 Description</Text>
                  <Text style={styles.sectionText}>{meditationExercises[selectedExercise].description}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>✨ Benefits</Text>
                  <Text style={styles.sectionText}>{meditationExercises[selectedExercise].benefits}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>📋 Instructions</Text>
                  <Text style={styles.sectionText}>{meditationExercises[selectedExercise].instructions}</Text>
                </View>

                <View style={styles.exerciseInfo}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(meditationExercises[selectedExercise].difficulty) }]}>
                    <Text style={styles.difficultyText}>{meditationExercises[selectedExercise].difficulty}</Text>
                  </View>
                  <Text style={styles.durationInfo}>Duration: {meditationExercises[selectedExercise].duration}</Text>
                </View>

                <View style={styles.buttonContainer}>
                  {!isActive ? (
                    <Button 
                      mode="contained" 
                      onPress={startExercise} 
                      style={styles.startButton}
                      icon="play"
                    >
                      Start Session
                    </Button>
                  ) : (
                    <Button 
                      mode="outlined" 
                      onPress={stopExercise} 
                      style={styles.stopButton}
                      textColor="#f44336"
                      icon="stop"
                    >
                      Stop Session
                    </Button>
                  )}
                  
                  <Button 
                    mode="text" 
                    onPress={hideModal} 
                    style={styles.closeButton}
                    textColor="#000000"
                  >
                    Close
                  </Button>
                </View>
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
  cardInfo: {
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 20,
  },
  activeSession: {
    backgroundColor: '#f1f8e9',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  cycleText: {
    fontSize: 16,
    color: '#000000',
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
  exerciseInfo: {
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
  buttonContainer: {
    gap: 10,
  },
  startButton: {
    backgroundColor: '#4caf50',
  },
  stopButton: {
    borderColor: '#f44336',
  },
  closeButton: {
    marginTop: 5,
  },
});

export default MeditationBreathing;