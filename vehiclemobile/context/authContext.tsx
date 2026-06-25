import { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  username: string;
  setUsername: (username: string) => void;
  token: string;
  setToken: (token: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAmdin: boolean) => void;
  userId: string;
  setUserId: (userId: string) => void;
  image: string;
  setImage: (image: string) => void;
  logout: () => void;
};
// createContext creates a global container. default value null beofore it's set up by the provider
const AuthContext = createContext<AuthContextType | null>(null);

// we wrap the entire app with this to allow global state management so child components
// can access it
export function AuthProvider({ children }: { children: React.ReactNode}) {
  // the state we want to manage globally
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState('0');
  const [image, setImage] = useState('');

  const logout = () => {
    setUsername('');
    setToken('');
    setIsAdmin(false);
    setUserId('');
    setImage('');
    AsyncStorage.removeItem('session');
  }

  return (
    // any component will be able to access those
    <AuthContext.Provider value={{username, setUsername, token, setToken, isAdmin, setIsAdmin, userId, setUserId, image, setImage, logout}}>
      {children}
    </AuthContext.Provider>
  )
};
// custom hook to avoid repeating logic everywhere and importing useContext in every component
//  Error for safety in case it's used without 
// wrapping everything with AuthProvider
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}