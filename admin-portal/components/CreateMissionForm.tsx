'use client'
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styles from '@/components/CreateMissionForm.module.css';
import { useFetch } from "@/hooks/useFetch";

interface Vehicle {
  id: string;
  plate: string;
}

interface CreateMissionFormProps {
  onClose: () => void;
  vehicles: Vehicle[];
  onMissionCreated: () => void;
}
export default function CreateMissionForm({onClose, vehicles, onMissionCreated}: CreateMissionFormProps) {
  const [missionType, setMissionType] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const {getAccessTokenSilently} = useAuth0();
  const callApi = useFetch();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !missionType) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({type: missionType, vehicleId: selectedVehicle})
      });

      if(res.ok) {
        setMissionType('');
        setSelectedVehicle('');
        onMissionCreated();
        onClose();
      } else {
        alert(`Error: ${res.status}`)
      }
    } catch (error) {
      console.log('Error creating mission', error);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.header}>
          <h2>Create Mission</h2>
          <button onClick={onClose}>X</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Vehicle</label>
            <select 
              value={selectedVehicle}
              onChange={e => setSelectedVehicle(e.target.value)}
              className={styles.dropdown}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(v => (
                <option value={v.id} key={v.id}>{v.plate}</option>
              ))}
            </select>
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Mission Type</label>
            <select 
              value={missionType}
              onChange={e => setMissionType(e.target.value)}
              className={styles.dropdown}
            >
              <option value="">Select mission type</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Fly Doctor">Fly Doctor</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <button type="submit" className={styles.button}>Create</button>
        </form>
      </div>
    </div>
  )
}