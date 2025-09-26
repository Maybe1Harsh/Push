import * as React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, RadioButton, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from './supabaseClient';
import { useTranslation } from './hooks/useTranslation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [role, setRole] = React.useState('patient');
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isRegister, setIsRegister] = React.useState(false);

  const handleLogin = async () => {
    console.log('Login button clicked');
    setLoading(true);
    
    // Simple 2-second test
    setTimeout(() => {
      console.log('Test complete');
      setLoading(false);
      setMessage('Test completed - check console');
    }, 2000);
    
    if (!email || !password) {
      setMessage(t.pleaseEnterEmailPassword);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log('Auth result:', { data, error }); // Debug log
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    const { data: profileData, error: profileError } = await supabase
      .from('Profiles')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Profile result:', { profileData, profileError }); // Debug log

    if (profileError || !profileData) {
      setMessage(t.profileNotFound);
      return;
    }

    setMessage(t.loginSuccess);
    
    // Save profile to AsyncStorage for both doctor and patient
    await AsyncStorage.setItem('profile', JSON.stringify(profileData));
    console.log('Navigating with profile:', profileData); // Debug log
    
    if (profileData.Role === 'doctor') {
      navigation.replace('DoctorDashboard', { profile: profileData });
    } else {
      navigation.replace('Dashboard', { profile: profileData });
    }
  };

  const handleRegister = async () => {
    if (!name || !age || !email || !password || !address) {
      setMessage(t.fillAllFields);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    setMessage(error ? error.message : t.registrationSuccess);

    if (!error) {
      const { error: insertError } = await supabase
        .from('Profiles')
        .insert([
          {
            name: name,
            age: parseInt(age),
            email: email,
            address: address,
            Role: role
          }
        ]);
      if (insertError) {
        setMessage(t.errorSavingProfile + insertError.message);
      }
    }
  };

  return (
    <View style={loginStyles.container}>
      <LinearGradient
        colors={['#b3e8beff', '#323c0bff', '#2a3d09ff']}
        style={loginStyles.gradient}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={loginStyles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={28} color="#333" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={loginStyles.scrollContainer}>
          <View style={loginStyles.headerSection}>
            <View style={loginStyles.logoContainer}>
              <Text style={loginStyles.logoEmoji}>🌿</Text>
            </View>
            <Text variant="headlineLarge" style={loginStyles.title}>
              CureVeda
            </Text>
            <Text variant="titleMedium" style={loginStyles.subtitle}>
              {isRegister ? t.createAccount : t.welcomeBack}
            </Text>
          </View>

          <Card style={loginStyles.formCard}>
            <Card.Content style={loginStyles.cardContent}>
              {isRegister && (
                <>
                  <TextInput
                    label={t.fullName}
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={loginStyles.input}
                    left={<TextInput.Icon icon="account" />}
                  />
                  <TextInput
                    label={t.age}
                    value={age}
                    onChangeText={setAge}
                    mode="outlined"
                    keyboardType="numeric"
                    style={loginStyles.input}
                    left={<TextInput.Icon icon="calendar" />}
                  />
                  <TextInput
                    label={t.address}
                    value={address}
                    onChangeText={setAddress}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={loginStyles.input}
                    left={<TextInput.Icon icon="map-marker" />}
                    placeholder={t.address}
                  />
                  <View style={loginStyles.roleSection}>
                    <Text style={loginStyles.roleLabel}>{t.registerAs}</Text>
                    <RadioButton.Group onValueChange={setRole} value={role}>
                      <View style={loginStyles.radioContainer}>
                        <RadioButton.Item 
                          label={t.patient} 
                          value="patient" 
                          labelStyle={loginStyles.radioLabel}
                        />
                        <RadioButton.Item 
                          label={t.doctor} 
                          value="doctor" 
                          labelStyle={loginStyles.radioLabel}
                        />
                      </View>
                    </RadioButton.Group>
                  </View>
                </>
              )}
              
              <TextInput
                label={t.email}
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={loginStyles.input}
                left={<TextInput.Icon icon="email" />}
              />
              
              <TextInput
                label={t.password}
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={loginStyles.input}
                left={<TextInput.Icon icon="lock" />}
              />
              
              <Button
                mode="contained"
                loading={loading}
                disabled={loading}
                onPress={isRegister ? handleRegister : handleLogin}
                style={loginStyles.submitButton}
                labelStyle={loginStyles.submitButtonLabel}
                contentStyle={loginStyles.submitButtonContent}
              >
                {isRegister ? t.createAccount : t.signIn}
              </Button>
              
              <Text
                style={loginStyles.switchText}
                onPress={() => {
                  setIsRegister(!isRegister);
                  setMessage('');
                  setName('');
                  setAge('');
                  setAddress('');
                  setEmail('');
                  setPassword('');
                }}
              >
                {isRegister ? t.alreadyHaveAccount : t.dontHaveAccount}
              </Text>
              
              {message ? (
                <Text style={loginStyles.messageText}>{message}</Text>
              ) : null}
            </Card.Content>
          </Card>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 35,
  },
  title: {
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#4caf50',
    textAlign: 'center',
    fontWeight: '500',
  },
  formCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  cardContent: {
    padding: 25,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  roleSection: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
  },
  roleLabel: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioLabel: {
    fontSize: 14,
    color: '#424242',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  switchText: {
    color: '#4caf50',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  messageText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#d32f2f',
    fontSize: 14,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
});


