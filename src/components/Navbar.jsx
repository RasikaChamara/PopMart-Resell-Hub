import React from 'react';
import { LogOut } from 'lucide-react'; // Import the icon
import { supabase } from '../supabaseClient'; // Import supabase

const Navbar = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error.message);
  };

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
      <h1 className="text-xl font-bold text-main">
        SL Resell Hub<span className="text-sub text-2xl">.</span>
      </h1>
      
      {/* Mobile Logout Button */}
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 p-2 px-3 bg-red-50 rounded-xl text-red-500 hover:bg-red-100 transition-colors border border-red-100"
      >
        <span className="text-xs font-bold uppercase tracking-wider">Log Out</span>
        <LogOut size={18} />
      </button>
    </div>
  );
};

export default Navbar;