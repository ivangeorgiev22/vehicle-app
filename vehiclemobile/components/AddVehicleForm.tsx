import { View, Modal, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Alert } from "react-native";
import { useState } from "react";
import { API_URL } from "@env";
import { theme } from "../theme";
import { useFetch } from "../context/useFetch";
import { useAuth } from "../context/authContext";
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AddVehicleFormProps {
  seen: boolean,
  onClose: () => void;
  onVehicleAdded: () => void;
}
export default function AddVehicleForm({seen, onClose, onVehicleAdded}: AddVehicleFormProps) {
  const {token} = useAuth();
  const [plate, setPlate] = useState('');
  const [battery, setBattery] = useState('');
  const callApi = useFetch();

  const handleSubmit = async () => {
    try {
      const res = await callApi(`${API_URL}/vehicles`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({plate, battery})
      });

      if(res.ok) {
        Alert.alert('Vehicle Added Successfully');
        setPlate('');
        setBattery('');
        onClose();
        onVehicleAdded();
      } else {
        Alert.alert('Failed to add vehicle');
      }
    } catch (error) {
      console.log('Error adding vehicle', error);
    }
  };

  return (
    <Modal visible={seen} onRequestClose={onClose} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Vehicle</Text>
            <Pressable onPress={onClose}>
              <Text>
                <Icon name="close" size={25} />
              </Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Vehicle Reg"
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters" 
          />
          <TextInput
            style={styles.input}
            placeholder="Battery Level"
            value={battery}
            onChangeText={setBattery}
            keyboardType="numeric" 
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.btnText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)'

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
    color: '#090909'
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 16
  },
  button: {
    backgroundColor: theme.colors.button,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center'
  },
  btnText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: '700'
  },
})