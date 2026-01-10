import React from 'react';
import { TrendingUp, Package, Users, DollarSign } from 'lucide-react';

const Dashboard = () => {
  // Stats data (We will connect this to Supabase later)
  const stats = [
    { label: 'Total Items', value: '342', icon: <Package size={20} />, color: 'bg-blue-500' },
    { label: 'Active Resellers', value: '12', icon: <Users size={20} />, color: 'bg-purple-500' },
    { label: 'Monthly Profit', value: '45,000 LKR', icon: <TrendingUp size={20} />, color: 'bg-sub' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-main">Business Overview</h2>
        <p className="text-gray-500 text-sm">Real-time performance of your resell business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-main mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for a Chart or Recent Activity */}
      <div className="bg-main text-white p-8 rounded-[40px] shadow-xl">
        <h3 className="text-lg font-bold mb-2">Recent Activity</h3>
        <p className="text-gray-400 text-sm">Your recent sales and inventory updates will appear here once we link the database.</p>
        <div className="mt-6 h-32 border-2 border-dashed border-gray-700 rounded-3xl flex items-center justify-center">
          <p className="text-gray-600 italic text-xs">Chart Area Coming Soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;