import { View, Text, StyleSheet, Alert, TouchableOpacity, Image, Pressable } from "react-native";
import { useAuth } from "../context/authContext";
import { useState } from "react";
import { API_URL } from "@env";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Params } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import User from 'react-native-vector-icons/Feather'

type MissionType = 'Cleaning' | 'Fly Doctor' | 'Maintenance' | '';

export default function Home () {
  const { token, isAdmin, userId, image } = useAuth();
  const [missionType, setMissionType] = useState<MissionType>('');
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Cleaning', value: 'Cleaning'},
    {label: 'Fly Doctor', value: 'Fly Doctor'},
    {label: 'Maintenance', value: 'Maintenance'}
  ]);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Pressable onPress={() => navigation.navigate('Profile', { id: userId })}>
          <View style={styles.avatar}>
            {image ? (
              <Image source={{uri: image }} style={styles.img} />
            ):(
              <User name="user" size={22} />
            )}
          </View>
        </Pressable>
      </View>
      {isAdmin && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Mission</Text>
          <Text style={styles.cardSubtitle}>Select a mission type</Text>
          <DropDownPicker
            open={open}
            value={missionType}
            items={items}
            setOpen={setOpen}
            setValue={setMissionType}
            setItems={setItems}
            style={styles.picker}
            textStyle={styles.pickerText}
            dropDownContainerStyle={styles.pickerDropdown}
            listItemLabelStyle={styles.pickerText}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={createMission}
          >
            <Text style={styles.buttonText}>Create Mission</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff'
  },
  headerTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#adafb3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
  },
  picker: {
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
  },
  pickerDropdown: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});