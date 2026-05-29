import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet,Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Params } from "../navigation/types";
import { useAuth } from "../context/authContext";

export default function Login () {
  // reaches into context to setUsername
  const { setUsername } = useAuth();
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();

  const login = async () => {
    try {
      const res = await fetch(
        'http://10.0.2.2:3001/auth/login',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({username,password})
        }
      )

      if (res.ok) {
        setUsername(username); // saves the username into context based on input for use elsewhere
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