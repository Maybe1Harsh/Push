import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, Button, Card, Portal, Modal, Provider as PaperProvider } from 'react-native-paper';
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





export default function AyurvedicRemedies() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Function to remove emojis and keep only the text
  const removeEmojis = (text) => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  };

  // Function to clean text content (remedies and avoid text)
  const cleanTextContent = (text) => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  };

  const handleSelect = (issueKey) => {
    setSelected(issueKey);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelected(null);
  };

  return (
    <PaperProvider>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={true}>
            <Text style={styles.header}>{t.remTitle}</Text>
            <View style={styles.grid}>
              {Object.keys(healthIssues).map((issue) => (
                <Card
                  key={issue}
                  style={[
                    styles.card,
                    { 
                      backgroundColor: healthIssues[issue].color,
                      borderLeftColor: healthIssues[issue].iconColor,
                      shadowColor: healthIssues[issue].iconColor,
                    },
                    selected === issue && styles.cardSelected
                  ]}
                  onPress={() => handleSelect(issue)}
                >
                  <Card.Title 
                    title={removeEmojis(issue)} 
                    titleStyle={{ 
                      fontSize: 14, 
                      textAlign: 'center',
                      color: '#424242',
                      fontWeight: '700',
                      lineHeight: 18,
                    }} 
                  />
                </Card>
              ))}
            </View>
            {/* Disclaimer (subtle, visible once per screen) */}
            <Text style={{ 
              fontSize: 12, 
              color: '#424242', 
              textAlign: 'center', 
              marginVertical: 15, 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: 10,
              borderRadius: 8,
              fontStyle: 'italic',
            }}>
              {t.remDisclaimer}
            </Text>
            <Portal>
              {/* Existing Modal for health issues */}
              <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
                {selected && (
                  <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={true}>
                    <Text style={styles.modalTitle}>{removeEmojis(selected)}</Text>
                    <Text style={styles.modalExplanation}>{healthIssues[selected].explanation}</Text>
                    <Text style={styles.modalSection}>{t.remRemedies}</Text>
                    <Text style={styles.modalText}>{cleanTextContent(healthIssues[selected].remedies)}</Text>
                    <Text style={styles.modalSection}>{t.remAvoid}</Text>
                    <Text style={styles.modalText}>{cleanTextContent(healthIssues[selected].avoid)}</Text>
                    <Button 
                      mode="contained" 
                      onPress={hideModal} 
                      style={{ 
                        marginTop: 15,
                        backgroundColor: '#4caf50',
                        borderRadius: 15,
                        elevation: 3,
                      }}
                      contentStyle={{ paddingVertical: 5 }}
                    >
                      {t.commonClose}
                    </Button>
                  </ScrollView>
                )}
              </Modal>
            </Portal>
          </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  header: {
    marginBottom: 30,
    color: '#1b5e20',
    alignSelf: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(27, 94, 32, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 165,
    height: 100,
    margin: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#1b5e20',
    elevation: 8,
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.3,
  },
  image: {
    width: 70,
    height: 50,
    borderRadius: 10,
    marginBottom: 6,
  },
  modal: {
    backgroundColor: '#ffffff',
    padding: 30,
    margin: 20,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#4caf50',
    elevation: 10,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2e7d32',
    textAlign: 'center',
  },
  modalExplanation: {
    fontStyle: 'italic',
    color: '#424242',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#f8fdf8',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#81c784',
    lineHeight: 20,
  },
  modalSection: {
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
    marginTop: 15,
    fontSize: 18,
  },
  modalText: {
    marginBottom: 15,
    color: '#424242',
    textAlign: 'left',
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#66bb6a',
    borderWidth: 1,
    borderColor: 'rgba(102, 187, 106, 0.2)',
  },
});
