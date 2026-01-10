import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory'; 
import Reseller from './pages/Resellers';
import Order from './pages/Orders';

function App() {
  const [session, setSession] = useState(null);
  // This line fixes the "activeTab is not defined" error
  const [activeTab, setActiveTab] = useState('dashboard'); 

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login/logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Show Login if no session
  if (!session) {
    return <Login />;
  }

  // 2. Show Dashboard/App if logged in
  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {activeTab === 'dashboard' && <Dashboard />}
      
      {activeTab === 'items' && <Inventory />}

      {activeTab === 'resellers' && <Reseller />}

      {activeTab === 'orders' && <Order />}

      {/* Add other conditions for 'resellers' or 'orders' here */}
      
    </MainLayout>
  );
}

export default App;