'use client'
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styles from '@/components/CreateMissionForm.module.css';
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import { handleErrors } from "@/utils/errorHandler";

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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({type: missionType, vehicleId: selectedVehicle})
      });

      if(res.ok) {
        toast.success('Mission Created Successfully');
        setMissionType('');
        setSelectedVehicle('');
        onMissionCreated();
        onClose();
      } else {
        handleErrors(res.status);
      }
    } catch (error) {
      console.error('Error Creating Mission', error);
      toast.error('Connection error.Please try again later.');
    }
  }

  return (
    <div className={styles.container} onClick={onClose}>
      <div className={styles.form} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Create Mission</h2>
          <button 
            onClick={onClose}
            className={styles.closeBtn}
          >
            <MdClose />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Vehicle</label>
            <select 
              value={selectedVehicle}
              onChange={e => setSelectedVehicle(e.target.value)}
              className={styles.dropdown}
              required
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
              required
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