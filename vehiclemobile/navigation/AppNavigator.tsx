import Login from "../components/Login";
import Home from "../components/Home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Jobs from "../components/Jobs";
import JobDetails from "../components/JobDetails";
import Profile from "../components/Profile";
import { useAuth } from "../context/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

// allows navigation between screens/components
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const {token, isAdmin, setToken, setIsAdmin, setUsername, setUserId, setImage} = useAuth();

  const session = async () => {
    try {
      const storedtoken = await AsyncStorage.getItem('token');
      const storedIsAdmin = await AsyncStorage.getItem('isAdmin');
      const storedUsername = await AsyncStorage.getItem('username');
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedImage = await AsyncStorage.getItem('image');
      
      if(storedtoken) {
        setToken(storedtoken);
        setIsAdmin(storedIsAdmin === 'true');
        setUsername(storedUsername ?? '');
        setUserId(storedUserId ?? '');
        setImage(storedImage ?? '');
      }
    } catch (error) {
      console.log('Error restoring session', error);
    }
  }

  useEffect(() => {
    session()
  }, []);
  
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {token ? (
        <>
          {isAdmin ? (
            <Stack.Screen name="Home" component={Home} />
          ):(
            <>
              <Stack.Screen name="Jobs" component={Jobs} />
              <Stack.Screen name="Job Details" component={JobDetails} />
            </>
          )}
          <Stack.Screen name= "Profile" component={Profile} />
        </>
      ):(
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}