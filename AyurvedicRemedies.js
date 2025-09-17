import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, Button, Card, Portal, Modal, Provider as PaperProvider } from 'react-native-paper';
import { useTranslation } from './hooks/useTranslation';

const healthIssues = {
  "Headache": {
    explanation: "Headaches can be caused by a variety of factors including tension, dehydration, and lack of sleep.",
    remedies: "1. Ginger tea: Ginger has anti-inflammatory properties that can help reduce headache symptoms. 2. Peppermint oil: Applying diluted peppermint oil to the temples may help alleviate tension headaches. 3. Lavender oil: Inhaling lavender essential oil has been shown to reduce headache symptoms in some people.",
    avoid: "1. Excessive caffeine: While small amounts of caffeine can help some headaches, too much can lead to rebound headaches. 2. Alcohol: Alcohol can cause dehydration and trigger headaches in some individuals. 3. Aged cheeses and processed meats: These contain tyramine, which can trigger headaches in some people."
  },
  "Back Pain": {
    explanation: "Back pain can result from strain, poor posture, or underlying medical conditions.",
    remedies: "1. Turmeric milk: Turmeric has anti-inflammatory properties that may help reduce pain. 2. Ginger compress: A warm compress with ginger can help soothe muscle pain. 3. Epsom salt bath: Magnesium sulfate in Epsom salt can help relax muscles and reduce pain.",
    avoid: "1. Prolonged sitting or standing: Take breaks and change positions regularly. 2. Heavy lifting: Avoid lifting heavy objects improperly, which can strain the back. 3. High heels: They can alter your posture and exacerbate back pain."
  },
  "Digestive Issues": {
    explanation: "Digestive issues can include bloating, gas, constipation, and diarrhea.",
    remedies: "1. Peppermint tea: It can help relax the digestive system and reduce bloating. 2. Ginger: It can help with nausea and digestion. 3. Fennel seeds: Chewing on fennel seeds can help reduce bloating and gas.",
    avoid: "1. Fatty and fried foods: They can exacerbate digestive issues. 2. Dairy products: They can cause problems for those who are lactose intolerant. 3. Artificial sweeteners: They can cause gas and bloating in some people."
  },
  "Skin Rashes": {
    explanation: "Skin rashes can be caused by allergies, irritants, or underlying health conditions.",
    remedies: "1. Aloe vera: Its gel can soothe irritated skin and reduce inflammation. 2. Coconut oil: It has moisturizing properties and can help reduce dryness and itching. 3. Oatmeal baths: Colloidal oatmeal can help soothe itchy and inflamed skin.",
    avoid: "1. Harsh soaps and detergents: They can irritate the skin further. 2. Scratching: It can worsen the rash and lead to infection. 3. Tight clothing: It can cause friction and irritate the rash."
  },
  "Fatigue": {
    explanation: "Fatigue is a feeling of constant tiredness or weakness and can be physical, mental, or both.",
    remedies: "1. Ashwagandha: This herb is known to reduce stress and fatigue. 2. Rhodiola Rosea: It may help improve energy levels and reduce fatigue. 3. Ginseng: It can help boost energy and reduce fatigue.",
    avoid: "1. Alcohol: It can interfere with sleep and contribute to fatigue. 2. Caffeine: While it may provide a temporary boost, it can lead to a crash later. 3. Sugary foods: They can cause a rapid spike and drop in energy levels."
  },
  "Stress": {
    explanation: "Stress is a feeling of emotional or physical tension and can come from any event or thought that makes you feel frustrated, angry, or nervous.",
    remedies: "1. Meditation: It can help calm the mind and reduce stress. 2. Deep breathing exercises: They can help reduce tension and promote relaxation. 3. Yoga: It combines physical movement, meditation, and breathing exercises to help reduce stress.",
    avoid: "1. Overcommitment: Learn to say no to tasks or activities that can lead to excessive stress. 2. Unhealthy coping mechanisms: Such as smoking, excessive drinking, or overeating. 3. Ignoring the problem: Face stressors head-on rather than avoiding them."
  },
  "Weight Gain": {
    explanation: "Weight gain can be caused by consuming more calories than you burn, lack of physical activity, or medical conditions.",
    remedies: "1. Green tea: It may help boost metabolism and promote fat loss. 2. Apple cider vinegar: It may help with weight loss by increasing feelings of fullness. 3. Ginger tea: It can help with digestion and may have a mild thermogenic effect.",
    avoid: "1. Sugary drinks: They can add a significant number of calories and offer little nutritional value. 2. Processed foods: They often contain unhealthy fats, sugars, and additives. 3. Skipping meals: It can lead to overeating later in the day."
  },
  "Joint Pain": {
    explanation: "Joint pain can be caused by injuries, arthritis, or other medical conditions.",
    remedies: "1. Turmeric: It has anti-inflammatory properties and may help reduce joint pain. 2. Ginger: It can help reduce pain and inflammation. 3. Omega-3 fatty acids: Found in fish oil, they may help reduce joint pain and stiffness.",
    avoid: "1. Sugary foods: They can increase inflammation and exacerbate pain. 2. Processed foods: They often contain unhealthy fats and additives. 3. Excessive alcohol: It can lead to inflammation and worsen joint pain."
  },
  "Allergies": {
    explanation: "Allergies are caused by the immune system reacting to a foreign substance (allergen) as if it were a harmful pathogen.",
    remedies: "1. Local honey: Consuming local honey may help some people with pollen allergies. 2. Quercetin: A natural antihistamine found in many fruits and vegetables. 3. Bromelain: An enzyme found in pineapples that may help with nasal swelling and inflammation.",
    avoid: "1. Known allergens: Such as pollen, pet dander, and certain foods. 2. Smoking and secondhand smoke: They can exacerbate respiratory allergies. 3. Strong perfumes or scents: They can trigger allergic reactions in some people."
  },
  "Cold and Cough": {
    explanation: "Colds and coughs are caused by viral infections and are characterized by sneezing, coughing, and a runny nose.",
    remedies: "1. Honey and lemon tea: It can help soothe a sore throat and reduce coughing. 2. Ginger tea: It can help reduce throat inflammation and coughing. 3. Steam inhalation: It can help relieve nasal congestion and soothe the airways.",
    avoid: "1. Cold drinks and foods: They can exacerbate throat irritation. 2. Dairy products: They can thicken mucus for some people. 3. Smoking: It can worsen cough and respiratory symptoms."
  },
  "Fever": {
    explanation: "Fever is a temporary increase in body temperature, often due to an illness.",
    remedies: "1. Tulsi (Holy Basil) tea: It can help reduce fever and has anti-inflammatory properties. 2. Ginger: It can help induce sweating, which may reduce fever. 3. Black pepper: It can help increase circulation and promote sweating.",
    avoid: "1. Heavy blankets or clothing: They can raise body temperature further. 2. Alcohol: It can lead to dehydration. 3. Caffeine: It can cause dehydration and interfere with sleep."
  },
  "Asthma": {
    explanation: "Asthma is a condition in which your airways narrow and swell and may produce extra mucus, making breathing difficult.",
    remedies: "1. Ginger tea: It can help relax the airways and reduce inflammation. 2. Turmeric milk: It has anti-inflammatory properties that may help with asthma symptoms. 3. Omega-3 fatty acids: They may help reduce airway inflammation.",
    avoid: "1. Tobacco smoke: It can trigger asthma attacks and worsen symptoms. 2. Strong odors and fumes: They can exacerbate asthma symptoms. 3. Cold air: It can trigger bronchospasm in some individuals."
  },
  "Diabetes": {
    explanation: "Diabetes is a disease that occurs when your blood glucose, or blood sugar, levels are too high.",
    remedies: "1. Bitter melon: It may help lower blood sugar levels. 2. Fenugreek seeds: They may help manage blood sugar levels. 3. Cinnamon: It may improve insulin sensitivity and lower blood sugar levels.",
    avoid: "1. Sugary foods and drinks: They can cause rapid spikes in blood sugar. 2. White bread, rice, and pasta: They can increase blood sugar levels. 3. Full-fat dairy products: They may worsen insulin resistance."
  },
  "Hypertension": {
    explanation: "Hypertension, or high blood pressure, is a condition in which the force of the blood against the artery walls is too high.",
    remedies: "1. Garlic: It may help lower blood pressure by relaxing blood vessels. 2. Basil: It can help reduce blood pressure and has a calming effect. 3. Celery seed extract: It may help reduce blood pressure by relaxing blood vessels.",
    avoid: "1. High-sodium foods: They can increase blood pressure. 2. Processed foods: They often contain unhealthy fats, sugars, and additives. 3. Alcohol: It can raise blood pressure and interfere with medications."
  },
  "Osteoporosis": {
    explanation: "Osteoporosis is a condition in which bones become weak and brittle, increasing the risk of fractures.",
    remedies: "1. Milk and dairy products: They are rich in calcium, which is essential for bone health. 2. Leafy green vegetables: Such as kale and broccoli, are good sources of calcium. 3. Fish with bones: Such as sardines and salmon, are high in calcium and vitamin D.",
    avoid: "1. Excessive salt: It can cause calcium loss through urine. 2. Caffeine: High amounts can interfere with calcium absorption. 3. Alcohol: Excessive consumption can interfere with the body's ability to absorb calcium."
  },
  "Kidney Stones": {
    explanation: "Kidney stones are hard deposits made of minerals and salts that form inside your kidneys.",
    remedies: "1. Water: Drinking plenty of water can help dilute the substances in urine that lead to stones. 2. Lemon juice: It contains citrate, which can help prevent the formation of stones. 3. Apple cider vinegar: It may help dissolve kidney stones and reduce symptoms.",
    avoid: "1. High-oxalate foods: Such as spinach, beets, and nuts, can contribute to stone formation in susceptible individuals. 2. Excessive salt: It can increase the amount of calcium in your urine, which may lead to stones. 3. Sugary drinks: They can increase the risk of kidney stones."
  },
  "Gout": {
    explanation: "Gout is a form of arthritis characterized by sudden, severe attacks of pain, redness, and swelling in the joints, often the big toe.",
    remedies: "1. Cherries: They may help reduce the frequency of gout attacks. 2. Ginger: It has anti-inflammatory properties and may help reduce pain. 3. Omega-3 fatty acids: They may help reduce inflammation and pain.",
    avoid: "1. Purine-rich foods: Such as red meat, organ meats, and certain fish, can increase uric acid levels and trigger gout attacks. 2. Sugary foods and drinks: They can increase the risk of gout attacks. 3. Alcohol: Especially beer and spirits, can increase the risk of gout attacks."
  },
  "Skin Rashes": {
    explanation: "Skin rashes can be caused by allergies, irritants, or underlying health conditions.",
    remedies: "1. Aloe vera: Its gel can soothe irritated skin and reduce inflammation. 2. Coconut oil: It has moisturizing properties and can help reduce dryness and itching. 3. Oatmeal baths: Colloidal oatmeal can help soothe itchy and inflamed skin.",
    avoid: "1. Harsh soaps and detergents: They can irritate the skin further. 2. Scratching: It can worsen the rash and lead to infection. 3. Tight clothing: It can cause friction and irritate the rash."
  }
};





