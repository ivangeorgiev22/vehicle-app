import { useAuth } from "./authContext";
import { Alert } from "react-native";

export function useFetch() {
  const {logout} = useAuth();

  return async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      }
    });

    if (res.status === 401) {
      logout();
      Alert.alert('Session Expired', 'Please log in again.');
      throw new Error('Session Expired');
    }
    return res;
  }
}