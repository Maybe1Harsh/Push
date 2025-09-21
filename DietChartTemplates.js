import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Button, Provider as PaperProvider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from './hooks/useTranslation';

 const dietTemplates = [
  {
    id: 1,
    name: 'Vata Balancing Diet',
    description: 'Light, warm, and nourishing foods for Vata constitution',
    meals: {
      breakfast: 'Garam doodh mein khajoor aur badam, daliya',
      lunch: 'Moong dal khichdi ghee ke saath, paka hua sabzi, chawal',
      dinner: 'Sabzi ka soup, chawal ya soft gehu ki roti',
      snacks: 'Adrak wali chai, bhige hue kishmish, aam ya kele jaise meethay phal'
    },
    guidelines: 'Khaana garam aur paka hua ho. Thanda, kaccha khana na khayein. Ghee aur tel ka upyog karein.'
  },
  {
    id: 2,
    name: 'Pitta Pacifying Diet',
    description: 'Cooling and calming foods for Pitta constitution',
    meals: {
      breakfast: 'Tarbooj, nashpati, anaar, ya saunf ke paani ke saath phal',
      lunch: 'Basmati chawal, moong dal, kakdi, lauki, nariyal wali sabzi',
      dinner: 'Halka khichdi dhaniya-pudina chutney ke saath, ya thandi sabzi ka soup',
      snacks: 'Nariyal paani, meethay phal, gulab ya pudina wali chai'
    },
    guidelines: 'Thanda aur shant karne wala khaana khayein. Teekha aur mirch-masala kam karein.'
  },
  {
    id: 3,
    name: 'Kapha Reducing Diet',
    description: 'Light, warm, and stimulating foods for Kapha constitution',
    meals: {
      breakfast: 'Adrak wali chai shahad ke saath, seb ya nashpati jaise halkay phal',
      lunch: 'Jau ya bajre ki roti, karela, palak, ya dal',
      dinner: 'Sabzi ka garam soup, kali mirch aur haldi ke saath',
      snacks: 'Bhuna chana, tulsi wali chai, anar ya seb'
    },
    guidelines: 'Halka, garam khaana khayein. Tel, dahi, aur bhari khana na khayein. Teekha aur katu swad shamil karein.'
  },
  {
    id: 4,
    name: 'General Ayurvedic Diet',
    description: 'Balanced diet suitable for all constitutions',
    meals: {
      breakfast: 'Seasonal phal (seb, angoor), bhige hue badam, cardamom wala daliya',
      lunch: 'Chawal, dal, roti, paka hua sabzi, salad nimbu ke saath',
      dinner: 'Halka khichdi, sabzi ka soup',
      snacks: 'Herbal chai (adrak, saunf, tulsi), phal, bhige hue nuts'
    },
    guidelines: 'Hamesha taza aur seasonal khana khayein. Chhe ras (meetha, khatta, lavan, katu, tikta, kashaya) shamil karein.'
  },
  {
    id: 5,
    name: 'Detox Diet',
    description: 'Cleansing diet for body purification',
    meals: {
      breakfast: 'Garam nimbu paani shahad ke saath, papita ya seb',
      lunch: 'Moong dal khichdi haldi aur jeera ke saath',
      dinner: 'Sabzi ka saaf soup, kali mirch ke saath',
      snacks: 'Triphala ka kadha, jeera-dhaniya-adrak ka pani, halkay phal'
    },
    guidelines: 'Packet aur bazaar ka khana na khayein. Zyada paani piyein. Safaai karne wali jadi-booti shamil karein.'
  }
];


export default function DietChartTemplatesScreen({ navigation, route }) {
  const { t } = useTranslation();
  const doctorEmail = route.params?.profile?.email;

  const handleCustomizeTemplate = (template) => {
    console.log('Navigating to CustomizeDietChart with:', { template, doctorEmail });
    navigation.navigate('CustomizeDietChart', { 
      template, 
      doctorEmail: route.params?.profile?.email,
      profile: route.params?.profile 
    });
  };

  return (
    <PaperProvider>
      <LinearGradient
        colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>📋</Text>
            </View>
            <Text variant="headlineLarge" style={styles.title}>
              Diet Chart Templates
            </Text>
            <Text style={styles.subtitle}>
              Select a template to customize for your patient
            </Text>
          </View>

          {dietTemplates.map((template) => (
            <Card key={template.id} style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.templateName}>
                  {template.name}
                </Text>
                <Text style={styles.templateDescription}>
                  {template.description}
                </Text>
                
                <View style={styles.mealsContainer}>
                  <Text style={styles.mealsTitle}>Sample Meals:</Text>
                  <Text style={styles.mealText}>
                    Breakfast: {template.meals.breakfast}
                  </Text>
                  <Text style={styles.mealText}>
                    Lunch: {template.meals.lunch}
                  </Text>
                  <Text style={styles.mealText}>
                    Dinner: {template.meals.dinner}
                  </Text>
                </View>
                
                <Text style={styles.guidelinesText}>
                  Guidelines: {template.guidelines}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="contained" 
                  onPress={() => handleCustomizeTemplate(template)}
                  style={styles.primaryButton}
                >
                  Customize for Patient
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </ScrollView>
      </LinearGradient>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
    marginBottom: 20,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  templateName: {
    color: '#2e7d32',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  templateDescription: {
    color: '#424242',
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  mealsContainer: {
    marginBottom: 12,
  },
  mealsTitle: {
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
    fontSize: 14,
  },
  mealText: {
    color: '#424242',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  guidelinesText: {
    color: '#424242',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  primaryButton: {
    backgroundColor: '#4caf50',
    borderRadius: 25,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
