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
      breakfast: 'Warm oatmeal with ghee, dates, and almonds',
      lunch: 'Rice with dal, cooked vegetables, and warm spices',
      dinner: 'Light soup with rice or quinoa',
      snacks: 'Warm herbal tea, soaked nuts, dates'
    },
    guidelines: 'Eat warm, cooked foods. Avoid cold, raw foods. Include healthy fats.'
  },
  {
    id: 2,
    name: 'Pitta Pacifying Diet',
    description: 'Cooling and calming foods for Pitta constitution',
    meals: {
      breakfast: 'Cooling fruits, coconut water, sweet grains',
      lunch: 'Rice with cooling vegetables, coconut curry',
      dinner: 'Light salad with cooling herbs',
      snacks: 'Sweet fruits, coconut water, cooling teas'
    },
    guidelines: 'Eat cooling foods. Avoid spicy, hot foods. Include sweet tastes.'
  },
  {
    id: 3,
    name: 'Kapha Reducing Diet',
    description: 'Light, warm, and stimulating foods for Kapha constitution',
    meals: {
      breakfast: 'Light fruits, warm spices, minimal grains',
      lunch: 'Light vegetables, legumes, warming spices',
      dinner: 'Light soup, minimal grains',
      snacks: 'Warm teas, light fruits, warming spices'
    },
    guidelines: 'Eat light, warm foods. Avoid heavy, oily foods. Include pungent tastes.'
  },
  {
    id: 4,
    name: 'General Ayurvedic Diet',
    description: 'Balanced diet suitable for all constitutions',
    meals: {
      breakfast: 'Fresh fruits, whole grains, nuts',
      lunch: 'Rice with vegetables, dal, salad',
      dinner: 'Light soup, vegetables, minimal grains',
      snacks: 'Fresh fruits, nuts, herbal teas'
    },
    guidelines: 'Eat seasonal, fresh foods. Include all six tastes. Eat mindfully.'
  },
  {
    id: 5,
    name: 'Detox Diet',
    description: 'Cleansing diet for body purification',
    meals: {
      breakfast: 'Warm lemon water, light fruits',
      lunch: 'Steamed vegetables, quinoa, herbal tea',
      dinner: 'Light soup, minimal grains',
      snacks: 'Herbal teas, light fruits'
    },
    guidelines: 'Avoid processed foods. Drink plenty of water. Include cleansing herbs.'
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
