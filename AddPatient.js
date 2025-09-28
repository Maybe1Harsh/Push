import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { Text, Card, Button, TextInput, Snackbar, IconButton } from "react-native-paper";
import { supabase } from "./supabaseClient";

export default function AddPatientScreen({ route, navigation }) {
  const { doctorEmail } = route.params;
  const [patientEmail, setPatientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleAddPatient = async () => {
    if (!patientEmail.trim()) {
      setSnackbarMessage("Please enter a patient's email address.");
      setSnackbarVisible(true);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail.trim())) {
      setSnackbarMessage("Please enter a valid email address.");
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);

    try {
      // First, check if the patient exists in the Profiles table
      const { data: patientProfile, error: profileError } = await supabase
        .from("Profiles")
        .select("*")
        .eq("email", patientEmail.trim())
        .single();

      if (profileError || !patientProfile) {
        setSnackbarMessage("Patient not found. Please ensure the patient has registered.");
        setSnackbarVisible(true);
        setLoading(false);
        return;
      }

      // Check if the patient is already assigned to this doctor
      const { data: existingPatient, error: existingError } = await supabase
        .from("patients")
        .select("*")
        .eq("email", patientEmail.trim())
        .eq("doctor_email", doctorEmail)
        .single();

      if (existingPatient) {
        setSnackbarMessage("This patient is already assigned to you.");
        setSnackbarVisible(true);
        setLoading(false);
        return;
      }

      // Check for existing requests
      const { data: existingRequest, error: requestError } = await supabase
        .from("patient_requests")
        .select("*")
        .eq("patient_email", patientEmail.trim())
        .eq("doctor_email", doctorEmail)
        .single();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          setSnackbarMessage("Request already sent. Waiting for patient approval.");
          setSnackbarVisible(true);
          setLoading(false);
          return;
        } else if (existingRequest.status === 'declined') {
          // Allow sending a new request if previously declined
          // Delete or update the old declined request before sending a new one
          await supabase
            .from("patient_requests")
            .delete()
            .eq("id", existingRequest.id);

          // Continue to send new request below
        }
      }

      // Send request to the patient
      const { error: insertError } = await supabase
        .from("patient_requests")
        .insert([
          {
            doctor_email: doctorEmail,
            patient_email: patientEmail.trim(),
            status: 'pending',
          },
        ]);

      if (insertError) {
        console.error("Error sending request:", insertError);
        setSnackbarMessage(`Failed to send request: ${insertError.message || insertError.details || 'Unknown error'}`);
        setSnackbarVisible(true);
      } else {
        setSnackbarMessage("Request sent successfully! Waiting for patient approval.");
        setSnackbarVisible(true);
        setPatientEmail(""); // Clear the input field
        // Optionally, navigate back to the dashboard after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setSnackbarMessage("An unexpected error occurred. Please try again.");
      setSnackbarVisible(true);
    }

    setLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#F1F0E8",
      }}
    >
      {/* Back Button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <IconButton
          icon="arrow-left"
          iconColor="#2C3E50"
          size={24}
          onPress={() => navigation.goBack()}
          style={{ margin: 0 }}
        />
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2C3E50' }}>Back</Text>
      </View>
      
      {/* Header */}
      <Card style={{ marginBottom: 20, backgroundColor: "#96B6C5", elevation: 4, borderRadius: 12 }}>
        <Card.Content>
          <Text
            variant="headlineMedium"
            style={{ color: "#2C3E50", fontWeight: "bold" }}
          >
            Add New Patient
          </Text>
          <Text style={{ color: "#2C3E50", marginTop: 5, fontSize: 16 }}>
            Enter the patient's email address to add them to your care.
          </Text>
        </Card.Content>
      </Card>

      {/* Input Section */}
      <Card style={{ marginBottom: 20, borderRadius: 12, backgroundColor: "#EEE0C9", elevation: 3 }}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginBottom: 15, color: "#2C3E50" }}
          >
            Patient Email
          </Text>
          <TextInput
            label="Patient's Email Address"
            value={patientEmail}
            onChangeText={setPatientEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ marginBottom: 15, backgroundColor: "#F1F0E8" }}
            textColor="#2C3E50"
            outlineColor="#96B6C5"
            activeOutlineColor="#96B6C5"
          />
          <Button
            mode="contained"
            onPress={handleAddPatient}
            loading={loading}
            disabled={loading}
            style={{
              backgroundColor: "#ADC4CE",
              borderRadius: 10,
              paddingVertical: 5,
            }}
            labelStyle={{ fontSize: 16, color: "#2C3E50" }}
          >
            {loading ? "Adding Patient..." : "Add Patient"}
          </Button>
        </Card.Content>
      </Card>

      {/* Instructions */}
      <Card style={{ borderRadius: 12, backgroundColor: "#F1F0E8", elevation: 2 }}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginBottom: 10, color: "#2C3E50" }}
          >
            Instructions
          </Text>
          <Text style={{ marginBottom: 5, color: "#2C3E50" }}>
            • Enter the email address of the patient you want to add.
          </Text>
          <Text style={{ marginBottom: 5, color: "#2C3E50" }}>
            • The patient must have already registered in the system.
          </Text>
          <Text style={{ marginBottom: 5, color: "#2C3E50" }}>
            • Once added, the patient will appear in your patients list.
          </Text>
        </Card.Content>
      </Card>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}
