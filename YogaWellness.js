import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Button, Card, Portal, Modal, Provider as PaperProvider } from 'react-native-paper';
import { useTranslation } from './hooks/useTranslation';
import YogaPoses from './YogaPoses';
import MeditationBreathing from './MeditationBreathing';

const YogaWellness = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState('main');

  const renderMainView = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🧘‍♀️ Yoga & Wellness</Text>
      <Text style={styles.subtitle}>Transform your mind and body through ancient practices</Text>
      
      <Card style={styles.featureCard} onPress={() => setCurrentView('poses')}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.featureHeader}>
            <Text style={styles.featureEmoji}>🧘‍♀️</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Yoga Poses</Text>
              <Text style={styles.featureDescription}>
                Discover traditional yoga asanas for strength, flexibility, and balance
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </View>
          <View style={styles.featureStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8+</Text>
              <Text style={styles.statLabel}>Poses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>All Levels</Text>
              <Text style={styles.statLabel}>Difficulty</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.featureCard} onPress={() => setCurrentView('meditation')}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.featureHeader}>
            <Text style={styles.featureEmoji}>🧘‍♂️</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Meditation & Breathing</Text>
              <Text style={styles.featureDescription}>
                Guided breathing exercises and meditation techniques for inner peace
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </View>
          <View style={styles.featureStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>6+</Text>
              <Text style={styles.statLabel}>Techniques</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>Interactive</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.benefitsCard}>
        <Card.Content>
          <Text style={styles.benefitsTitle}>🌟 Benefits of Regular Practice</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>• Reduces stress and anxiety</Text>
            <Text style={styles.benefitItem}>• Improves flexibility and strength</Text>
            <Text style={styles.benefitItem}>• Enhances mental clarity</Text>
            <Text style={styles.benefitItem}>• Promotes better sleep</Text>
            <Text style={styles.benefitItem}>• Boosts immune system</Text>
            <Text style={styles.benefitItem}>• Increases mindfulness</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          💡 Tip: Start with beginner poses and gradually progress. Listen to your body and never force any movement.
        </Text>
      </View>
    </ScrollView>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Button 
        mode="text" 
        onPress={() => setCurrentView('main')}
        style={styles.backButton}
        icon="arrow-left"
        textColor="#2e7d32"
      >
        Back to Yoga
      </Button>
    </View>
  );

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        {currentView === 'main' && renderMainView()}
        {currentView === 'poses' && (
          <>
            {renderHeader()}
            <YogaPoses />
          </>
        )}
        {currentView === 'meditation' && (
          <>
            {renderHeader()}
            <MeditationBreathing />
          </>
        )}
      </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  featureCard: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#f1f8e9',
    elevation: 6,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#4caf50',
  },
  cardContent: {
    padding: 20,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  arrow: {
    fontSize: 24,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  featureStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#c8e6c9',
    borderRadius: 12,
    padding: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  statLabel: {
    fontSize: 12,
    color: '#000000',
    marginTop: 2,
  },
  benefitsCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#f1f8e9',
    elevation: 4,
    borderWidth: 2,
    borderColor: '#c8e6c9',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitsList: {
    paddingHorizontal: 10,
  },
  benefitItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: '#c8e6c9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#2e7d32',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  headerContainer: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
});

export default YogaWellness;