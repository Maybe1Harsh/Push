
import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Card, RadioButton, ProgressBar, Divider } from 'react-native-paper';
import { useTranslation } from './hooks/useTranslation';

const quizData = [
  {
    question: "How would you describe your natural body frame?",
    answers: [
      { text: "Thin, light, and slender. I find it hard to gain weight.", dosha: "vata" },
      { text: "Medium and muscular, with a well-proportioned build.", dosha: "pitta" },
      { text: "Solid, sturdy, and well-built. I gain weight easily.", dosha: "kapha" }
    ]
  },
  {
    question: "What is your skin typically like?",
    answers: [
      { text: "Dry, thin, and cool. Prone to roughness or cracking.", dosha: "vata" },
      { text: "Warm, somewhat oily, and sensitive. Prone to moles or rashes.", dosha: "pitta" },
      { text: "Thick, cool, and smooth, often pale or oily.", dosha: "kapha" }
    ]
  },
  {
    question: "How is your appetite and digestion?",
    answers: [
      { text: "Irregular and variable. I often forget to eat.", dosha: "vata" },
      { text: "Strong and sharp. I get irritable if I miss a meal.", dosha: "pitta" },
      { text: "Slow but steady. I can skip meals without much trouble.", dosha: "kapha" }
    ]
  },
  {
    question: "When under stress, what is your typical reaction?",
    answers: [
      { text: "I become anxious, worried, and overwhelmed.", dosha: "vata" },
      { text: "I become irritable, impatient, and critical.", dosha: "pitta" },
      { text: "I withdraw, become quiet, and may oversleep or overeat.", dosha: "kapha" }
    ]
  },
  {
    question: "What best describes your hair?",
    answers: [
      { text: "Dry, thin, and sometimes frizzy.", dosha: "vata" },
      { text: "Fine, straight, and may be prone to early graying or thinning.", dosha: "pitta" },
      { text: "Thick, wavy, lustrous, and sometimes oily.", dosha: "kapha" }
    ]
  },
  {
    question: "How do you sleep?",
    answers: [
      { text: "I am a light sleeper and easily awakened. My sleep is often interrupted.", dosha: "vata" },
      { text: "I sleep soundly but for shorter periods. I can feel hot at night.", dosha: "pitta" },
      { text: "My sleep is deep and long. I can have trouble waking up.", dosha: "kapha" }
    ]
  },
  {
    question: "What's your mental temperament like?",
    answers: [
      { text: "Quick, creative, and full of ideas, but I can lose focus easily.", dosha: "vata" },
      { text: "Sharp, intelligent, and focused, but can be overly critical or intense.", dosha: "pitta" },
      { text: "Calm, steady, and methodical, but it takes me time to learn new things.", dosha: "kapha" }
    ]
  },
  {
    question: "How is your memory?",
    answers: [
      { text: "I learn quickly and forget quickly. My short-term memory is better.", dosha: "vata" },
      { text: "My memory is sharp and clear. I remember things accurately.", dosha: "pitta" },
      { text: "I am slow to learn but have excellent long-term retention.", dosha: "kapha" }
    ]
  },
  {
    question: "How is your energy throughout the day?",
    answers: [
      { text: "Variable, comes in bursts. I tire easily.", dosha: "vata" },
      { text: "Consistent but can burn out if I overdo it.", dosha: "pitta" },
      { text: "Steady and sustained, but I can feel sluggish.", dosha: "kapha" }
    ]
  },
  {
    question: "How do you react to weather changes?",
    answers: [
      { text: "I dislike cold, dry, and windy weather.", dosha: "vata" },
      { text: "I dislike hot and humid weather.", dosha: "pitta" },
      { text: "I dislike damp and cold weather.", dosha: "kapha" }
    ]
  },
  {
    question: "In which climate do you feel most comfortable?",
    answers: [
      { text: "Warm and humid climates. I dislike the cold and wind.", dosha: "vata" },
      { text: "Cooler climates. I dislike intense heat and sun.", dosha: "pitta" },
      { text: "Warm and dry climates. I dislike cold, damp weather.", dosha: "kapha" }
    ]
  }
];

