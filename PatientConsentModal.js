import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, View, Alert } from 'react-native';
import { Text, Button, Card, Checkbox } from 'react-native-paper';
import { supabase } from './supabaseClient';

const PatientConsentModal = ({ 
  visible, 
  onClose, 
  patientProfile, 
  assignedDoctor, 
  onConsentStatusChange 
}) => {
  const [loading, setLoading] = useState(false);
  const [showFullConsent, setShowFullConsent] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setShowFullConsent(false);
      setHasReadTerms(false);
      setLoading(false);
    }
  }, [visible]);

  const consentText = `INFORMED CONSENT TO TREAT

I hereby request and consent to the performance of Ayurvedic medicine treatments, acupuncture treatments (including Marmapuncture), and other procedures within the scope of the practice of Ayurvedic medicine, Chinese medicine, and acupuncture on me.

I understand that methods of treatment may include, but are not limited to, Marma therapy, Snehana (Ayurvedic massage), Ayurvedic herbal medicine, dietary advice, therapeutic exercise and other oriental therapies.

I have been informed that acupuncture (including Marmapuncture) is a generally safe method of treatment, but that it may have some side effects, including bruising, numbness or tingling near the needling sites that may last a few days, and dizziness or fainting.

I understand the clinical and administrative staff may review my patient records and lab reports, but all my records will be kept confidential and will not be released without my written consent.

I understand that the CureVeda Health Counselor below is not a licensed medical practitioner or health care professional and is not trained in Western diagnosis or treatment and that I should consult my Medical Doctor for diagnosis, treatment, and advice of medical conditions.

By voluntarily signing below, I show that I have read, or have had read to me, the above consent to treatment, have been told about the risks and benefits of acupuncture and of other procedures, and have had an opportunity to ask questions.

I hereby consent to receive Ayurvedic consultation and treatment, including assessment of my health, dietary recommendations, dosha evaluation, and prescription of Ayurvedic medicines, provided by an authenticated and qualified Ayurvedic doctor or clinic.`;

  const handleConsentResponse = async (accepted) => {
    if (!patientProfile?.email || !assignedDoctor?.email) {
      Alert.alert('Error', 'Missing patient or doctor information');
      return;
    }

    setLoading(true);
    
    try {
      // Save consent response to database
      const { data: consentData, error: consentError } = await supabase
        .from('patient_consent')
        .insert([
          {
            patient_email: patientProfile.email,
            patient_name: patientProfile.name,
            doctor_email: assignedDoctor.email,
            doctor_name: assignedDoctor.name,
            consent_given: accepted,
            consent_date: new Date().toISOString(),
            consent_text: consentText
          }
        ]);

      if (consentError) {
        console.error('Error saving consent:', consentError);
        Alert.alert('Error', 'Failed to save consent. Please try again.');
        return;
      }

      // If consent is accepted, add patient to doctor's patients list
      if (accepted) {
        // First check if patient is already in the doctor's list
        const { data: existingPatient, error: checkError } = await supabase
          .from('patients')
          .select('*')
          .eq('email', patientProfile.email)
          .eq('doctor_email', assignedDoctor.email)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error('Error checking existing patient:', checkError);
          Alert.alert('Error', 'Failed to verify patient status. Please try again.');
          return;
        }

        // Only add if patient doesn't already exist in doctor's list
        if (!existingPatient) {
          const { error: insertError } = await supabase
            .from('patients')
            .insert([
              {
                name: patientProfile.name,
                email: patientProfile.email,
                doctor_email: assignedDoctor.email,
                age: patientProfile.age || 0, // Default age if not provided
              },
            ]);

          if (insertError) {
            console.error('Error adding patient to doctor list:', insertError);
            Alert.alert('Error', 'Failed to add you to doctor\'s patient list. Please try again.');
            return;
          }
        }

        // Update any pending request status to accepted
        const { error: updateRequestError } = await supabase
          .from('patient_requests')
          .update({ status: 'accepted' })
          .eq('patient_email', patientProfile.email)
          .eq('doctor_email', assignedDoctor.email);

        if (updateRequestError) {
          console.error('Error updating request status:', updateRequestError);
          // Don't fail the whole process for this, just log it
        }
      } else {
        // If consent is declined, update any pending request status
        const { error: updateRequestError } = await supabase
          .from('patient_requests')
          .update({ status: 'declined' })
          .eq('patient_email', patientProfile.email)
          .eq('doctor_email', assignedDoctor.email);

        if (updateRequestError) {
          console.error('Error updating request status:', updateRequestError);
          // Don't fail the whole process for this, just log it
        }
      }

      // Show a brief success message and automatically proceed
      if (accepted) {
        // Close modal and trigger callback immediately for a smoother experience
        onClose?.(); // Close the modal first
        onConsentStatusChange?.(accepted); // Then trigger the callback to refresh parent
        
        // Show success message after modal is closed
        setTimeout(() => {
          Alert.alert(
            'Success! ✅',
            'Consent accepted and signed successfully!\n\nYou have been added to the doctor\'s patient list and they can now see you in their dashboard.',
            [{ text: 'Great!', style: 'default' }]
          );
        }, 300); // Small delay to let modal close first
      } else {
        Alert.alert(
          'Declined',
          'Consent declined and recorded.',
          [
            {
              text: 'OK',
              onPress: () => {
                onClose?.(); // Close the modal
                onConsentStatusChange?.(accepted); // Trigger callback
              }
            }
          ]
        );
      }

    } catch (err) {
      console.error('Unexpected error saving consent:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <View style={{
          backgroundColor: '#1976d2',
          paddingTop: 50,
          paddingBottom: 20,
          paddingHorizontal: 20
        }}>
          <Text style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Doctor Approval & Consent
          </Text>
          <Text style={{
            color: '#e3f2fd',
            fontSize: 16,
            textAlign: 'center',
            marginTop: 8
          }}>
            Dr. {assignedDoctor?.name}
          </Text>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {!showFullConsent ? (
            // Preview Screen
            <>
              <Card style={{
                backgroundColor: '#fff',
                marginBottom: 20,
                borderRadius: 12,
                elevation: 2
              }}>
                <Card.Content style={{ padding: 20 }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#1976d2',
                    marginBottom: 15,
                    textAlign: 'center'
                  }}>
                    📋 Medical Consent Form Preview
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: '#333',
                    textAlign: 'justify',
                    marginBottom: 15
                  }}>
                    You are about to review an informed consent form for medical treatment with Dr. {assignedDoctor?.name}.
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: '#666',
                    textAlign: 'justify'
                  }}>
                    This consent form covers:
                    {'\n'}• Ayurvedic medicine treatments
                    {'\n'}• Acupuncture and Marmapuncture
                    {'\n'}• Herbal medicine prescriptions
                    {'\n'}• Dietary recommendations
                    {'\n'}• Treatment risks and benefits
                    {'\n'}• Privacy and confidentiality
                  </Text>
                </Card.Content>
              </Card>

              <Card style={{
                backgroundColor: '#fff3e0',
                marginBottom: 20,
                borderRadius: 12,
                elevation: 2
              }}>
                <Card.Content style={{ padding: 20 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#ef6c00',
                    marginBottom: 10,
                    textAlign: 'center'
                  }}>
                    Patient Information
                  </Text>
                  <Text style={{ fontSize: 16, color: '#333', marginBottom: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>Name:</Text> {patientProfile?.name}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#333', marginBottom: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>Email:</Text> {patientProfile?.email}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#333' }}>
                    <Text style={{ fontWeight: 'bold' }}>Date:</Text> {new Date().toLocaleDateString()}
                  </Text>
                </Card.Content>
              </Card>

              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1976d2',
                textAlign: 'center',
                marginBottom: 20
              }}>
                Please read the full consent form carefully
              </Text>

              <Button
                mode="contained"
                onPress={() => setShowFullConsent(true)}
                style={{
                  backgroundColor: '#1976d2',
                  borderRadius: 25,
                  paddingVertical: 8,
                  marginBottom: 15
                }}
                labelStyle={{
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
                icon="file-document-outline"
              >
                Read Full Consent Form
              </Button>

              <Button
                mode="outlined"
                onPress={onClose}
                style={{
                  borderColor: '#666',
                  borderRadius: 25,
                  marginBottom: 20
                }}
                textColor="#666"
              >
                Cancel
              </Button>
            </>
          ) : (
            // Full Consent Form Screen
            <>
              <Card style={{
                backgroundColor: '#fff',
                marginBottom: 20,
                borderRadius: 12,
                elevation: 2
              }}>
                <Card.Content style={{ padding: 20 }}>
                  <Text style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: '#333',
                    textAlign: 'justify'
                  }}>
                    {consentText}
                  </Text>
                </Card.Content>
              </Card>

              {/* Terms and Conditions Checkbox */}
              <Card style={{
                backgroundColor: '#f3e5f5',
                marginBottom: 20,
                borderRadius: 12,
                elevation: 2
              }}>
                <Card.Content style={{ padding: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Checkbox
                      status={hasReadTerms ? 'checked' : 'unchecked'}
                      onPress={() => setHasReadTerms(!hasReadTerms)}
                      color="#1976d2"
                    />
                    <Text style={{
                      fontSize: 16,
                      color: '#333',
                      flex: 1,
                      marginLeft: 10
                    }}>
                      I have read, understood, and agree to the above consent and disclaimer.
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              {hasReadTerms ? (
                <>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#1976d2',
                    textAlign: 'center',
                    marginBottom: 20
                  }}>
                    Do you approve this doctor and consent to treatment?
                  </Text>

                  {/* Action Buttons */}
                  <View style={{ 
                    flexDirection: 'row', 
                    gap: 15, 
                    marginBottom: 20 
                  }}>
                    <Button
                      mode="contained"
                      onPress={() => handleConsentResponse(true)}
                      loading={loading}
                      disabled={loading}
                      style={{
                        flex: 1,
                        backgroundColor: '#4caf50',
                        borderRadius: 25,
                        paddingVertical: 8
                      }}
                      labelStyle={{
                        fontSize: 16,
                        fontWeight: 'bold'
                      }}
                      icon="check"
                    >
                      Approve & Sign
                    </Button>

                    <Button
                      mode="contained"
                      onPress={() => handleConsentResponse(false)}
                      loading={loading}
                      disabled={loading}
                      style={{
                        flex: 1,
                        backgroundColor: '#f44336',
                        borderRadius: 25,
                        paddingVertical: 8
                      }}
                      labelStyle={{
                        fontSize: 16,
                        fontWeight: 'bold'
                      }}
                      icon="close"
                    >
                      Reject
                    </Button>
                  </View>
                </>
              ) : (
                <Card style={{
                  backgroundColor: '#ffebee',
                  marginBottom: 20,
                  borderRadius: 12,
                  elevation: 2
                }}>
                  <Card.Content style={{ padding: 20 }}>
                    <Text style={{
                      fontSize: 16,
                      color: '#d32f2f',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      ⚠️ Please read and check the agreement box above to proceed
                    </Text>
                  </Card.Content>
                </Card>
              )}

              <View style={{ 
                flexDirection: 'row', 
                gap: 15, 
                marginBottom: 30 
              }}>
                <Button
                  mode="outlined"
                  onPress={() => setShowFullConsent(false)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    borderColor: '#666',
                    borderRadius: 25
                  }}
                  textColor="#666"
                >
                  Back to Preview
                </Button>

                <Button
                  mode="outlined"
                  onPress={onClose}
                  disabled={loading}
                  style={{
                    flex: 1,
                    borderColor: '#666',
                    borderRadius: 25
                  }}
                  textColor="#666"
                >
                  Cancel
                </Button>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default PatientConsentModal;