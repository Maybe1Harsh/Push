import * as React from 'react';
import { ScrollView } from 'react-native';
import { Text, DataTable, Card, Button } from 'react-native-paper';

export default function NearbyDieticiansScreen({ navigation }) {
  const dieticians = [
    { name: 'Dr. Sharma', rating: 4.8, address: '123 Herbal St, Delhi', phone: '9876543210' },
    { name: 'Dr. Patel', rating: 4.6, address: '456 Ayurveda Rd, Mumbai', phone: '9123456780' },
    { name: 'Dr. Rao', rating: 4.7, address: '789 Wellness Ave, Bangalore', phone: '9988776655' },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f3f6fa' }}>
      <Card style={{ marginBottom: 20, borderRadius: 16 }}>
        <Card.Title title="Ayurvedic Dieticians Nearby" />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title>Rating</DataTable.Title>
              <DataTable.Title>Address</DataTable.Title>
              <DataTable.Title>Phone</DataTable.Title>
            </DataTable.Header>
            {dieticians.map((doc, idx) => (
              <DataTable.Row key={idx}>
                <DataTable.Cell>{doc.name}</DataTable.Cell>
                <DataTable.Cell>{doc.rating}</DataTable.Cell>
                <DataTable.Cell>{doc.address}</DataTable.Cell>
                <DataTable.Cell>{doc.phone}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.goBack()}>Back</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}