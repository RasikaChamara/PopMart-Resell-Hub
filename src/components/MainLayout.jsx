import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const MainLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Sidebar stays fixed on the left for Desktop */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col md:ml-64">
        {/* 2. Top Navbar for Mobile */}
        <Navbar />

        {/* 3. Main Content Area */}
        <main className="p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* 4. Bottom Nav for Mobile */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default MainLayout;