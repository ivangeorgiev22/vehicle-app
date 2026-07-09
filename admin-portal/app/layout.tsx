import type { Metadata } from "next";
import "./globals.css";
import Auth0ProviderWrapper from "@/components/Auth0Provider";


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
          {children}
        </Auth0ProviderWrapper>
      </body>
    </html>
  );
}
