import { View, Modal, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from "react-native";
import { useState } from "react";
import { API_URL } from "@env";
import { theme } from "../theme";
import { useFetch } from "../context/useFetch";
import { useAuth } from "../context/authContext";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from 'react-native-vector-icons/MaterialIcons';

type MissionType = 'Cleaning' | 'Fly Doctor' | 'Maintenance' | '';

interface Vehicle {
  vehicleId: string;
  plate: string;
  battery: number;
  vehicle_status: 'Available' | 'Unavailable'
}

interface CreateMissionFormProps {
  seen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onMissionCreated: () => void;
}

export default function CreateMissionForm({seen, onClose, vehicles, onMissionCreated}: CreateMissionFormProps) {
  const {token} = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [missionType, setMissionType] = useState<MissionType>('');
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [missionTypeOpen, setMissionTypeOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Cleaning', value: 'Cleaning'},
    {label: 'Fly Doctor', value: 'Fly Doctor'},
    {label: 'Maintenance', value: 'Maintenance'}
  ]);
  const vehicleItems = vehicles.map(vehicle => ({
    label: `${vehicle.plate}`,
    value: vehicle.vehicleId
  }));

  const callApi = useFetch();

  const handleSubmit = async () => {
    try {
      const res = await callApi(`${API_URL}/missions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({mission_type: missionType, vehicle_id: selectedVehicle})
      });
      if (res.ok) {
        Alert.alert('Mission created!');
        setMissionType('');
        setSelectedVehicle('');
        onMissionCreated();
        onClose();
      } else {
        Alert.alert(`Error: ${res.status}`);
      }
    } catch (error) {
      console.log('Error creating mission', error);
    }
  };

  return (
    <Modal visible={seen} onRequestClose={onClose} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Mission</Text>
            <Pressable onPress={onClose}>
              <Text>
                <Icon name="close" size={25} />
              </Text>
            </Pressable>
          </View>
          <DropDownPicker
            open={vehicleOpen}
            value={selectedVehicle}
            items={vehicleItems}
            setOpen={setVehicleOpen}
            setValue={setSelectedVehicle}
            placeholder="Select a vehicle"
            style={styles.picker}
            textStyle={styles.pickerText}
            dropDownContainerStyle={styles.pickerDropdown}
            zIndex={2000}
            zIndexInverse={1000}
          />
          <DropDownPicker
            open={missionTypeOpen}
            value={missionType}
            items={items}
            setOpen={setMissionTypeOpen}
            setValue={setMissionType}
            setItems={setItems}
            placeholder="Select mission type"
            style={styles.picker}
            textStyle={styles.pickerText}
            dropDownContainerStyle={styles.pickerDropdown}
            zIndex={1000}
            zIndexInverse={2000}
          />
          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.btnText}>Create Mission</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.cardPadding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.header
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
  },
  btnText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: '700',
  },
})