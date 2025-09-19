import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Modal, Portal, Provider as PaperProvider, Divider, IconButton, TextInput } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from './hooks/useTranslation';

// Add this line for AsyncStorage key
const storageKey = 'calorieCounterData';

// Food data with nutrients and Ayurvedic aspects
const foods = [
  {
    name: 'Apple',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    rasa: 'Sweet',
    doshaImpact: 'Balances Vata & Pitta',
    guna: 'Light, Cooling'
  },
  {
    name: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    rasa: 'Sweet',
    doshaImpact: 'Increases Kapha, Balances Vata',
    guna: 'Heavy, Moist'
  },
  {
    name: 'Rice (1 cup)',
    calories: 206,
    protein: 4.3,
    carbs: 45,
    fat: 0.4,
    rasa: 'Sweet',
    doshaImpact: 'Balances Vata & Pitta, Increases Kapha',
    guna: 'Light, Dry'
  },
  {
    name: 'Egg (boiled)',
    calories: 68,
    protein: 6.3,
    carbs: 0.6,
    fat: 4.8,
    rasa: 'Sweet',
    doshaImpact: 'Balances Vata, Increases Pitta & Kapha',
    guna: 'Heavy, Oily'
  },
  {
    name: 'Chicken Breast (100g)',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    rasa: 'Savory',
    doshaImpact: 'Increases Pitta & Kapha',
    guna: 'Heavy, Oily'
  },
  {
    name: 'Paneer (100g)',
    calories: 265,
    protein: 18,
    carbs: 1.2,
    fat: 20,
    rasa: 'Sweet',
    doshaImpact: 'Increases Kapha, Balances Vata',
    guna: 'Heavy, Oily'
  },
  {
    name: 'Chapati (1 medium)',
    calories: 104,
    protein: 3,
    carbs: 21,
    fat: 0.4,
    rasa: 'Sweet',
    doshaImpact: 'Balances Vata & Pitta',
    guna: 'Light, Dry'
  },
  {
    name: 'Milk (1 cup)',
    calories: 103,
    protein: 8,
    carbs: 12,
    fat: 2.4,
    rasa: 'Sweet',
    doshaImpact: 'Increases Kapha, Balances Vata & Pitta',
    guna: 'Heavy, Oily'
  },
  {
    name: 'Almonds (10)',
    calories: 70,
    protein: 2.6,
    carbs: 2.5,
    fat: 6.1,
    rasa: 'Sweet, Astringent',
    doshaImpact: 'Balances Vata, Increases Pitta & Kapha',
    guna: 'Heavy, Oily'
  },
  {
    name: 'Curd (100g)',
    calories: 61,
    protein: 3.5,
    carbs: 4.7,
    fat: 3.3,
    rasa: 'Sour',
    doshaImpact: 'Increases Kapha & Pitta',
    guna: 'Heavy, Oily'
  },
  {
    name: 'Oats (1 cup cooked)',
    calories: 154,
    protein: 6,
    carbs: 27,
    guna: 'Heavy, Moist'
  },
  {
    name: 'Fish (100g)',
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 12,
    rasa: 'Savory',
    doshaImpact: 'Increases Pitta',
    guna: 'Heavy, Oily'
  },
  {
    name: 'Tofu (100g)',
    calories: 76,
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
    rasa: 'Sweet',
    doshaImpact: 'Balances Vata & Pitta',
    guna: 'Light, Oily'
  },
  {
    name: 'Spinach (100g)',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    rasa: 'Bitter',
    doshaImpact: 'Balances Pitta',
    guna: 'Light, Dry'
  },
  {
    name: 'Orange',
    calories: 47,
    protein: 0.9,
    carbs: 12,
    fat: 0.1,
    rasa: 'Sweet, Sour',
    doshaImpact: 'Balances Vata & Pitta',
    guna: 'Light, Cooling'
  },
  {
    name: 'Walnuts (10)',
    calories: 130,
    protein: 3,
    carbs: 2.7,
    fat: 13,
    rasa: 'Astringent',
    doshaImpact: 'Balances Vata',
    guna: 'Heavy, Oily'
  },
  {
    name: 'Sweet Potato (100g)',
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    rasa: 'Sweet',
    doshaImpact: 'Balances Vata',
    guna: 'Heavy, Moist'
  },
  {
    name: 'Green Peas (100g)',
    calories: 81,
    protein: 5.4,
    carbs: 14,
    fat: 0.4,
    rasa: 'Sweet',
    doshaImpact: 'Balances Kapha',
    guna: 'Light, Dry'
  },
];

