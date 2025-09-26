import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Button, Card, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced data with icons and categories
const dashboardItems = [
  {
    id: 1,
    title: 'Request Appointment',
    subtitle: 'Book consultation with doctors',
    icon: '📅',
    color: ['#4caf50', '#66bb6a'],
    navigation: 'PatientAppointment'
  },
  {
    id: 2,
    title: 'Ayurvedic Remedies',
    subtitle: 'Natural healing solutions',
    icon: '🌿',
    color: ['#2e7d32', '#4caf50'],
    navigation: 'AyurvedicRemedies'
  },
  {
    id: 3,
    title: 'Prescriptions',
    subtitle: 'View your medical history',
    icon: '💊',
    color: ['#1976d2', '#42a5f5'],
    navigation: 'PatientPrescriptions'
  },
  {
    id: 4,
    title: 'Yoga & Wellness',
    subtitle: 'Mind and body exercises',
    icon: '🧘‍♀️',
    color: ['#7b1fa2', '#ba68c8'],
    navigation: 'YogaWellness'
  }
];

// Data for the 10 basic yoga exercises with enhanced styling
const yogaExercises = [
  {
    name: 'Mountain Pose',
    sanskrit: 'Tadasana',
    icon: '🏔️',
    instructions: 'Stand tall with feet together, shoulders relaxed, and weight even. Breathe deeply, feeling grounded.',
    duration: '30-60 seconds',
    difficulty: 'Beginner'
  },
  {
    name: 'Downward-Facing Dog',
    sanskrit: 'Adho Mukha Svanasana',
    icon: '🐕',
    instructions: 'Start on hands and knees. Lift your hips up and back into an inverted "V" shape. Keep your head between your upper arms.',
    duration: '1-3 minutes',
    difficulty: 'Beginner'
  },
  {
    name: 'Warrior I',
    sanskrit: 'Virabhadrasana I',
    icon: '⚔️',
    instructions: 'Step one foot back. Bend your front knee to 90 degrees. Raise your arms straight up, palms facing each other.',
    duration: '30-60 seconds each side',
    difficulty: 'Intermediate'
  },
  {
    name: 'Tree Pose',
    sanskrit: 'Vrksasana',
    icon: '🌳',
    instructions: 'Place the sole of one foot on your opposite inner thigh or calf (not the knee). Bring hands together at your chest.',
    duration: '30-60 seconds each side',
    difficulty: 'Intermediate'
  },
  {
    name: 'Triangle Pose',
    sanskrit: 'Trikonasana',
    icon: '📐',
    instructions: 'Stand with feet wide. Turn one foot out 90 degrees. Hinge at your hip, bringing one hand to your shin and extending the other arm up.',
    duration: '30-60 seconds each side',
    difficulty: 'Intermediate'
  },
  {
    name: 'Bridge Pose',
    sanskrit: 'Setu Bandhasana',
    icon: '🌉',
    instructions: 'Lie on your back with knees bent. Press your feet into the floor and lift your hips toward the ceiling.',
    duration: '30-60 seconds',
    difficulty: 'Beginner'
  },
  {
    name: 'Cobra Pose',
    sanskrit: 'Bhujangasana',
    icon: '🐍',
    instructions: 'Lie on your stomach with hands under your shoulders. Slowly lift your head and chest, keeping your hips on the floor.',
    duration: '15-30 seconds',
    difficulty: 'Beginner'
  },
  {
    name: 'Seated Forward Bend',
    sanskrit: 'Paschimottanasana',
    icon: '🪑',
    instructions: 'Sit with legs extended. Inhale to lengthen your spine, then exhale and fold forward over your legs.',
    duration: '1-3 minutes',
    difficulty: 'Intermediate'
  },
  {
    name: 'Cat-Cow Stretch',
    sanskrit: 'Marjaryasana-Bitilasana',
    icon: '🐱',
    instructions: 'On hands and knees, inhale to drop your belly and look up (Cow). Exhale to round your spine (Cat).',
    duration: '1-2 minutes',
    difficulty: 'Beginner'
  },
  {
    name: 'Child\'s Pose',
    sanskrit: 'Balasana',
    icon: '🧘',
    instructions: 'Kneel, sit back on your heels, and fold forward, resting your forehead on the floor. Extend arms forward or rest them by your sides.',
    duration: '1-5 minutes',
    difficulty: 'Beginner'
  }
];

