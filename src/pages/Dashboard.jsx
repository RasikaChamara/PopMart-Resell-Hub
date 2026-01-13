import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Logo from "../assets/logo2.png";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ShieldAlert,
  Trash2,
  User,
  Lock,
  Info,
  Loader2,
  Download,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    items: 0,
    resellers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ open: false, table: "" });
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), getCurrentUser()]);
      setLoading(false);
    };
    initDashboard();
  }, []);

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUser(data.user);
  };

  const fetchStats = async () => {
    const [ord, itm, res] = await Promise.all([
      supabase.from("orders").select("sell_price_at_sale"),
      supabase.from("items").select("item_id", { count: "exact" }),
      supabase.from("resellers").select("reseller_id", { count: "exact" }),
    ]);

    const totalRevenue = ord.data?.reduce(
      (sum, o) => sum + (Number(o.sell_price_at_sale) || 0),
      0
    );

    setStats({
      orders: ord.data?.length || 0,
      items: itm.count || 0,
      resellers: res.count || 0,
      revenue: totalRevenue || 0,
    });
  };

  // --- BACKUP FUNCTIONALITY ---
  const downloadBackup = async (tableName) => {
    try {
      const { data, error } = await supabase
        .from(tableName.toLowerCase())
        .select("*");
      if (error) throw error;

      if (data.length === 0) {
        alert("No data found to backup!");
        return;
      }

      // Convert JSON to CSV
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      );
      const csvContent = [headers, ...rows].join("\n");

      // Trigger Download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tableName}_Backup_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
    } catch (err) {
      alert("Backup failed: " + err.message);
    }
  };

  const handleClearTable = async () => {
    // SECURITY: Compares input to the HIDDEN Environment Variable
    const MASTER_PASS = import.meta.env.VITE_ADMIN_PASSWORD;

    if (passwordInput !== MASTER_PASS) {
      setError("Invalid Security Key!");
      return;
    }

    try {
      setLoading(true);
      const table = confirmModal.table.toLowerCase();

      // Delete Orders first to satisfy foreign key constraints
      if (table === "orders") {
        await supabase.from("orders").delete().neq("order_id", "0");
      } else {
        await supabase.from("orders").delete().neq("order_id", "0");
        const idField = table === "items" ? "item_id" : "reseller_id";
        await supabase.from(table).delete().neq(idField, "0");
      }

      setConfirmModal({ open: false, table: "" });
      setPasswordInput("");
      await fetchStats();
      alert(`${confirmModal.table} table has been cleared.`);
    } catch (err) {
      alert("Database Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && stats.orders === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-main" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10 px-4 md:px-8 pt-6">
      {/* --- TOP BAR --- */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-black text-main flex items-center gap-2">
            <LayoutDashboard className="text-sub" /> DASHBOARD
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest tracking-tighter">
            Control Center
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-full border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-main rounded-full flex items-center justify-center text-sub border-2 border-white shadow-sm">
            <User size={20} />
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-black text-main leading-none uppercase tracking-tight">
              System Admin
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              {user?.email || "Authenticated"}
            </p>
          </div>
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<ShoppingCart />}
          label="Total Orders"
          value={stats.orders}
          color="bg-blue-600"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Gross Revenue"
          value={`Rs. ${stats.revenue.toLocaleString()}`}
          color="bg-emerald-600"
        />
        <StatCard
          icon={<Package />}
          label="Inventory"
          value={stats.items}
          color="bg-amber-600"
        />
        <StatCard
          icon={<Users />}
          label="Resellers"
          value={stats.resellers}
          color="bg-indigo-600"
        />
      </div>

      {/* --- MIDDLE SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-main text-sub p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 italic">Quick Overview</h2>
            <p className="opacity-70 text-sm max-w-[280px]">
              Your database is currently managing{" "}
              {stats.orders + stats.items + stats.resellers} total records.
            </p>
            <button
              onClick={fetchStats}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-sub text-main rounded-xl font-bold text-xs uppercase hover:bg-white transition-all"
            >
              Refresh Data
            </button>
          </div>
          <TrendingUp
            size={150}
            className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform"
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 p-8 rounded-[32px] flex flex-col justify-center">
          <h3 className="font-black text-main uppercase text-sm mb-3 flex items-center gap-2">
            <Download size={18} className="text-blue-500" /> Quick Backup
          </h3>
          <p className="text-xs text-gray-500 font-medium mb-5">
            Download your data as CSV before performing any maintenance.
          </p>
          <div className="flex gap-2">
            {["Items", "Resellers", "Orders"].map((t) => (
              <button
                key={t}
                onClick={() => downloadBackup(t)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-main hover:bg-gray-100 uppercase"
              >
                {t} CSV
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- DANGER ZONE --- */}
      <div className="p-8 bg-red-50/50 rounded-[32px] border border-red-100 shadow-inner">
        <div className="flex items-center gap-2 mb-6 text-red-600">
          <ShieldAlert size={24} />
          <h2 className="text-xl font-black uppercase italic tracking-tighter">
            System Maintenance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Items", "Resellers", "Orders"].map((table) => (
            <button
              key={table}
              onClick={() => {
                setConfirmModal({ open: true, table });
                setError("");
              }}
              className="flex flex-col items-center justify-center gap-2 p-6 bg-white border border-red-100 text-red-500 font-bold rounded-[24px] hover:bg-red-600 hover:text-white transition-all shadow-sm group"
            >
              <Trash2 size={24} className="mb-1" />
              <span className="uppercase text-xs tracking-widest">
                Clear {table}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* --- FOOTER & BRANDING --- */}
      <footer className="mt-20 py-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left Side: Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-50 p-2">
            <img
              src={Logo}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-black text-main text-lg tracking-tighter block leading-none">
              POPMART.LK-SL RESELL HUB
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[3px]">
              Admin Suite v1.0
            </span>
          </div>
        </div>

        {/* Right Side: Developer Info */}
        <div className="flex flex-col items-center md:items-end">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
            Architecture & Code By
          </p>

          {/* Name - Removed bg-sub and rounded-full */}
          <h4 className="text-base font-black text-main tracking-tight mb-1">
            CHAMARA RASIKA BANDARA
          </h4>

          {/* Contact Info Row */}
          <div className="flex flex-col md:items-end gap-1 text-[11px] font-bold text-gray-500">
            <a
              href="mailto:your-email@example.com"
              className="hover:text-main transition-colors flex items-center gap-2"
            >
              rasikacbandara1593@gmail.com
            </a>
            <a
              href="tel:+94700000000"
              className="hover:text-main transition-colors flex items-center gap-2"
            >
              +94 76 4327 987
            </a>
            
          </div>
        </div>
      </footer>

      {/* --- SECURITY MODAL --- */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-main/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock size={40} />
            </div>
            <h3 className="text-2xl font-black text-main text-center mb-2 uppercase tracking-tighter">
              Authorize Reset
            </h3>
            <p className="text-gray-400 text-center text-sm mb-8 px-4">
              Enter your <b>Master Security Key</b> to permanently erase the{" "}
              <span className="text-red-500 font-bold">
                {confirmModal.table}
              </span>{" "}
              database.
            </p>

            <input
              type="password"
              placeholder="••••••••"
              className={`w-full p-5 rounded-2xl bg-gray-50 border outline-none mb-3 text-center text-xl font-bold tracking-widest ${
                error
                  ? "border-red-500 animate-shake"
                  : "border-gray-100 focus:ring-4 focus:ring-red-100"
              }`}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            {error && (
              <p className="text-red-600 text-[10px] font-black text-center mb-6 uppercase italic">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={handleClearTable}
                className="w-full py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 active:scale-95 transition-all uppercase tracking-widest text-sm"
              >
                Execute Wipe
              </button>
              <button
                onClick={() => {
                  setConfirmModal({ open: false, table: "" });
                  setPasswordInput("");
                }}
                className="w-full py-4 text-gray-400 font-bold rounded-2xl hover:text-main transition-colors text-xs uppercase"
              >
                Abort Operation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group">
    <div
      className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
    >
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-1">
      {label}
    </p>
    <p className="text-xl font-black text-main tracking-tight italic">
      {value}
    </p>
  </div>
);

export default Dashboard;
