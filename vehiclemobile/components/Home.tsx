import { View, Text, StyleSheet, Button, Alert, Pressable } from "react-native";
import { useAuth } from "../context/authContext";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker"
import { API_URL } from "@env";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Params } from "../navigation/types";

type MissionType = 'Cleaning' | 'Fly Doctor' | 'Maintenance' | '';

export default function Home () {
  const { username, token, isAdmin, userId } = useAuth();
  const [missionType, setMissionType] = useState<MissionType>('');
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();

  const createMission = async () => {
    try {
      const res = await fetch(`${API_URL}/missions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({mission_type: missionType})
      })

      if(res.ok) {
        Alert.alert('Mission created!')
        setMissionType('')
      } else {
        Alert.alert(`Error: ${res.status}`)
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.navigate('Profile', {id: userId}) }>
        <Text style={styles.profileTitle}>Profile</Text>
      </Pressable>
      <Text style={styles.title}>Hello, {username} </Text>
      {isAdmin && (
        <>
          <Text style={styles.label}>New Mission</Text>
          <Picker 
            selectedValue={missionType}
            onValueChange={(value) => setMissionType(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select mission type" value='' />
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
    marginBottom: 26,
  },
  container: {
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
  },
  profileTitle: {
    fontSize: 17,
    width: 60,
  }
})