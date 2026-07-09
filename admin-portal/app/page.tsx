'use client'
import styles from "./page.module.css";
import { useAuth0 } from "@auth0/auth0-react";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const {isAuthenticated, isLoading, loginWithRedirect} = useAuth0();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <div className={styles.header}>
            <h1>Admin Portal</h1>
            <p>Vehicle App</p>
          </div>
          <p className={styles.loadingTxt}>Loading...</p>
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
