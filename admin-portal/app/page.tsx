'use client'
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styles from '@/app/page.module.css';
import AddVehicleForm from "@/components/AddVehicleForm";
import CreateMissionForm from "@/components/CreateMissionForm";
import Profile from "@/components/Profile";
import { useImage } from "@/context/imageContext";
import { redirect } from "next/navigation";
import { handleErrors } from "@/utils/errorHandler";
import { toast } from "react-toastify";

interface Vehicle {
  id: string;
  plate: string;
  battery: number;
  vehicleStatus: 'Available' | 'Unavailable';
}

export default function Dashboard() {
  const {isAuthenticated, isLoading, user, getAccessTokenSilently} = useAuth0();
  const {profileImage, setProfileImage} = useImage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [addVehicleForm, setAddVehicleForm] = useState(false);
  const [createMissionForm, setCreateMissionForm] = useState(false);
  const [profile, setProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errDescription = params.get('error_description');
  
    if (!isLoading && !isAuthenticated) {
      if (error) {
        redirect(`/login?error=${error}&error_description=${encodeURIComponent(errDescription || '')}`);
      } else {
        redirect('/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const init = async () => {
      const token = await getAccessTokenSilently();
      fetchImage(user?.sub || '', token);
      fetchVehicles();
    };
    init();
  }, [isAuthenticated, user]);

  const fetchImage = async (userId: string, token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(userId)}/image`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      if (!res.ok) {
        setProfileImage(user?.picture || '');
        return;
      }
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
      console.error('Image Fetching Failed', error);
    }
  }

  const fetchVehicles = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      if(!res.ok) {
        handleErrors(res.status);
        return;
      }
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles', error);
      toast.error('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.headerRight}>
          {user?.picture && (
            <img src={profileImage || user?.picture || ''} alt="avatar" className={styles.avatar} key={profileImage} onClick={() => setProfile(true)} />
          )}
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.spinnerContainer}>
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : vehicles.length === 0 ? (
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
        />
      )}
    </div>
  )
}