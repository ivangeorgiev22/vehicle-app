import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet,Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Params } from "../navigation/types";
import { useAuth } from "../context/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export default function Login () {
  const { setUsername, setToken, setIsAdmin } = useAuth();
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();

  const login = async () => {
    try {
      const res = await fetch(
        `${API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({username,password})
        }
      )
      const data = await res.json();

      if (res.ok) {
        //save for in memory use.
        setUsername(username);
        setToken(data.accessToken);
        setIsAdmin(data.isAdmin);

        // save for persistence
        await AsyncStorage.setItem('token', data.accessToken);
        await AsyncStorage.setItem('isAdmin', JSON.stringify(data.isAdmin));


        navigation.navigate('Home')
        setUsernameInput('');
        setPassword('');
      } else {
        Alert.alert('Invalid credentials')
      }
    } catch (error) {
      console.log('Error', error);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsernameInput}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword} 
      />
      <Button title="Login" onPress={login}/>
    </View>
  )
}
// styling, outsise the component!
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 10
  },
  input: {
    borderColor: "#151414",
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10
  },
})