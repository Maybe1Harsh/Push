import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import DoctorDashboardScreen from './DoctorDashboard';
import DoctorScheduleScreen from './DoctorSchedule';
import DoctorPrescriptionsScreen from './DoctorPrescriptions';
import PatientPrescriptions from './PatientPrescriptions';
import PrescriptionPage from './PrescriptionPage';
// Import other screens as needed

const Stack = createStackNavigator();

export function DoctorNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DoctorDashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1976d2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="DoctorDashboard" 
          component={DoctorDashboardScreen}
          options={{ title: 'Doctor Dashboard' }}
        />
        <Stack.Screen 
          name="DoctorSchedule" 
          component={DoctorScheduleScreen}
          options={{ title: 'Schedule & Appointments' }}
        />
        <Stack.Screen 
          name="DoctorPrescriptions" 
          component={DoctorPrescriptionsScreen}
          options={{ title: 'Write Prescriptions' }}
        />
        <Stack.Screen 
          name="PrescriptionPage" 
          component={PrescriptionPage}
          options={{ title: 'Quick Prescription' }}
        />
        {/* Add other screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export function PatientNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="PatientDashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4caf50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="PatientPrescriptions" 
          component={PatientPrescriptions}
          options={{ title: 'My Prescriptions' }}
        />
        {/* Add other patient screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
