'use client'
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import styles from '@/components/AddVehicleForm.module.css';
import { MdClose } from "react-icons/md";

interface AddVehicleFormProps {
  onClose: () => void;
  onVehicleAdded: () => void;
}
export default function AddVehicleForm({onClose, onVehicleAdded}: AddVehicleFormProps) {
  const [plate, setPlate] = useState('');
  const [battery, setBattery] = useState('');
  const {getAccessTokenSilently} = useAuth0();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!plate || !battery) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({plate, battery})
      });

      if(res.ok) {
        setPlate('');
        setBattery('');
        onVehicleAdded();
        onClose();
      } else {
        alert('Failed to add vehicle');
      }
    } catch (error) {
      console.log('Error adding vehicle', error);
    }
  }

  return (
    <div className={styles.container} onClick={onClose}>
      <div className={styles.form} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Add Vehicle</h2>
          <button 
          onClick={onClose}
          className={styles.closeBtn}
          >
            <MdClose />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Plate</label>
            <input 
              type="text"
              value={plate}
              onChange={e => setPlate(e.target.value)}
              placeholder="Enter vehicle reg"
              className={styles.input}
              required
            />
          </div>
          <div>
            <label className={styles.label}>Battery</label>
            <input 
              type="number"
              min='0'
              max='100'
              value={battery}
              onChange={e => setBattery(e.target.value)}
              placeholder="Battery Level"
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.button}>Add</button>
        </form>
      </div>
    </div>
  )
}