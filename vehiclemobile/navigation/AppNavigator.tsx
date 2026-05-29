import Login from "../components/Login";
import Home from "../components/Home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// allows navigation between screens/components
const Stack = createNativeStackNavigator();


export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}