function CalorieCounter() {
  // User info for BMR
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('sedentary');

  // Water tracking
  const [waterIntake, setWaterIntake] = useState(0); // in ml
  // Water requirement: 35ml per kg body weight (common recommendation)
  const waterRequirement = weight ? Math.round(parseFloat(weight) * 35) : 2000;
  const handleAddWater = (amount) => setWaterIntake(waterIntake + amount);
  const handleRemoveWater = (amount) => setWaterIntake(Math.max(waterIntake - amount, 0));
  // Quantity controls for foods
  const [foodQuantities, setFoodQuantities] = useState({});

  // Helper to get food with quantity
  const getFoodWithQuantity = (food, quantity = 1) => ({
    ...food,
    calories: food.calories * quantity,
    protein: food.protein * quantity,
    carbs: food.carbs * quantity,
    fat: food.fat * quantity,
    quantity
  });

  // Update quantity for a food
  const updateFoodQuantity = (foodName, delta) => {
    setFoodQuantities(prev => {
      const newQty = Math.max((prev[foodName] || 1) + delta, 1);
      return { ...prev, [foodName]: newQty };
    });
  };
  // Calculate BMR
  const calcBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || !h || !a) return 0;
    if (gender === 'male') {
      return 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      return 10 * w + 6.25 * h - 5 * a - 161;
    }
  };
  // Activity multiplier
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very: 1.9
  };
  const bmr = calcBMR();
  const dailyTarget = Math.round(bmr * activityMap[activity] || 2250);
  const { t } = useTranslation();
  const [addedFoods, setAddedFoods] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    const payload = JSON.stringify({ addedFoods, totalCalories, totalProtein, totalCarbs, totalFat });
    AsyncStorage.setItem(storageKey, payload).catch(() => {});
  }, [addedFoods, totalCalories, totalProtein, totalCarbs, totalFat, storageKey]);

  const handleReset = async () => {
    setAddedFoods([]);
    setTotalCalories(0);
    setTotalProtein(0);
    setTotalCarbs(0);
    setTotalFat(0);
    await AsyncStorage.removeItem(storageKey).catch(() => {});
  };

  const handleAddFood = () => {
    if (selectedFood) {
      setAddedFoods([...addedFoods, selectedFood]);
      setTotalCalories(totalCalories + selectedFood.calories);
      setTotalProtein(totalProtein + selectedFood.protein);
      setTotalCarbs(totalCarbs + selectedFood.carbs);
      setTotalFat(totalFat + selectedFood.fat);
      setModalVisible(false);
      setSelectedFood(null);
    }
  };

  const handleRemoveFood = (index) => {
    const foodToRemove = addedFoods[index];
    setAddedFoods(addedFoods.filter((_, idx) => idx !== index));
    setTotalCalories(totalCalories - foodToRemove.calories);
    setTotalProtein(totalProtein - foodToRemove.protein);
    setTotalCarbs(totalCarbs - foodToRemove.carbs);
    setTotalFat(totalFat - foodToRemove.fat);
  };

  const handleFoodPress = (food) => {
    setSelectedFood(food);
    setModalVisible(true);
  };

  // Add this debug line at the top of your return
  // If you see this text, the component is rendering
  // If not, the error is before this point
  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f3f6fa', flexGrow: 1 }}>
        <Text style={{ color: 'red', fontWeight: 'bold', marginBottom: 10 }}>CalorieCounter is rendering</Text>
        <View>
          <Card style={{ marginBottom: 16, borderRadius: 14, backgroundColor: '#fff', padding: 12 }}>
            <Text style={{ fontWeight: 'bold', color: '#222', marginBottom: 8 }}>Personal Info (for BMR)</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text>Age</Text>
                        <View style={{ backgroundColor: '#f3f6fa', borderRadius: 6, padding: 4 }}>
                          <TextInput
                            value={age}
                            onChangeText={setAge}
                            placeholder="Age"
                            keyboardType="numeric"
                            style={{ width: 60, fontSize: 16, color: '#222', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 4 }}
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text>Weight (kg)</Text>
                        <View style={{ backgroundColor: '#f3f6fa', borderRadius: 6, padding: 4 }}>
                          <TextInput
                            value={weight}
                            onChangeText={setWeight}
                            placeholder="Weight"
                            keyboardType="numeric"
                            style={{ width: 60, fontSize: 16, color: '#222', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 4 }}
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text>Height (cm)</Text>
                        <View style={{ backgroundColor: '#f3f6fa', borderRadius: 6, padding: 4 }}>
                          <TextInput
                            value={height}
                            onChangeText={setHeight}
                            placeholder="Height"
                            keyboardType="numeric"
                            style={{ width: 60, fontSize: 16, color: '#222', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 4 }}
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text>Gender</Text>
                        <View style={{ backgroundColor: '#f3f6fa', borderRadius: 6, padding: 4, flexDirection: 'row' }}>
                          <Button mode={gender === 'male' ? 'contained' : 'outlined'} onPress={() => setGender('male')} style={{ marginRight: 4 }}>Male</Button>
                          <Button mode={gender === 'female' ? 'contained' : 'outlined'} onPress={() => setGender('female')}>Female</Button>
                        </View>
                      </View>
                      <View style={{ flex: 2 }}>
                        <Text>Activity</Text>
                        <View style={{ backgroundColor: '#f3f6fa', borderRadius: 6, padding: 4, flexDirection: 'row', flexWrap: 'wrap' }}>
                          <Button mode={activity === 'sedentary' ? 'contained' : 'outlined'} onPress={() => setActivity('sedentary')} style={{ marginRight: 2, marginBottom: 2 }}>Sedentary</Button>
                          <Button mode={activity === 'light' ? 'contained' : 'outlined'} onPress={() => setActivity('light')} style={{ marginRight: 2, marginBottom: 2 }}>Light</Button>
                          <Button mode={activity === 'moderate' ? 'contained' : 'outlined'} onPress={() => setActivity('moderate')} style={{ marginRight: 2, marginBottom: 2 }}>Moderate</Button>
                          <Button mode={activity === 'active' ? 'contained' : 'outlined'} onPress={() => setActivity('active')} style={{ marginRight: 2, marginBottom: 2 }}>Active</Button>
                          <Button mode={activity === 'very' ? 'contained' : 'outlined'} onPress={() => setActivity('very')}>Very Active</Button>
                        </View>
                      </View>
                    </View>
                    <Text style={{ marginTop: 8, color: '#388e3c' }}>Your daily calorie target: <Text style={{ fontWeight: 'bold' }}>{dailyTarget}</Text> kcal</Text>
                  </Card>
                  <Card style={{ marginBottom: 16, borderRadius: 14, backgroundColor: '#e3f2fd', padding: 12 }}>
                    <Text style={{ fontWeight: 'bold', color: '#1976d2', marginBottom: 8 }}>Water Tracker</Text>
                    <Text style={{ color: '#222', marginBottom: 4 }}>Recommended: <Text style={{ fontWeight: 'bold' }}>{waterRequirement}</Text> ml</Text>
                    <Text style={{ color: '#388e3c', marginBottom: 4 }}>Consumed: <Text style={{ fontWeight: 'bold' }}>{waterIntake}</Text> ml</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <Button mode="contained" onPress={() => handleAddWater(250)} style={{ marginRight: 8 }}>+250ml</Button>
                      <Button mode="contained" onPress={() => handleAddWater(500)} style={{ marginRight: 8 }}>+500ml</Button>
                      <Button mode="outlined" onPress={() => handleRemoveWater(250)} style={{ marginRight: 8 }}>-250ml</Button>
                      <Button mode="outlined" onPress={() => handleRemoveWater(500)}>-500ml</Button>
                    </View>
                    <Text style={{ marginTop: 8, color: '#1976d2' }}>{Math.min(Math.round((waterIntake / waterRequirement) * 100), 100)}% of daily goal</Text>
                  </Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text variant="headlineMedium" style={{ color: '#222' }}>{t.ccTitle}</Text>
                    <Button mode="outlined" onPress={handleReset}>{t.commonReset}</Button>
                  </View>
                  <Card style={{ marginBottom: 20, borderRadius: 16, padding: 16, backgroundColor: '#e8f5e9' }}>
                    <Text style={{ fontSize: 18, color: '#1976d2', textAlign: 'center', marginBottom: 8 }}>
                      {t.ccTodayTotals}
                    </Text>
                    <Divider style={{ marginBottom: 8 }} />
                    <View style={{ alignItems: 'center', marginBottom: 12 }}>
                      {(() => {
                        const radius = 48;
                        const stroke = 10;
                        const normalizedRadius = radius - stroke / 2;
                        const circumference = normalizedRadius * 2 * Math.PI;
                        const progress = Math.min(totalCalories / dailyTarget, 1);
                        const strokeDashoffset = circumference - progress * circumference;
                        return (
                          <Svg height={radius * 2} width={radius * 2}>
                            <Circle stroke="#e0e0e0" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                            <Circle stroke="#4caf50" fill="transparent" strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
                          </Svg>
                        );
                      })()}
                      <Text style={{ marginTop: 6, color: '#2e7d32' }}>{Math.min(Math.round((totalCalories / dailyTarget) * 100), 100)}%</Text>
                      <Text style={{ color: '#6d4c41' }}>{totalCalories} / {dailyTarget} kcal</Text>
                    </View>
                    <Text style={{ fontSize: 16, color: '#388e3c', marginBottom: 4 }}>
                      {t.ccCalories}: <Text style={{ fontWeight: 'bold' }}>{totalCalories}</Text> kcal
                    </Text>
                    <Text style={{ fontSize: 16, color: '#388e3c', marginBottom: 4 }}>
                      {t.ccProtein}: <Text style={{ fontWeight: 'bold' }}>{totalProtein}</Text> g
                    </Text>
                    <Text style={{ fontSize: 16, color: '#388e3c', marginBottom: 4 }}>
                      {t.ccCarbs}: <Text style={{ fontWeight: 'bold' }}>{totalCarbs}</Text> g
                    </Text>
                    <Text style={{ fontSize: 16, color: '#388e3c', marginBottom: 4 }}>
                      {t.ccFat}: <Text style={{ fontWeight: 'bold' }}>{totalFat}</Text> g
                    </Text>
                  </Card>
                  <View style={{ marginBottom: 20 }}>
                    {addedFoods.length > 0 && (
                      <Text style={{ fontWeight: 'bold', color: '#388e3c', marginBottom: 8 }}>{t.ccFoodsAdded}</Text>
                    )}
                    {addedFoods.map((food, idx) => (
                      <Card key={idx} style={{ marginBottom: 8, borderRadius: 10, backgroundColor: '#fff' }}>
                        <Card.Title title={food.name} subtitle={`${food.calories} kcal`} right={() => (
                          <IconButton icon="delete" iconColor="#d32f2f" onPress={() => handleRemoveFood(idx)} />
                        )} />
                        <Card.Content>
                          <Text style={{ fontSize: 14, color: '#4e342e' }}>
                            {t.ccProtein}: {food.protein}g | {t.ccCarbs}: {food.carbs}g | {t.ccFat}: {food.fat}g
                          </Text>
                          <Text style={{ fontSize: 13, color: '#388e3c', marginTop: 4 }}>
                            {t.ccRasa}: {food.rasa} | {t.ccDoshaImpact}: {food.doshaImpact} | {t.ccGuna}: {food.guna}
                          </Text>
                        </Card.Content>
                      </Card>
                    ))}
                  </View>
                  <Text style={{ fontSize: 16, marginBottom: 10, color: '#2e7d32' }}>{t.ccAddFood}</Text>
                  {foods.map((food, idx) => (
                    <Card key={idx} style={{ marginBottom: 12, borderRadius: 14 }} onPress={() => handleFoodPress(food)}>
                      <Card.Title title={food.name} subtitle={`${food.calories} kcal`} />
                    </Card>
                  ))}
                  <Card style={{ marginTop: 10, marginBottom: 20, borderRadius: 14, backgroundColor: '#fff' }}>
                    <Card.Content>
                      <Text style={{ color: '#2e7d32', fontWeight: 'bold', marginBottom: 6 }}>{t.tipsTitle}</Text>
                      <Text style={{ color: '#4e342e' }}>{t.tipsList[(addedFoods.length) % t.tipsList.length]}</Text>
                    </Card.Content>
                  </Card>
                  <Text style={{ fontSize: 12, color: '#6d4c41', textAlign: 'center', marginTop: 4, opacity: 0.85 }}>{t.ccDisclaimer}</Text>
                  <Portal>
                    <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', padding: 24, margin: 24, borderRadius: 16 }}>
                      {selectedFood && (
                        <View>
                          <Text variant="titleLarge" style={{ color: '#388e3c', marginBottom: 10 }}>{selectedFood.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <Button icon="minus" mode="outlined" onPress={() => updateFoodQuantity(selectedFood.name, -1)} style={{ marginRight: 8 }}>-</Button>
                            <Text style={{ fontSize: 18, marginHorizontal: 8 }}>{foodQuantities[selectedFood.name] || 1}x</Text>
                            <Button icon="plus" mode="outlined" onPress={() => updateFoodQuantity(selectedFood.name, 1)} style={{ marginLeft: 8 }}>+</Button>
                          </View>
                          <Text style={{ marginBottom: 6 }}>{t.ccCalories}: {(selectedFood.calories * (foodQuantities[selectedFood.name] || 1))} kcal</Text>
                          <Text style={{ marginBottom: 6 }}>{t.ccProtein}: {(selectedFood.protein * (foodQuantities[selectedFood.name] || 1))} g</Text>
                          <Text style={{ marginBottom: 6 }}>{t.ccCarbs}: {(selectedFood.carbs * (foodQuantities[selectedFood.name] || 1))} g</Text>
                          <Text style={{ marginBottom: 6 }}>{t.ccFat}: {(selectedFood.fat * (foodQuantities[selectedFood.name] || 1))} g</Text>
                          <Divider style={{ marginVertical: 10 }} />
                          <Text style={{ marginBottom: 6, color: '#388e3c' }}>{t.ccAyurAspects}:</Text>
                          <Text style={{ marginBottom: 4 }}>{t.ccRasa}: {selectedFood.rasa}</Text>
                          <Text style={{ marginBottom: 4 }}>{t.ccDoshaImpact}: {selectedFood.doshaImpact}</Text>
                          <Text style={{ marginBottom: 4 }}>{t.ccGuna}: {selectedFood.guna}</Text>
                          <Button mode="contained" style={{ marginTop: 10 }} onPress={handleAddFood}>
                            {t.ccAddToDaily}
                          </Button>
                          <Button mode="outlined" style={{ marginTop: 10 }} onPress={() => setModalVisible(false)}>
                            {t.commonCancel}
                          </Button>
                        </View>
                      )}
                    </Modal>
                  </Portal>
                </View>
              </ScrollView>
            </PaperProvider>
  );
}

export default CalorieCounter;