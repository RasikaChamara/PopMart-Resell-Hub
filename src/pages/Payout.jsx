import React, { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../supabaseClient";
import {
  DollarSign,
  FileText,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Payout = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get the current week's Monday in YYYY-MM-DD format
  const getMondayDate = () => {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const currentMonday = getMondayDate();

  const fetchPayoutData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`*, resellers ( reseller_name )`)
        .eq("delivery_status", "Delivered")
        .order("date", { ascending: false });

      if (error) throw error;
      setData(orders ?? []);
    } catch (error) {
      console.error("Error fetching payout data:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayoutData();
  }, [fetchPayoutData]);

  // --- UPDATE PAID STATUS ---
  const handleMarkAsPaid = async (orderId, currentStatus) => {
    const newStatus = !currentStatus;

    // Update local state immediately (UI will recalculate stats automatically)
    setData((prev) =>
      prev.map((o) =>
        o.order_id === orderId ? { ...o, is_paid: newStatus } : o
      )
    );

    const { error } = await supabase
      .from("orders")
      .update({ is_paid: newStatus })
      .eq("order_id", orderId);

    if (error) {
      alert("Failed to update status");
      fetchPayoutData();
    }
  };

  // --- DYNAMIC CALCULATIONS ---
  // These update whenever 'data' changes (e.g., when you toggle a 'Paid' button)
  const stats = useMemo(() => {
    let weeklyProfit = 0;
    let ongoingProfit = 0;
    let pendingCommission = 0;

    data.forEach((order) => {
      const orderProfit =
        (order.sell_price_at_sale || 0) -
        (order.buy_price_at_sale || 0) -
        (order.commission_amount || 0);

      // Profit is only counted if the order is PAID
      if (order.is_paid) {
        ongoingProfit += orderProfit;
        if (order.date >= currentMonday) {
          weeklyProfit += orderProfit;
        }
      } else {
        // If not paid, it adds to the Pending Commission pool
        pendingCommission += order.commission_amount || 0;
      }
    });

    return { weeklyProfit, ongoingProfit, pendingCommission };
  }, [data, currentMonday]);

  // Filter lists for the UI
  const pastDueOrders = data.filter(
    (o) => o.date < currentMonday && !o.is_paid
  );
  const currentWeekOrders = data.filter((o) => o.date >= currentMonday);

  // --- PDF GENERATION ---
  const generatePDF = () => {
    const doc = new jsPDF();

    // Header text
    doc.setFontSize(18);
    doc.text("Settlement & Profit Report", 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Week Beginning: ${currentMonday} | Generated: ${new Date().toLocaleString()}`,
      14,
      28
    );

    // Use the autoTable function directly
    autoTable(doc, {
      head: [["Date", "Reseller", "Order ID", "Commission", "Status"]],
      body: data.map((o) => [
        o.date,
        o.resellers?.reseller_name || "N/A",
        o.order_id,
        `Rs. ${o.commission_amount}`,
        o.is_paid ? "SETTLED" : "PENDING",
      ]),
      startY: 35,
      headStyles: { fillColor: [15, 23, 42] }, // Your 'main' color
      theme: "grid",
    });

    doc.save(`Payout_Summary_${currentMonday}.pdf`);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-main">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold uppercase tracking-widest text-xs">
          Processing Ledger...
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-main uppercase">Payouts</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Calculated from Monday, {currentMonday}
          </p>
        </div>
        <button
          onClick={generatePDF}
          className="bg-main text-sub p-3 rounded-2xl shadow-lg hover:scale-105 transition-all"
        >
          <FileText size={20} />
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-main/10 shadow-sm">
          <Calendar className="text-main mb-2" size={20} />
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">
            Settled Profit (Week)
          </p>
          <p className="text-2xl font-black text-main">
            Rs. {stats.weeklyProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-main p-6 rounded-[32px] shadow-xl text-sub">
          <DollarSign className="text-sub mb-2" size={20} />
          <p className="opacity-70 text-[10px] uppercase font-bold tracking-tight">
            Realized Hub Profit
          </p>
          <p className="text-2xl font-black">
            Rs. {stats.ongoingProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 p-6 rounded-[32px] border border-red-100">
          <CheckCircle2 className="text-red-500 mb-2" size={20} />
          <p className="text-red-400 text-[10px] uppercase font-bold tracking-tight">
            Unpaid Commissions
          </p>
          <p className="text-2xl font-black text-red-600">
            Rs. {stats.pendingCommission.toLocaleString()}
          </p>
        </div>
      </div>

      {/* SECTION: PAST DUE */}
      {pastDueOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2 text-red-500">
            <AlertCircle size={16} />
            <h3 className="font-black text-xs uppercase tracking-widest">
              Past Due (Forgot to Pay)
            </h3>
          </div>
          {pastDueOrders.map((order) => (
            <PayoutCard
              key={order.order_id}
              order={order}
              onPay={handleMarkAsPaid}
              isPastDue={true}
            />
          ))}
        </div>
      )}

      {/* SECTION: CURRENT WEEK */}
      <div className="space-y-3">
        <h3 className="font-black text-main text-xs uppercase tracking-widest px-2">
          Current Week Deliveries
        </h3>
        {currentWeekOrders.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-[32px] border-2 border-dashed text-gray-400 text-xs">
            No orders delivered this week yet.
          </div>
        ) : (
          currentWeekOrders.map((order) => (
            <PayoutCard
              key={order.order_id}
              order={order}
              onPay={handleMarkAsPaid}
            />
          ))
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: PAYOUT CARD ---
const PayoutCard = ({ order, onPay, isPastDue }) => (
  <div
    className={`bg-white p-4 rounded-[28px] border ${
      isPastDue ? "border-red-200 bg-red-50/20" : "border-gray-100"
    } flex justify-between items-center shadow-sm`}
  >
    <div>
      <p className="font-bold text-main">
        {order.resellers?.reseller_name || "Anonymous"}
      </p>
      <p className="font-bold text-main">
        {order.reseller_id }
      </p>
      <div className="flex gap-3 items-center mt-1">
        <p className="text-[10px] text-gray-400 font-mono uppercase">
          {order.order_id}
        </p>
        <p
          className={`text-[10px] font-bold ${
            isPastDue ? "text-red-500" : "text-gray-400"
          }`}
        >
          {order.date}
        </p>
      </div>
    </div>
    <div className="text-right flex items-center gap-6">
      <div>
        <p className="text-[9px] text-gray-400 uppercase font-black">
          Commission
        </p>
        <p className="font-black text-main">Rs. {order.commission_amount}</p>
      </div>
      <button
        onClick={() => onPay(order.order_id, order.is_paid)}
        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${
          order.is_paid
            ? "bg-green-500 text-white shadow-green-200"
            : "bg-white border-2 border-main text-main hover:bg-main hover:text-sub"
        }`}
      >
        {order.is_paid ? "Paid ✓" : "Pay Now"}
      </button>
    </div>
  </div>
);

export default Payout;
