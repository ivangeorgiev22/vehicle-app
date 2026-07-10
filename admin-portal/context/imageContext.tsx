'use client'
import { createContext, useContext, useState } from "react";

interface ImageContextType {
  profileImage: string;
  setProfileImage: (image: string) => void;
}

const ImageContext = createContext<ImageContextType>({
  profileImage: '',
  setProfileImage: () => {}
});

export function ImageProvider({children}: {children: React.ReactNode}) {
  const [profileImage, setProfileImage] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('profileImage') || '' : ''
  );

  return (
    <ImageContext.Provider value={{profileImage, setProfileImage}}>
      {children}
    </ImageContext.Provider>
  )
}
export const useImage = () => useContext(ImageContext);