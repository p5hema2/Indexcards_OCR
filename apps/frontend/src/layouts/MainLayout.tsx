import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-parchment/40 relative">
          {/* Subtle paper texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('/assets/paper-noise.png')]"></div>
          
          <div className="max-w-6xl mx-auto p-8 relative z-10">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