const doshaInfo = {
  vata: {
    name: "Vata",
    color: "#0288d1",
    description:
      "Vata types are creative, energetic, and quick thinkers. In balance, you are adaptable and enthusiastic. Out of balance, you may experience anxiety and inconsistency.\n\nTo find balance: Focus on warmth, stability, and routine. Favor warm, nourishing foods."
  },
  pitta: {
    name: "Pitta",
    color: "#ef6c00",
    description:
      "Pitta types are sharp, ambitious, and focused. In balance, you are a warm and focused leader. Out of balance, you can be critical and irritable.\n\nTo find balance: Focus on coolness, moderation, and relaxation. Avoid excessive heat."
  },
  kapha: {
    name: "Kapha",
    color: "#388e3c",
    description:
      "Kapha types are calm, loving, and steady. In balance, you are compassionate and a source of strength. Out of balance, you may feel lethargic and resistant to change.\n\nTo find balance: Focus on stimulation and activity. Favor light, warm foods and regular exercise."
  },
  "pitta-vata": {
    name: "Vata-Pitta",
    color: "#7b1fa2",
    description:
      "You possess a unique combination of Vata's creativity and quickness with Pitta's sharpness and drive. You may be dynamic and charismatic, but also prone to 'burning the candle at both ends.'\n\nTo find balance: Focus on routines that are both grounding and moderately challenging. Prioritize rest."
  },
  "kapha-pitta": {
    name: "Pitta-Kapha",
    color: "#009688",
    description:
      "You combine Pitta's ambition and intensity with Kapha's stability and stamina. You are both driven and steady. The challenge lies in avoiding stubbornness.\n\nTo find balance: Embrace regular, invigorating exercise and practice patience."
  },
  "kapha-vata": {
    name: "Vata-Kapha",
    color: "#6d4c41",
    description:
      "You have a combination of Vata's lightness and mobility with Kapha's heaviness and stability. This can manifest as a calm exterior with a creative inner world.\n\nTo find balance: Prioritize warmth, stimulation, and a consistent daily routine."
  }
};

function getResult(scores) {
  const sorted = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  if (scores[sorted[0]] - scores[sorted[1]] <= 1) {
    return [sorted[0], sorted[1]].sort().join('-');
  }
  return sorted[0];
}

