import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Modal, Portal, Divider, IconButton, TextInput, Menu, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from './supabaseClient';

const storageKey = 'calorieCounterData';

// Local food database as fallback - UPDATED with diverse foods
const localFoodsDatabase = [
  {
    id: 1,
    name: 'Apple (1 medium)',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4,
    rasa: 'Sweet, Astringent',
    dosha_impact: 'Balances Vata & Pitta, Slightly increases Kapha',
    guna: 'Light, Cool, Dry',
    virya: 'Cool',
    vipaka: 'Sweet'
  },
  {
    id: 2,
    name: 'Banana (1 medium)',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3,
    rasa: 'Sweet',
    dosha_impact: 'Increases Kapha, Balances Vata, Neutral for Pitta',
    guna: 'Heavy, Moist, Smooth',
    virya: 'Cool',
    vipaka: 'Sweet'
  },
  {
    id: 3,
    name: 'Rice (1 cup cooked)',
    calories: 206,
    protein: 4.3,
    carbs: 45,
    fat: 0.4,
    fiber: 0.6,
    rasa: 'Sweet',
    dosha_impact: 'Balances Vata & Pitta, Increases Kapha',
    guna: 'Light, Easy to digest',
    virya: 'Cool',
    vipaka: 'Sweet'
  },
  {
    id: 4,
    name: 'Chapati (1 medium)',
    calories: 104,
    protein: 3,
    carbs: 21,
    fat: 0.4,
    fiber: 2,
    rasa: 'Sweet',
    dosha_impact: 'Balances Vata & Pitta',
    guna: 'Light, Dry',
    virya: 'Neutral',
    vipaka: 'Sweet'
  },
  {
    id: 5,
    name: 'Dal (1 cup)',
    calories: 230,
    protein: 18,
    carbs: 40,
    fat: 0.8,
    fiber: 8,
    rasa: 'Sweet, Astringent',
    dosha_impact: 'Balances all Doshas, especially good for Vata',
    guna: 'Light, Easy to digest',
    virya: 'Warm',
    vipaka: 'Sweet'
  },
  {
    id: 6,
    name: 'Chicken Breast (100g)',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    rasa: 'Sweet',
    dosha_impact: 'Increases Pitta & Kapha, Balances Vata',
    guna: 'Heavy, Oily, Hot',
    virya: 'Hot',
    vipaka: 'Sweet'
  },
  {
    id: 7,
    name: 'Milk (1 cup)',
    calories: 103,
    protein: 8,
    carbs: 12,
    fat: 2.4,
    fiber: 0,
    rasa: 'Sweet',
    dosha_impact: 'Increases Kapha, Balances Vata & Pitta',
    guna: 'Heavy, Oily, Cooling',
    virya: 'Cool',
    vipaka: 'Sweet'
  },
  {
    id: 8,
    name: 'Ghee (1 tbsp)',
    calories: 112,
    protein: 0,
    carbs: 0,
    fat: 12.8,
    fiber: 0,
    rasa: 'Sweet',
    dosha_impact: 'Balances Vata & Pitta, increases Kapha in excess',
    guna: 'Heavy, Oily, Smooth',
    virya: 'Cool',
    vipaka: 'Sweet'
  }
];

