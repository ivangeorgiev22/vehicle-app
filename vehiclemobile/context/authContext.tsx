import { createContext, useContext, useState } from "react";

type AuthContextType = {
  username: string;
  setUsername: (username: string) => void;
};
// createContext creates a global container. default value null beofore it's set up by the provider
const AuthContext = createContext<AuthContextType | null>(null);

// we wrap the entire app with this to allow global state management so child components
// can access it
export function AuthProvider({ children }: { children: React.ReactNode}) {
  // the state we want to manage globally
  const [username, setUsername] = useState('');

  return (
    // any component will be able to access username or setUsername
    <AuthContext.Provider value={{username, setUsername}}>
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