import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, Platform, ScrollView, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Button, Text, TextInput, Card, RadioButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from './hooks/useTranslation';
import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const carouselSlides = [
  {
    title: "CureVeda",
    subtitle: "Doctor-Patient Ayurvedic Platform",
    icon: "🌿",
    description: "Streamlined platform for Ayurvedic practitioners to manage patients, prescriptions, and treatments efficiently."
  },
  {
    title: "Digital Prescriptions & Diet Charts",
    subtitle: "Create and send prescriptions instantly",
    icon: "📝",
    description: "Generate customized Ayurvedic prescriptions and diet charts for your patients with just a few taps."
  },
  {
    title: "Secure Cloud Storage",
    subtitle: "All patient data safely stored",
    icon: "🔒",
    description: "Patient records, prescriptions, and treatment plans securely stored in the cloud with encrypted protection."
  },
  {
    title: "Appointment Scheduling",
    subtitle: "Manage your calendar efficiently",
    icon: "📅",
    description: "Book appointments, set availability, and manage your daily schedule with intuitive calendar tools."
  }
];

export default function LandingScreen({ navigation }) {
  const { t, language, setLanguage } = useTranslation();
  const [activePage, setActivePage] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showLogin, setShowLogin] = useState(false); // Show/hide login form in landing page

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePage((prev) => (prev + 1) % carouselSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Function to handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setMessage(t.pleaseEnterEmailPassword || 'Please enter email and password.');
      return;
    }
    setLoading(true);
    setMessage('');
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('Profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    setLoading(false);

    if (profileError || !profileData) {
      setMessage(t.profileNotFound || 'Profile not found.');
      return;
    }

    setMessage(t.loginSuccess || 'Login successful!');
    await AsyncStorage.setItem('profile', JSON.stringify(profileData));

    // Navigate after successful login
    setTimeout(() => {
      if (profileData.Role === 'doctor') {
        navigation.replace('DoctorDashboard', { profile: profileData });
      } else {
        navigation.replace('Dashboard', { profile: profileData });
      }
    }, 1000);
  };

  // Function to handle sign up navigation
  const handleSignUpNavigation = () => {
    navigation.navigate('Login'); // Navigate to Login screen which handles both login and signup
  };

  // Toggle login form visibility
  const toggleLoginForm = () => {
    setShowLogin(!showLogin);
    setMessage('');
    setEmail('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#2e7d32', '#1b5e20', '#0d3b13']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Landing Page */}
          <View style={styles.mainContainer}>
            {/* Top Half: Carousel Section */}
            <View style={styles.carouselContainer}>
              {/* Simple Slide Display */}
              <View style={styles.slide}>
                <View style={styles.slideContent}>
                  <Text style={styles.slideIcon}>{carouselSlides[activePage].icon}</Text>
                  <Text variant="headlineLarge" style={styles.slideTitle}>{carouselSlides[activePage].title}</Text>
                  <Text style={styles.slideSubtitle}>{carouselSlides[activePage].subtitle}</Text>
                  <Text style={styles.slideDescription}>{carouselSlides[activePage].description}</Text>
                </View>
              </View>
              
              {/* Page Indicators */}
              <View style={styles.indicatorContainer}>
                {carouselSlides.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setActivePage(index)}
                    style={[
                      styles.indicator,
                      activePage === index ? styles.activeIndicator : styles.inactiveIndicator
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Bottom Half: Login/Signup Section */}
            <View style={styles.bottomSection}>
              <View style={styles.bottomContent}>
                {/* Language Toggle */}
                <View style={styles.languageToggle}>
                  <Button
                    mode={language === 'en' ? 'contained' : 'outlined'}
                    onPress={() => setLanguage('en')}
                    style={styles.languageButton}
                    compact
                    labelStyle={styles.languageButtonLabel}
                  >
                    English
                  </Button>
                  <Button
                    mode={language === 'hi' ? 'contained' : 'outlined'}
                    onPress={() => setLanguage('hi')}
                    style={styles.languageButton}
                    compact
                    labelStyle={styles.languageButtonLabel}
                  >
                    हिन्दी
                  </Button>
                </View>

                {/* App Logo/Name */}
                <View style={styles.appBrand}>
                  <Text style={styles.appIcon}>🌿</Text>
                  <Text variant="headlineSmall" style={styles.appName}>CureVeda</Text>
                  <Text style={styles.appTagline}>Ayurvedic Practice Management</Text>
                </View>

                {/* Login Form (Visible when showLogin is true) */}
                {showLogin ? (
                  <Card style={styles.loginCard}>
                    <Card.Content>
                      <Text variant="titleMedium" style={styles.formTitle}>
                        {t.welcomeBack || 'Welcome Back'}
                      </Text>
                      
                      <TextInput
                        label={t.email || 'Email'}
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        left={<TextInput.Icon icon="email" />}
                      />
                      
                      <TextInput
                        label={t.password || 'Password'}
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        secureTextEntry
                        style={styles.input}
                        left={<TextInput.Icon icon="lock" />}
                      />
                      
                      <Button
                        mode="contained"
                        loading={loading}
                        disabled={loading}
                        onPress={handleLogin}
                        style={styles.loginActionButton}
                        labelStyle={styles.buttonLabel}
                        icon="login"
                      >
                        {t.signIn || 'Sign In'}
                      </Button>
                      
                      <Button
                        mode="text"
                        onPress={toggleLoginForm}
                        style={styles.cancelButton}
                        labelStyle={styles.cancelButtonLabel}
                      >
                        Cancel
                      </Button>
                      
                      {message ? (
                        <Text style={[
                          styles.messageText,
                          message.includes('successful') ? styles.successMessage : styles.errorMessage
                        ]}>
                          {message}
                        </Text>
                      ) : null}
                    </Card.Content>
                  </Card>
                ) : (
                  /* Action Buttons (Visible when login form is hidden) */
                  <View style={styles.actionButtons}>
                    <Button
                      mode="contained"
                      onPress={toggleLoginForm}
                      style={[styles.actionButton, styles.loginButton]}
                      labelStyle={styles.buttonLabel}
                      icon="login"
                    >
                      {t.login || 'Login'}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={handleSignUpNavigation}
                      style={[styles.actionButton, styles.signupButton]}
                      labelStyle={[styles.buttonLabel, styles.signupButtonLabel]}
                      icon="account-plus"
                    >
                      {t.signUp || 'Sign Up'}
                    </Button>
                  </View>
                )}

                <Text style={styles.footerText}>
                  Designed exclusively for Ayurvedic practitioners
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
    backgroundColor: '#e8f5e8',
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  slideIcon: {
    fontSize: height < 700 ? 40 : 50,
    marginBottom: 15,
  },
  slideTitle: {
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: height < 700 ? 20 : 24,
    lineHeight: height < 700 ? 26 : 30,
  },
  slideSubtitle: {
    color: '#4caf50',
    fontSize: height < 700 ? 14 : 16,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
    lineHeight: height < 700 ? 18 : 22,
  },
  slideDescription: {
    fontSize: height < 700 ? 12 : 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: height < 700 ? 16 : 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 15,
    backgroundColor: '#e8f5e8',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: '#4caf50',
    width: 16,
  },
  inactiveIndicator: {
    backgroundColor: '#c8e6c9',
  },
  bottomSection: {
    height: height * 0.4,
    minHeight: 300,
    paddingHorizontal: 20,
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 15,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  languageToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  languageButton: {
    marginHorizontal: 4,
    borderRadius: 12,
    minWidth: 70,
  },
  languageButtonLabel: {
    fontSize: 11,
  },
  appBrand: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appIcon: {
    fontSize: height < 700 ? 28 : 35,
    marginBottom: 6,
  },
  appName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: height < 700 ? 16 : 20,
    marginBottom: 2,
  },
  appTagline: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: height < 700 ? 12 : 14,
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    textAlign: 'center',
    color: '#2e7d32',
    fontWeight: 'bold',
    marginBottom: 20,
    fontSize: 18,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  actionButtons: {
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    borderRadius: 20,
    paddingVertical: 2,
    height: 44,
    justifyContent: 'center',
  },
  loginActionButton: {
    backgroundColor: '#4caf50',
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 5,
    height: 44,
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#4caf50',
  },
  signupButton: {
    borderColor: 'white',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  signupButtonLabel: {
    color: 'white',
  },
  cancelButton: {
    marginTop: 5,
  },
  cancelButtonLabel: {
    color: '#4caf50',
    fontSize: 13,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontSize: 11,
    fontStyle: 'italic',
  },
  messageText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorMessage: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  successMessage: {
    color: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
});