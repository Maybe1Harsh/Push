import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Dimensions, TouchableOpacity } from "react-native";
import { Text, Card, Button, Divider, TextInput, Modal, Portal, Provider as PaperProvider } from "react-native-paper";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from "./supabaseClient";

export default function DoctorDashboardScreen({ route, navigation }) {
  const doctorEmail = route.params?.profile?.email || "";
  const doctorName = route.params?.profile?.name || "Doctor";

  if (!doctorEmail) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e8' }}>
        <Text style={{ color: '#000000', fontSize: 18 }}>No doctor profile found. Please log in again.</Text>
      </View>
    );
  }

  // Diet Chart Templates
  const dietTemplates = [
    {
      id: 1,
      name: 'Vata Balancing Diet',
      description: 'Light, warm, and nourishing foods for Vata constitution',
      emoji: '🌿',
      meals: {
        breakfast: 'Garam doodh mein khajoor aur badam, daliya',
        lunch: 'Moong dal khichdi ghee ke saath, paka hua sabzi, chawal',
        dinner: 'Sabzi ka soup, chawal ya soft gehu ki roti',
        snacks: 'Adrak wali chai, bhige hue kishmish, aam ya kele jaise meethay phal'
      },
      guidelines: 'Khaana garam aur paka hua ho. Thanda, kaccha khana na khayein. Ghee aur tel ka upyog karein.'
    },
    {
      id: 2,
      name: 'Pitta Pacifying Diet',
      description: 'Cooling and calming foods for Pitta constitution',
      emoji: '🧊',
      meals: {
        breakfast: 'Tarbooz, nashpati, anaar, ya saunf ke paani ke saath phal',
        lunch: 'Basmati chawal, moong dal, kakdi, lauki, nariyal wali sabzi',
        dinner: 'Halka khichdi dhaniya-pudina chutney ke saath, ya thandi sabzi ka soup',
        snacks: 'Nariyal paani, meethay phal, gulab ya pudina wali chai'
      },
      guidelines: 'Thanda aur shant karne wala khaana khayein. Teekha aur mirch-masala kam karein.'
    },
    {
      id: 3,
      name: 'Kapha Reducing Diet',
      description: 'Light, warm, and stimulating foods for Kapha constitution',
      emoji: '🔥',
      meals: {
        breakfast: 'Adrak wali chai shahad ke saath, seb ya nashpati jaise halkay phal',
        lunch: 'Jau ya bajre ki roti, karela, palak, ya dal',
        dinner: 'Sabzi ka garam soup, kali mirch aur haldi ke saath',
        snacks: 'Bhuna chana, tulsi wali chai, anar ya seb'
      },
      guidelines: 'Halka, garam khaana khayein. Tel, dahi, aur bhari khana na khayein. Teekha aur katu swad shamil karein.'
    },
    {
      id: 4,
      name: 'General Ayurvedic Diet',
      description: 'Balanced diet suitable for all constitutions',
      emoji: '⚖️',
      meals: {
        breakfast: 'Seasonal phal (seb, angoor), bhige hue badam, cardamom wala daliya',
        lunch: 'Chawal, dal, roti, paka hua sabzi, salad nimbu ke saath',
        dinner: 'Halka khichdi, sabzi ka soup',
        snacks: 'Herbal chai (adrak, saunf, tulsi), phal, bhige hue nuts'
      },
      guidelines: 'Hamesha taza aur seasonal khana khayein. Chhe ras (meetha, khatta, lavan, katu, tikta, kashaya) shamil karein.'
    },
    {
      id: 5,
      name: 'Detox Diet',
      description: 'Cleansing diet for body purification',
      emoji: '🌱',
      meals: {
        breakfast: 'Garam nimbu paani shahad ke saath, papita ya seb',
        lunch: 'Moong dal khichdi haldi aur jeera ke saath',
        dinner: 'Sabzi ka saaf soup, kali mirch ke saath',
        snacks: 'Triphala ka kadha, jeera-dhaniya-adrak ka pani, halkay phal'
      },
      guidelines: 'Packet aur bazaar ka khana na khayein. Zyada paani piyein. Safaai karne wali jadi-booti shamil karein.'
    }
  ];

  const [patients, setPatients] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDietChartModal, setShowDietChartModal] = useState(false);
  const [dietSearchQuery, setDietSearchQuery] = useState('');

  // Filter diet charts based on search query
  const filteredDietTemplates = dietTemplates.filter(template => 
    template.name.toLowerCase().includes(dietSearchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(dietSearchQuery.toLowerCase())
  );

  // Debug function to check appointments
  const debugAppointments = useCallback(async () => {
    console.log('=== DEBUG: Checking all appointments ===');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_email', doctorEmail);
    
    console.log('All appointments for doctor:', data);
    console.log('Error (if any):', error);
    
    const acceptedOnes = data?.filter(app => app.status === 'accepted');
    console.log('Accepted appointments:', acceptedOnes);
    
    const today = new Date().toISOString().slice(0, 10);
    console.log('Today date:', today);
    
    acceptedOnes?.forEach(app => {
      const finalDate = app.final_time ? new Date(app.final_time).toISOString().slice(0, 10) : 'N/A';
      const requestedDate = app.requested_time ? new Date(app.requested_time).toISOString().slice(0, 10) : 'N/A';
      console.log(`Appointment ${app.id}: final_time date=${finalDate}, requested_time date=${requestedDate}`);
    });
  }, [doctorEmail]);

  // Handle date change and refresh schedule
  const handleDateChange = (newDate) => {
    console.log('Date change requested:', newDate);
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      alert('Please enter date in YYYY-MM-DD format (e.g., 2025-09-20)');
      return;
    }
    
    // Validate if it's a real date
    const dateObj = new Date(newDate);
    if (isNaN(dateObj.getTime()) || dateObj.toISOString().slice(0, 10) !== newDate) {
      alert('Please enter a valid date');
      return;
    }
    
    console.log('Date changed to:', newDate);
    setSelectedDate(newDate);
    setShowDatePicker(false);
    // Fetch schedule for the new date
    fetchScheduleForDate(newDate);
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    if (dateString === today) {
      return `Today (${date.toLocaleDateString('en-IN')})`;
    } else if (dateString === tomorrow) {
      return `Tomorrow (${date.toLocaleDateString('en-IN')})`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Generate date options for date picker (next 14 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().slice(0, 10);
      const displayDate = date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      dates.push({ value: dateString, label: displayDate });
    }
    return dates;
  };

  // Fetch patients assigned to this doctor
  const fetchPatients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_email", doctorEmail);

      if (error) {
        console.error('Error fetching patients:', error);
      } else {
        console.log('Fetched patients:', data);
        setPatients(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching patients:', err);
    }
  }, [doctorEmail]);

  // Fetch prescription history for a specific patient
  const fetchPrescriptionHistory = useCallback(async (patientEmail) => {
    try {
      console.log('Fetching prescription history for:', patientEmail);
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_email", patientEmail)
        .eq("doctor_email", doctorEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prescription history:', error);
        alert('Failed to fetch prescription history');
        return;
      }

      console.log('Fetched prescription history:', data);
      setPrescriptionHistory(data || []);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('Unexpected error fetching prescription history:', err);
      alert('Failed to fetch prescription history');
    }
  }, [doctorEmail]);

  // Fetch schedule for a specific date (manual schedule + accepted appointments)
  const fetchScheduleForDate = useCallback(async (targetDate = null) => {
    try {
      const dateToFetch = targetDate || selectedDate;
      console.log('Fetching schedule for date:', dateToFetch);
      
      // Fetch manual schedule entries for the selected date
      const { data: manualSchedule, error: scheduleError } = await supabase
        .from("doctor_schedule")
        .select("*")
        .eq("doctor_email", doctorEmail)
        .eq("date", dateToFetch)
        .order('start_time', { ascending: true });

      if (scheduleError) {
        console.error('Error fetching manual schedule:', scheduleError);
      } else {
        console.log('Manual schedule data for', dateToFetch, ':', manualSchedule);
      }

      // Fetch ALL accepted appointments for this doctor
      const { data: allAcceptedAppointments, error: appointmentError } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_email", doctorEmail)
        .eq("status", "accepted");

      if (appointmentError) {
        console.error('Error fetching accepted appointments:', appointmentError);
      } else {
        console.log('All accepted appointments:', allAcceptedAppointments);
      }

      // Filter appointments for the selected date manually
      let selectedDateAppointments = [];
      if (allAcceptedAppointments) {
        selectedDateAppointments = allAcceptedAppointments.filter(appointment => {
          // Check both final_time and requested_time
          const timeToCheck = appointment.final_time || appointment.requested_time;
          if (!timeToCheck) return false;
          
          const appointmentDate = new Date(timeToCheck).toISOString().slice(0, 10);
          console.log('Comparing dates - Target:', dateToFetch, 'Appointment:', appointmentDate, 'Time:', timeToCheck);
          return appointmentDate === dateToFetch;
        });
        console.log('Filtered appointments for', dateToFetch, ':', selectedDateAppointments);
      }

      // Combine and format the schedule data
      const combinedSchedule = [];
      
      // Add manual schedule entries
      if (manualSchedule && manualSchedule.length > 0) {
        manualSchedule.forEach(slot => {
          combinedSchedule.push({
            ...slot,
            type: 'manual_schedule',
            display_time: `${slot.start_time} - ${slot.end_time}`,
            title: 'Scheduled Time',
            status: slot.status || 'scheduled'
          });
        });
      }

      // Add accepted appointments
      if (selectedDateAppointments && selectedDateAppointments.length > 0) {
        selectedDateAppointments.forEach(appointment => {
          const timeToUse = appointment.final_time || appointment.requested_time;
          const appointmentTime = new Date(timeToUse);
          const timeStr = appointmentTime.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          });
          
          combinedSchedule.push({
            id: `appointment_${appointment.id}`,
            type: 'appointment',
            display_time: timeStr,
            title: `Appointment: ${appointment.patient_email}`,
            status: 'booked',
            patient_email: appointment.patient_email,
            notes: appointment.notes,
            appointment_id: appointment.id,
            final_time: timeToUse
          });
        });
      }

      console.log('Combined schedule before sorting:', combinedSchedule);

      // Sort by time (simpler sorting)
      combinedSchedule.sort((a, b) => {
        let timeA, timeB;
        
        if (a.type === 'manual_schedule') {
          timeA = new Date(`${dateToFetch}T${a.start_time}`);
        } else {
          timeA = new Date(a.final_time);
        }
        
        if (b.type === 'manual_schedule') {
          timeB = new Date(`${dateToFetch}T${b.start_time}`);
        } else {
          timeB = new Date(b.final_time);
        }
        
        return timeA - timeB;
      });

      console.log('Final combined schedule for', dateToFetch, ':', combinedSchedule);
      setTodaySchedule(combinedSchedule);
    } catch (err) {
      console.error('Unexpected error fetching schedule:', err);
    }
  }, [doctorEmail, selectedDate]);

  // Fetch pending appointments
  const fetchAppointments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_email', doctorEmail)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5); // Show only latest 5

      if (error) {
        console.error('Error fetching appointments:', error);
      } else {
        setAppointments(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching appointments:', err);
    }
  }, [doctorEmail]);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
      fetchScheduleForDate();
      fetchAppointments();
    }, [fetchPatients, fetchScheduleForDate, fetchAppointments])
  );

  // Filter patients based on search query
  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [patients, searchQuery]);

  // Real-time subscriptions for schedule updates
  React.useEffect(() => {
    const appointmentsChannel = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('=== REAL-TIME: Appointments change received! ===', payload);
          // Refresh schedule if it's this doctor's appointment
          if (payload.new?.doctor_email === doctorEmail || payload.old?.doctor_email === doctorEmail) {
            console.log('This doctor affected, refreshing...');
            setTimeout(() => {
              fetchScheduleForDate(); // Refresh schedule
              fetchAppointments(); // Refresh appointment requests
              debugAppointments(); // Debug current state
            }, 1000); // Small delay to ensure DB is updated
          }
        }
      )
      .subscribe();

    const scheduleChannel = supabase
      .channel('schedule_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_schedule',
        },
        (payload) => {
          console.log('Schedule change received!', payload);
          // Refresh schedule if it's this doctor's schedule
          if (payload.new?.doctor_email === doctorEmail || payload.old?.doctor_email === doctorEmail) {
            fetchScheduleForDate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(scheduleChannel);
    };
  }, [doctorEmail, fetchScheduleForDate, fetchAppointments, debugAppointments]);

  // Remove the old patients subscription and replace with this enhanced one
  React.useEffect(() => {
    const patientsChannel = supabase
      .channel('patients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
        },
        (payload) => {
          console.log('Patients change received!', payload);
          fetchPatients(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(patientsChannel);
    };
  }, [fetchPatients]);

  // Fix the declined requests query - remove the invalid join
  React.useEffect(() => {
    const checkDeclinedRequests = async () => {
      // Check if patient_requests table exists and has the right structure
      const { data, error } = await supabase
        .from('patient_requests')
        .select('id, patient_email') // Remove invalid join
        .eq('doctor_email', doctorEmail)
        .eq('status', 'declined');

      if (error) {
        console.error('Error fetching declined requests:', error);
        return;
      }

      if (data && data.length > 0) {
        const declinedPatients = data.map(req => req.patient_email).join(', ');
        alert(`The following patients have declined your request: ${declinedPatients}`);
      }
    };

    if (doctorEmail) {
      checkDeclinedRequests();
    }
  }, [doctorEmail]);

  const handleAccept = async (id) => {
    setLoading(true);
    try {
      // First get the appointment to check its requested_time
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching appointment:', fetchError);
        alert('Failed to fetch appointment details.');
        setLoading(false);
        return;
      }

      console.log('Accepting appointment:', appointment);

      // Update appointment status and set final_time to requested_time if not already set
      const updateData = { 
        status: 'accepted',
        final_time: appointment.final_time || appointment.requested_time || new Date().toISOString()
      };

      console.log('Updating appointment with data:', updateData);

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error accepting appointment:', error);
        alert('Failed to accept appointment.');
      } else {
        alert('Appointment accepted.');
        fetchAppointments(); // Refresh appointments
        fetchScheduleForDate(); // Refresh today's schedule to show the new appointment
      }
    } catch (err) {
      console.error('Unexpected error accepting appointment:', err);
      alert('Unexpected error occurred.');
    }
    setLoading(false);
  };

  const handleReject = async (id) => {
    setLoading(true);
    const { error } = await supabase.from('appointments').update({ status: 'rejected' }).eq('id', id);
    if (error) {
      alert('Failed to reject appointment.');
    } else {
      alert('Appointment rejected.');
      fetchAppointments(); // Refresh appointments
      fetchScheduleForDate(); // Refresh today's schedule to remove the rejected appointment
    }
    setLoading(false);
  };

  const formatTime = (timeString) => {
    try {
      return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return timeString;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('profile');
      navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
    } catch (e) {
      console.error('Logout error:', e);
      // Still navigate even if there's an error
      navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
    }
  };

  return (
    <PaperProvider>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          backgroundColor: "#e8f5e8",
        }}
      >
      {/* Header */}
      <Card style={{ marginBottom: 20, backgroundColor: "#4caf50" }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text
                variant="headlineMedium"
                style={{ color: "#000000", fontWeight: "bold" }}
              >
                Welcome, Dr. {doctorName}
              </Text>
            </View>
            
            {/* Logout Button - Professional Blue Circle */}
            <TouchableOpacity 
              onPress={handleLogout}
              style={{
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
              }}
            >
              <Text style={{ fontSize: 18, color: 'white' }}>🚪</Text>
              <Text style={{
                color: 'white',
                fontSize: 9,
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: 2
              }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("AddPatient", { doctorEmail })}
          style={{
            backgroundColor: "#4caf50",
            borderRadius: 10,
            paddingVertical: 5,
            paddingHorizontal: 20,
          }}
          labelStyle={{ fontSize: 14 }}
        >
          ➕ Add Patient
        </Button>
      </View>

      {/* Today's Schedule Section */}
      <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#f1f8e9' }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold" }}
            >
              📅 Schedule
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                mode="outlined"
                onPress={() => {
                  console.log('Navigating to DoctorSchedule with params:', route.params);
                  navigation.navigate("DoctorSchedule", { 
                    profile: route.params?.profile,
                    doctorEmail: doctorEmail,
                    doctorName: doctorName
                  });
                }}
                style={{ borderColor: '#4caf50' }}
                textColor="#4caf50"
                compact
              >
                Manage Schedule
              </Button>
            </View>
          </View>

          {/* Date Selector */}
          <View style={{ 
            backgroundColor: '#c8e6c9', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#000000', marginBottom: 2 }}>Viewing Schedule For:</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000000' }}>
                {formatDateForDisplay(selectedDate)}
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => setShowDatePicker(true)}
              compact
              style={{ backgroundColor: '#4caf50' }}
            >
              Change Date
            </Button>
          </View>

          {/* Quick Date Buttons */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-around', 
            marginBottom: 10,
            gap: 8
          }}>
            <Button
              mode={selectedDate === new Date().toISOString().slice(0, 10) ? "contained" : "outlined"}
              onPress={() => handleDateChange(new Date().toISOString().slice(0, 10))}
              compact
              style={{ 
                flex: 1,
                ...(selectedDate === new Date().toISOString().slice(0, 10) 
                  ? { backgroundColor: '#4caf50' } 
                  : { borderColor: '#4caf50' })
              }}
              textColor={selectedDate === new Date().toISOString().slice(0, 10) ? undefined : "#000000"}
            >
              Today
            </Button>
            <Button
              mode={selectedDate === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) ? "contained" : "outlined"}
              onPress={() => handleDateChange(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10))}
              compact
              style={{ 
                flex: 1,
                ...(selectedDate === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) 
                  ? { backgroundColor: '#4caf50' } 
                  : { borderColor: '#4caf50' })
              }}
              textColor={selectedDate === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) ? undefined : "#000000"}
            >
              Tomorrow
            </Button>
            <Button
              mode={selectedDate === new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) ? "contained" : "outlined"}
              onPress={() => handleDateChange(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))}
              compact
              style={{ 
                flex: 1,
                ...(selectedDate === new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) 
                  ? { backgroundColor: '#4caf50' } 
                  : { borderColor: '#4caf50' })
              }}
              textColor={selectedDate === new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) ? undefined : "#000000"}
            >
              Day After
            </Button>
          </View>
          
          {/* Schedule Summary */}
          {todaySchedule.length > 0 && (
            <View style={{ 
              backgroundColor: '#e8f5e8', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', color: '#000000' }}>
                  {todaySchedule.filter(item => item.type === 'manual_schedule').length}
                </Text>
                <Text style={{ fontSize: 12, color: '#000000' }}>Scheduled Slots</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', color: '#000000' }}>
                  {todaySchedule.filter(item => item.type === 'appointment').length}
                </Text>
                <Text style={{ fontSize: 12, color: '#000000' }}>Appointments</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', color: '#000000' }}>
                  {todaySchedule.length}
                </Text>
                <Text style={{ fontSize: 12, color: '#000000' }}>Total Items</Text>
              </View>
            </View>
          )}
          
          <Divider style={{ marginBottom: 10 }} />
          {todaySchedule.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ color: '#000000', marginBottom: 12, textAlign: 'center' }}>
                No schedule found for {formatDateForDisplay(selectedDate).toLowerCase()}.
              </Text>
              <Button
                mode="contained"
                onPress={() => {
                  console.log('Navigating to DoctorSchedule with params:', route.params);
                  navigation.navigate("DoctorSchedule", { 
                    profile: route.params?.profile,
                    doctorEmail: doctorEmail,
                    doctorName: doctorName
                  });
                }}
                style={{ backgroundColor: '#4caf50' }}
              >
                Add Schedule
              </Button>
            </View>
          ) : (
            todaySchedule.map((item, index) => (
              <Card
                key={item.id || `schedule_${index}`}
                style={{
                  marginBottom: 8,
                  backgroundColor: item.type === 'appointment' 
                    ? '#fff3e0' 
                    : item.status === 'scheduled' 
                      ? '#ffebee' 
                      : '#f3e5f5',
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: item.type === 'appointment' 
                    ? '#ff9800' 
                    : item.status === 'scheduled' 
                      ? '#f44336' 
                      : '#9c27b0'
                }}
              >
                <Card.Content style={{ paddingVertical: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                          {item.display_time}
                        </Text>
                        <View style={{
                          marginLeft: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 12,
                          backgroundColor: item.type === 'appointment' ? '#ff9800' : '#f44336'
                        }}>
                          <Text style={{ 
                            color: 'white', 
                            fontSize: 10, 
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            {item.type === 'appointment' ? 'APPOINTMENT' : 'SCHEDULED'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={{ 
                        color: '#333', 
                        fontSize: 14,
                        marginBottom: 2
                      }}>
                        {item.title}
                      </Text>
                      
                      {item.type === 'manual_schedule' && item.description && (
                        <Text style={{ color: '#000000', fontSize: 12 }}>
                          {item.description}
                        </Text>
                      )}
                      
                      {item.type === 'appointment' && item.notes && (
                        <Text style={{ color: '#000000', fontSize: 12, fontStyle: 'italic' }}>
                          Notes: {item.notes}
                        </Text>
                      )}
                    </View>
                    
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ 
                        color: item.type === 'appointment' 
                          ? '#f57c00' 
                          : item.status === 'scheduled' 
                            ? '#d32f2f' 
                            : '#7b1fa2',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                        fontSize: 12
                      }}>
                        {item.type === 'appointment' ? 'Booked' : 'Scheduled'}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Patients Section */}
      <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#f1f8e9' }}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginBottom: 15 }}
          >
            👥 My Patients ({patients.length})
          </Text>
          
          {/* Search Box */}
          <TextInput
            mode="outlined"
            placeholder="Search patients by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ 
              marginBottom: 15, 
              backgroundColor: '#ffffff',
              fontSize: 16
            }}
            left={<TextInput.Icon icon="magnify" />}
            right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : null}
          />
          
          <Divider style={{ marginBottom: 15 }} />
          
          {patients.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#000000', fontSize: 16 }}>
                No patients found. Patients will appear here when they approve your consultation requests.
              </Text>
            </View>
          ) : (
            <View>
              {/* Patient List - Scrollable */}
              <View style={{ maxHeight: 300 }}>
                <ScrollView nestedScrollEnabled={true}>
                  {filteredPatients.length === 0 ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#000000', fontSize: 16 }}>
                        No patients found matching "{searchQuery}"
                      </Text>
                    </View>
                  ) : (
                    filteredPatients.map((patient, index) => (
                      <Card
                        key={patient.id}
                        style={{
                          marginBottom: 8,
                          backgroundColor: selectedPatient?.id === patient.id ? '#c8e6c9' : '#ffffff',
                          borderRadius: 8,
                          borderWidth: selectedPatient?.id === patient.id ? 2 : 1,
                          borderColor: selectedPatient?.id === patient.id ? '#4caf50' : '#e0e0e0'
                        }}
                        onPress={() => setSelectedPatient(patient)}
                      >
                        <Card.Content style={{ paddingVertical: 12 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000000' }}>
                                {patient.name}
                              </Text>
                              <Text style={{ fontSize: 14, color: '#000000', marginTop: 2 }}>
                                {patient.email}
                              </Text>
                              <Text style={{ fontSize: 12, color: '#000000', marginTop: 2 }}>
                                Age: {patient.age} | ID: {patient.id.slice(0, 8)}...
                              </Text>
                            </View>
                            {selectedPatient?.id === patient.id && (
                              <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 20 }}>✓</Text>
                                <Text style={{ fontSize: 10, color: '#000000', fontWeight: 'bold' }}>
                                  SELECTED
                                </Text>
                              </View>
                            )}
                          </View>
                        </Card.Content>
                      </Card>
                    ))
                  )}
                </ScrollView>
              </View>

              {/* Patient Actions - Show when patient is selected */}
              {selectedPatient && (
                <Card style={{ 
                  marginTop: 15, 
                  backgroundColor: '#e8f5e8',
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#4caf50'
                }}>
                  <Card.Content>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: 'bold', 
                      color: '#000000', 
                      marginBottom: 15,
                      textAlign: 'center'
                    }}>
                      🩺 Actions for {selectedPatient.name}
                    </Text>
                    
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {/* Patient History Button */}
                      <Button
                        mode="contained"
                        onPress={() => {
                          fetchPrescriptionHistory(selectedPatient.email);
                        }}
                        style={{ 
                          flex: 1,
                          minWidth: '45%',
                          backgroundColor: '#2196f3',
                          borderRadius: 25
                        }}
                        icon="history"
                        contentStyle={{ paddingVertical: 8 }}
                      >
                        Prescription History
                      </Button>
                    </View>

                    {/* Send Prescription Button */}
                    <Button
                      mode="contained"
                      onPress={() => {
                        if (!selectedPatient) {
                          alert('Please select a patient first');
                          return;
                        }
                        navigation.navigate('PrescriptionPage', {
                          profile: route.params?.profile,
                          selectedPatient: selectedPatient
                        });
                      }}
                      style={{ 
                        marginTop: 10,
                        backgroundColor: '#2196f3',
                        borderRadius: 25
                      }}
                      textColor="#ffffff"
                      icon="medical-bag"
                    >
                      Send Prescription
                    </Button>

                    {/* Send Diet Chart Button */}
                    <Button
                      mode="contained"
                      onPress={() => {
                        if (!selectedPatient) {
                          alert('Please select a patient first');
                          return;
                        }
                        setShowDietChartModal(true);
                      }}
                      style={{ 
                        marginTop: 10,
                        backgroundColor: '#ff9800',
                        borderRadius: 25
                      }}
                      textColor="#ffffff"
                      icon="food-apple"
                    >
                      Send Diet Chart
                    </Button>

                    {/* Send Panchkarma Button */}
                    <Button
                      mode="contained"
                      onPress={() => {
                        if (!selectedPatient) {
                          alert('Please select a patient first');
                          return;
                        }
                        navigation.navigate('PanchkarmaScreen', {
                          profile: route.params?.profile,
                          selectedPatient: selectedPatient
                        });
                      }}
                      style={{ 
                        marginTop: 10,
                        backgroundColor: '#4caf50',
                        borderRadius: 25
                      }}
                      textColor="#ffffff"
                      icon="spa"
                    >
                      Send Panchkarma
                    </Button>

                    {/* Clear Selection Button */}
                    <Button
                      mode="outlined"
                      onPress={() => setSelectedPatient(null)}
                      style={{ 
                        marginTop: 10,
                        borderColor: '#4caf50'
                      }}
                      textColor="#000000"
                      compact
                    >
                      Clear Selection
                    </Button>
                  </Card.Content>
                </Card>
              )}

              {/* Summary Footer */}
              <View style={{
                marginTop: 15,
                padding: 12,
                backgroundColor: '#e8f5e8',
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#4caf50'
              }}>
                <Text style={{ fontSize: 14, color: '#000000', fontWeight: 'bold' }}>
                  📊 Summary: {filteredPatients.length} of {patients.length} patient{patients.length !== 1 ? 's' : ''} shown
                </Text>
                {searchQuery && (
                  <Text style={{ fontSize: 12, color: '#000000', marginTop: 4 }}>
                    Filtered by: "{searchQuery}"
                  </Text>
                )}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Appointment Requests Section - Only show when there are pending requests */}
      {appointments.length > 0 && (
        <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: '#f1f8e9' }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold" }}
              >
                📋 New Appointment Requests ({appointments.length})
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  console.log('Navigating to DoctorSchedule with params:', route.params);
                  navigation.navigate("DoctorSchedule", { 
                    profile: route.params?.profile,
                    doctorEmail: doctorEmail,
                    doctorName: doctorName
                  });
                }}
                style={{ borderColor: '#4caf50' }}
                textColor="#4caf50"
                compact
              >
                View All
              </Button>
            </View>
            <Divider style={{ marginBottom: 10 }} />
            {appointments.map((app) => (
              <Card
                key={app.id}
                style={{
                  marginBottom: 12,
                  backgroundColor: '#c8e6c9',
                  borderRadius: 8
                }}
              >
                <Card.Content>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    Patient: {app.patient_email}
                  </Text>
                  <Text style={{ color: '#000000', marginBottom: 4 }}>
                    Requested: {new Date(app.requested_time).toLocaleString('en-IN')}
                  </Text>
                  {app.notes && (
                    <Text style={{ color: '#000000', fontStyle: 'italic', marginBottom: 8 }}>
                      Notes: {app.notes}
                    </Text>
                  )}
                </Card.Content>
                <Card.Actions>
                  <Button 
                    mode="contained" 
                    onPress={() => handleAccept(app.id)}
                    style={{ backgroundColor: '#4caf50', marginRight: 8 }}
                    loading={loading}
                    compact
                  >
                    Accept
                  </Button>
                  <Button 
                    mode="outlined" 
                    onPress={() => handleReject(app.id)}
                    textColor="#f44336"
                    loading={loading}
                    compact
                  >
                    Reject
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </Card.Content>
        </Card>
      )}
      
      {/* Date Picker Modal */}
      <Portal>
        <Modal 
          visible={showDatePicker} 
          onDismiss={() => setShowDatePicker(false)} 
          contentContainerStyle={{ 
            backgroundColor: '#f1f8e9', 
            padding: 20, 
            margin: 20, 
            borderRadius: 16,
            maxHeight: '80%'
          }}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16, color: '#2e7d32', textAlign: 'center' }}>
            Select Date for Schedule
          </Text>
          
          <Text style={{ marginBottom: 16, color: '#000000', textAlign: 'center' }}>
            Choose a date to view the schedule
          </Text>
          
          <ScrollView style={{ maxHeight: 400 }}>
            {generateDateOptions().map((option) => (
              <Button
                key={option.value}
                mode={selectedDate === option.value ? "contained" : "outlined"}
                onPress={() => {
                  handleDateChange(option.value);
                }}
                style={{ 
                  marginBottom: 8,
                  backgroundColor: selectedDate === option.value ? '#4caf50' : 'transparent'
                }}
                contentStyle={{ paddingVertical: 8 }}
              >
                {option.label}
              </Button>
            ))}
          </ScrollView>
          
          <Button 
            mode="outlined" 
            onPress={() => setShowDatePicker(false)}
            style={{ marginTop: 16 }}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>

      {/* Prescription History Modal */}
      <Portal>
        <Modal 
          visible={showHistoryModal} 
          onDismiss={() => setShowHistoryModal(false)}
          contentContainerStyle={{
            backgroundColor: '#f1f8e9',
            margin: 20,
            borderRadius: 16,
            maxHeight: '80%'
          }}
        >
          <ScrollView style={{ padding: 20 }}>
            <Text variant="headlineSmall" style={{ 
              color: '#000000', 
              textAlign: 'center', 
              marginBottom: 20,
              fontWeight: 'bold'
            }}>
              📋 Prescription History
            </Text>
            
            {selectedPatient && (
              <Card style={{ 
                marginBottom: 20, 
                backgroundColor: '#e8f5e8',
                borderRadius: 12
              }}>
                <Card.Content>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000000' }}>
                    Patient: {selectedPatient.name}
                  </Text>
                  <Text style={{ color: '#000000', marginTop: 4 }}>
                    Email: {selectedPatient.email} | Age: {selectedPatient.age}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {prescriptionHistory.length === 0 ? (
              <Card style={{ 
                padding: 20, 
                backgroundColor: '#ffffff',
                borderRadius: 12,
                alignItems: 'center'
              }}>
                <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                  No prescription history found for this patient.
                </Text>
                <Text style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                  Previous prescriptions will appear here once you write them.
                </Text>
              </Card>
            ) : (
              prescriptionHistory.map((prescription, index) => (
                <Card key={prescription.id || index} style={{
                  marginBottom: 15,
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#4caf50'
                }}>
                  <Card.Content>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000000' }}>
                        Prescription #{prescriptionHistory.length - index}
                      </Text>
                      <Text style={{ color: '#000000', fontSize: 12 }}>
                        {new Date(prescription.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    
                    {/* Medicines */}
                    {prescription.medicines && prescription.medicines.length > 0 && (
                      <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000000', marginBottom: 5 }}>
                          💊 Medicines:
                        </Text>
                        {prescription.medicines.map((medicine, medIndex) => (
                          <Text key={medIndex} style={{ 
                            color: '#000000', 
                            fontSize: 14, 
                            marginBottom: 3,
                            paddingLeft: 10
                          }}>
                            • {medicine.medicine} - {medicine.dosage} ({medicine.frequency})
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {/* Advice */}
                    {prescription.advice && (
                      <View>
                        <Text style={{ fontWeight: 'bold', color: '#000000', marginBottom: 5 }}>
                          📝 Advice:
                        </Text>
                        <Text style={{ color: '#000000', fontSize: 14, lineHeight: 20 }}>
                          {prescription.advice}
                        </Text>
                      </View>
                    )}
                    
                    {/* Prescription Data (if available) */}
                    {prescription.prescription_data && (
                      <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: 'bold', color: '#000000', marginBottom: 5 }}>
                          🩺 Assessment Details:
                        </Text>
                        <Text style={{ color: '#000000', fontSize: 12 }}>
                          Ayurvedic assessment data recorded
                        </Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              ))
            )}

            <Button
              mode="contained"
              onPress={() => setShowHistoryModal(false)}
              style={{ 
                marginTop: 20,
                backgroundColor: '#4caf50',
                borderRadius: 25
              }}
            >
              Close
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Diet Chart Selection Modal */}
      <Portal>
        <Modal
          visible={showDietChartModal}
          onDismiss={() => {
            setShowDietChartModal(false);
            setDietSearchQuery('');
          }}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 15,
            maxHeight: '80%'
          }}
        >
          <ScrollView>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: '#000000', 
              textAlign: 'center',
              marginBottom: 10
            }}>
              🍽️ Send Diet Chart
            </Text>
            
            <Text style={{ 
              fontSize: 16, 
              color: '#000000', 
              textAlign: 'center',
              marginBottom: 20
            }}>
              Sending to: {selectedPatient?.name}
            </Text>

            {/* Search Box */}
            <TextInput
              placeholder="Search diet charts..."
              value={dietSearchQuery}
              onChangeText={setDietSearchQuery}
              mode="outlined"
              style={{ marginBottom: 15 }}
              textColor="#000000"
              left={<TextInput.Icon icon="magnify" />}
              right={
                dietSearchQuery ? (
                  <TextInput.Icon 
                    icon="close" 
                    onPress={() => setDietSearchQuery('')}
                  />
                ) : null
              }
            />

            {/* Diet Chart Options */}
            {filteredDietTemplates.length === 0 ? (
              <Text style={{ 
                color: '#666', 
                textAlign: 'center', 
                marginVertical: 20,
                fontSize: 16
              }}>
                No diet charts found matching "{dietSearchQuery}"
              </Text>
            ) : (
              filteredDietTemplates.map((template) => (
                <Card key={template.id} style={{ marginBottom: 15 }}>
                  <Card.Content style={{ padding: 15 }}>
                    <Text style={{ 
                      fontSize: 20, 
                      fontWeight: 'bold', 
                      color: '#000000',
                      marginBottom: 5
                    }}>
                      {template.emoji} {template.name}
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      color: '#666',
                      marginBottom: 10
                    }}>
                      {template.description}
                    </Text>
                    
                    {/* Sample meals preview */}
                    <Text style={{ 
                      fontSize: 12, 
                      color: '#333',
                      marginBottom: 10,
                      fontStyle: 'italic'
                    }}>
                      Breakfast: {template.meals.breakfast.substring(0, 50)}...
                    </Text>
                    
                    <Button
                      mode="contained"
                      onPress={() => {
                        navigation.navigate('CustomizeDietChart', {
                          profile: route.params?.profile,
                          selectedPatient: selectedPatient,
                          template: template,
                          doctorEmail: route.params?.profile?.email
                        });
                        setShowDietChartModal(false);
                        setDietSearchQuery('');
                      }}
                      style={{
                        backgroundColor: '#4caf50',
                        borderRadius: 25
                      }}
                    >
                      Send This Diet Chart
                    </Button>
                  </Card.Content>
                </Card>
              ))
            )}

            <Button
              mode="outlined"
              onPress={() => {
                setShowDietChartModal(false);
                setDietSearchQuery('');
              }}
              style={{
                marginTop: 20,
                borderRadius: 25
              }}
            >
              Cancel
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
    </PaperProvider>
  );
}

