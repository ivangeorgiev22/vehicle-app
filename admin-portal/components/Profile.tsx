'use client'
import { useAuth0 } from "@auth0/auth0-react";
import { useRef } from "react";
import styles from '@/components/Profile.module.css';

interface ProfileProps {
  onClose: () => void;
  image: string;
  onImageUpdate: (base64: string) => void;
}

export default function Profile({onClose, onImageUpdate, image}: ProfileProps) {
  const {user, logout, getAccessTokenSilently} = useAuth0();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const imgRes = await fetch(data.imageUrl);
        const blob = await imgRes.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          localStorage.setItem('profileImage', base64);
          onImageUpdate(base64);
        };
        reader.readAsDataURL(blob);
        alert('Image uploaded successfully');
        onClose();
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.log('Error uploading image', error);
    }
  }

  return (
    <div onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        <div>
          <h2>Profile</h2>
          <button onClick={onClose}>X</button>
        </div>

        <div>
          <img src={image || user?.picture || ''} alt="avatar" />
          <p>{user?.name}</p>
        </div>

        <input 
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{display: 'none'}} 
        />
        <div>
          <button onClick={() => fileInputRef.current?.click()}>
            Upload Image
          </button>
          <button onClick={() => logout({logoutParams: {returnTo: window.location.origin}})}></button>
        </div>
      </div>
    </div>
  )
}