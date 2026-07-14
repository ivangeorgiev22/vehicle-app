'use client'
import styles from "./page.module.css";
import { useAuth0 } from "@auth0/auth0-react";
import Dashboard from "@/components/Dashboard";
import { useEffect, useState } from "react";
import { useImage } from "@/context/imageContext";

export default function Home() {
  const {isAuthenticated, isLoading, loginWithRedirect, user, getAccessTokenSilently} = useAuth0();
  const {setProfileImage} = useImage();
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchImage = async (userId: string, token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(userId)}/image`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      const data = await res.json();

      if(!data.imageUrl) {
        localStorage.setItem('profileImage', user?.picture || '');
        setProfileImage(user?.picture || '');
        return;
      };
      const imgRes = await fetch(data.imageUrl);
      const blob = await imgRes.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        localStorage.setItem('profileImage', base64);
        setProfileImage(base64);
      };
      reader.readAsDataURL(blob)
    } catch (error) {
      console.log('Error', error);
    }
  }
  useEffect(() => {
    if(!isAuthenticated || !user) return;
    const init = async () => {
      const token = await getAccessTokenSilently();
      fetchImage(user?.sub || '', token);
    }
    init();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errDescription = params.get('error_description');
    if (error) {
      setAuthError(errDescription || 'Access Denied');
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  if (authError) {
    return (
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <div className={styles.header}>
            <h1>Access Denied</h1>
            <p>{authError}</p>
          </div>
          <button
            className={styles.button}
            onClick={() => {
              setAuthError(null);
              loginWithRedirect({authorizationParams: {prompt: 'login'}})
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <div className={styles.header}>
            <h1>Admin Portal</h1>
            <p>Vehicle App</p>
          </div>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <div className={styles.header}>
            <h1>Admin Portal</h1>
            <p>Vehicle App</p>
          </div>
          <button onClick={() => loginWithRedirect({
            authorizationParams: {
              prompt: 'login'
            }
          })} className={styles.button}>
            Login with Auth0
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard />
}