export default function CalorieCounter({ navigation }) {
  // Personal info for BMR calculation
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [bmr, setBmr] = useState(0);
  const [bmi, setBmi] = useState(0);
  
  // Food tracking
  const [addedFoods, setAddedFoods] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [totalFiber, setTotalFiber] = useState(0);
  
  // Water tracking
  const [waterConsumed, setWaterConsumed] = useState(0);
  const recommendedWater = weight ? Math.round(parseFloat(weight) * 35) : 2500;
  
  // UI states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [customWaterAmount, setCustomWaterAmount] = useState('');
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const [resetWaterConfirmVisible, setResetWaterConfirmVisible] = useState(false);
  
  // Food database states
  const [foods, setFoods] = useState(localFoodsDatabase);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [usingSupabase, setUsingSupabase] = useState(false);
  
  // Filter foods based on search with smart prioritization
  const filteredFoods = React.useMemo(() => {
    if (!searchText || searchText.trim().length === 0) {
      return foods;
    }
    const searchTerm = searchText.toLowerCase().trim();
    
    // Separate foods into different priority groups
    const startsWithSearch = foods.filter(food => 
      food.name && food.name.toLowerCase().startsWith(searchTerm)
    );
    
    const containsSearch = foods.filter(food => 
      food.name && 
      food.name.toLowerCase().includes(searchTerm) && 
      !food.name.toLowerCase().startsWith(searchTerm)
    );
    
    // Return foods that start with search term first, then foods that contain it
    return [...startsWithSearch, ...containsSearch];
  }, [foods, searchText]);

  // Load data on component mount
  useEffect(() => {
    console.log('CalorieCounter component mounted');
    loadData();
    fetchFoodsFromSupabase();
  }, []);

  // Auto-reset water tracker at midnight (12:00 AM)
  useEffect(() => {
    const checkAndAutoReset = async () => {
      try {
        const currentDate = new Date().toDateString();
        const savedDate = await AsyncStorage.getItem('lastWaterResetDate');
        
        if (savedDate !== currentDate) {
          console.log('New day detected, auto-resetting water tracker');
          setWaterConsumed(0);
          
          // Update the last reset date
          const dataToSave = {
            addedFoods: [],
            waterConsumed: 0,
            bmr: bmr,
            bmi: bmi,
            date: currentDate
          };
          
          await AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave));
          await AsyncStorage.setItem('lastWaterResetDate', currentDate);
          
          console.log('Water tracker auto-reset completed for new day:', currentDate);
        }
      } catch (error) {
        console.error('Error during auto-reset check:', error);
      }
    };

    // Check immediately on component mount
    checkAndAutoReset();

    // Set up interval to check every minute for date change
    const interval = setInterval(() => {
      checkAndAutoReset();
    }, 60000); // Check every minute

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Remove dependencies to prevent infinite re-renders

  // Save data whenever it changes
  useEffect(() => {
    if (addedFoods.length > 0 || waterConsumed > 0) {
      saveData();
    }
  }, [addedFoods, waterConsumed, bmr, bmi]);

  // Fetch foods from Supabase
  const fetchFoodsFromSupabase = async () => {
    setLoadingFoods(true);
    try {
      console.log('Attempting to fetch foods from Supabase...');
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.log('Supabase foods table not found or error:', error.message);
        setFoods(localFoodsDatabase);
        setUsingSupabase(false);
      } else if (data && data.length > 0) {
        console.log('Successfully loaded', data.length, 'foods from Supabase');
        setFoods(data);
        setUsingSupabase(true);
      } else {
        console.log('Supabase foods table exists but is empty, using local database');
        setFoods(localFoodsDatabase);
        setUsingSupabase(false);
      }
    } catch (err) {
      console.log('Error connecting to Supabase foods table:', err.message);
      setFoods(localFoodsDatabase);
      setUsingSupabase(false);
    } finally {
      setLoadingFoods(false);
    }
  };

  const loadData = async () => {
    try {
      console.log('Loading calorie counter data...');
      const data = await AsyncStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        console.log('Loaded data:', parsed);
        
        // Validate and set data with defaults
        setAddedFoods(Array.isArray(parsed.addedFoods) ? parsed.addedFoods : []);
        setWaterConsumed(typeof parsed.waterConsumed === 'number' ? parsed.waterConsumed : 0);
        setBmr(typeof parsed.bmr === 'number' ? parsed.bmr : 0);
        setBmi(typeof parsed.bmi === 'number' ? parsed.bmi : 0);
        
        // Recalculate totals
        calculateTotals(Array.isArray(parsed.addedFoods) ? parsed.addedFoods : []);
        console.log('Data loaded successfully');
      } else {
        console.log('No previous data found, starting fresh');
      }

      // Initialize last reset date if it doesn't exist
      const lastResetDate = await AsyncStorage.getItem('lastWaterResetDate');
      if (!lastResetDate) {
        const currentDate = new Date().toDateString();
        await AsyncStorage.setItem('lastWaterResetDate', currentDate);
        console.log('Initialized last water reset date:', currentDate);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Warning', 'Failed to load previous data. Starting fresh.');
    }
  };

  const saveData = async () => {
    try {
      const data = {
        addedFoods: addedFoods || [],
        waterConsumed: waterConsumed || 0,
        bmr: bmr || 0,
        bmi: bmi || 0,
        date: new Date().toDateString()
      };
      console.log('Saving data:', data);
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      // Don't show alert here as it could be called frequently
    }
  };

  // Calculate BMR and BMI
  const calculateBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    if (!w || !h || !a) {
      Alert.alert('Error', 'Please fill all personal info fields');
      return;
    }

    // Calculate BMI
    const heightInM = h / 100;
    const calculatedBMI = w / (heightInM * heightInM);
    setBmi(calculatedBMI);

    // Calculate BMR using Mifflin-St Jeor Equation
    let calculatedBMR;
    if (gender === 'male') {
      calculatedBMR = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      calculatedBMR = 10 * w + 6.25 * h - 5 * a - 161;
    }

    // Apply activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const dailyCalories = calculatedBMR * activityMultipliers[activityLevel];
    setBmr(dailyCalories);
    
    Alert.alert(
      'Calculations Complete!',
      `BMI: ${calculatedBMI.toFixed(1)}\nDaily Calories: ${Math.round(dailyCalories)} kcal`
    );
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#2196f3' };
    if (bmi < 25) return { category: 'Normal', color: '#4caf50' };
    if (bmi < 30) return { category: 'Overweight', color: '#ff9800' };
    return { category: 'Obese', color: '#f44336' };
  };

  // Calculate nutritional totals
  const calculateTotals = (foodList) => {
    try {
      if (!Array.isArray(foodList)) {
        console.error('Invalid foodList provided to calculateTotals:', foodList);
        foodList = [];
      }

      let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
      
      foodList.forEach(food => {
        if (food && typeof food === 'object') {
          calories += food.totalCalories || 0;
          protein += food.totalProtein || 0;
          carbs += food.totalCarbs || 0;
          fat += food.totalFat || 0;
          fiber += food.totalFiber || 0;
        }
      });
      
      console.log('Calculated totals:', { calories, protein, carbs, fat, fiber });
      
      setTotalCalories(calories);
      setTotalProtein(protein);
      setTotalCarbs(carbs);
      setTotalFat(fat);
      setTotalFiber(fiber);
    } catch (error) {
      console.error('Error calculating totals:', error);
    }
  };

  // Add food item
  const handleAddFood = () => {
    try {
      if (!selectedFood || !quantity) {
        Alert.alert('Error', 'Please select a food and enter quantity');
        return;
      }

      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) {
        Alert.alert('Error', 'Please enter a valid quantity');
        return;
      }

      const foodItem = {
        ...selectedFood,
        quantity: qty,
        totalCalories: (selectedFood.calories || 0) * qty,
        totalProtein: (selectedFood.protein || 0) * qty,
        totalCarbs: (selectedFood.carbs || 0) * qty,
        totalFat: (selectedFood.fat || 0) * qty,
        totalFiber: (selectedFood.fiber || 0) * qty,
        id: Date.now() + Math.random() // Simple ID for removal
      };

      console.log('Adding food item:', foodItem);
      const updatedFoods = [...addedFoods, foodItem];
      setAddedFoods(updatedFoods);
      calculateTotals(updatedFoods);
      
      setModalVisible(false);
      setSelectedFood(null);
      setQuantity('1');
      setSearchText('');
      
      console.log('Food added successfully');
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food item. Please try again.');
    }
  };

  // Remove food item
  const handleRemoveFood = (id) => {
    const updatedFoods = addedFoods.filter(food => food.id !== id);
    setAddedFoods(updatedFoods);
    calculateTotals(updatedFoods);
  };

  // Quick add food with quantity
  const handleQuickAddFood = (food, qty = 1) => {
    try {
      if (!food || !food.name) {
        console.error('Invalid food object:', food);
        Alert.alert('Error', 'Invalid food item');
        return;
      }

      const quantity = parseFloat(qty);
      if (isNaN(quantity) || quantity <= 0) {
        Alert.alert('Error', 'Invalid quantity');
        return;
      }

      const foodItem = {
        ...food,
        quantity: quantity,
        totalCalories: (food.calories || 0) * quantity,
        totalProtein: (food.protein || 0) * quantity,
        totalCarbs: (food.carbs || 0) * quantity,
        totalFat: (food.fat || 0) * quantity,
        totalFiber: (food.fiber || 0) * quantity,
        id: Date.now() + Math.random() // Ensure unique ID
      };

      console.log('Quick adding food:', foodItem);
      const updatedFoods = [...addedFoods, foodItem];
      setAddedFoods(updatedFoods);
      calculateTotals(updatedFoods);
      
      console.log('Food quick-added successfully');
    } catch (error) {
      console.error('Error in handleQuickAddFood:', error);
      Alert.alert('Error', 'Failed to add food item. Please try again.');
    }
  };

  // Water tracking functions
  const handleCustomWater = () => {
    const amount = parseFloat(customWaterAmount);
    if (amount && amount > 0) {
      const newWaterAmount = waterConsumed + amount;
      setWaterConsumed(newWaterAmount);
      setCustomWaterAmount('');
      setWaterModalVisible(false);
      
      // Force immediate save
      const dataToSave = {
        addedFoods,
        waterConsumed: newWaterAmount,
        bmr,
        bmi,
        date: new Date().toDateString()
      };
      AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } else {
      Alert.alert('Invalid Amount', 'Please enter a valid water amount');
    }
  };

  // FIXED: Water reset function using custom modal
  const handleResetWater = () => {
    console.log('Reset Water button clicked!'); // Debug log
    setResetWaterConfirmVisible(true);
  };

  const performWaterReset = () => {
    console.log('Performing water reset...'); // Debug log
    
    setWaterConsumed(0);
    
    // Save the updated data
    const dataToSave = {
      addedFoods,
      waterConsumed: 0,
      bmr,
      bmi,
      date: new Date().toDateString()
    };
    
    AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave))
      .then(() => {
        console.log('Water reset completed successfully');
        setResetWaterConfirmVisible(false);
        Alert.alert('Water Reset', 'Water intake has been reset to 0ml.');
      })
      .catch((error) => {
        console.error('Error resetting water:', error);
        setResetWaterConfirmVisible(false);
        Alert.alert('Error', 'Failed to reset water intake.');
      });
  };

  // FIXED: Reset function using custom modal instead of Alert
  const handleReset = () => {
    console.log('Reset button clicked!'); // Debug log
    setResetConfirmVisible(true);
  };

  const performReset = () => {
    console.log('Performing reset...'); // Debug log
    
    // Clear all data
    setAddedFoods([]);
    setWaterConsumed(0);
    setTotalCalories(0);
    setTotalProtein(0);
    setTotalCarbs(0);
    setTotalFat(0);
    setTotalFiber(0);
    
    // Save cleared data
    const dataToSave = {
      addedFoods: [],
      waterConsumed: 0,
      bmr,
      bmi,
      date: new Date().toDateString()
    };
    
    AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave))
      .then(() => {
        console.log('Data cleared successfully');
        setResetConfirmVisible(false);
        Alert.alert('Reset Complete', 'All food and water data has been cleared.');
      })
      .catch((error) => {
        console.error('Error clearing data:', error);
        setResetConfirmVisible(false);
        Alert.alert('Error', 'Failed to clear data.');
      });
  };

  console.log('CalorieCounter rendering...'); // Debug log

  return (
    <View style={{ flex: 1, backgroundColor: '#e8f5e8' }}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={28} color="#333" />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
      >
        {/* Header - REMOVED DATABASE INDICATOR */}
        <Card style={{ marginBottom: 20, borderRadius: 16, elevation: 4, backgroundColor: '#f1f8e9', borderLeftWidth: 4, borderLeftColor: '#4caf50' }}>
          <Card.Content style={{ paddingVertical: 20 }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              textAlign: 'center',
              color: '#000000',
              marginBottom: 8
            }}>
              CureVeda Calorie & Nutrition Counter
            </Text>
            <Text style={{ 
              textAlign: 'center', 
              color: '#000000', 
              fontSize: 16 
            }}>
              Track calories with Ayurvedic wisdom
            </Text>
          </Card.Content>
        </Card>

        {/* Personal Info & BMR Section */}
        <Card style={{ marginBottom: 20, borderRadius: 16, elevation: 2, backgroundColor: '#f1f8e9', borderLeftWidth: 4, borderLeftColor: '#4caf50' }}>
          <Card.Content>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 16,
              color: '#000000'
            }}>
              Personal Info & Calculations
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flex: 0.48 }}>
                <TextInput
                  label="Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  mode="outlined"
                  style={{ backgroundColor: 'white' }}
                />
              </View>
              <View style={{ flex: 0.48 }}>
                <TextInput
                  label="Weight (kg)"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  mode="outlined"
                  style={{ backgroundColor: 'white' }}
                />
              </View>
            </View>

            <TextInput
              label="Height (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              mode="outlined"
              style={{ backgroundColor: 'white', marginBottom: 12 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flex: 0.48 }}>
                <Text style={{ marginBottom: 8, fontWeight: '500' }}>Gender</Text>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, backgroundColor: 'white' }}>
                  <Picker selectedValue={gender} onValueChange={setGender} style={{ height: 50 }}>
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                  </Picker>
                </View>
              </View>
              <View style={{ flex: 0.48 }}>
                <Text style={{ marginBottom: 8, fontWeight: '500' }}>Activity Level</Text>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, backgroundColor: 'white' }}>
                  <Picker selectedValue={activityLevel} onValueChange={setActivityLevel} style={{ height: 50 }}>
                    <Picker.Item label="Sedentary" value="sedentary" />
                    <Picker.Item label="Light Exercise" value="light" />
                    <Picker.Item label="Moderate Exercise" value="moderate" />
                    <Picker.Item label="Active" value="active" />
                    <Picker.Item label="Very Active" value="very_active" />
                  </Picker>
                </View>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={calculateBMR}
              style={{ backgroundColor: '#4caf50', marginBottom: 16 }}
            >
              Calculate BMR & BMI
            </Button>

            {(bmr > 0 || bmi > 0) && (
              <View style={{ backgroundColor: '#c8e6c9', padding: 12, borderRadius: 8 }}>
                {bmi > 0 && (
                  <Text style={{ marginBottom: 4 }}>
                    BMI: <Text style={{ fontWeight: 'bold', color: getBMICategory(bmi).color }}>
                      {bmi.toFixed(1)} ({getBMICategory(bmi).category})
                    </Text>
                  </Text>
                )}
                {bmr > 0 && (
                  <Text>
                    Daily Calorie Target: <Text style={{ fontWeight: 'bold', color: '#000000' }}>
                      {Math.round(bmr)} kcal
                    </Text>
                  </Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Water Tracker - FIXED RESET FUNCTIONALITY */}
        <Card style={{ marginBottom: 20, borderRadius: 16, elevation: 2, backgroundColor: '#f1f8e9', borderLeftWidth: 4, borderLeftColor: '#4caf50' }}>
          <Card.Content>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#000000' }}>
              💧 Water Tracker
            </Text>
            
            <View style={{ backgroundColor: '#c8e6c9', padding: 16, borderRadius: 12, marginBottom: 12 }}>
              <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#000000' }}>
                {waterConsumed} ml / {recommendedWater} ml
              </Text>
              <Text style={{ textAlign: 'center', color: '#000000', marginTop: 4 }}>
                ({Math.round((waterConsumed / recommendedWater) * 100)}% of daily goal)
              </Text>
              
              {/* Progress bar */}
              <View style={{ 
                height: 8, 
                backgroundColor: '#e0e0e0', 
                borderRadius: 4, 
                marginTop: 12,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  height: '100%', 
                  backgroundColor: '#4caf50', 
                  width: `${Math.min((waterConsumed / recommendedWater) * 100, 100)}%`,
                  borderRadius: 4
                }} />
              </View>
            </View>
            
            {/* Water Control Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
              <Button 
                mode="contained" 
                onPress={() => {
                  const newAmount = waterConsumed + 250;
                  setWaterConsumed(newAmount);
                  const dataToSave = { addedFoods, waterConsumed: newAmount, bmr, bmi, date: new Date().toDateString() };
                  AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave));
                }}
                style={{ backgroundColor: '#4caf50', flex: 0.28 }}
                compact
              >
                +250ml
              </Button>
              <Button 
                mode="contained" 
                onPress={() => {
                  const newAmount = waterConsumed + 500;
                  setWaterConsumed(newAmount);
                  const dataToSave = { addedFoods, waterConsumed: newAmount, bmr, bmi, date: new Date().toDateString() };
                  AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave));
                }}
                style={{ backgroundColor: '#4caf50', flex: 0.28 }}
                compact
              >
                +500ml
              </Button>
              <Button 
                mode="contained" 
                onPress={() => {
                  const newAmount = waterConsumed + 1000;
                  setWaterConsumed(newAmount);
                  const dataToSave = { addedFoods, waterConsumed: newAmount, bmr, bmi, date: new Date().toDateString() };
                  AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave));
                }}
                style={{ backgroundColor: '#4caf50', flex: 0.28 }}
                compact
              >
                +1L
              </Button>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button 
                mode="outlined" 
                onPress={() => setWaterModalVisible(true)}
                style={{ flex: 0.45, borderColor: '#4caf50' }}
                textColor="#000000"
                compact
              >
                Custom Amount
              </Button>
              <Button 
                mode="contained" 
                onPress={handleResetWater}
                buttonColor="#f44336"
                style={{ flex: 0.45 }}
                compact
              >
                Reset Water
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Food Selection - UPDATED with better variety */}
        <Card style={{ marginBottom: 20, borderRadius: 16, elevation: 2, backgroundColor: '#f1f8e9', borderLeftWidth: 4, borderLeftColor: '#4caf50' }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }}>
                🍽️ Add Food
              </Text>
              {loadingFoods && (
                <Text style={{ color: '#000000', fontSize: 12 }}>Loading foods...</Text>
              )}
            </View>
            
            <TextInput
              label="Search Foods"
              value={searchText}
              onChangeText={setSearchText}
              mode="outlined"
              style={{ backgroundColor: 'white', marginBottom: 12 }}
              placeholder="Type food name..."
            />

            {/* Display search results when user types in search bar */}
            {searchText.length > 0 && (
              <View style={{ 
                backgroundColor: '#c8e6c9', 
                borderRadius: 8, 
                padding: 12, 
                marginBottom: 12,
                maxHeight: 200 
              }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#000000' }}>
                  Search Results for "{searchText}" ({filteredFoods.length} found):
                </Text>
                <ScrollView style={{ maxHeight: 150 }}>
                  {filteredFoods.length > 0 ? (
                    filteredFoods.slice(0, 10).map((food, index) => (
                      <View key={food.id || index} style={{ 
                        backgroundColor: 'white', 
                        borderRadius: 6, 
                        padding: 10, 
                        marginBottom: 6,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
                            {food.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#000000' }}>
                            {food.calories} kcal • {food.rasa}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                          <Button 
                            mode="contained" 
                            compact
                            onPress={() => {
                              handleQuickAddFood(food, 1);
                              setSearchText(''); // Clear search after adding
                            }}
                            style={{ 
                              backgroundColor: '#4caf50',
                              marginRight: 4,
                              height: 32
                            }}
                            labelStyle={{ fontSize: 10 }}
                          >
                            Add 1x
                          </Button>
                          <Button 
                            mode="outlined" 
                            compact
                            onPress={() => {
                              setSelectedFood(food);
                              setModalVisible(true);
                              setSearchText(''); // Clear search after selecting
                            }}
                            style={{ 
                              borderColor: '#4caf50',
                              height: 32
                            }}
                            textColor="#000000"
                            labelStyle={{ fontSize: 10 }}
                          >
                            Details
                          </Button>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={{ textAlign: 'center', color: '#000000', fontStyle: 'italic' }}>
                      No foods found matching "{searchText}"
                    </Text>
                  )}
                </ScrollView>
                <Button
                  mode="text"
                  onPress={() => setSearchText('')}
                  style={{ marginTop: 8 }}
                  textColor="#000000"
                  labelStyle={{ fontSize: 12 }}
                >
                  Clear Search
                </Button>
              </View>
            )}

            <Button
              mode="contained"
              onPress={() => setModalVisible(true)}
              style={{ backgroundColor: '#4caf50', marginBottom: 12 }}
              disabled={loadingFoods}
            >
              Browse Food Database ({foods.length} items)
            </Button>

            {/* Quick Add Popular Foods - DIVERSIFIED */}
            <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#000000' }}>Quick Add Popular Foods:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', paddingVertical: 4 }}>
                {(() => {
                  // Select diverse popular foods from different categories
                  const popularFoodNames = [
                    'rice', 'chapati', 'dal', 'chicken', 'paneer', 'egg', 
                    'milk', 'banana', 'apple', 'potato', 'onion', 'tomato',
                    'yogurt', 'bread', 'tea', 'coffee'
                  ];
                  
                  const diversePopularFoods = popularFoodNames
                    .map(name => foods.find(food => 
                      food.name.toLowerCase().includes(name.toLowerCase())
                    ))
                    .filter(food => food !== undefined)
                    .slice(0, 8);
                  
                  // If we don't have enough diverse foods, fill with random ones
                  while (diversePopularFoods.length < 8 && diversePopularFoods.length < foods.length) {
                    const randomFood = foods[Math.floor(Math.random() * foods.length)];
                    if (!diversePopularFoods.find(f => f.id === randomFood.id)) {
                      diversePopularFoods.push(randomFood);
                    }
                  }
                  
                  return diversePopularFoods;
                })().map((food, index) => (
                  <Card key={food.id || index} style={{ 
                    marginRight: 12, 
                    width: 160, 
                    backgroundColor: '#c8e6c9' 
                  }}>
                    <Card.Content style={{ padding: 12 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 6, color: '#000000' }}>
                        {food.name.split('(')[0].trim()}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#000000', marginBottom: 8 }}>
                        {food.calories} kcal
                      </Text>
                      
                      {/* Quantity selector buttons */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Button 
                          mode="outlined" 
                          compact
                          onPress={() => handleQuickAddFood(food, 1)}
                          style={{ 
                            marginRight: 4, 
                            marginBottom: 4, 
                            borderColor: '#4caf50',
                            minWidth: 30,
                            height: 32
                          }}
                          textColor="#000000"
                          labelStyle={{ fontSize: 11 }}
                        >
                          1x
                        </Button>
                        <Button 
                          mode="outlined" 
                          compact
                          onPress={() => handleQuickAddFood(food, 2)}
                          style={{ 
                            marginBottom: 4, 
                            borderColor: '#4caf50',
                            minWidth: 30,
                            height: 32
                          }}
                          textColor="#000000"
                          labelStyle={{ fontSize: 11 }}
                        >
                          2x
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            </ScrollView>

            {/* Common Indian Food Quick Adds - IMPROVED */}
            <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#000000' }}>Common Servings:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
              {foods.filter(food => 
                food.name.toLowerCase().includes('chapati') || 
                food.name.toLowerCase().includes('rice') ||
                food.name.toLowerCase().includes('dal')
              ).slice(0, 3).map((food, index) => (
                <View key={food.id || index} style={{ 
                  backgroundColor: '#c8e6c9', 
                  padding: 8, 
                  borderRadius: 8, 
                  marginBottom: 8,
                  minWidth: '30%',
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 12, color: '#000000', marginBottom: 6, fontWeight: 'bold' }}>
                    {food.name.split('(')[0].trim()}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <Button 
                      mode="contained" 
                      compact
                      onPress={() => handleQuickAddFood(food, 1)}
                      style={{ 
                        backgroundColor: '#4caf50', 
                        marginRight: 4,
                        height: 32
                      }}
                      labelStyle={{ fontSize: 10 }}
                    >
                      1 {food.name.toLowerCase().includes('rice') ? 'bowl' : 
                          food.name.toLowerCase().includes('chapati') ? 'pc' : 'cup'}
                    </Button>
                    <Button 
                      mode="contained" 
                      compact
                      onPress={() => handleQuickAddFood(food, 2)}
                      style={{ 
                        backgroundColor: '#2e7d32', 
                        height: 32
                      }}
                      labelStyle={{ fontSize: 10 }}
                    >
                      2 {food.name.toLowerCase().includes('rice') ? 'bowls' : 
                          food.name.toLowerCase().includes('chapati') ? 'pcs' : 'cups'}
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Today's Summary - IMPROVED PRESENTATION */}
        <Card style={{ marginBottom: 20, borderRadius: 16, elevation: 3, backgroundColor: '#f1f8e9', borderLeftWidth: 4, borderLeftColor: '#4caf50' }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }}>
                📊 Today's Summary
              </Text>
              <Button 
                mode="contained" 
                onPress={() => {
                  console.log('Reset button pressed!'); // Debug log
                  handleReset();
                }}
                compact
                buttonColor="#f44336"
                textColor="white"
                style={{ 
                  minWidth: 80,
                  zIndex: 10 // Ensure button is clickable
                }}
                labelStyle={{ fontSize: 12 }}
              >
                Reset All
              </Button>
            </View>

            {/* Nutritional Summary Cards */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Card style={{ flex: 0.48, backgroundColor: '#c8e6c9' }}>
                <Card.Content style={{ padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000000' }}>
                    {Math.round(totalCalories)}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000000' }}>Calories</Text>
                  {bmr > 0 && (
                    <Text style={{ fontSize: 10, color: '#000000' }}>
                      Target: {Math.round(bmr)}
                    </Text>
                  )}
                </Card.Content>
              </Card>
              
              <Card style={{ flex: 0.48, backgroundColor: '#c8e6c9' }}>
                <Card.Content style={{ padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }}>
                    {Math.round((waterConsumed / recommendedWater) * 100)}%
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000000' }}>Water Goal</Text>
                  <Text style={{ fontSize: 10, color: '#000000' }}>
                    {waterConsumed}ml / {recommendedWater}ml
                  </Text>
                </Card.Content>
              </Card>
            </View>

            {/* Macronutrient Breakdown */}
            <View style={{ backgroundColor: '#c8e6c9', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 8, color: '#000000' }}>
                Macronutrients Breakdown:
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ff5722' }}>
                    {Math.round(totalProtein)}g
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000000' }}>Protein</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ffc107' }}>
                    {Math.round(totalCarbs)}g
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000000' }}>Carbs</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#795548' }}>
                    {Math.round(totalFat)}g
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000000' }}>Fat</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4caf50' }}>
                    {Math.round(totalFiber)}g
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000000' }}>Fiber</Text>
                </View>
              </View>
            </View>

            {/* Food Items List - IMPROVED PRESENTATION */}
            {addedFoods.length > 0 && (
              <>
                <Text style={{ fontWeight: 'bold', marginBottom: 12, color: '#000000', fontSize: 16 }}>
                  Today's Food Items ({addedFoods.length}):
                </Text>
                
                {addedFoods.map((food) => (
                  <Card key={food.id} style={{ 
                    marginBottom: 8,
                    backgroundColor: '#fff',
                    borderLeftWidth: 4,
                    borderLeftColor: '#4caf50',
                    elevation: 2
                  }}>
                    <Card.Content style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000000', marginBottom: 4 }}>
                            {food.name}
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            <Chip 
                              size="small" 
                              style={{ margin: 1, backgroundColor: '#c8e6c9' }}
                              textStyle={{ fontSize: 10, color: '#000000' }}
                            >
                              {food.quantity}x
                            </Chip>
                            <Chip 
                              size="small" 
                              style={{ margin: 1, backgroundColor: '#c8e6c9' }}
                              textStyle={{ fontSize: 10, color: '#000000' }}
                            >
                              {Math.round(food.totalCalories)} kcal
                            </Chip>
                            <Chip 
                              size="small" 
                              style={{ margin: 1, backgroundColor: '#c8e6c9' }}
                              textStyle={{ fontSize: 10, color: '#000000' }}
                            >
                              {Math.round(food.totalProtein)}g protein
                            </Chip>
                          </View>
                        </View>
                        <IconButton 
                          icon="delete" 
                          size={20} 
                          iconColor="#f44336"
                          onPress={() => handleRemoveFood(food.id)} 
                          style={{ margin: 0 }}
                        />
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </>
            )}

            {/* Empty state */}
            {addedFoods.length === 0 && (
              <View style={{ 
                alignItems: 'center', 
                padding: 20, 
                backgroundColor: '#c8e6c9', 
                borderRadius: 12 
              }}>
                <Text style={{ fontSize: 16, color: '#000000', marginBottom: 8 }}>
                  No food items added yet
                </Text>
                <Text style={{ fontSize: 14, color: '#000000', textAlign: 'center' }}>
                  Start tracking by adding foods above
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

      </ScrollView>

      {/* Custom Water Modal */}
      <Portal>
        <Modal
          visible={waterModalVisible}
          onDismiss={() => setWaterModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: 20,
            borderRadius: 16,
            padding: 20
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#000000' }}>
            Add Custom Water Amount
          </Text>
          
          <TextInput
            label="Water Amount (ml)"
            value={customWaterAmount}
            onChangeText={setCustomWaterAmount}
            keyboardType="numeric"
            mode="outlined"
            style={{ marginBottom: 16 }}
            placeholder="Enter amount in ml"
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button 
              mode="outlined" 
              onPress={() => setWaterModalVisible(false)} 
              style={{ flex: 0.45 }}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCustomWater}
              style={{ flex: 0.45, backgroundColor: '#4caf50' }}
            >
              Add Water
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Food Details Modal - UPDATED */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: 20,
            borderRadius: 16,
            padding: 20,
            maxHeight: '80%'
          }}
        >
          {selectedFood ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000', marginBottom: 16 }}>
                {selectedFood.name}
              </Text>

              <TextInput
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: 16 }}
                placeholder="1"
              />

              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Nutritional Information:</Text>
              <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text>Calories: {Math.round(selectedFood.calories * parseFloat(quantity || 1))} kcal</Text>
                <Text>Protein: {(selectedFood.protein * parseFloat(quantity || 1)).toFixed(1)}g</Text>
                <Text>Carbohydrates: {(selectedFood.carbs * parseFloat(quantity || 1)).toFixed(1)}g</Text>
                <Text>Fat: {(selectedFood.fat * parseFloat(quantity || 1)).toFixed(1)}g</Text>
                <Text>Fiber: {(selectedFood.fiber * parseFloat(quantity || 1)).toFixed(1)}g</Text>
              </View>

              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#000000' }}>
                Ayurvedic Properties:
              </Text>
              <View style={{ backgroundColor: '#c8e6c9', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>Rasa (Taste): </Text>{selectedFood.rasa}
                </Text>
                <Text style={{ marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>Dosha Impact: </Text>
                  {selectedFood.dosha_impact || selectedFood.doshaImpact}
                </Text>
                <Text style={{ marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>Guna (Qualities): </Text>{selectedFood.guna}
                </Text>
                <Text style={{ marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>Virya (Potency): </Text>{selectedFood.virya}
                </Text>
                <Text>
                  <Text style={{ fontWeight: 'bold' }}>Vipaka (Post-digestive effect): </Text>{selectedFood.vipaka}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button mode="outlined" onPress={() => setModalVisible(false)} style={{ flex: 0.45 }}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleAddFood} style={{ flex: 0.45, backgroundColor: '#4caf50' }}>
                  Add Food
                </Button>
              </View>
            </ScrollView>
          ) : (
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select a Food Item</Text>
              <TextInput
                label="Search Foods"
                value={searchText}
                onChangeText={setSearchText}
                mode="outlined"
                style={{ marginBottom: 16 }}
                placeholder="Type to search..."
              />
              <ScrollView style={{ maxHeight: 300 }}>
                {filteredFoods.map((food, index) => (
                  <Button
                    key={food.id || index}
                    mode="outlined"
                    onPress={() => setSelectedFood(food)}
                    style={{ marginBottom: 8, justifyContent: 'flex-start' }}
                    contentStyle={{ justifyContent: 'flex-start' }}
                  >
                    <View style={{ alignItems: 'flex-start' }}>
                      <Text style={{ fontWeight: 'bold' }}>{food.name}</Text>
                      <Text style={{ fontSize: 12, color: '#000000' }}>
                        {food.calories} kcal • {food.rasa}
                      </Text>
                    </View>
                  </Button>
                ))}
              </ScrollView>
              <Button mode="outlined" onPress={() => setModalVisible(false)} style={{ marginTop: 16 }}>
                Close
              </Button>
            </View>
          )}
        </Modal>
      </Portal>

      {/* Reset Confirmation Modal */}
      <Portal>
        <Modal
          visible={resetConfirmVisible}
          onDismiss={() => setResetConfirmVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 16,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#f44336' }}>
            Reset All Data
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 24, textAlign: 'center', color: '#000000' }}>
            Are you sure you want to reset today's food and water data? This action cannot be undone.
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <Button 
              mode="outlined" 
              onPress={() => {
                console.log('Reset cancelled');
                setResetConfirmVisible(false);
              }}
              style={{ flex: 0.45 }}
              textColor="#000000"
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={performReset}
              style={{ flex: 0.45 }}
              buttonColor="#f44336"
              textColor="white"
            >
              Reset All
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Water Reset Confirmation Modal */}
      <Portal>
        <Modal
          visible={resetWaterConfirmVisible}
          onDismiss={() => setResetWaterConfirmVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 16,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#000000' }}>
            Reset Water Intake
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 24, textAlign: 'center', color: '#000000' }}>
            Are you sure you want to reset today's water intake to 0ml?
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <Button 
              mode="outlined" 
              onPress={() => {
                console.log('Water reset cancelled');
                setResetWaterConfirmVisible(false);
              }}
              style={{ flex: 0.45 }}
              textColor="#000000"
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={performWaterReset}
              style={{ flex: 0.45 }}
              buttonColor="#4caf50"
              textColor="white"
            >
              Reset Water
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = {
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },
});