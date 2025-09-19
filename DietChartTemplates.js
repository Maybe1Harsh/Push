import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Card, Button, Provider as PaperProvider } from 'react-native-paper';
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
      <ScrollView style={{ flex: 1, backgroundColor: '#f3f6fa' }}>
        <View style={{ padding: 20 }}>
          <Text variant="headlineMedium" style={{ marginBottom: 20, color: '#2e7d32', textAlign: 'center' }}>
            Diet Chart Templates
          </Text>
          
          <Text style={{ marginBottom: 20, color: '#666', textAlign: 'center' }}>
            Select a template to customize for your patient
          </Text>

          {dietTemplates.map((template) => (
            <Card key={template.id} style={{ marginBottom: 15, borderRadius: 16, backgroundColor: '#fff' }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ color: '#2e7d32', marginBottom: 8 }}>
                  {template.name}
                </Text>
                <Text style={{ color: '#666', marginBottom: 12 }}>
                  {template.description}
                </Text>
                
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: 4 }}>Sample Meals:</Text>
                  <Text style={{ color: '#666', fontSize: 12 }}>
                    Breakfast: {template.meals.breakfast}
                  </Text>
                  <Text style={{ color: '#666', fontSize: 12 }}>
                    Lunch: {template.meals.lunch}
                  </Text>
                  <Text style={{ color: '#666', fontSize: 12 }}>
                    Dinner: {template.meals.dinner}
                  </Text>
                </View>
                
                <Text style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
                  Guidelines: {template.guidelines}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="contained" 
                  onPress={() => handleCustomizeTemplate(template)}
                  style={{ backgroundColor: '#4caf50' }}
                >
                  Customize for Patient
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </ScrollView>
    </PaperProvider>
  );
}