export default function PrakritiGuesserScreen() {
  const { t } = useTranslation();
  const [step, setStep] = React.useState('start'); // start | quiz | result
  const [current, setCurrent] = React.useState(0);
  const [selected, setSelected] = React.useState('');
  const [answers, setAnswers] = React.useState([]);
  const [scores, setScores] = React.useState({ vata: 0, pitta: 0, kapha: 0 });

  const startQuiz = () => {
    setStep('quiz');
    setCurrent(0);
    setAnswers([]);
    setScores({ vata: 0, pitta: 0, kapha: 0 });
    setSelected('');
  };

  const handleSelect = (value) => setSelected(value);

  const handleNext = () => {
    const dosha = quizData[current].answers.find(a => a.text === selected)?.dosha;
    const newScores = { ...scores };
    if (dosha) newScores[dosha]++;
    setScores(newScores);
    setAnswers([...answers, selected]);
    setSelected('');
    if (current + 1 < quizData.length) {
      setCurrent(current + 1);
    } else {
      setStep('result');
    }
  };

  const handleRetake = () => startQuiz();

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f6fa' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 600 }}>
          <Card
            style={{
              width: '100%',
              maxWidth: 500,
              alignSelf: 'center',
              padding: 24,
              borderRadius: 20,
              elevation: 5,
              backgroundColor: '#fffbe6',
              borderColor: '#c5e1a5',
              borderWidth: 1,
              marginVertical: 40,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {step === 'start' && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Text variant="headlineLarge" style={{ color: '#388e3c', fontWeight: 'bold', marginBottom: 8 }}>
                    🌿 {t.pgTitle}
                  </Text>
                  <Text style={{ color: '#6d4c41', fontSize: 16, textAlign: 'center', marginBottom: 10 }}>
                    {t.pgIntro}
                  </Text>
                </View>
                <Button
                  mode="contained"
                  buttonColor="#388e3c"
                  contentStyle={{ paddingVertical: 8 }}
                  style={{ borderRadius: 30, marginTop: 10 }}
                  onPress={startQuiz}
                >
                  {t.pgStartQuiz}
                </Button>
              </>
            )}

            {step === 'quiz' && (
              <View>
                <Text variant="titleMedium" style={{ color: '#388e3c', marginBottom: 10, fontWeight: 'bold', textAlign: 'center' }}>
                  {t.pgQuestionCounter.replace('{current}', String(current + 1)).replace('{total}', String(quizData.length))}
                </Text>
                <ProgressBar progress={(current + 1) / quizData.length} color="#388e3c" style={{ height: 8, borderRadius: 8, marginBottom: 18, backgroundColor: '#e0e0e0' }} />
                <Text style={{ fontSize: 18, color: '#4e342e', marginBottom: 18, fontWeight: '600', textAlign: 'center' }}>
                  {quizData[current].question}
                </Text>
                <RadioButton.Group onValueChange={handleSelect} value={selected}>
                  {quizData[current].answers.map((ans, idx) => (
                    <RadioButton.Item
                      key={idx}
                      label={ans.text}
                      value={ans.text}
                      color="#388e3c"
                      style={{
                        backgroundColor: selected === ans.text ? '#e8f5e9' : '#fff',
                        borderRadius: 12,
                        marginBottom: 8,
                        borderWidth: selected === ans.text ? 2 : 1,
                        borderColor: selected === ans.text ? '#388e3c' : '#e0e0e0'
                      }}
                      labelStyle={{ color: '#4e342e', fontSize: 15 }}
                    />
                  ))}
                </RadioButton.Group>
                <Button
                  mode="contained"
                  buttonColor="#388e3c"
                  style={{ marginTop: 18, borderRadius: 30 }}
                  disabled={!selected}
                  onPress={handleNext}
                >
                  {current + 1 === quizData.length ? t.pgSeeResult : t.commonNext}
                </Button>
              </View>
            )}

            {step === 'result' && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Text variant="headlineMedium" style={{ color: '#388e3c', fontWeight: 'bold', marginBottom: 6 }}>
                    {t.pgYourResult}
                  </Text>
                  <Divider style={{ width: 60, height: 3, backgroundColor: '#388e3c', marginBottom: 10, borderRadius: 2 }} />
                </View>
                {(() => {
                  const total = quizData.length;
                  const resultKey = getResult(scores);
                  return (
                    <>
                      <Text style={{ fontSize: 22, color: doshaInfo[resultKey].color, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
                        {doshaInfo[resultKey].name}
                      </Text>
                      <Text style={{ color: '#4e342e', fontSize: 16, marginBottom: 18, textAlign: 'center', fontStyle: 'italic' }}>
                        {doshaInfo[resultKey].description}
                      </Text>
                      <Divider style={{ marginVertical: 10 }} />
                      {['vata', 'pitta', 'kapha'].map((d) => {
                        const percent = Math.round((scores[d] / total) * 100);
                        return (
                          <View key={d} style={{ marginBottom: 10 }}>
                            <Text style={{ color: doshaInfo[d].color, fontWeight: 'bold', fontSize: 15 }}>
                              {doshaInfo[d].name} - {percent}%
                            </Text>
                            <ProgressBar progress={scores[d] / total} color={doshaInfo[d].color} style={{ height: 8, borderRadius: 8, backgroundColor: '#e0e0e0' }} />
                          </View>
                        );
                      })}
                    </>
                  );
                })()}
                <Button
                  mode="outlined"
                  style={{ marginTop: 24, borderRadius: 30, borderColor: '#388e3c' }}
                  textColor="#388e3c"
                  onPress={handleRetake}
                >
                  {t.pgRetake}
                </Button>
              </>
            )}
          </Card>
          {(step === 'start' || step === 'result') && (
            <Text style={{ color: '#a1887f', fontSize: 12, marginTop: 18, textAlign: 'center', maxWidth: 500 }}>
              {t.pgDisclaimer}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
