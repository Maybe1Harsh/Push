import * as React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from './hooks/useTranslation';
import PatientConsentModal from './PatientConsentModal';
import { User, FileText, Calendar, MapPin, Calculator, Leaf, Bell, Clock } from 'lucide-react-native';

export default function DashboardScreen({ navigation, route }) {
  const { t } = useTranslation();
  const profile = route.params?.profile;

  const [pendingRequests, setPendingRequests] = React.useState([]);
  const [assignedDoctor, setAssignedDoctor] = React.useState(null);
  const [scheduledAppointments, setScheduledAppointments] = React.useState([]);
  const [loadingAppointments, setLoadingAppointments] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Slideshow state for infinite scroll
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [actualSlideIndex, setActualSlideIndex] = React.useState(0);
  const slideshowRef = React.useRef(null);
  const { width } = Dimensions.get('window');
  const isScrolling = React.useRef(false);
  const autoScrollEnabled = React.useRef(true);
  const repositioning = React.useRef(false);

  // Original wellness features for slideshow
  const originalWellnessFeatures = [
    {
      id: 1,
      title: 'Dosha Quiz',
      subtitle: 'Discover Your Constitution',
      description: 'Take our personalized quiz to understand your unique Ayurvedic body type',
      category: 'Assessment',
      emoji: '🔍',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&crop=center',
      onPress: () => navigation.navigate('DoshaQuiz'),
      style: 'doshaIconStyle'
    },
    {
      id: 2,
      title: 'Nutrition Tracker',
      subtitle: 'Monitor Your Diet',
      description: 'Track your daily nutrition and calorie intake for better health insights',
      category: 'Assessment',
      emoji: '📊',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&crop=center',
      onPress: () => navigation.navigate('CalorieCounter'),
      style: 'calorieIconStyle'
    },
    {
      id: 3,
      title: 'Expert Network',
      subtitle: 'Find Specialists',
      description: 'Connect with certified Ayurvedic practitioners and nutritionists near you',
      category: 'Expert Care',
      emoji: '👨‍⚕️',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
      onPress: () => navigation.navigate('NearbyDieticiansScreen'),
      style: 'expertsIconStyle'
    },
    {
      id: 4,
      title: 'Natural Healing',
      subtitle: 'Herbal Solutions',
      description: 'Explore traditional Ayurvedic remedies for common health conditions',
      category: 'Natural Remedies',
      emoji: '🌿',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=300&fit=crop&crop=center',
      onPress: () => navigation.navigate('AyurvedicRemedies'),
      style: 'herbalIconStyle'
    },
    {
      id: 5,
      title: 'Mind & Body',
      subtitle: 'Yoga Practice',
      description: 'Discover yoga poses and wellness practices for mental and physical balance',
      category: 'Natural Remedies',
      emoji: '🧘‍♀️',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center',
      onPress: () => navigation.navigate('YogaWellness'),
      style: 'yogaIconStyle'
    },
    {
      id: 6,
      title: 'VIRUDHA AHAR',
      subtitle: 'Incompatible Foods',
      description: 'Learn about incompatible food combinations in Ayurveda for better digestion',
      category: 'Ayurvedic Wisdom',
      emoji: '🚫🍽️',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&crop=center',
      onPress: () => navigation.navigate('ViruddhaAhara'),
      style: 'foodCombinationIconStyle'
    }
  ];

  // Create infinite scroll data by tripling the array
  const wellnessFeatures = React.useMemo(() => {
    if (originalWellnessFeatures.length === 0) return [];
    
    // Create triple array: [set1, set2, set3] for seamless infinite scroll
    const infiniteData = [
      ...originalWellnessFeatures.map((item, index) => ({ ...item, id: `set1_${index}`, originalIndex: index })),
      ...originalWellnessFeatures.map((item, index) => ({ ...item, id: `set2_${index}`, originalIndex: index })),
      ...originalWellnessFeatures.map((item, index) => ({ ...item, id: `set3_${index}`, originalIndex: index }))
    ];
    
    return infiniteData;
  }, []);

  // Initialize slideshow to middle set for infinite scroll
  React.useEffect(() => {
    if (slideshowRef.current && originalWellnessFeatures.length > 0) {
      // Start at the middle set (set2)
      const initialIndex = originalWellnessFeatures.length; // Start of set2
      const slideWidth = width - 48 + 16;
      const initialOffset = initialIndex * slideWidth;
      
      // Delay initialization to ensure FlatList is ready
      const timer = setTimeout(() => {
        if (slideshowRef.current) {
          slideshowRef.current.scrollToOffset({ offset: initialOffset, animated: false });
          setCurrentSlide(initialIndex);
          setActualSlideIndex(0);
          autoScrollEnabled.current = true;
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [originalWellnessFeatures.length, width]);

  // Auto-scroll functionality for infinite scroll
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (slideshowRef.current && 
          autoScrollEnabled.current && 
          !isScrolling.current && 
          !repositioning.current && 
          originalWellnessFeatures.length > 0) {
        
        const nextActualIndex = (actualSlideIndex + 1) % originalWellnessFeatures.length;
        const nextSlideIndex = currentSlide + 1;
        
        try {
          const slideWidth = width - 48 + 16;
          const offset = nextSlideIndex * slideWidth;
          
          isScrolling.current = true;
          slideshowRef.current.scrollToOffset({ offset, animated: true });
          setCurrentSlide(nextSlideIndex);
          setActualSlideIndex(nextActualIndex);
          
          // Re-enable after animation
          setTimeout(() => {
            isScrolling.current = false;
          }, 400);
        } catch (error) {
          console.log('Auto-scroll error:', error);
          isScrolling.current = false;
        }
      }
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [currentSlide, actualSlideIndex, originalWellnessFeatures.length, width]);

  // Consent state
  const [consentModalVisible, setConsentModalVisible] = React.useState(false);
  const [pendingApprovalRequest, setPendingApprovalRequest] = React.useState(null);

  // Fetch assigned doctor from the new patients → doctors relationship (from 1st dashboard)
  const fetchAssignedDoctor = React.useCallback(async () => {
    if (!profile?.email) return;

    try {
      console.log('Fetching assigned doctor for patient:', profile.email);

      const { data, error } = await supabase
        .from('patients')
        .select('id, name, doctor:doctors(id, name, specialization, email)')
        .eq('email', profile.email)
        .single();

      if (error) {
        console.error('Error fetching assigned doctor:', error.message);
        setAssignedDoctor(null);
        return;
      }

      setAssignedDoctor(data?.doctor ?? null);
      console.log('Assigned doctor:', data?.doctor);
    } catch (err) {
      console.error('Unexpected error fetching assigned doctor:', err);
      setAssignedDoctor(null);
    }
  }, [profile]);

  // Fetch pending requests (from 2nd dashboard)
  const fetchPendingRequests = React.useCallback(async () => {
    if (!profile?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_requests')
        .select(`
          *,
          doctor:doctor_email (
            name,
            email,
            specialization
          )
        `)
        .eq('patient_email', profile.email)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending requests:', error);
        return;
      }

      setPendingRequests(data || []);
      
      // Check for requests needing consent
      const needsConsent = data?.find(req => 
        req.status === 'pending' && 
        (!req.consent_status || req.consent_status === 'pending')
      );
      
      if (needsConsent) {
        setPendingApprovalRequest(needsConsent);
        setConsentModalVisible(true);
      }
    } catch (error) {
      console.error('Error in fetchPendingRequests:', error);
    }
  }, [profile]);

  // Fetch appointments (from 2nd dashboard)
  const fetchScheduledAppointments = React.useCallback(async () => {
    if (!profile?.email) return;
    
    setLoadingAppointments(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_email (
            name,
            email,
            specialization
          )
        `)
        .eq('patient_email', profile.email)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled appointments:', error);
        return;
      }

      setScheduledAppointments(data || []);
    } catch (error) {
      console.error('Error in fetchScheduledAppointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  }, [profile]);

  React.useEffect(() => {
    fetchPendingRequests();
    fetchAssignedDoctor();
    fetchScheduledAppointments();
  }, [fetchPendingRequests, fetchAssignedDoctor, fetchScheduledAppointments, profile]);

  // Supabase real-time listeners (from 1st dashboard with modifications)
  React.useEffect(() => {
    if (!profile?.email) return;

    const requestsChannel = supabase
      .channel('patient_requests_changes_' + profile.email)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_requests' }, payload => {
        if (payload.new?.patient_email === profile.email || payload.old?.patient_email === profile.email) {
          fetchPendingRequests();
          fetchAssignedDoctor();
        }
      })
      .subscribe();

    const appointmentsChannel = supabase
      .channel('patient_appointments_changes_' + profile.email)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, payload => {
        if (payload.new?.patient_email === profile.email || payload.old?.patient_email === profile.email) {
          fetchScheduledAppointments();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(appointmentsChannel);
    };
  }, [profile?.email, fetchPendingRequests, fetchScheduledAppointments, fetchAssignedDoctor]);

  const handleApprove = async (request) => {
    if (!request) return;

    setPendingApprovalRequest(request);
    setConsentModalVisible(true);
  };

  const handleReject = async (request) => {
    console.log('Reject request:', request);
  };

  const handleConsentStatusChange = async (accepted) => {
    if (!pendingApprovalRequest) return;
    
    try {
      const { error } = await supabase
        .from('patient_requests')
        .update({ 
          consent_status: accepted ? 'accepted' : 'rejected',
          consent_updated_at: new Date().toISOString()
        })
        .eq('id', pendingApprovalRequest.id);

      if (error) {
        console.error('Error updating consent status:', error);
        return;
      }

      // If consent was accepted, update the status to approved
      if (accepted) {
        const { error: approveError } = await supabase
          .from('patient_requests')
          .update({ 
            status: 'approved',
            approved_at: new Date().toISOString()
          })
          .eq('id', pendingApprovalRequest.id);

        if (approveError) {
          console.error('Error approving request:', approveError);
        }
      }

      // Close the modal and refresh data
      setConsentModalVisible(false);
      setPendingApprovalRequest(null);
      
      // Refresh data to reflect the changes
      fetchPendingRequests();
      fetchAssignedDoctor();
      
    } catch (error) {
      console.error('Error in handleConsentStatusChange:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear any stored user data
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('userSession');
      
      // Sign out from Supabase if there's an active session
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Navigate to Landing page
      navigation.reset({
        index: 0,
        routes: [{ name: 'Landing' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, still navigate to landing
      navigation.reset({
        index: 0,
        routes: [{ name: 'Landing' }],
      });
    }
  };

  // Slideshow render function for individual feature cards
  const renderSlide = ({ item }) => (
    <View 
      style={[styles.slide, { width: width - 64 }]} // Adjusted for proper spacing
    >
      <View style={styles.slideContent}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
        
        {/* Feature Image */}
        <View style={[styles.slideImageContainer, styles[item.style]]}>
          <Image 
            source={{ uri: item.image }}
            style={styles.slideImage}
          />
        </View>
        
        {/* Feature Details */}
        <View style={styles.slideDetails}>
          <View style={styles.slideHeader}>
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
          </View>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </View>
      </View>
    </View>
  );

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
    <>
      {!profile ? (
        <View style={styles.errorContainer}>
          <Text variant="headlineMedium" style={styles.errorText}>
            Error: No profile data found
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate('Landing')}>
            Go to Landing Page
          </Button>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header */}
            <Card style={styles.headerCard}>
              <Card.Content>
                <View style={styles.headerContent}>
                  <View style={styles.welcomeSection}>
                    <Text
                      variant="headlineMedium"
                      style={styles.welcomeText}
                    >
                      Welcome, {profile?.name || 'Patient'}
                    </Text>
                  </View>
                  
                  {/* Logout Button - Professional Blue Circle */}
                  <TouchableOpacity 
                    onPress={handleLogout}
                    style={styles.logoutButtonContainer}
                  >
                    <Text style={styles.logoutIcon}>🚪</Text>
                    <Text style={styles.logoutText}>
                      Sign Out
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>



            {/* Your Doctor Card - Prominent */}
            <Card style={[styles.card, styles.prominentCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <User size={24} color="#2e7d32" />
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Your Doctor
                  </Text>
                </View>

                {assignedDoctor ? (
                  <View style={styles.doctorContent}>
                    <Text style={styles.doctorName}>Dr. {assignedDoctor.name}</Text>
                    <Text style={styles.doctorSpecialization}>{assignedDoctor.specialization}</Text>
                    <Text style={styles.doctorStatus}>You are under Dr. {assignedDoctor.name}'s care</Text>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No doctor assigned yet</Text>
                    <Text style={styles.emptySubtext}>Approve a request to connect with a doctor</Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* Appointments Card */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Calendar size={24} color="#2e7d32" />
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Appointments
                  </Text>
                </View>

                {loadingAppointments ? (
                  <Text style={styles.loadingText}>Loading appointments...</Text>
                ) : scheduledAppointments.length > 0 ? (
                  <View>
                    <Text style={styles.appointmentCount}>{scheduledAppointments.length} Upcoming</Text>
                    <View style={styles.nextAppointment}>
                      <Clock size={16} color="#666" />
                      <Text style={styles.nextAppointmentText}>
                        Next: {new Date(scheduledAppointments[0]?.final_time || scheduledAppointments[0]?.requested_time).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No appointments scheduled</Text>
                  </View>
                )}
              </Card.Content>

              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('PatientAppointment', { patientEmail: profile?.email })}
                  style={styles.secondaryButton}
                >
                  Request New
                </Button>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PatientAppointmentsView', { profile })}
                  style={styles.primaryButton}
                >
                  View All
                </Button>
              </Card.Actions>
            </Card>

            {/* Prescriptions Card */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <FileText size={24} color="#2e7d32" />
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Prescriptions
                  </Text>
                </View>
                <Text style={styles.cardDescription}>Access your medical prescriptions and treatment plans</Text>
              </Card.Content>

              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PatientPrescriptions', { profile })}
                  style={styles.primaryButton}
                >
                  {t.dashViewPrescriptions}
                </Button>
              </Card.Actions>
            </Card>

            {/* Doctor Requests Card */}
            {pendingRequests.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Bell size={24} color="#9c27b0" />
                    <Text variant="titleLarge" style={styles.cardTitle}>
                      Doctor Requests ({pendingRequests.length})
                    </Text>
                  </View>

                  {pendingRequests.map((request) => (
                    <View key={request.id} style={styles.requestItem}>
                      <Text style={styles.requestText}>Dr. {request.doctor.name}</Text>
                      <Text style={styles.requestSpecialization}>{request.doctor.specialization}</Text>
                      <View style={styles.requestActions}>
                        <Button
                          mode="contained"
                          onPress={() => handleApprove(request)}
                          loading={loading}
                          disabled={loading}
                          style={styles.approveButton}
                        >
                          {t.commonApprove}
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => handleReject(request)}
                          disabled={loading}
                          style={styles.rejectButton}
                        >
                          {t.commonReject}
                        </Button>
                      </View>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Wellness by Category - Slideshow */}
            <Card style={styles.modernCard}>
              <Card.Content style={styles.modernCardContent}>
                <View style={styles.headerSection}>
                  <Text variant="headlineSmall" style={styles.modernCardTitle}>
                    🌿 Wellness by Category
                  </Text>
                  <Text style={styles.modernCardSubtitle}>
                    Swipe to explore Ayurvedic solutions for your wellness journey
                  </Text>
                  <View style={styles.decorativeLine} />
                </View>

                {/* Slideshow */}
                <FlatList
                  ref={slideshowRef}
                  data={wellnessFeatures}
                  renderItem={renderSlide}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={width - 48 + 16} // slide width + margin
                  snapToAlignment="start"
                  decelerationRate="fast"
                  onScroll={(event) => {
                    if (originalWellnessFeatures.length === 0 || repositioning.current) return;
                    
                    const slideWidth = width - 48 + 16;
                    const currentOffset = event.nativeEvent.contentOffset.x;
                    const slideIndex = Math.round(currentOffset / slideWidth);
                    
                    // Update current slide
                    if (slideIndex !== currentSlide && !repositioning.current) {
                      setCurrentSlide(slideIndex);
                    }
                    
                    // Calculate actual slide for pagination dots (real-time updates)
                    const newActualIndex = slideIndex % originalWellnessFeatures.length;
                    if (newActualIndex !== actualSlideIndex) {
                      setActualSlideIndex(newActualIndex);
                    }
                  }}
                  onMomentumScrollEnd={(event) => {
                    if (originalWellnessFeatures.length === 0 || repositioning.current) return;
                    
                    const slideWidth = width - 48 + 16;
                    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
                    const originalLength = originalWellnessFeatures.length;
                    
                    setCurrentSlide(slideIndex);
                    
                    // Calculate actual slide for pagination
                    const newActualIndex = slideIndex % originalLength;
                    setActualSlideIndex(newActualIndex);
                    
                    // Handle infinite scroll repositioning with improved logic
                    const shouldReposition = slideIndex <= 1 || slideIndex >= (originalLength * 2) - 1;
                    
                    if (shouldReposition && !repositioning.current) {
                      repositioning.current = true;
                      autoScrollEnabled.current = false;
                      
                      let targetIndex;
                      if (slideIndex <= 1) {
                        // If near or at the beginning of first set, jump to middle set equivalent
                        targetIndex = slideIndex + originalLength;
                      } else {
                        // If near or at the end of third set, jump to middle set equivalent
                        targetIndex = slideIndex - originalLength;
                      }
                      
                      const targetOffset = targetIndex * slideWidth;
                      
                      // Perform invisible jump with minimal delay
                      setTimeout(() => {
                        if (slideshowRef.current && repositioning.current) {
                          slideshowRef.current.scrollToOffset({ 
                            offset: targetOffset, 
                            animated: false 
                          });
                          setCurrentSlide(targetIndex);
                          
                          // Re-enable auto-scroll after repositioning
                          setTimeout(() => {
                            repositioning.current = false;
                            autoScrollEnabled.current = true;
                          }, 50);
                        }
                      }, 30);
                    }
                  }}
                  onScrollBeginDrag={() => {
                    isScrolling.current = true;
                    autoScrollEnabled.current = false; // Disable auto-scroll when user interacts
                  }}
                  onScrollEndDrag={() => {
                    setTimeout(() => {
                      isScrolling.current = false;
                      if (!repositioning.current) {
                        autoScrollEnabled.current = true; // Re-enable auto-scroll
                      }
                    }, 200);
                  }}
                  scrollEventThrottle={16}
                  onScrollToIndexFailed={(info) => {
                    console.log('Scroll to index failed:', info);
                    // Fallback: scroll to offset
                    const slideWidth = width - 48 + 16;
                    const offset = info.index * slideWidth;
                    setTimeout(() => {
                      slideshowRef.current?.scrollToOffset({ offset, animated: false });
                    }, 100);
                  }}
                  style={styles.slideshow}
                />



                {/* All Features List */}
                <View style={styles.featuresListSection}>
                  <View style={styles.featuresHeader}>
                    <View style={styles.categoryIconBadge}>
                      <Text style={styles.categoryEmoji}>🎯</Text>
                    </View>
                    <Text style={styles.categoryTitle}>Explore All Features</Text>
                  </View>
                  <Text style={styles.featuresSubtitle}>Choose any feature to get started with your wellness journey</Text>
                  
                  <View style={styles.featuresGrid}>
                    {originalWellnessFeatures.map((feature, index) => (
                      <TouchableOpacity
                        key={feature.id}
                        style={styles.featureListItem}
                        onPress={feature.onPress}
                        activeOpacity={0.7}
                      >
                        <View style={styles.featureListIcon}>
                          <Text style={styles.featureListEmoji}>{feature.emoji}</Text>
                        </View>
                        <View style={styles.featureListContent}>
                          <Text style={styles.featureListTitle}>{feature.title}</Text>
                          <Text style={styles.featureListSubtitle}>{feature.subtitle}</Text>
                          <View style={styles.featureListCategory}>
                            <Text style={styles.featureListCategoryText}>{feature.category}</Text>
                          </View>
                        </View>
                        <View style={styles.featureListArrow}>
                          <Text style={styles.featureListArrowText}>→</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Quick Access */}
                <View style={styles.quickAccessSection}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryIconBadge}>
                      <Text style={styles.categoryEmoji}>⚡</Text>
                    </View>
                    <Text style={styles.categoryTitle}>Quick Access</Text>
                  </View>
                  <Text style={styles.categoryDescription}>Instant access to your health tools</Text>
                  <View style={styles.quickAccessGrid}>
                    <TouchableOpacity 
                      style={styles.quickAccessItem}
                      onPress={() => navigation.navigate('PatientAppointment', { patientEmail: profile?.email })}
                    >
                      <View style={styles.quickAccessIconContainer}>
                        <Calendar size={20} color="#4caf50" />
                      </View>
                      <Text style={styles.quickAccessText}>Book Appointment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.quickAccessItem}
                      onPress={() => navigation.navigate('PatientPrescriptions', { profile })}
                    >
                      <View style={styles.quickAccessIconContainer}>
                        <FileText size={20} color="#4caf50" />
                      </View>
                      <Text style={styles.quickAccessText}>My Prescriptions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>

          <PatientConsentModal
            visible={consentModalVisible}
            onClose={() => {
              setConsentModalVisible(false);
              setPendingApprovalRequest(null);
            }}
            patientProfile={profile}
            assignedDoctor={
              pendingApprovalRequest
                ? {
                    email: pendingApprovalRequest.doctor_email,
                    name: pendingApprovalRequest.doctor.name,
                  }
                : null
            }
            onConsentStatusChange={handleConsentStatusChange}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#e8f5e8',
  },
  headerCard: {
    marginBottom: 20,
    backgroundColor: '#4caf50',
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  logoutButtonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutIcon: {
    fontSize: 18,
    color: 'white',
  },
  logoutText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quickActionButton: {
    backgroundColor: '#4caf50',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prominentCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#2e7d32',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#000000',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#4caf50',
    borderRadius: 10,
    paddingVertical: 5,
  },
  secondaryButton: {
    borderColor: '#4caf50',
    borderRadius: 10,
  },
  approveButton: {
    backgroundColor: '#4caf50',
    marginRight: 8,
    flex: 1,
    borderRadius: 10,
  },
  rejectButton: {
    borderColor: '#f44336',
    borderRadius: 10,
    flex: 1,
  },
  doctorContent: {
    marginTop: 8,
  },
  doctorName: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorSpecialization: {
    color: '#2e7d32',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  doctorStatus: {
    color: '#000000',
    fontSize: 14,
  },
  emptyState: {
    marginTop: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  appointmentCount: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nextAppointment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextAppointmentText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  requestItem: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f5f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9c27b0',
  },
  requestText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  requestSpecialization: {
    color: '#2e7d32',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  modernCardContent: {
    padding: 24,
  },
  headerSection: {
    marginBottom: 28,
    alignItems: 'center',
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: '#4caf50',
    borderRadius: 2,
    marginTop: 12,
  },
  modernCardTitle: {
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modernCardSubtitle: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  categorySection: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f8f0',
  },
  slideshow: {
    marginBottom: 20,
  },
  slide: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  slideContent: {
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  slideImageContainer: {
    width: 200,
    height: 150,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  slideDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slideEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  slideSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  slideAction: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  slideActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    letterSpacing: 0.5,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
    paddingLeft: 38,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  modernFeatureItem: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  modernFeatureIcon: {
    width: 160,
    height: 120,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  doshaIconStyle: {
    backgroundColor: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%)',
  },
  calorieIconStyle: {
    backgroundColor: 'linear-gradient(135deg, #fff8e1 0%, #f9f5d7 100%)',
  },
  expertsIconStyle: {
    backgroundColor: 'linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%)',
  },
  herbalIconStyle: {
    backgroundColor: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
  },
  yogaIconStyle: {
    backgroundColor: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
  },
  lifestyleIconStyle: {
    backgroundColor: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
  },

  featureImage: {
    width: 160,
    height: 120,
    borderRadius: 22,
    resizeMode: 'cover',
  },
  modernFeatureTitle: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  modernFeatureSubtitle: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quickAccessSection: {
    marginTop: 16,
    borderBottomWidth: 0,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f8f0',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAccessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8e9',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  quickAccessIconContainer: {
    marginRight: 8,
  },
  quickAccessText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresListSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f8f0',
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  featuresSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  featuresGrid: {
    gap: 12,
  },
  featureListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fff8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  featureListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureListEmoji: {
    fontSize: 18,
  },
  featureListContent: {
    flex: 1,
  },
  featureListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 2,
  },
  featureListSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  featureListCategory: {
    alignSelf: 'flex-start',
  },
  featureListCategoryText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '600',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featureListArrow: {
    marginLeft: 8,
  },
  featureListArrowText: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8f5e8',
  },
  errorText: {
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
});