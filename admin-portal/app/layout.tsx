import type { Metadata } from "next";
import "./globals.css";
import Auth0ProviderWrapper from "@/auth/Auth0Provider"
import { ImageProvider } from "@/context/imageContext";
import { ToastContainer } from "react-toastify";


export const metadata: Metadata = {
  title: "Vehicle App Admin Portal",
  description: "Admin Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Auth0ProviderWrapper>
          <ImageProvider>
           {children}
           <ToastContainer position="top-center" autoClose={4000} />
          </ImageProvider>
        </Auth0ProviderWrapper>
      </body>
    </html>
  );
}
