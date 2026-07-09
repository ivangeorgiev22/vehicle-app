'use client'
import { useAuth0 } from "@auth0/auth0-react";

export function useFetch() {
  const {logout} = useAuth0();

  return async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers
      }
    });

    if (res.status === 401) {
      window.alert('Session expired. Please log in again.');
      logout({logoutParams: {returnTo: window.location.origin}});
      throw new Error('Session Expired');
    }
    return res;
  }
}