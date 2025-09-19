import * as React from 'react';

import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from './Landingpage';
import DashboardScreen from './Dashboard';
import AyurvedicRemediesScreen from './AyurvedicRemedies';
import DoctorDashboardScreen from './DoctorDashboard';
import PatientPrescriptionsScreen from './PatientPrescriptions';
import PrakritiGuesserScreen from './PrakritiGuesser';
import CalorieCounter from './CalorieCounter';
import NearbyDieticiansScreen from './NearbyDieticiansScreen';
import { LanguageProvider } from './context/LanguageContext';
import LoginScreen from './LoginScreen';
import DoctorPrescriptions from './DoctorPrescriptions';
import DietChartTemplates from './DietChartTemplates';
import CustomizeDietChart from './CustomizeDietChart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddPatientScreen from './AddPatient';
import PatientAppointmentScreen from './PatientAppointment';
import PrescriptionPage from './PrescriptionPage';
import { View } from 'react-native';

console.log('App.js loaded');

const Stack = createNativeStackNavigator();

export default function App() {
  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [storedProfile, setStoredProfile] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('profile');
        if (saved) {
          const profile = JSON.parse(saved);
          console.log('Loaded profile:', profile); // Debug log
          setStoredProfile(profile);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  if (bootstrapping) {
    return (
      <PaperProvider>
        <LanguageProvider initial="en">
          <ActivityIndicator style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }} />
        </LanguageProvider>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <LanguageProvider initial="en">
        <NavigationContainer>
          {storedProfile ? (
            <Stack.Navigator initialRouteName="Dashboard">
              <Stack.Screen name="Dashboard" component={DashboardScreen} initialParams={{ profile: storedProfile }} />
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen 
                name="DoctorDashboard" 
                component={DoctorDashboardScreen}
                initialParams={{ profile: storedProfile }}
                options={{
                  key: storedProfile?.email || 'doctor-dashboard'
                }}
              />
              <Stack.Screen 
                name="DoctorPrescriptions" 
                component={DoctorPrescriptions}
                initialParams={{ profile: storedProfile }}
              />
              <Stack.Screen name="DietChartTemplates" component={DietChartTemplates} />
              <Stack.Screen name="CustomizeDietChart" component={CustomizeDietChart} initialParams={{ profile: storedProfile }} />
              <Stack.Screen name="AyurvedicRemedies" component={AyurvedicRemediesScreen} />
              <Stack.Screen name="PatientPrescriptions" component={PatientPrescriptionsScreen} initialParams={{ profile: storedProfile }} />
              <Stack.Screen name="PrakritiGuesser" component={PrakritiGuesserScreen} />
              <Stack.Screen name="CalorieCounter" component={CalorieCounter} />
              <Stack.Screen name="NearbyDieticiansScreen" component={NearbyDieticiansScreen} />
              <Stack.Screen name="AddPatient" component={AddPatientScreen} />
              <Stack.Screen
                name="PatientAppointment"
                component={PatientAppointmentScreen}
                options={{ title: 'Request Appointment' }}
              />
              <Stack.Screen name="PrescriptionPage" component={PrescriptionPage} />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator initialRouteName="Landing">
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} />
              <Stack.Screen name="DoctorPrescriptions" component={DoctorPrescriptions} />
              <Stack.Screen name="DietChartTemplates" component={DietChartTemplates} />
              <Stack.Screen name="CustomizeDietChart" component={CustomizeDietChart} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="AyurvedicRemedies" component={AyurvedicRemediesScreen} />
              <Stack.Screen name="PatientPrescriptions" component={PatientPrescriptionsScreen} />
              <Stack.Screen name="PrakritiGuesser" component={PrakritiGuesserScreen} />
              <Stack.Screen name="CalorieCounter" component={CalorieCounter} />
              <Stack.Screen name="AddPatient" component={AddPatientScreen} />
              <Stack.Screen name="NearbyDieticiansScreen" component={NearbyDieticiansScreen} />
              <Stack.Screen
                name="PatientAppointment"
                component={PatientAppointmentScreen}
                options={{ title: 'Request Appointment' }}
              />
              <Stack.Screen name="PrescriptionPage" component={PrescriptionPage} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </LanguageProvider>
    </PaperProvider>
  );
}
