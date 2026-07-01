import { useState } from "react";
import { View, Text, TextInput, StyleSheet,Alert, TouchableOpacity, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Params } from "../navigation/types";
import { useAuth } from "../context/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { theme } from "../theme";

export default function Login () {
  const { setUsername, setToken, setIsAdmin, setUserId, setImage } = useAuth();
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();

  const getImage = async (userId: string, token: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/image`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      const data = await res.json();
      if(!data.image_url) return;

      const imgRes = await fetch(data.image_url);
      const blob = await imgRes.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        AsyncStorage.setItem('image', base64);
      };
      reader.readAsDataURL(blob)
    } catch (error) {
      console.log('Error', error);
    }
  }

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
        setUserId(data.user.id);
        getImage(data.user.id, data.accessToken);

        await AsyncStorage.setItem('session', JSON.stringify({
          token: data.accessToken,
          isAdmin: data.isAdmin,
          username: username,
          userId: data.user.id,
        }))

        if (data.isAdmin) {
          navigation.navigate('Home');
        } else {
          navigation.navigate('Jobs');
        }
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
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.input}>
          <Icon name="user" size={16} />
          <TextInput
            placeholder="Username"
            style={styles.inputField}
            value={username}
            onChangeText={setUsernameInput}
          />
        </View>
        <View style={styles.input}>
          <Icon name="lock" size={15} />
          <TextInput
            placeholder="Password"
            value={password}
            style={styles.inputField}
            secureTextEntry={true}
            onChangeText={setPassword} 
          />
        </View>
        <TouchableOpacity 
          onPress={login}
          style={styles.button}
        >
          <Text style={styles.buttonTxt}>Login</Text>
        </TouchableOpacity> 
      </View>
    </SafeAreaView>
  )
}
// styling, outsise the component!
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    backgroundColor: theme.colors.background
  },
  card: {
    backgroundColor: theme.colors.card, 
    borderRadius: theme.borderRadius.card, 
    padding: theme.spacing.cardPadding, 
    margin: theme.spacing.cardMargin, 
    elevation: theme.elevation.card
  },
  title: {
    fontSize: 28, 
    fontWeight: '500', 
    marginBottom: 30, 
  },
  inputField: {
    flex: 1, 
    paddingVertical: 0, 
    fontSize: 15, 
    marginLeft: 2
  },
  input: {
    flexDirection: 'row', 
    padding: 8, 
    marginBottom: 25, 
    borderBottomColor: '#808080', 
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  button: {
    backgroundColor: theme.colors.button, 
    padding: 15, 
    borderRadius: theme.borderRadius.button, 
    marginBottom: 30
  },
  buttonTxt: {
    textAlign: 'center', 
    fontWeight: '700', 
    fontSize: 20, 
    color: theme.colors.text, 
  }
})