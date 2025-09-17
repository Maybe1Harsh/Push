import * as React from 'react';
import { Provider as PaperProvider, ActivityIndicator, Text } from 'react-native-paper';
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
import { View } from 'react-native'; // Add View import for debug

console.log('App.js loaded');

const Stack = createNativeStackNavigator();

export default function App() {
  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [storedProfile, setStoredProfile] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('profile');
        if (saved) {
          setStoredProfile(JSON.parse(saved));
        }
      } catch (e) {
        setError(e);
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

  if (error) {
    return (
      <PaperProvider>
        <LanguageProvider initial="en">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'red', fontSize: 18 }}>App Error: {error.message}</Text>
          </View>
        </LanguageProvider>
      </PaperProvider>
    );
  }

  // Add a debug message to confirm rendering
  // Remove this after debugging
  // return (
  //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //     <Text>App.js is rendering!</Text>
  //   </View>
  // );

  return (
    <PaperProvider>
      <LanguageProvider initial="en">
        <NavigationContainer>
          {storedProfile ? (
            <Stack.Navigator initialRouteName="Dashboard">
              <Stack.Screen name="Dashboard" component={DashboardScreen} initialParams={{ profile: storedProfile }} />
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} />
              <Stack.Screen name="DoctorPrescriptions" component={DoctorPrescriptions} />
              <Stack.Screen name="DietChartTemplates" component={DietChartTemplates} />
              <Stack.Screen name="CustomizeDietChart" component={CustomizeDietChart} initialParams={{ profile: storedProfile }} />
              <Stack.Screen name="AyurvedicRemedies" component={AyurvedicRemediesScreen} />
              <Stack.Screen name="PatientPrescriptions" component={PatientPrescriptionsScreen} />
              <Stack.Screen name="PrakritiGuesser" component={PrakritiGuesserScreen} />
              <Stack.Screen name="CalorieCounter" component={CalorieCounter} />
              <Stack.Screen name="NearbyDieticiansScreen" component={NearbyDieticiansScreen} />
              <Stack.Screen name="AddPatient" component={AddPatientScreen} />
              <Stack.Screen
                name="PatientAppointment"
                component={PatientAppointmentScreen}
                options={{ title: 'Request Appointment' }}
              />
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
              <Stack.Screen name="PatientAppointment"
                component={PatientAppointmentScreen}
                options={{ title: 'Request Appointment' }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </LanguageProvider>
    </PaperProvider>
  );
}