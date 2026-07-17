'use client'
import styles from "./page.module.css";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export default function Home() {
  const {isLoading, loginWithRedirect} = useAuth0();
  const [authError, setAuthError] = useState<string | null>(null);


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
