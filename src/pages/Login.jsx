import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png'; 

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-main p-6">
      
      {/* Branding Section Above the Box */}
      <div className="flex flex-col items-center mb-8">
        {/* Increased Logo Size from w-24 to w-32 */}
        <img src={logo} alt="App Logo" className="w-40 h-40 mb-1 object-contain" />
        
      </div>

      {/* The Login Card Area */}
      <div className="w-full max-w-sm bg-white rounded-[40px] p-4 shadow-2xl border border-white/10">
        <div className="text-center mb-6">
          <h2 className="text-main text-xl font-bold">Welcome Back</h2>
          <p className="text-black-400 text-xs">Enter your details to manage inventory</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-black-400 ml-2 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="admin@resell.com"
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-main placeholder-gray-300 focus:ring-2 focus:ring-sub outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-black-400 ml-2 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-main placeholder-gray-300 focus:ring-2 focus:ring-sub outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 mt-2 bg-sub text-main font-extrabold rounded-2xl shadow-lg shadow-cyan-500/30 hover:brightness-105 active:scale-95 transition-all uppercase tracking-wider text-sm"
          >
            {loading ? 'Verifying...' : 'Login Now'}
          </button>
        </form>
      </div>

      <p className="mt-8 text-gray-500 text-[10px] uppercase tracking-widest font-medium">
        Secure Access Only
      </p>
    </div>
  );
};

export default Login;