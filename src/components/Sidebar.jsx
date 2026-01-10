import React from 'react';
import { LayoutDashboard, Package, Users, Receipt, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'items', name: 'Inventory', icon: <Package size={20} /> },
    { id: 'resellers', name: 'Resellers', icon: <Users size={20} /> },
    { id: 'orders', name: 'Orders', icon: <Receipt size={20} /> },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
  };

  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-main text-white p-4 fixed left-0 top-0 border-r border-white/5">
      <div className="mb-10 px-2 text-2xl font-bold">
        SL Resell Hub<span className="text-sub text-3xl">.</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
              activeTab === item.id 
                ? 'bg-sub text-main font-bold shadow-lg shadow-cyan-500/20' 
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>

      {/* User & Logout Section */}
      <div className="mt-auto p-3 bg-white/5 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sub flex items-center justify-center text-main font-bold shadow-inner">
            AD
          </div>
          <div className="text-sm">
            <p className="font-bold text-white leading-none">Admin</p>
            <p className="text-[10px] text-gray-500 uppercase mt-1">Online</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;