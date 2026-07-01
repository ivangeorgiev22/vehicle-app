import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, FlatList } from "react-native";
import { useAuth } from "../context/authContext";
import { useEffect, useState } from "react";
import { API_URL } from "@env";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Params } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import User from 'react-native-vector-icons/Feather';
import { theme } from "../theme";
import { useFetch } from "../context/useFetch";
import AddVehicleForm from "./AddVehicleForm";
import CreateMissionForm from "./CreateMissionForm";

interface Vehicle {
  vehicleId: string;
  plate: string;
  battery: number;
  vehicle_status: 'Available' | 'Unavailable'
}

export default function Home () {
  const { token, userId, image } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();
  const callApi = useFetch();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [addVehicleForm, setAddVehicleForm] = useState(false);
  const [createMissionForm, setCreateMissionForm] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await callApi(`${API_URL}/vehicles`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.log('Error retrieving vehicles', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

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
      <FlatList
        data={vehicles}
        style={styles.vehicleList}
        keyExtractor={(vehicle => vehicle.vehicleId)}
        ListEmptyComponent={
          <Text style={styles.placeholder}>No vehicles added.</Text>
        }
        renderItem={({item}) => (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleInfoTitle}>Reg:</Text>
              <Text>{item.plate}</Text>
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleInfoTitle}>Battery:</Text>
              <Text>{item.battery}%</Text>
            </View>
            <View>
              <Text style={{color: item.vehicle_status === 'Available' ? '#0bc924' : '#d21b1b'}}>{item.vehicle_status}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.forms}>
            <TouchableOpacity onPress={() => setAddVehicleForm(true)} style={styles.button}>
              <Text style={styles.buttonText}>Add Vehicle</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreateMissionForm(true)} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Create Mission</Text>
            </TouchableOpacity>
          </View>
        } 
      />
      <AddVehicleForm
        seen={addVehicleForm}
        onClose={() => setAddVehicleForm(false)}
        onVehicleAdded={fetchVehicles} 
      />
      <CreateMissionForm
        seen={createMissionForm}
        onClose={() => setCreateMissionForm(false)}
        vehicles={vehicles}
        onMissionCreated={() => {setCreateMissionForm(false); setTimeout(() => fetchVehicles(), 2500)}} 
      />
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text
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
  button: {
    backgroundColor: theme.colors.button,
    padding: 20,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: '700',
  },
  placeholder: {
    fontSize: 16,
    marginBottom: 16,
    alignSelf: 'center'
  },
  vehicleCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: theme.elevation.card
  },
  forms: {
    marginTop: 8,
    gap: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtn: {
    backgroundColor: theme.colors.button,
    padding: 20,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center'
  },
  secondaryBtnText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: '700',
  },
  vehicleList: {
    paddingVertical: theme.spacing.vertical,
    paddingHorizontal: 19
  },
  vehicleInfo: {
    alignItems: 'center'
  },
  vehicleInfoTitle: {
    fontWeight: '600'
  }
});