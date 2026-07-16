'use client'
import { useAuth0 } from "@auth0/auth0-react";
import { useRef } from "react";
import styles from '@/components/Profile.module.css';
import { MdClose } from "react-icons/md";
import { useImage } from "@/context/imageContext";

interface ProfileProps {
  onClose: () => void;
}

export default function Profile({onClose}: ProfileProps) {
  const {user, logout, getAccessTokenSilently} = useAuth0();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {profileImage, setProfileImage} = useImage();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;

    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(user?.sub || '')}/image`, {
        method: 'POST',
        headers: {'Authorization': `Bearer ${token}`},
        body: formData
      });

      if(res.ok) {
        const data = await res.json();
        alert('Image uploaded successfully');
        onClose();
        setTimeout(async () => {
          const imgRes = await fetch(data.imageUrl);
          console.log('imgRes status;', imgRes.status);
          console.log('imageUrl:', data.imageUrl);
          const blob = await imgRes.blob();
          console.log('blob size:', blob.size);
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            console.log('base64 set:', base64.substring(0, 50))
            localStorage.setItem('profileImage', base64);
            setProfileImage(base64);
          };
          reader.readAsDataURL(blob);
        }, 26000)
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.log('Error uploading image', error);
    }
  }

  return (
    <div onClick={onClose} className={styles.container}>
      <div onClick={e => e.stopPropagation()} className={styles.form}>
        <div className={styles.header}>
          <h2>Profile</h2>
          <button 
            onClick={onClose}
            className={styles.closeBtn}
          >
            <MdClose />
          </button>
        </div>
        <div className={styles.avatar}>
          <img 
            src={profileImage || user?.picture || ''} 
            alt="avatar"
            className={styles.img} 
          />
          <p>{user?.name}</p>
        </div>
        <input 
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{display: 'none'}} 
        />
        <div className={styles.buttons}>
          <button onClick={() => fileInputRef.current?.click()} className={styles.uploadBtn}>
            Upload Image
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('profileImage')
              logout({logoutParams: {returnTo: window.location.origin}})}} 
            className={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}