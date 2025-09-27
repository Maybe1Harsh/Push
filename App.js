import * as React from 'react';
import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from './Landingpage';
import DashboardScreen from './Dashboard';
import AyurvedicRemediesScreen from './AyurvedicRemedies';
import DoctorDashboardScreen from './DoctorDashboard';
import PatientPrescriptionsScreen from './PatientPrescriptions';
import DoshaQuiz from './DoshaQuiz';
import CalorieCounter from './CalorieCounter';
import NearbyDieticiansScreen from './NearbyDieticiansScreen';
import { LanguageProvider } from './context/LanguageContext';
import LoginScreen from './LoginScreen';
import DoctorPrescriptions from './DoctorPrescriptions';
import DoctorSchedule from './DoctorSchedule';
import DietChartTemplates from './DietChartTemplates';
import CustomizeDietChart from './CustomizeDietChart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddPatientScreen from './AddPatient';
import PatientAppointmentScreen from './PatientAppointment';
import PatientAppointmentViewScreen from './PatientAppointmentView';
import PrescriptionPage from './PrescriptionPage';
import PanchkarmaScreen from './PanchkarmaScreen';
import YogaWellness from './YogaWellness';
import ViruddhaAhara from './ViruddhaAhara';
import { View, Text } from 'react-native';

console.log('App.js loaded');

const Stack = createNativeStackNavigator();

function ErrorBoundary({ children }) {
  try {
    return children;
  } catch (error) {
    console.error(error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }
}

export default function App() {
  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [storedProfile, setStoredProfile] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('profile');
        if (saved) {
          const profile = JSON.parse(saved);
          console.log('Loaded profile:', profile);
          setStoredProfile(profile);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  // Function to determine initial route based on user role
  const getInitialRouteName = (profile) => {
    if (!profile) return 'Landing';

    console.log('Determining route for profile:', profile);

    // Check if user is a doctor based on Role field in profile
    const isDoctor = profile.Role === 'doctor';

    console.log('Profile Role:', profile.Role);
    console.log('Is doctor?', isDoctor);

    return isDoctor ? 'DoctorDashboard' : 'Dashboard';
  };

  if (bootstrapping) {
    return (
      <PaperProvider>
        <LanguageProvider initial="en">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        </LanguageProvider>
      </PaperProvider>
    );
  }

  return (
    <ErrorBoundary>
      <PaperProvider>
        <LanguageProvider initial="en">
          <NavigationContainer>
            <Stack.Navigator initialRouteName={storedProfile ? getInitialRouteName(storedProfile) : 'Landing'}>
              <Stack.Screen 
                name="Landing" 
                component={LandingScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Dashboard" 
                component={DashboardScreen} 
                initialParams={{ profile: storedProfile }} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="DoctorDashboard" 
                component={DoctorDashboardScreen} 
                initialParams={{ profile: storedProfile }} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="DoctorPrescriptions" 
                component={DoctorPrescriptions} 
                initialParams={{ profile: storedProfile }} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="DoctorSchedule" 
                component={DoctorSchedule} 
                initialParams={{ profile: storedProfile }} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="DietChartTemplates" 
                component={DietChartTemplates} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="CustomizeDietChart" 
                component={CustomizeDietChart} 
                initialParams={{ profile: storedProfile }} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="PanchkarmaScreen" 
                component={PanchkarmaScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="AyurvedicRemedies" 
                component={AyurvedicRemediesScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="PatientPrescriptions" 
                component={PatientPrescriptionsScreen} 
                initialParams={{ profile: storedProfile }} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="CalorieCounter" 
                component={CalorieCounter} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="YogaWellness" 
                component={YogaWellness} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="NearbyDieticiansScreen" 
                component={NearbyDieticiansScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="AddPatient" 
                component={AddPatientScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PatientAppointment"
                component={PatientAppointmentScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PatientAppointmentsView"
                component={PatientAppointmentViewScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="PrescriptionPage" 
                component={PrescriptionPage} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="DoshaQuiz" 
                component={DoshaQuiz} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="ViruddhaAhara" 
                component={ViruddhaAhara} 
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </LanguageProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}