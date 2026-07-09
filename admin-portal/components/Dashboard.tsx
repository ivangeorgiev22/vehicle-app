'use client'
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styles from '@/components/Dashboard.module.css';
import AddVehicleForm from "./AddVehicleForm";
import CreateMissionForm from "./CreateMissionForm";
import { useFetch } from "@/hooks/useFetch";
import Profile from "./Profile";

interface Vehicle {
  id: string;
  plate: string;
  battery: number;
  vehicleStatus: 'Available' | 'Unavailable';
}
export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [addVehicleForm, setAddVehicleForm] = useState(false);
  const [createMissionForm, setCreateMissionForm] = useState(false);
  const [profile, setProfile] = useState(false);
  const [image, setImage] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('profileImage') : null
  );
  const {getAccessTokenSilently, user, logout} = useAuth0();
  const callApi = useFetch();

  const fetchVehicles = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/vehicles`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.log('Error fetching vehicles', error);
    }
  }

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.headerRight}>
          {user?.picture && (
            <img src={image || user?.picture || ''} alt="avatar" className={styles.avatar} onClick={() => setProfile(true)} />
          )}
          <button onClick={() => logout({logoutParams: {returnTo: window.location.origin}})} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.tableContainer}>
          {vehicles.length === 0 ? (
            <p className={styles.placeholder}>No vehicles added yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reg</th>
                  <th>Battery</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.plate}</td>
                    <td>{vehicle.battery}%</td>
                    <td>
                      <span className={vehicle.vehicleStatus === 'Available' ? styles.available : styles.unavailable}>
                        {vehicle.vehicleStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.buttons}>
          <button onClick={() => setAddVehicleForm(true)} className={styles.btn}>Add Vehicle</button>
          <button onClick={() => setCreateMissionForm(true)} className={styles.btn}>Create Mission</button>
        </div>
      </main>
      {addVehicleForm && (
        <AddVehicleForm
          onClose={() => setAddVehicleForm(false)}
          onVehicleAdded={fetchVehicles} 
        />
      )}
      {createMissionForm && (
        <CreateMissionForm
          onClose={() => setCreateMissionForm(false)}
          vehicles={vehicles}
          onMissionCreated={() => setTimeout(() => fetchVehicles(), 2500)} 
        />
      )}

      {profile && (
        <Profile 
          onClose={() => setProfile(false)}
          onImageUpdate={(base64) => setImage(base64)}
          image={image || user?.picture || ''}
        />
      )}
    </div>
  )
}