export default function PatientDashboard({ navigation, route }) {
  const { patientEmail } = route.params;
  // State to control the visibility of the yoga exercises
  const [showYoga, setShowYoga] = React.useState(false);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const yogaAnimation = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const particleAnimations = useRef(Array.from({ length: 6 }, () => ({
    translateY: new Animated.Value(0),
    opacity: new Animated.Value(0.3),
    scale: new Animated.Value(1),
  }))).current;
  
  const cardAnimations = useRef(dashboardItems.map(() => ({
    scale: new Animated.Value(1),
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(30),
    rotation: new Animated.Value(0),
    shimmer: new Animated.Value(0),
  }))).current;

  useEffect(() => {
    // Enhanced header animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous floating animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Continuous pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Floating particles animation
    particleAnimations.forEach((particle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 500),
          Animated.parallel([
            Animated.timing(particle.translateY, {
              toValue: -50,
              duration: 4000 + index * 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(particle.scale, {
                toValue: 1.2,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.scale, {
                toValue: 0.8,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(particle.translateY, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    // Enhanced staggered card animations with rotation
    dashboardItems.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(500 + index * 200),
        Animated.parallel([
          Animated.spring(cardAnimations[index].opacity, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(cardAnimations[index].translateY, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(cardAnimations[index].rotation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Shimmer effect for cards
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 1000),
          Animated.timing(cardAnimations[index].shimmer, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(cardAnimations[index].shimmer, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handleCardPress = (item, index) => {
    // Enhanced card press animation with multiple effects
    Animated.parallel([
      Animated.sequence([
        Animated.timing(cardAnimations[index].scale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(cardAnimations[index].scale, {
          toValue: 1.05,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnimations[index].scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Rotation effect on press
      Animated.sequence([
        Animated.timing(cardAnimations[index].rotation, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnimations[index].rotation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(() => {
      if (item.navigation === 'PatientAppointment') {
        navigation.navigate('PatientAppointment', { patientEmail });
      } else if (item.navigation) {
        navigation.navigate(item.navigation);
      }
    }, 300);
  };

  const toggleYoga = () => {
    const toValue = showYoga ? 0 : 1;
    setShowYoga(!showYoga);
    
    Animated.spring(yogaAnimation, {
      toValue,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  // Floating particles component
  const FloatingParticles = () => {
    const particles = ['🌿', '✨', '🧘‍♀️', '💚', '🌸', '🌱'];
    return (
      <View style={styles.particlesContainer}>
        {particleAnimations.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: `${15 + index * 15}%`,
                opacity: particle.opacity,
                transform: [
                  { translateY: particle.translateY },
                  { scale: particle.scale },
                ],
              },
            ]}
          >
            <Text style={styles.particleEmoji}>{particles[index]}</Text>
          </Animated.View>
        ))}
      </View>
    );
  };

  const AnimatedCard = ({ item, index }) => {
    return (
      <Animated.View
        style={[
          {
            opacity: cardAnimations[index].opacity,
            transform: [
              { translateY: cardAnimations[index].translateY },
              { scale: cardAnimations[index].scale },
              {
                rotate: cardAnimations[index].rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['5deg', '0deg'],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleCardPress(item, index)}
        >
          <View style={styles.cardWrapper}>
            {/* Shimmer overlay */}
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  opacity: cardAnimations[index].shimmer.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3],
                  }),
                  transform: [
                    {
                      translateX: cardAnimations[index].shimmer.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-screenWidth, screenWidth],
                      }),
                    },
                  ],
                },
              ]}
            />
            <LinearGradient
              colors={item.color}
              style={styles.dashboardCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <Animated.View 
                  style={[
                    styles.iconContainer,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <Text style={styles.cardIcon}>{item.icon}</Text>
                </Animated.View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
                <IconButton
                  icon="chevron-right"
                  iconColor="#ffffff"
                  size={24}
                  style={styles.chevron}
                />
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#e8f5e8', '#c8e6c9', '#a5d6a7']}
      style={styles.gradient}
    >
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Enhanced Animated Header Section */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: pulseAnim },
                  {
                    translateY: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Shimmer effect on logo */}
            <Animated.View
              style={[
                styles.logoShimmer,
                {
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                  }),
                  transform: [
                    {
                      translateX: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 100],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text style={styles.logoEmoji}>🧘‍♀️</Text>
          </Animated.View>
          
          <Animated.Text 
            variant="headlineLarge" 
            style={[
              styles.title,
              {
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            Welcome to Your Dashboard
          </Animated.Text>
          
          <Animated.Text 
            style={[
              styles.subtitle,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            Your wellness journey starts here ✨
          </Animated.Text>
        </Animated.View>

        {/* Enhanced Dashboard Cards */}
        <View style={styles.cardsContainer}>
          {dashboardItems.map((item, index) => (
            <AnimatedCard key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Enhanced Yoga Toggle Button */}
        <TouchableOpacity onPress={toggleYoga} style={styles.yogaToggleContainer}>
          <Animated.View
            style={[
              {
                transform: [
                  {
                    scale: yogaAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#7b1fa2', '#ba68c8', '#ce93d8']}
              style={styles.yogaToggleButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.Text 
                style={[
                  styles.yogaToggleIcon,
                  {
                    transform: [
                      {
                        rotate: yogaAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                🧘‍♂️
              </Animated.Text>
              <Text style={styles.yogaToggleText}>
                {showYoga ? 'Hide Yoga Exercises' : 'Show Basic Yoga Exercises'}
              </Text>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: yogaAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                    {
                      scale: yogaAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                }}
              >
                <Text style={styles.chevronDown}>▼</Text>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {/* Enhanced Animated Yoga Exercises */}
        {showYoga && (
          <Animated.View
            style={[
              styles.yogaContainer,
              {
                opacity: yogaAnimation,
                transform: [
                  {
                    scale: yogaAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                  {
                    translateY: yogaAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                  {
                    rotateX: yogaAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['15deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)', 'rgba(232, 245, 232, 0.9)']}
              style={styles.yogaCard}
            >
              <Animated.Text 
                style={[
                  styles.yogaHeader,
                  {
                    transform: [
                      {
                        scale: yogaAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                🧘‍♀️ 10 Essential Yoga Poses
              </Animated.Text>
              
              <Animated.Text 
                style={[
                  styles.yogaSubheader,
                  {
                    opacity: yogaAnimation,
                    transform: [
                      {
                        translateY: yogaAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                Transform your mind and body with ancient wisdom ✨
              </Animated.Text>
              
              {yogaExercises.map((exercise, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.yogaItem,
                    {
                      opacity: yogaAnimation,
                      transform: [
                        {
                          translateX: yogaAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [index % 2 === 0 ? -100 : 100, 0],
                          }),
                        },
                        {
                          scale: yogaAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.yogaHeaderRow}>
                    <Animated.View 
                      style={[
                        styles.yogaIconContainer,
                        {
                          transform: [
                            {
                              rotate: yogaAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                            {
                              scale: yogaAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.yogaIcon}>{exercise.icon}</Text>
                    </Animated.View>
                    <View style={styles.yogaTitleContainer}>
                      <Text style={styles.yogaTitle}>{exercise.name}</Text>
                      <Text style={styles.yogaSanskrit}>{exercise.sanskrit}</Text>
                    </View>
                    <Animated.View 
                      style={[
                        styles.yogaBadge,
                        {
                          transform: [
                            {
                              scale: yogaAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.yogaBadgeText}>{exercise.difficulty}</Text>
                    </Animated.View>
                  </View>
                  
                  <Animated.Text 
                    style={[
                      styles.yogaInstructions,
                      {
                        opacity: yogaAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ]}
                  >
                    {exercise.instructions}
                  </Animated.Text>
                  
                  <Animated.View 
                    style={[
                      styles.yogaFooter,
                      {
                        transform: [
                          {
                            translateY: yogaAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.durationContainer}>
                      <Text style={styles.durationIcon}>⏱️</Text>
                      <Text style={styles.durationText}>{exercise.duration}</Text>
                    </View>
                  </Animated.View>
                </Animated.View>
              ))}
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 45,
  },
  title: {
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#424242',
    textAlign: 'center',
    fontWeight: '500',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dashboardCard: {
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardIcon: {
    fontSize: 30,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chevron: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  yogaToggleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  yogaToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 25,
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  yogaToggleIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  yogaToggleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chevronDown: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  yogaContainer: {
    paddingHorizontal: 20,
  },
  yogaCard: {
    borderRadius: 25,
    padding: 25,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  yogaHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 8,
  },
  yogaSubheader: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 25,
    fontStyle: 'italic',
  },
  yogaItem: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#4caf50',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  yogaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  yogaIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#e8f5e8',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  yogaIcon: {
    fontSize: 24,
  },
  yogaTitleContainer: {
    flex: 1,
  },
  yogaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 2,
  },
  yogaSanskrit: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  yogaBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yogaBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  yogaInstructions: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
    marginBottom: 15,
  },
  yogaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  durationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  durationText: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '600',
  },
});
