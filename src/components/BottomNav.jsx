import React from 'react';
import { LayoutDashboard, Package, Users, Receipt,CircleDollarSign } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: <LayoutDashboard size={22} />, label: 'Home' },
    { id: 'items', icon: <Package size={22} />, label: 'Items' },
    { id: 'resellers', icon: <Users size={22} />, label: 'Resellers' },
    { id: 'orders', icon: <Receipt size={22} />, label: 'Orders' },
    { id: 'payout', icon: <CircleDollarSign size={22} />, label: 'Payout' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-main text-white border-t border-gray-700 px-2 pb-4 pt-2 flex justify-around items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${
            activeTab === tab.id ? 'text-sub scale-110' : 'text-gray-400'
          }`}
        >
          {tab.icon}
          <span className="text-[10px] font-medium uppercase tracking-wider">
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;