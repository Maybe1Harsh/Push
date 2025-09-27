import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ViruddhaAhara = ({ navigation }) => {
  const foodCombinations = [
    {
      id: 1,
      combination: "Milk + Sour foods",
      example: "Milk with citrus fruits, curd, or sour foods",
      effect: "Causes curdling in the stomach",
      icon: "🥛🍋"
    },
    {
      id: 2,
      combination: "Milk + Fish",
      example: "Consuming milk and fish together",
      effect: "Considered contradictory, may lead to skin disorders",
      icon: "🥛🐟"
    },
    {
      id: 3,
      combination: "Milk + Salt",
      example: "Adding salt to milk or consuming salty foods with milk",
      effect: "Leads to imbalance and toxin formation",
      icon: "🥛🧂"
    },
    {
      id: 4,
      combination: "Fruits + Milk",
      example: "Especially bananas with milk",
      effect: "Can cause heaviness and digestive issues",
      icon: "🍌🥛"
    },
    {
      id: 5,
      combination: "Ghee + Honey (equal proportion)",
      example: "Mixing ghee and honey in equal quantities",
      effect: "Considered toxic if mixed in equal quantity",
      icon: "🍯🧈"
    },
    {
      id: 6,
      combination: "Hot + Cold foods together",
      example: "Drinking cold water immediately after hot tea or coffee",
      effect: "Creates digestive imbalance and affects metabolism",
      icon: "🔥❄️"
    },
    {
      id: 7,
      combination: "Radish + Milk",
      example: "Consuming radish with milk or milk products",
      effect: "Causes stomach upset and skin issues",
      icon: "🥛🥬"
    },
    {
      id: 8,
      combination: "Curd + Night time",
      example: "Eating curd or yogurt at night",
      effect: "Increases kapha and may cause cold/cough",
      icon: "🌙🥛"
    },
    {
      id: 9,
      combination: "Heating honey",
      example: "Cooking or heating honey above 40°C",
      effect: "Heated honey becomes toxic and loses its beneficial properties",
      icon: "🍯🔥"
    }
  ];

  const renderCombinationCard = (item) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.iconText}>{item.icon}</Text>
        <Text style={styles.combinationTitle}>{item.combination}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Example:</Text>
          <Text style={styles.sectionText}>{item.example}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Effect:</Text>
          <Text style={styles.effectText}>{item.effect}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#81C784']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>VIRUDHA AHAR</Text>
          <Text style={styles.headerSubtitle}>Incompatible Food Combinations</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>What is Viruddha Ahara?</Text>
          <Text style={styles.introText}>
            In Ayurveda, Viruddha Ahara refers to incompatible food combinations that can 
            disturb digestion, create toxins in the body, and lead to various health issues. 
            Understanding these combinations helps maintain optimal digestive health.
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Ionicons name="warning" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            Avoiding these combinations is essential for maintaining good digestive health 
            and preventing the formation of toxins (Ama) in the body.
          </Text>
        </View>

        {foodCombinations.map(renderCombinationCard)}

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>General Guidelines:</Text>
          <Text style={styles.tipText}>• Wait at least 1-2 hours between different food groups</Text>
          <Text style={styles.tipText}>• Eat fruits separately, preferably on an empty stomach</Text>
          <Text style={styles.tipText}>• Avoid mixing dairy with sour or salty foods</Text>
          <Text style={styles.tipText}>• Be mindful of food temperatures - avoid extreme contrasts</Text>
          <Text style={styles.tipText}>• Listen to your body's response to different combinations</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#E65100',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconText: {
    fontSize: 24,
    marginRight: 15,
  },
  combinationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  cardContent: {
    padding: 20,
    paddingTop: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  effectText: {
    fontSize: 14,
    color: '#d32f2f',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  tipsSection: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    marginVertical: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  tipText: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 22,
    marginBottom: 5,
  },
});

export default ViruddhaAhara;