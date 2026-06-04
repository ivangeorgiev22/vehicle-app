import Login from "../components/Login";
import Home from "../components/Home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Jobs from "../components/Jobs";
import JobDetails from "../components/JobDetails";
import Profile from "../components/Profile";

// allows navigation between screens/components
const Stack = createNativeStackNavigator();


export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Jobs" component={Jobs} />
      <Stack.Screen name="Job Details" component={JobDetails} />
      <Stack.Screen name= "Profile" component={Profile} />
    </Stack.Navigator>
  );
}