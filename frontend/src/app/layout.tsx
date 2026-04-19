import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from '@/providers/redux-provider';

export const metadata: Metadata = {
  title: "Roofing — Job Management",
  description: "Multi-tenant job management system for roofing companies. Create, schedule, assign, and complete jobs with real-time status tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
