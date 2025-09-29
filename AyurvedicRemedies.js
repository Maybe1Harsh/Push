import React, { useState, useRef } from 'react';
import { ScrollView, View, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Portal, Modal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from './hooks/useTranslation';

const healthIssues = {
  "🤕 Headache": {
    explanation: "Headaches can be caused by a variety of factors including tension, dehydration, and lack of sleep. They may also be linked to eye strain, poor posture, or excessive screen time.",
    remedies: "1. 🫖 Ginger tea: Ginger has anti-inflammatory properties that can help reduce headache symptoms.\n2. 🌿 Peppermint oil: Applying diluted peppermint oil to the temples may help alleviate tension headaches.\n3. 💜 Lavender oil: Inhaling lavender essential oil has been shown to reduce headache symptoms in some people.\n4. 💧 Hydration: Drinking enough water can relieve dehydration-related headaches.\n5. 🧘 Relaxation techniques: Yoga or meditation can reduce stress-induced headaches.",
    avoid: "1. ☕ Excessive caffeine: While small amounts can help, too much can cause rebound headaches.\n2. 🍷 Alcohol: Alcohol can cause dehydration and trigger headaches in some individuals.\n3. 🧀 Aged cheeses and processed meats: These contain tyramine, which can trigger headaches.\n4. 📱 Excess screen time: Prolonged digital use without breaks can worsen headaches.",
    color: "#ffcdd2",
    iconColor: "#d32f2f"
  },
  "🦴 Back Pain": {
    explanation: "Back pain can result from strain, poor posture, injuries, or underlying medical conditions like slipped disc or arthritis.",
    remedies: "1. 🥛 Turmeric milk: Turmeric has anti-inflammatory properties that may help reduce pain.\n2. 🫖 Ginger compress: A warm compress with ginger can help soothe muscle pain.\n3. 🛁 Epsom salt bath: Magnesium sulfate in Epsom salt can help relax muscles and reduce pain.\n4. 🧘 Gentle yoga: Stretching and yoga improve flexibility and posture.\n5. 💆 Massage therapy: Improves circulation and relieves muscle tension.",
    avoid: "1. 🪑 Prolonged sitting or standing: Take breaks and change positions regularly.\n2. 🏋️ Heavy lifting: Avoid lifting heavy objects improperly.\n3. 👠 High heels: They can alter posture and worsen back pain.\n4. 🛋️ Poor sleeping posture: Use a supportive mattress and pillow.",
    color: "#ffe0b2",
    iconColor: "#f57c00"
  },
  "🍽️ Digestive Issues": {
    explanation: "Digestive issues can include bloating, gas, constipation, diarrhea, and indigestion. These may be caused by diet, stress, or infections.",
    remedies: "1. 🌿 Peppermint tea: Helps relax the digestive system and reduce bloating.\n2. 🫚 Ginger: Aids nausea and improves digestion.\n3. 🌱 Fennel seeds: Chewing fennel seeds reduces bloating and gas.\n4. 🥭 Papaya: Contains enzymes that improve digestion.\n5. 🥛 Buttermilk with cumin: An Ayurvedic remedy for indigestion.",
    avoid: "1. 🍟 Fatty and fried foods: They worsen digestive discomfort.\n2. 🥛 Dairy products: Problematic for lactose-intolerant individuals.\n3. 🍬 Artificial sweeteners: May cause gas and bloating.\n4. 🌶️ Spicy foods: Can irritate the stomach lining.",
    color: "#f3e5f5",
    iconColor: "#7b1fa2"
  },
  "🌸 Skin Rashes": {
    explanation: "Skin rashes can be caused by allergies, infections, heat, or underlying health conditions such as eczema or psoriasis.",
    remedies: "1. 🌵 Aloe vera: Soothes irritated skin and reduces inflammation.\n2. 🥥 Coconut oil: Moisturizes and reduces itching.\n3. 🌾 Oatmeal baths: Relieves itchy and inflamed skin.\n4. 🍯 Honey: Has antibacterial properties that help healing.\n5. 🌿 Neem paste: An Ayurvedic remedy for skin irritation.",
    avoid: "1. 🧴 Harsh soaps and detergents: They worsen irritation.\n2. ✋ Scratching: Increases the risk of infection.\n3. 👕 Tight clothing: Causes friction and worsens rash.\n4. ☀️ Excess sun exposure: May aggravate skin conditions.",
    color: "#fce4ec",
    iconColor: "#c2185b"
  },
  "😴 Fatigue": {
    explanation: "Fatigue is a constant feeling of tiredness or weakness, which can be physical, mental, or both. It may result from poor sleep, anemia, or stress.",
    remedies: "1. 🌿 Ashwagandha: Reduces stress and fatigue.\n2. 🌺 Rhodiola Rosea: Improves energy levels.\n3. 🌱 Ginseng: Boosts energy and reduces tiredness.\n4. 🚶 Light exercise: Walking or stretching improves circulation.\n5. 💧 Staying hydrated: Prevents dehydration-related fatigue.",
    avoid: "1. 🍷 Alcohol: Interferes with sleep.\n2. ☕ Excess caffeine: Leads to energy crashes.\n3. 🍭 Sugary foods: Cause rapid energy spikes and drops.\n4. ⏰ Irregular sleep: Disrupts circadian rhythm.",
    color: "#e8eaf6",
    iconColor: "#3f51b5"
  },
  "😰 Stress": {
    explanation: "Stress is a state of mental or emotional strain that can negatively impact both mind and body.",
    remedies: "1. 🧘 Meditation: Calms the mind.\n2. 🫁 Deep breathing: Promotes relaxation.\n3. 🧘‍♀️ Yoga: Combines physical and mental relaxation.\n4. 🎶 Listening to music: Helps reduce anxiety.\n5. 🌿 Brahmi herb: Traditionally used in Ayurveda for stress relief.",
    avoid: "1. 📅 Overcommitment: Leads to burnout.\n2. 🚭 Smoking and alcohol: Harmful coping methods.\n3. 🙈 Ignoring issues: Worsens stress in long term.\n4. 💻 Excess screen time: Can increase mental fatigue.",
    color: "#e0f2f1",
    iconColor: "#00695c"
  },
  "⚖️ Weight Gain": {
    explanation: "Weight gain can be caused by consuming more calories than you burn, lack of physical activity, or medical conditions.",
    remedies: "1. 🍵 Green tea: It may help boost metabolism and promote fat loss. 2. 🍎 Apple cider vinegar: It may help with weight loss by increasing feelings of fullness. 3. 🫖 Ginger tea: It can help with digestion and may have a mild thermogenic effect.",
    avoid: "1. 🥤 Sugary drinks: They can add a significant number of calories and offer little nutritional value. 2. 🍕 Processed foods: They often contain unhealthy fats, sugars, and additives. 3. ⏰ Skipping meals: It can lead to overeating later in the day.",
    color: "#fff3e0",
    iconColor: "#ef6c00"
  },
  "🦴 Joint Pain": {
    explanation: "Joint pain can be caused by injuries, arthritis, or other medical conditions.",
    remedies: "1. 🌿 Turmeric: It has anti-inflammatory properties and may help reduce joint pain. 2. 🫚 Ginger: It can help reduce pain and inflammation. 3. 🐟 Omega-3 fatty acids: Found in fish oil, they may help reduce joint pain and stiffness.",
    avoid: "1. 🍭 Sugary foods: They can increase inflammation and exacerbate pain. 2. 🍟 Processed foods: They often contain unhealthy fats and additives. 3. 🍷 Excessive alcohol: It can lead to inflammation and worsen joint pain.",
    color: "#fff8e1",
    iconColor: "#ffa000"
  },
  "🤧 Allergies": {
    explanation: "Allergies are caused by the immune system reacting to a foreign substance (allergen) as if it were a harmful pathogen.",
    remedies: "1. 🍯 Local honey: Consuming local honey may help some people with pollen allergies. 2. 🍇 Quercetin: A natural antihistamine found in many fruits and vegetables. 3. 🍍 Bromelain: An enzyme found in pineapples that may help with nasal swelling and inflammation.",
    avoid: "1. 🌸 Known allergens: Such as pollen, pet dander, and certain foods. 2. 🚭 Smoking and secondhand smoke: They can exacerbate respiratory allergies. 3. 💐 Strong perfumes or scents: They can trigger allergic reactions in some people.",
    color: "#f1f8e9",
    iconColor: "#689f38"
  },
  "🤒 Cold and Cough": {
    explanation: "Colds and coughs are caused by viral infections and are characterized by sneezing, coughing, and a runny nose.",
    remedies: "1. 🍯 Honey and lemon tea: It can help soothe a sore throat and reduce coughing. 2. 🫖 Ginger tea: It can help reduce throat inflammation and coughing. 3. 💨 Steam inhalation: It can help relieve nasal congestion and soothe the airways.",
    avoid: "1. 🧊 Cold drinks and foods: They can exacerbate throat irritation. 2. 🥛 Dairy products: They can thicken mucus for some people. 3. 🚬 Smoking: It can worsen cough and respiratory symptoms.",
    color: "#e3f2fd",
    iconColor: "#1976d2"
  },
  "🌡️ Fever": {
    explanation: "Fever is a temporary increase in body temperature, often due to an illness.",
    remedies: "1. 🌿 Tulsi (Holy Basil) tea: It can help reduce fever and has anti-inflammatory properties. 2. 🫚 Ginger: It can help induce sweating, which may reduce fever. 3. ⚫ Black pepper: It can help increase circulation and promote sweating.",
    avoid: "1. 🛏️ Heavy blankets or clothing: They can raise body temperature further. 2. 🍷 Alcohol: It can lead to dehydration. 3. ☕ Caffeine: It can cause dehydration and interfere with sleep.",
    color: "#ffebee",
    iconColor: "#d32f2f"
  },
  "🫁 Asthma": {
    explanation: "Asthma is a condition in which your airways narrow and swell and may produce extra mucus, making breathing difficult.",
    remedies: "1. 🫖 Ginger tea: It can help relax the airways and reduce inflammation. 2. 🥛 Turmeric milk: It has anti-inflammatory properties that may help with asthma symptoms. 3. 🐟 Omega-3 fatty acids: They may help reduce airway inflammation.",
    avoid: "1. 🚬 Tobacco smoke: It can trigger asthma attacks and worsen symptoms. 2. 🌬️ Strong odors and fumes: They can exacerbate asthma symptoms. 3. ❄️ Cold air: It can trigger bronchospasm in some individuals.",
    color: "#e8f5e8",
    iconColor: "#388e3c"
  },
  "🩸 Diabetes": {
    explanation: "Diabetes is a disease that occurs when your blood glucose, or blood sugar, levels are too high.",
    remedies: "1. 🥒 Bitter melon: It may help lower blood sugar levels. 2. 🌱 Fenugreek seeds: They may help manage blood sugar levels. 3. 🌿 Cinnamon: It may improve insulin sensitivity and lower blood sugar levels.",
    avoid: "1. 🍭 Sugary foods and drinks: They can cause rapid spikes in blood sugar. 2. 🍞 White bread, rice, and pasta: They can increase blood sugar levels. 3. 🧈 Full-fat dairy products: They may worsen insulin resistance.",
    color: "#e1f5fe",
    iconColor: "#0277bd"
  },
  "💓 Hypertension": {
    explanation: "Hypertension, or high blood pressure, is a condition in which the force of the blood against the artery walls is too high.",
    remedies: "1. 🧄 Garlic: It may help lower blood pressure by relaxing blood vessels. 2. 🌿 Basil: It can help reduce blood pressure and has a calming effect. 3. 🌱 Celery seed extract: It may help reduce blood pressure by relaxing blood vessels.",
    avoid: "1. 🧂 High-sodium foods: They can increase blood pressure. 2. 🍟 Processed foods: They often contain unhealthy fats, sugars, and additives. 3. 🍷 Alcohol: It can raise blood pressure and interfere with medications.",
    color: "#fce4ec",
    iconColor: "#ad1457"
  },
  "🦴 Osteoporosis": {
    explanation: "Osteoporosis is a condition in which bones become weak and brittle, increasing the risk of fractures.",
    remedies: "1. 🥛 Milk and dairy products: They are rich in calcium, which is essential for bone health. 2. 🥬 Leafy green vegetables: Such as kale and broccoli, are good sources of calcium. 3. 🐟 Fish with bones: Such as sardines and salmon, are high in calcium and vitamin D.",
    avoid: "1. 🧂 Excessive salt: It can cause calcium loss through urine. 2. ☕ Caffeine: High amounts can interfere with calcium absorption. 3. 🍷 Alcohol: Excessive consumption can interfere with the body's ability to absorb calcium.",
    color: "#f3e5f5",
    iconColor: "#6a1b9a"
  },
  "💎 Kidney Stones": {
    explanation: "Kidney stones are hard deposits made of minerals and salts that form inside your kidneys.",
    remedies: "1. 💧 Water: Drinking plenty of water can help dilute the substances in urine that lead to stones. 2. 🍋 Lemon juice: It contains citrate, which can help prevent the formation of stones. 3. 🍎 Apple cider vinegar: It may help dissolve kidney stones and reduce symptoms.",
    avoid: "1. 🥬 High-oxalate foods: Such as spinach, beets, and nuts, can contribute to stone formation in susceptible individuals. 2. 🧂 Excessive salt: It can increase the amount of calcium in your urine, which may lead to stones. 3. 🥤 Sugary drinks: They can increase the risk of kidney stones.",
    color: "#e0f7fa",
    iconColor: "#00838f"
  },
  "🦶 Gout": {
    explanation: "Gout is a form of arthritis characterized by sudden, severe attacks of pain, redness, and swelling in the joints, often the big toe.",
    remedies: "1. 🍒 Cherries: They may help reduce the frequency of gout attacks. 2. 🫚 Ginger: It has anti-inflammatory properties and may help reduce pain. 3. 🐟 Omega-3 fatty acids: They may help reduce inflammation and pain.",
    avoid: "1. 🥩 Purine-rich foods: Such as red meat, organ meats, and certain fish, can increase uric acid levels and trigger gout attacks. 2. 🍭 Sugary foods and drinks: They can increase the risk of gout attacks. 3. 🍺 Alcohol: Especially beer and spirits, can increase the risk of gout attacks.",
    color: "#fff3e0",
    iconColor: "#e65100"
  }
};





const { width: screenWidth } = Dimensions.get('window');

export default function AyurvedicRemedies({ navigation }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const cardAnimations = useRef({});
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;

  // Initialize animations for cards
  React.useEffect(() => {
    Object.keys(healthIssues).forEach((issue, index) => {
      cardAnimations.current[issue] = {
        scale: new Animated.Value(1),
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(50),
      };
    });

    // Animate header
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Stagger card animations
    Object.keys(healthIssues).forEach((issue, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.timing(cardAnimations.current[issue].opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(cardAnimations.current[issue].translateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, []);

  // Function to remove emojis and keep only the text
  const removeEmojis = (text) => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  };

  // Function to clean text content (remedies and avoid text) - Keep emojis for better readability
  const cleanTextContent = (text) => {
    // Instead of removing all emojis, let's keep them for better visual appeal
    return text || 'No information available';
  };

  // Function to format remedies text with better styling
  const formatRemedies = (text) => {
    if (!text) return 'No remedies available';
    
    // Split by numbers to create bullet points
    const items = text.split(/\d+\.\s/).filter(item => item.trim().length > 0);
    return items.map((item, index) => `• ${item.trim()}`).join('\n\n');
  };

  const handleSelect = (issueKey) => {
    // Animate card press
    Animated.sequence([
      Animated.timing(cardAnimations.current[issueKey].scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations.current[issueKey].scale, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setSelected(issueKey);
    setModalVisible(true);
    
    // Animate modal appearance
    Animated.spring(modalAnimation, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelected(null);
    });

    // Reset card scale
    if (selected && cardAnimations.current[selected]) {
      Animated.timing(cardAnimations.current[selected].scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const AnimatedCard = ({ issue, data, onPress }) => {
    // Use static card without complex animations for now
    return (
      <View style={{ opacity: 1, margin: 8 }}>
        <TouchableWithoutFeedback onPress={onPress}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: '#ffffff',
                borderLeftColor: '#4caf50',
                shadowColor: '#4caf50',
              },
              selected === issue && styles.cardSelected,
            ]}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#4caf50' }]}>
                <Text style={styles.cardEmoji}>{issue.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu)?.[0] || '🌿'}</Text>
              </View>
              <Text style={styles.cardTitle}>{removeEmojis(issue)}</Text>
              <View style={styles.cardIndicator} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#e8f5e8' }}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={28} color="#2e7d32" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header Section with Animation */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: headerAnimation,
                transform: [
                  {
                    translateY: headerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>
            <Text style={styles.header}>{t.remTitle || 'Ayurvedic Remedies'}</Text>
            <Text style={styles.subtitle}>Natural healing solutions for common health issues</Text>
          </Animated.View>

          {/* Cards Grid */}
          <View style={styles.grid}>
            {Object.keys(healthIssues).map((issue) => (
              <AnimatedCard
                key={issue}
                issue={issue}
                data={healthIssues[issue]}
                onPress={() => handleSelect(issue)}
              />
            ))}
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimer}>
              {t.remDisclaimer || 'These remedies are for informational purposes only. Consult healthcare professionals for serious conditions.'}
            </Text>
          </View>

          {/* Enhanced Modal */}
          <Portal>
            <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
              <Animated.View
                style={[
                  styles.modal,
                  {
                    opacity: modalAnimation,
                    transform: [
                      {
                        scale: modalAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                      {
                        translateY: modalAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {selected && (
                  <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.modalHeader}>
                      <View style={[styles.modalIconContainer, { backgroundColor: '#4caf50' }]}>
                        <Text style={styles.modalEmoji}>
                          {selected.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu)?.[0] || '🌿'}
                        </Text>
                      </View>
                      <Text style={styles.modalTitle}>{removeEmojis(selected)}</Text>
                    </View>
                    
                    <View style={styles.modalContent}>
                      <Text style={styles.modalExplanation}>{healthIssues[selected].explanation}</Text>
                      
                      <View style={styles.sectionContainer}>
                        <Text style={styles.modalSection}>✨ {t.remRemedies || 'Recommended Remedies'}</Text>
                        <View style={styles.remediesContainer}>
                          <Text style={styles.modalText}>{formatRemedies(healthIssues[selected].remedies)}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.sectionContainer}>
                        <Text style={styles.modalSection}>⚠️ {t.remAvoid || 'Things to Avoid'}</Text>
                        <View style={styles.avoidContainer}>
                          <Text style={styles.modalText}>{formatRemedies(healthIssues[selected].avoid)}</Text>
                        </View>
                      </View>
                      
                      <TouchableWithoutFeedback onPress={hideModal}>
                        <View style={styles.closeButton}>
                          <Text style={styles.closeButtonText}>{t.commonClose || 'Close'}</Text>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </ScrollView>
                )}
              </Animated.View>
            </Modal>
          </Portal>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
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
  header: {
    fontSize: 28,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  card: {
    width: (screenWidth - 60) / 2,
    height: 140,
    margin: 8,
    borderRadius: 20,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: "#96B6C5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardEmoji: {
    fontSize: 22,
    color: '#fff',
  },
  cardTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#2e7d32',
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardIndicator: {
    width: 30,
    height: 3,
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  cardSelected: {
    elevation: 12,
    shadowOpacity: 0.4,
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  disclaimerContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: '#424242',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: '85%',
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(232, 245, 232, 0.7)',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#96B6C5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalEmoji: {
    fontSize: 30,
    color: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalExplanation: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(232, 245, 232, 0.5)',
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  remediesContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  avoidContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  modalSection: {
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
    fontSize: 18,
  },
  modalText: {
    color: '#424242',
    fontSize: 15,
    lineHeight: 24,
  },
  closeButton: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#4caf50',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },
});
