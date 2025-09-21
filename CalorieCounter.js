import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Modal, Portal, Divider, IconButton, TextInput, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { supabase } from './supabaseClient';
import { Search, Plus, Trash2, Droplets, Calculator, User, Activity, Utensils, BarChart3 } from 'lucide-react-native';

const storageKey = 'calorieCounterData';

// Local food database as fallback - UPDATED with diverse foods
const localFoodsDatabase = [
  // ... (keep your existing food database exactly as is)
];

export default function CalorieCounter() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [bmr, setBmr] = useState(0);
  const [bmi, setBmi] = useState(0);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [recommendedWater, setRecommendedWater] = useState(2000); // Default to 2000ml
  const [searchText, setSearchText] = useState('');
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [addedFoods, setAddedFoods] = useState([]);
  const [customWaterAmount, setCustomWaterAmount] = useState('');
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Function to calculate BMR and BMI
  const calculateBMR = () => {
    if (!age || !weight || !height) {
      Alert.alert('Error', 'Please fill in all fields to calculate BMR and BMI.');
      return;
    }

    const weightInKg = parseFloat(weight);
    const heightInCm = parseFloat(height);
    const ageInYears = parseInt(age, 10);

    let calculatedBmr = 0;
    if (gender === 'male') {
      calculatedBmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageInYears + 5;
    } else {
      calculatedBmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageInYears - 161;
    }

    const activityMultiplier = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    calculatedBmr *= activityMultiplier[activityLevel];
    setBmr(calculatedBmr);

    const heightInMeters = heightInCm / 100;
    const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
    setBmi(calculatedBmi);
  };

  // Function to handle water reset
  const handleResetWater = () => {
    setWaterConsumed(0);
    AsyncStorage.setItem(storageKey, JSON.stringify({ ...existingData, waterConsumed: 0 }));
  };

  // Function to handle custom water addition
  const handleCustomWater = () => {
    const customAmount = parseInt(customWaterAmount, 10);
    if (isNaN(customAmount) || customAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid water amount.');
      return;
    }

    const newAmount = waterConsumed + customAmount;
    setWaterConsumed(newAmount);
    AsyncStorage.setItem(storageKey, JSON.stringify({ ...existingData, waterConsumed: newAmount }));
    setCustomWaterAmount('');
    setWaterModalVisible(false);
  };

  // Function to handle food removal
  const handleRemoveFood = (foodId) => {
    const updatedFoods = addedFoods.filter((food) => food.id !== foodId);
    setAddedFoods(updatedFoods);
    AsyncStorage.setItem(storageKey, JSON.stringify({ ...existingData, addedFoods: updatedFoods }));
  };

  // Function to handle quick food addition
  const handleQuickAddFood = (food, quantity) => {
    const existingFood = addedFoods.find((f) => f.id === food.id);
    if (existingFood) {
      existingFood.quantity += quantity;
      existingFood.totalCalories += food.calories * quantity;
    } else {
      addedFoods.push({
        ...food,
        quantity,
        totalCalories: food.calories * quantity,
      });
    }
    setAddedFoods([...addedFoods]);
    AsyncStorage.setItem(storageKey, JSON.stringify({ ...existingData, addedFoods }));
  };

  // Function to get BMI category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#f39c12' };
    if (bmi < 24.9) return { category: 'Normal', color: '#27ae60' };
    if (bmi < 29.9) return { category: 'Overweight', color: '#f1c40f' };
    return { category: 'Obese', color: '#e74c3c' };
  };

  // Test Supabase connection
  React.useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('test_table').select('*').limit(1);
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connection successful:', data);
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };

    testSupabaseConnection();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#2c3e50' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
      >
        {/* Header */}
        <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#34495e', elevation: 2 }}>
          <Card.Content style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 22, 
              fontWeight: 'bold', 
              textAlign: 'center',
              color: '#f3f6fa',
              marginBottom: 8
            }}>
              Calorie & Nutrition Tracker
            </Text>
            <Text style={{ 
              textAlign: 'center', 
              color: '#bdc3c7', 
              fontSize: 14 
            }}>
              Track calories with Ayurvedic wisdom
            </Text>
          </Card.Content>
        </Card>

        {/* Personal Info & BMR Section */}
        <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#34495e', elevation: 2 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Calculator size={20} color="#388e3c" />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                marginLeft: 8,
                color: '#f3f6fa'
              }}>
                Personal Info & Calculations
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flex: 0.48 }}>
                <TextInput
                  label="Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  mode="outlined"
                  style={{ backgroundColor: '#2c3e50' }}
                  textColor="#f3f6fa"
                  outlineColor="#7f8c8d"
                  activeOutlineColor="#388e3c"
                />
              </View>
              <View style={{ flex: 0.48 }}>
                <TextInput
                  label="Weight (kg)"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  mode="outlined"
                  style={{ backgroundColor: '#2c3e50' }}
                  textColor="#f3f6fa"
                  outlineColor="#7f8c8d"
                  activeOutlineColor="#388e3c"
                />
              </View>
            </View>

            <TextInput
              label="Height (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              mode="outlined"
              style={{ backgroundColor: '#2c3e50', marginBottom: 12 }}
              textColor="#f3f6fa"
              outlineColor="#7f8c8d"
              activeOutlineColor="#388e3c"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flex: 0.48 }}>
                <Text style={{ marginBottom: 8, fontWeight: '500', color: '#f3f6fa' }}>Gender</Text>
                <View style={{ borderWidth: 1, borderColor: '#7f8c8d', borderRadius: 8, backgroundColor: '#2c3e50' }}>
                  <Picker 
                    selectedValue={gender} 
                    onValueChange={setGender} 
                    style={{ height: 50, color: '#f3f6fa' }}
                    dropdownIconColor="#f3f6fa"
                  >
                    <Picker.Item label="Male" value="male" color="#f3f6fa" />
                    <Picker.Item label="Female" value="female" color="#f3f6fa" />
                  </Picker>
                </View>
              </View>
              <View style={{ flex: 0.48 }}>
                <Text style={{ marginBottom: 8, fontWeight: '500', color: '#f3f6fa' }}>Activity Level</Text>
                <View style={{ borderWidth: 1, borderColor: '#7f8c8d', borderRadius: 8, backgroundColor: '#2c3e50' }}>
                  <Picker 
                    selectedValue={activityLevel} 
                    onValueChange={setActivityLevel} 
                    style={{ height: 50, color: '#f3f6fa' }}
                    dropdownIconColor="#f3f6fa"
                  >
                    <Picker.Item label="Sedentary" value="sedentary" color="#f3f6fa" />
                    <Picker.Item label="Light Exercise" value="light" color="#f3f6fa" />
                    <Picker.Item label="Moderate Exercise" value="moderate" color="#f3f6fa" />
                    <Picker.Item label="Active" value="active" color="#f3f6fa" />
                    <Picker.Item label="Very Active" value="very_active" color="#f3f6fa" />
                  </Picker>
                </View>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={calculateBMR}
              style={{ backgroundColor: '#388e3c', marginBottom: 16 }}
              labelStyle={{ fontWeight: '600' }}
            >
              Calculate BMR & BMI
            </Button>

            {(bmr > 0 || bmi > 0) && (
              <View style={{ backgroundColor: '#2c3e50', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#388e3c' }}>
                {bmi > 0 && (
                  <Text style={{ marginBottom: 4, color: '#f3f6fa' }}>
                    BMI: <Text style={{ fontWeight: 'bold', color: getBMICategory(bmi).color }}>
                      {bmi.toFixed(1)} ({getBMICategory(bmi).category})
                    </Text>
                  </Text>
                )}
                {bmr > 0 && (
                  <Text style={{ color: '#f3f6fa' }}>
                    Daily Calorie Target: <Text style={{ fontWeight: 'bold', color: '#388e3c' }}>
                      {Math.round(bmr)} kcal
                    </Text>
                  </Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Water Tracker */}
        <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#34495e', elevation: 2 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Droplets size={20} color="#3498db" />
              <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#f3f6fa' }}>
                Water Tracker
              </Text>
            </View>
            
            <View style={{ backgroundColor: '#2c3e50', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#3498db' }}>
              <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>
                {waterConsumed} ml / {recommendedWater} ml
              </Text>
              <Text style={{ textAlign: 'center', color: '#bdc3c7', marginTop: 4 }}>
                ({Math.round((waterConsumed / recommendedWater) * 100)}% of daily goal)
              </Text>
              
              {/* Progress bar */}
              <View style={{ 
                height: 8, 
                backgroundColor: '#2c3e50', 
                borderRadius: 4, 
                marginTop: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#7f8c8d'
              }}>
                <View style={{ 
                  height: '100%', 
                  backgroundColor: '#3498db', 
                  width: `${Math.min((waterConsumed / recommendedWater) * 100, 100)}%`,
                  borderRadius: 4
                }} />
              </View>
            </View>
            
            {/* Water Control Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              {[250, 500, 1000].map((amount) => (
                <Button 
                  key={amount}
                  mode="contained" 
                  onPress={() => {
                    const newAmount = waterConsumed + amount;
                    setWaterConsumed(newAmount);
                    const dataToSave = { addedFoods, waterConsumed: newAmount, bmr, bmi, date: new Date().toDateString() };
                    AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave));
                  }}
                  style={{ backgroundColor: '#3498db', flex: 0.3 }}
                  compact
                  labelStyle={{ fontSize: 12 }}
                >
                  +{amount}ml
                </Button>
              ))}
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button 
                mode="outlined" 
                onPress={() => setWaterModalVisible(true)}
                style={{ flex: 0.48, borderColor: '#3498db' }}
                textColor="#3498db"
                compact
                labelStyle={{ fontSize: 12 }}
              >
                Custom Amount
              </Button>
              <Button 
                mode="contained" 
                onPress={handleResetWater}
                buttonColor="#e74c3c"
                style={{ flex: 0.48 }}
                compact
                labelStyle={{ fontSize: 12 }}
              >
                Reset Water
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Food Selection */}
        <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#34495e', elevation: 2 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Utensils size={20} color="#f39c12" />
              <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#f3f6fa' }}>
                Add Food
              </Text>
            </View>
            
            <TextInput
              label="Search Foods"
              value={searchText}
              onChangeText={setSearchText}
              mode="outlined"
              style={{ backgroundColor: '#2c3e50', marginBottom: 12 }}
              placeholder="Type food name..."
              textColor="#f3f6fa"
              outlineColor="#7f8c8d"
              activeOutlineColor="#f39c12"
              left={<TextInput.Icon icon={Search} color="#f39c12" />}
            />

            {/* Display search results */}
            {searchText.length > 0 && (
              <View style={{ 
                backgroundColor: '#2c3e50', 
                borderRadius: 8, 
                padding: 12, 
                marginBottom: 12,
                maxHeight: 200,
                borderWidth: 1,
                borderColor: '#7f8c8d'
              }}>
                <Text style={{ fontWeight: '600', marginBottom: 8, color: '#f39c12' }}>
                  Search Results ({filteredFoods.length} found)
                </Text>
                <ScrollView style={{ maxHeight: 150 }}>
                  {filteredFoods.length > 0 ? (
                    filteredFoods.slice(0, 10).map((food, index) => (
                      <View key={food.id || index} style={{ 
                        backgroundColor: '#2c3e50', 
                        borderRadius: 6, 
                        padding: 10, 
                        marginBottom: 6,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#7f8c8d'
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600', fontSize: 14, color: '#f3f6fa' }}>
                            {food.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#bdc3c7' }}>
                            {food.calories} kcal • {food.rasa}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                          <Button 
                            mode="contained" 
                            compact
                            onPress={() => {
                              handleQuickAddFood(food, 1);
                              setSearchText('');
                            }}
                            style={{ 
                              backgroundColor: '#388e3c',
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
                              setSearchText('');
                            }}
                            style={{ 
                              borderColor: '#f39c12',
                              height: 32
                            }}
                            textColor="#f39c12"
                            labelStyle={{ fontSize: 10 }}
                          >
                            Details
                          </Button>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={{ textAlign: 'center', color: '#bdc3c7', fontStyle: 'italic' }}>
                      No foods found
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}

            <Button
              mode="contained"
              onPress={() => setModalVisible(true)}
              style={{ backgroundColor: '#f39c12' }}
              disabled={loadingFoods}
              labelStyle={{ fontWeight: '600' }}
            >
              Browse Food Database
            </Button>
          </Card.Content>
        </Card>

        {/* Today's Summary */}
        <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#34495e', elevation: 2 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <BarChart3 size={20} color="#9b59b6" />
                <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#f3f6fa' }}>
                  Today's Summary
                </Text>
              </View>
              <Button 
                mode="contained" 
                onPress={handleReset}
                compact
                buttonColor="#e74c3c"
                textColor="white"
                style={{ minWidth: 80 }}
                labelStyle={{ fontSize: 12 }}
              >
                Reset All
              </Button>
            </View>

            {/* Nutritional Summary Cards */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Card style={{ flex: 0.48, backgroundColor: '#2c3e50', borderWidth: 1, borderColor: '#388e3c' }}>
                <Card.Content style={{ padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#388e3c' }}>
                    {Math.round(totalCalories)}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#388e3c' }}>Calories</Text>
                  {bmr > 0 && (
                    <Text style={{ fontSize: 10, color: '#bdc3c7' }}>
                      Target: {Math.round(bmr)}
                    </Text>
                  )}
                </Card.Content>
              </Card>
              
              <Card style={{ flex: 0.48, backgroundColor: '#2c3e50', borderWidth: 1, borderColor: '#3498db' }}>
                <Card.Content style={{ padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>
                    {Math.round((waterConsumed / recommendedWater) * 100)}%
                  </Text>
                  <Text style={{ fontSize: 12, color: '#3498db' }}>Water Goal</Text>
                  <Text style={{ fontSize: 10, color: '#bdc3c7' }}>
                    {waterConsumed}ml / {recommendedWater}ml
                  </Text>
                </Card.Content>
              </Card>
            </View>

            {/* Macronutrient Breakdown */}
            <View style={{ backgroundColor: '#2c3e50', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#7f8c8d' }}>
              <Text style={{ fontWeight: '600', marginBottom: 12, color: '#f3f6fa' }}>
                Macronutrients:
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[
                  { label: 'Protein', value: totalProtein, color: '#e74c3c' },
                  { label: 'Carbs', value: totalCarbs, color: '#f39c12' },
                  { label: 'Fat', value: totalFat, color: '#f1c40f' },
                  { label: 'Fiber', value: totalFiber, color: '#27ae60' }
                ].map((nutrient, index) => (
                  <View key={index} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: nutrient.color }}>
                      {Math.round(nutrient.value)}g
                    </Text>
                    <Text style={{ fontSize: 10, color: '#bdc3c7' }}>{nutrient.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Food Items List */}
            {addedFoods.length > 0 && (
              <>
                <Text style={{ fontWeight: '600', marginBottom: 12, color: '#f3f6fa', fontSize: 14 }}>
                  Today's Food Items ({addedFoods.length})
                </Text>
                
                {addedFoods.map((food) => (
                  <Card key={food.id} style={{ 
                    marginBottom: 8,
                    backgroundColor: '#2c3e50',
                    borderLeftWidth: 4,
                    borderLeftColor: '#f39c12'
                  }}>
                    <Card.Content style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600', fontSize: 14, color: '#f3f6fa', marginBottom: 4 }}>
                            {food.name}
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            <Chip 
                              size="small" 
                              style={{ margin: 2, backgroundColor: '#34495e' }}
                              textStyle={{ fontSize: 10, color: '#f3f6fa' }}
                            >
                              {food.quantity}x
                            </Chip>
                            <Chip 
                              size="small" 
                              style={{ margin: 2, backgroundColor: '#34495e' }}
                              textStyle={{ fontSize: 10, color: '#f3f6fa' }}
                            >
                              {Math.round(food.totalCalories)} kcal
                            </Chip>
                          </View>
                        </View>
                        <IconButton 
                          icon={Trash2} 
                          size={18} 
                          iconColor="#e74c3c"
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
                backgroundColor: '#2c3e50', 
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#7f8c8d'
              }}>
                <Text style={{ fontSize: 14, color: '#bdc3c7', marginBottom: 8 }}>
                  No food items added yet
                </Text>
                <Text style={{ fontSize: 12, color: '#7f8c8d', textAlign: 'center' }}>
                  Start tracking by adding foods above
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

      </ScrollView>

      {/* Modals (keep exactly as they are, just update colors to match new theme) */}
      <Portal>
        <Modal
          visible={waterModalVisible}
          onDismiss={() => setWaterModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: '#34495e',
            margin: 20,
            borderRadius: 12,
            padding: 20
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#3498db' }}>
            Add Custom Water Amount
          </Text>
          
          <TextInput
            label="Water Amount (ml)"
            value={customWaterAmount}
            onChangeText={setCustomWaterAmount}
            keyboardType="numeric"
            mode="outlined"
            style={{ marginBottom: 16, backgroundColor: '#2c3e50' }}
            placeholder="Enter amount in ml"
            textColor="#f3f6fa"
            outlineColor="#7f8c8d"
            activeOutlineColor="#3498db"
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button 
              mode="outlined" 
              onPress={() => setWaterModalVisible(false)} 
              style={{ flex: 0.45, borderColor: '#7f8c8d' }}
              textColor="#bdc3c7"
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCustomWater}
              style={{ flex: 0.45, backgroundColor: '#3498db' }}
            >
              Add Water
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Keep all other modals exactly as they are, just update background colors to #34495e and text colors to #f3f6fa */}
      {/* Food Details Modal, Reset Confirmation Modal, Water Reset Confirmation Modal */}
      {/* ... (rest of your modal code with updated colors) */}

    </View>
  );
}