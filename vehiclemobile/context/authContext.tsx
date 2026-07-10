import { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  username: string;
  setUsername: (username: string) => void;
  token: string;
  setToken: (token: string) => void;
  userId: string;
  setUserId: (userId: string) => void;
  image: string;
  setImage: (image: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode}) {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('0');
  const [image, setImage] = useState('');

  const logout = () => {
    setUsername('');
    setToken('');
    setUserId('');
    setImage('');
    AsyncStorage.removeItem('session');
  }

  return (
    <AuthContext.Provider value={{username, setUsername, token, setToken, userId, setUserId, image, setImage, logout}}>
      {children}
    </AuthContext.Provider>
  )
};
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}