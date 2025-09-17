import * as React from 'react';
import { ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

export default function NearbyDieticiansScreen({ navigation }) {
  const dieticians = [
    {
      name: 'Dr. Sharma',
      rating: 4.8,
      address: '123 Herbal St, Delhi',
      phone: '9876543210',
      specialty: 'Weight Loss, Diabetes',
      experience: 10,
      reviews: [
        { user: 'Amit', comment: 'Very helpful and knowledgeable!' },
        { user: 'Priya', comment: 'Great advice for my diet.' },
      ],
      contact: 'dr.sharma@email.com',
    },
    {
      name: 'Dr. Patel',
      rating: 4.6,
      address: '456 Ayurveda Rd, Mumbai',
      phone: '9123456780',
      specialty: 'Sports Nutrition, PCOS',
      experience: 8,
      reviews: [
        { user: 'Rahul', comment: 'Helped me with my fitness goals.' },
      ],
      contact: 'dr.patel@email.com',
    },
    {
      name: 'Dr. Rao',
      rating: 4.7,
      address: '789 Wellness Ave, Bangalore',
      phone: '9988776655',
      specialty: 'Digestive Health, Child Nutrition',
      experience: 12,
      reviews: [
        { user: 'Sneha', comment: "My child's health improved a lot." },
      ],
      contact: 'dr.rao@email.com',
    },
  ];

  // Sort by rating (point 8)
  const sortedDieticians = [...dieticians].sort((a, b) => b.rating - a.rating);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f3f6fa' }}>
      <Card style={{ marginBottom: 20, borderRadius: 16 }}>
        <Card.Title title="Ayurvedic Dieticians Nearby" />
        <Card.Content>
          {sortedDieticians.map((doc, idx) => (
            <Card key={idx} style={{ marginBottom: 16, borderRadius: 12, backgroundColor: '#fff' }}>
              <Card.Title
                title={doc.name}
                subtitle={`${doc.specialty} • ${doc.experience} yrs exp.`}
                left={() => (
                  <Text style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    fontSize: 22,
                    fontWeight: 'bold',
                    marginRight: 8,
                    paddingTop: 6,
                  }}>
                    {doc.name.split(' ')[1]?.[0] || doc.name[0]}
                  </Text>
                )}
              />
              <Card.Content>
                <Text style={{ fontSize: 16, marginBottom: 4 }}>
                  ⭐ {doc.rating} / 5.0
                </Text>
                <Text style={{ marginBottom: 4 }}>📍 {doc.address}</Text>
                <Text style={{ marginBottom: 4 }}>📞 {doc.phone}</Text>
                <Text style={{ marginBottom: 4 }}>✉️ {doc.contact}</Text>
                {/* Patient Reviews (point 3) */}
                <Text style={{ fontWeight: 'bold', marginTop: 8, marginBottom: 2 }}>Patient Reviews:</Text>
                {doc.reviews.map((rev, i) => (
                  <Text key={i} style={{ fontStyle: 'italic', marginBottom: 2 }}>
                    "{rev.comment}" - {rev.user}
                  </Text>
                ))}
              </Card.Content>
              <Card.Actions>
                {/* Contact Options (point 5) */}
                <Button onPress={() => { /* Add call logic if needed */ }}>Call</Button>
                <Button onPress={() => { /* Add email/message logic if needed */ }}>Message</Button>
              </Card.Actions>
            </Card>
          ))}
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.goBack()}>Back</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}