export default function AyurvedicRemedies() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [remedyBoxVisible, setRemedyBoxVisible] = useState(false);

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
      <TouchableWithoutFeedback onPress={() => setRemedyBoxVisible(true)}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>{t.remTitle}</Text>
            <View style={styles.grid}>
              {Object.keys(healthIssues).map((issue) => (
                <Card
                  key={issue}
                  style={selected === issue ? [styles.card, styles.cardSelected] : styles.card}
                  onPress={() => handleSelect(issue)}
                >
                  <Card.Title title={issue} titleStyle={{ fontSize: 15, textAlign: 'center' }} />
                </Card>
              ))}
            </View>
            {/* Disclaimer (subtle, visible once per screen) */}
            <Text style={{ fontSize: 12, color: '#6d4c41', textAlign: 'center', marginVertical: 8, opacity: 0.85 }}>{t.remDisclaimer}</Text>
            <Portal>
              {/* Existing Modal for health issues */}
              <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
                {selected && (
                  <ScrollView>
                    <Text style={styles.modalTitle}>{selected}</Text>
                    <Text style={styles.modalExplanation}>{healthIssues[selected].explanation}</Text>
                    <Text style={styles.modalSection}>🌿 {t.remRemedies}</Text>
                    <Text style={styles.modalText}>{healthIssues[selected].remedies}</Text>
                    <Text style={styles.modalSection}>🍎 {t.remAvoid}</Text>
                    <Text style={styles.modalText}>{healthIssues[selected].avoid}</Text>
                    <Button mode="outlined" onPress={hideModal} style={{ marginTop: 10 }}>{t.commonClose}</Button>
                  </ScrollView>
                )}
              </Modal>
              {/* Remedy Box Modal, can be opened from anywhere */}
              <Modal visible={remedyBoxVisible} onDismiss={() => setRemedyBoxVisible(false)} contentContainerStyle={styles.remedyBoxModal}>
                <Text style={styles.remedyBoxTitle}>{t.remBox}</Text>
                <Text style={styles.remedyBoxContent}>{t.remBoxContent}</Text>
                <Button mode="contained" onPress={() => setRemedyBoxVisible(false)} style={{ marginTop: 10 }}>{t.commonClose}</Button>
              </Modal>
            </Portal>
            {/* Floating Button to open Remedy Box */}
            <Button
              mode="contained"
              style={styles.fab}
              onPress={() => setRemedyBoxVisible(true)}
              icon="plus"
            >
              {t.remBox}
            </Button>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f3f6fa',
  },
  header: {
    marginBottom: 20,
    color: '#2e7d32',
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 200,
    height: 100,
    margin: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    backgroundColor: '#fff',
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  image: {
    width: 70,
    height: 50,
    borderRadius: 10,
    marginBottom: 6,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2e7d32',
    textAlign: 'center',
  },
  modalExplanation: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSection: {
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
    marginTop: 10,
  },
  modalText: {
    marginBottom: 10,
    color: '#333',
    textAlign: 'left',
  },
  // Remedy Box Modal styles
  remedyBoxModal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 24,
    borderRadius: 18,
    alignItems: 'center',
  },
  remedyBoxTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
    textAlign: 'center',
  },
  remedyBoxContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    borderRadius: 30,
    elevation: 5,
    backgroundColor: '#2e7d32',
    zIndex: 10,
  },
});