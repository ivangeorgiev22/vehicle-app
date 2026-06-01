import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { useAuth } from "../context/authContext";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker"
import { API_URL } from "@env";

type MissionType = 'Cleaning' | 'Fly Doctor' | 'Maintenance';

export default function Home () {
  const { username, token, isAdmin } = useAuth();
  const [missionType, setMissionType] = useState<MissionType>('Cleaning');

  const createMission = async () => {
    try {
      const res = await fetch(`${API_URL}/missions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({mission_type: missionType})
      })

      if(res.ok) {
        Alert.alert('Mission created!')
      } else {
        Alert.alert(`Error: ${res.status}`)
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {username} </Text>
      {isAdmin && (
        <>
          <Text style={styles.label}>New Mission</Text>
          <Picker 
            selectedValue={missionType}
            onValueChange={(value) => setMissionType(value)}
            style={styles.picker}
          >
            <Picker.Item label="Cleaning" value="Cleaning" />
            <Picker.Item label="Fly Doctor" value="Fly Doctor" />
            <Picker.Item label="Maintenance" value="Maintenance" />
          </Picker>
          <Button 
            title="Create Mission"
            onPress={createMission}
          /> 
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 26
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20
  },
  picker: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    borderBottomColor: '#060606',
    borderBottomWidth: 1
  }
})