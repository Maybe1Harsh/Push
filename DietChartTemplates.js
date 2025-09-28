import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Button, Provider as PaperProvider, IconButton } from 'react-native-paper';
import { useTranslation } from './hooks/useTranslation';

 const dietTemplates = [
  {
    id: 1,
    name: 'Vata Balancing Diet Plan',
    description: 'Therapeutic nutritional regimen designed to pacify Vata dosha through warm, grounding, and easily digestible foods',
    meals: {
      breakfast: 'Warm spiced milk (150ml) with 4-5 soaked dates and almonds, followed by cooked oats porridge (daliya) with cardamom and ghee (1 tsp)',
      lunch: 'Moong dal khichdi (1 cup) prepared with basmati rice, turmeric, cumin, and clarified butter (2 tsp), served with steamed seasonal vegetables and white rice',
      dinner: 'Nourishing vegetable broth soup with root vegetables, accompanied by soft whole wheat chapati or steamed basmati rice (1 cup)',
      snacks: 'Fresh ginger tea with honey, pre-soaked raisins (10-12 pieces), seasonal sweet fruits like mango, banana, or papaya (1 medium portion)'
    },
    guidelines: 'Consume warm, well-cooked meals at regular intervals. Avoid cold, raw, or dry foods. Include adequate healthy fats (ghee/sesame oil). Maintain proper meal timing and eat in a calm environment.'
  },
  {
    id: 2,
    name: 'Pitta Pacifying Diet Plan',
    description: 'Therapeutic cooling regimen formulated to balance excess Pitta dosha through naturally cooling, alkaline, and anti-inflammatory foods',
    meals: {
      breakfast: 'Fresh seasonal fruits (1 cup): watermelon, pears, pomegranate, served with fennel-infused water (200ml) to enhance digestive fire without aggravating Pitta',
      lunch: 'Basmati rice (1 cup) with split yellow moong dal (½ cup), cucumber raita, bottle gourd curry prepared with coconut oil (1 tsp), and fresh coriander garnish',
      dinner: 'Light khichdi (¾ cup) served with cooling coriander-mint chutney (2 tbsp), or chilled vegetable soup with seasonal cooling vegetables like cucumber and bottle gourd',
      snacks: 'Fresh coconut water (200ml), sweet seasonal fruits (1 medium portion), cooling herbal teas - rose petal or mint tea without caffeine'
    },
    guidelines: 'Prioritize cool or room temperature foods and beverages. Minimize spicy, acidic, and heating foods. Include natural cooling herbs like coriander, fennel, and mint. Eat in a peaceful environment and avoid eating when emotionally disturbed.'
  },
  {
    id: 3,
    name: 'Kapha Reducing Diet Plan',
    description: 'Therapeutic metabolic enhancement regimen designed to reduce excess Kapha dosha through light, warming, and digestive-stimulating foods',
    meals: {
      breakfast: 'Warming ginger tea (200ml) with raw honey (1 tsp), accompanied by light seasonal fruits like apples or pears (1 medium) to stimulate sluggish digestion',
      lunch: 'Ancient grain flatbread - barley or pearl millet roti (2 pieces), bitter gourd curry, fresh spinach sauté, or protein-rich lentil dal (½ cup) with digestive spices',
      dinner: 'Hot vegetable broth soup (1 bowl) infused with black pepper, turmeric, and ginger to enhance metabolic fire and reduce mucus formation',
      snacks: 'Dry-roasted chickpeas (¼ cup), therapeutic tulsi tea with metabolism-boosting herbs, astringent fruits like pomegranate or crisp apples (1 small portion)'
    },
    guidelines: 'Emphasize light, warm, and easily digestible foods. Strictly avoid heavy, oily, dairy-rich, and cold foods. Incorporate pungent and bitter tastes to stimulate metabolism. Practice portion control and avoid overeating to prevent Kapha accumulation.'
  },
  {
    id: 4,
    name: 'General Ayurvedic Diet Plan',
    description: 'Comprehensive tridoshic nutritional regimen incorporating classical Ayurvedic principles for optimal health maintenance across all constitutional types',
    meals: {
      breakfast: 'Fresh seasonal fruits (1 cup) - apples, grapes, or seasonal varieties, pre-soaked almonds (5-6 pieces), cardamom-spiced oats porridge (daliya) prepared with warm milk or plant-based alternatives',
      lunch: 'Complete balanced meal: Basmati rice (1 cup), protein-rich lentil dal (½ cup), whole wheat roti (1-2 pieces), seasonal cooked vegetables with minimal oil, fresh salad with lemon dressing for digestive enhancement',
      dinner: 'Light khichdi (¾ cup) prepared with moong dal and digestive spices, accompanied by warming vegetable soup with seasonal vegetables and therapeutic herbs',
      snacks: 'Therapeutic herbal teas - ginger, fennel, or tulsi blend (200ml), seasonal fresh fruits (1 small portion), pre-soaked nuts and seeds for sustained energy'
    },
    guidelines: 'Prioritize fresh, seasonal, and locally-sourced foods. Incorporate all six tastes (Shadrasa) - sweet, sour, salty, pungent, bitter, and astringent in daily meals. Maintain regular eating schedule, proper food combinations, and mindful eating practices. Cook with love and gratitude for optimal prana absorption.'
  },
  {
    id: 5,
    name: 'Ayurvedic Detoxification Diet Plan',
    description: 'Comprehensive panchakarma-inspired cleansing protocol designed for systematic elimination of ama (toxins) and restoration of optimal digestive function',
    meals: {
      breakfast: 'Warm lemon water (250ml) with raw honey (1 tsp) to stimulate digestive enzymes, followed by detoxifying fruits - papaya or apple (1 medium) rich in natural enzymes and fiber',
      lunch: 'Therapeutic moong dal khichdi (1 cup) prepared with turmeric, cumin, and digestive spices - easily digestible protein and carbohydrates to support gentle detoxification without taxing the system',
      dinner: 'Clear vegetable broth soup (1 bowl) with seasonal cleansing vegetables, enhanced with black pepper and warming spices to promote toxin elimination through natural sweating',
      snacks: 'Classical Triphala decoction (150ml) for colon cleansing, CCF tea blend (cumin-coriander-fennel water, 200ml), light seasonal fruits with natural detox properties'
    },
    guidelines: 'Eliminate all processed, packaged, and restaurant foods during detox period. Increase pure water intake to 2-3 liters daily for optimal kidney function. Incorporate classical detoxifying herbs like Triphala, Neem, and Turmeric. Practice gentle yoga and meditation to support mental-emotional cleansing. Maintain early sleep schedule for optimal liver detoxification.'
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
      <ScrollView style={{ flex: 1, backgroundColor: '#F1F0E8' }} contentContainerStyle={styles.scrollContainer}>
        {/* Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 20, paddingTop: 20 }}>
          <IconButton
            icon="arrow-left"
            iconColor="#2C3E50"
            size={24}
            onPress={() => navigation.goBack()}
            style={{ margin: 0 }}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2C3E50' }}>Back</Text>
        </View>
          
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
    backgroundColor: '#F1F0E8',
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
    color: '#2C3E50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#ADC4CE',
    borderRadius: 15,
    shadowColor: '#96B6C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  templateName: {
    color: '#2C3E50',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  templateDescription: {
    color: '#2C3E50',
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
    color: '#2C3E50',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
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
});
