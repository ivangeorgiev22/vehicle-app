import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "./context/authContext";
import { Auth0Provider } from "react-native-auth0";
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from "@env";


export default function App() {
  return (
    <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </Auth0Provider>
  );
}