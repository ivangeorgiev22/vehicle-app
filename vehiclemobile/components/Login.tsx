import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Params } from "../navigation/types";
import { useAuth } from "../context/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";
import { useAuth0 } from "react-native-auth0";
import { ActivityIndicator } from "react-native";

export default function Login () {
  const { setUsername, setToken, setUserId, setImage, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();
  const {authorize, user, getCredentials} = useAuth0();
  const [loading, setLoading] = useState(false);

  const getImage = async (userId: string, token: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/image`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      const data = await res.json();
      if(!data.imageUrl) {
        setImage(user?.picture || '');
        await AsyncStorage.setItem('image', user?.picture || '');
        return;
      };
      const imgRes = await fetch(data.imageUrl);
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
  const handleLogin = async () => {
    try {
      const credentials = await getCredentials();
      if (!credentials) return;

      const token = credentials.accessToken;
      const userId = user?.sub || '';
      const username = user?.name || '';
      const picture = user?.picture || '';

      setToken(token);
      setUsername(username);
      setUserId(userId);
      setImage(picture);
      getImage(userId, token);

      await AsyncStorage.setItem('session', JSON.stringify({
        token,
        username,
        userId,
        image: picture
      }));

      navigation.navigate('Jobs');
    } catch (error) {
      console.log('Error handling login', error);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      await authorize({
        scope: 'openid profile email',
        audience: 'https://vehicle-app-api',
      });
    } catch (error) {
      console.log('Login error', error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if(!user) return;
    if(token) return;
    handleLogin();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Vehicle App</Text>
        <Text style={styles.subtitle}>Please log in to continue</Text>
        {loading ? (
          <ActivityIndicator size='large' color={theme.colors.button} />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={login}
          >
            <Text style={styles.buttonTxt}>Login with Auth0</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

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
    fontWeight: '700',
    marginBottom: 8, 
    alignSelf: 'center'
  },
  subtitle: {
    fontSize: theme.fontSize.subtitle,
    marginBottom: 30,
    alignSelf: 'center'
  },
  button: {
    backgroundColor: theme.colors.button, 
    padding: 15, 
    borderRadius: theme.borderRadius.button, 
    marginBottom: 20
  },
  buttonTxt: {
    textAlign: 'center', 
    fontWeight: '700', 
    fontSize: 20, 
    color: theme.colors.text, 
  }
})