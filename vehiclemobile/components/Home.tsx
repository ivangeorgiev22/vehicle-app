import { View, Text, StyleSheet, Alert, TouchableOpacity, Image, Pressable } from "react-native";
import { useAuth } from "../context/authContext";
import { useState } from "react";
import { API_URL } from "@env";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Params } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import User from 'react-native-vector-icons/Feather';
import { theme } from "../theme";
import { useFetch } from "../context/useFetch";

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
  const callApi = useFetch();

  const createMission = async () => {
    try {
      const res = await callApi(`${API_URL}/missions`, {
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
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.header,
    paddingHorizontal: theme.spacing.horizontal,
    paddingVertical: theme.spacing.vertical,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text
  },
  headerTxt: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  avatar: {
    width: theme.avatar.size,
    height: theme.avatar.size,
    borderRadius: theme.borderRadius.avatar,
    backgroundColor: theme.colors.avatar,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: theme.avatar.size,
    height: theme.avatar.size,
    borderRadius: theme.borderRadius.avatar,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.cardPadding,
    margin: theme.spacing.cardMargin,
    elevation: theme.elevation.card,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: theme.fontSize.subtitle,
    color: '#888',
    marginBottom: 20,
  },
  picker: {
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  pickerText: {
    fontSize: theme.fontSize.body,
  },
  pickerDropdown: {
    borderColor: theme.colors.border,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: theme.colors.button,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: '700',
  },
});