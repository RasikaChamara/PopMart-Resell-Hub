import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ShoppingBag,
  X,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Calendar,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  RotateCcw,
  Ban,
  User,
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    order_id: "",
    date: new Date().toISOString().split("T")[0],
    courier_service: "Royal Express",
    tracking_no: "",
    customer_name: "",
    customer_address: "",
    contact_no_1: "",
    contact_no_2: "",
    item_id: "",
    reseller_id: "",
    buy_price_at_sale: "",
    sell_price_at_sale: "",
    delivery_charges: "0",
    delivery_status: "Pending",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ord, itm, res] = await Promise.all([
        supabase
          .from("orders")
          .select("*, items(item_name), resellers(reseller_name)")
          .order("date", { ascending: false })
          .order("order_id", { ascending: false }),
        supabase.from("items").select("item_id, item_name"),
        supabase.from("resellers").select("reseller_id, reseller_name"),
      ]);

      if (ord.error) throw ord.error;
      if (itm.error) throw itm.error;
      if (res.error) throw res.error;

      setOrders(ord.data ?? []);
      setItems(itm.data ?? []);
      setResellers(res.data ?? []);
    } catch (error) {
      console.error("Failed to sync app data:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({
      order_id: "",
      date: new Date().toISOString().split("T")[0],
      courier_service: "Royal Express",
      tracking_no: "",
      customer_name: "",
      customer_address: "",
      contact_no_1: "",
      contact_no_2: "",
      item_id: "",
      reseller_id: "",
      buy_price_at_sale: "",
      sell_price_at_sale: "",
      delivery_charges: "0",
      delivery_status: "Pending",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingId) {
      // Remove joined tables before updating
      const {
        items: _items,
        resellers: _resellers,
        commission_amount: _comm,
        ...updateData
      } = formData;
      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("order_id", editingId);
      if (error) {
        setErrorPopup({ open: true, message: error.message });
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("orders").insert([formData]);
      if (error) {
        const msg =
          error.code === "23505" ? "Order ID already exists." : error.message;
        setErrorPopup({ open: true, message: msg });
        setLoading(false);
        return;
      }
    }
    setIsModalOpen(false);
    resetForm();
    fetchData();
  };

  const handleEdit = (order) => {
    // We only want the core database fields in the form, not the nested join objects
    const { items: _i, resellers: _r, ...cleanOrder } = order;
    setFormData(cleanOrder);
    setEditingId(order.order_id);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    if (status === "Delivered") return "text-green-500 bg-green-50";
    if (status === "Returned") return "text-orange-500 bg-orange-50";
    if (status === "Canceled") return "text-red-500 bg-red-50";
    return "text-blue-500 bg-blue-50";
  };

  return (
    <div className="space-y-6 pb-24 p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-main">ORDERS</h2>
          <p className="text-gray-500 text-sm font-medium">
            Tracking {orders.length} shipments
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-sub text-main p-4 rounded-[20px] shadow-lg flex items-center gap-2 font-bold hover:scale-105 transition-all"
        >
          <Plus size={20} /> Add Order
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          className="w-full pl-12 pr-4 py-4 rounded-[20px] border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-main bg-white"
          placeholder="Search Customer or Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
            <div className="w-10 h-10 border-4 border-main border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold animate-pulse uppercase tracking-widest text-xs">
              Syncing...
            </p>
          </div>
        ) : (
          orders
            .filter((o) => {
              const name = o.customer_name?.toLowerCase() || "";
              const id = String(o.order_id).toLowerCase();
              const term = searchTerm.toLowerCase();
              return name.includes(term) || id.includes(term);
            })
            .map((order) => (
              <div
                key={order.order_id}
                className={`bg-gray-50/50 rounded-[28px] border border-main/10 transition-all overflow-hidden ${
                  expandedId === order.order_id
                    ? "ring-2 ring-main bg-white shadow-xl"
                    : ""
                }`}
              >
                {/* TOP ROW */}
                <div className="p-5 flex justify-between items-center">
                  <div
                    className="flex items-center gap-4 cursor-pointer flex-1"
                    onClick={() =>
                      setExpandedId(
                        expandedId === order.order_id ? null : order.order_id
                      )
                    }
                  >
                    <div className="w-12 h-12 bg-main rounded-xl flex items-center justify-center text-sub shadow-md">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-main">
                        {order.customer_name}
                      </h3>
                      <div className="flex gap-3 items-center mt-1">
                        {" "}
                        {/* Increased gap to 3 */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(
                            order.delivery_status
                          )}`}
                        >
                          {order.delivery_status}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono uppercase">
                          {order.order_id}
                        </span>
                        {/* --- ADDED DATE SECTION START --- */}
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 border-l pl-3 border-gray-200">
                          <Calendar size={12} className="text-gray-400" />
                          {order.date}
                        </span>
                        {/* --- ADDED DATE SECTION END --- */}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(order)}
                      className="p-2 text-gray-400 hover:text-main"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({ open: true, id: order.order_id })
                      }
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* EXPANDED CONTENT */}
                {expandedId === order.order_id && (
                  <div className="px-5 pb-4 animate-in fade-in slide-in-from-top-2">
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-gray-50">
                          <User size={16} className="text-main mt-1" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">
                              Customer Name
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.customer_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-gray-50">
                          <MapPin size={16} className="text-main mt-1" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">
                              Address
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.customer_address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-50">
                          <Phone size={16} className="text-main" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">
                              Contacts
                            </p>
                            <p className="text-sm text-gray-600 font-bold">
                              {order.contact_no_1} /{" "}
                              {order.contact_no_2 || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-50">
                          <Truck size={16} className="text-main" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">
                              Courier
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.courier_service} -{" "}
                              <span className="font-mono font-bold">
                                {order.tracking_no}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-main text-sub p-5 rounded-[24px]">
                        <p className="text-[10px] uppercase font-bold opacity-60 mb-3">
                          Pricing & Profit
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Selling Price</span>
                            <span className="font-bold">
                              Rs. {order.sell_price_at_sale}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery</span>
                            <span className="font-bold">
                              Rs. {order.delivery_charges}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-white/10 text-sub font-black italic">
                            <span>Commission (25%)</span>
                            <span>Rs. {order.commission_amount}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-white/10 text-sub font-black italic">
                            <span>Reseller ID</span>
                            <span>{order.reseller_id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === order.order_id ? null : order.order_id
                    )
                  }
                  className="w-full py-2 flex justify-center text-gray-300 hover:text-main"
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-500 ${
                      expandedId === order.order_id ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            ))
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-main/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-50 w-full max-w-3xl rounded-[32px] p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 text-gray-300"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black text-main mb-6 uppercase">
              {editingId ? "Update Order" : "New Order"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  required
                  disabled={!!editingId}
                  placeholder="Order ID"
                  className="w-full p-4 rounded-2xl bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-main disabled:opacity-50"
                  value={formData.order_id}
                  onChange={(e) =>
                    setFormData({ ...formData, order_id: e.target.value })
                  }
                />
                <input
                  required
                  type="date"
                  className="w-full p-4 rounded-2xl bg-white border border-gray-200 outline-none"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
                <select
                  className="w-full p-4 rounded-2xl bg-white border border-gray-200 outline-none"
                  value={formData.delivery_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delivery_status: e.target.value,
                    })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Returned">Returned</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-main uppercase">
                    Customer Details
                  </p>
                  <input
                    required
                    placeholder="Customer Name"
                    className="w-full p-4 rounded-2xl bg-white border border-gray-200"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_name: e.target.value,
                      })
                    }
                  />
                  <textarea
                    required
                    placeholder="Shipping Address"
                    rows="2"
                    className="w-full p-4 rounded-2xl bg-white border border-gray-200 resize-none"
                    value={formData.customer_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_address: e.target.value,
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <input
                      required
                      placeholder="Contact 1"
                      className="w-1/2 p-4 rounded-2xl bg-white border border-gray-200"
                      value={formData.contact_no_1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_no_1: e.target.value,
                        })
                      }
                    />
                    <input
                      placeholder="Contact 2 (Optional)"
                      className="w-1/2 p-4 rounded-2xl bg-white border border-gray-200"
                      value={formData.contact_no_2}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_no_2: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-main uppercase">
                    Product & Partner
                  </p>
                  <select
                    required
                    className="w-full p-4 rounded-2xl bg-white border border-gray-200 outline-none"
                    value={formData.item_id}
                    onChange={(e) =>
                      setFormData({ ...formData, item_id: e.target.value })
                    }
                  >
                    <option value="">Select Item</option>
                    {items.map((i) => (
                      <option key={i.item_id} value={i.item_id}>
                        {i.item_name}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    className="w-full p-4 rounded-2xl bg-white border border-gray-200 outline-none"
                    value={formData.reseller_id}
                    onChange={(e) =>
                      setFormData({ ...formData, reseller_id: e.target.value })
                    }
                  >
                    <option value="">Select Reseller</option>
                    {resellers.map((r) => (
                      <option key={r.reseller_id} value={r.reseller_id}>
                        {r.reseller_name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <select
                      className="w-1/2 p-4 rounded-2xl bg-white border border-gray-200 outline-none"
                      value={formData.courier_service}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          courier_service: e.target.value,
                        })
                      }
                    >
                      <option value="Royal Express">Royal Express</option>
                      <option value="Fardar Express">Fardar Express</option>
                      <option value="Transe Express">Transe Express</option>
                      <option value="SL Post">SL Post</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      placeholder="Tracking No"
                      className="w-1/2 p-4 rounded-2xl bg-white border border-gray-200"
                      value={formData.tracking_no}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tracking_no: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="bg-main/5 p-6 rounded-[24px] grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Buy Price
                  </p>
                  <input
                    required
                    type="number"
                    className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-main"
                    value={formData.buy_price_at_sale}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buy_price_at_sale: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Sell Price
                  </p>
                  <input
                    required
                    type="number"
                    className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-main"
                    value={formData.sell_price_at_sale}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sell_price_at_sale: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Delivery Charges
                  </p>
                  <input
                    required
                    type="number"
                    className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-main"
                    value={formData.delivery_charges}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        delivery_charges: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button className="w-full py-5 bg-main text-sub font-black rounded-2xl shadow-lg active:scale-95 transition-all uppercase">
                {editingId ? "Update Shipment" : "Confirm Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-main/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-main mb-8">
              Delete Order {deleteConfirm.id}?
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null })}
                className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await supabase
                    .from("orders")
                    .delete()
                    .eq("order_id", deleteConfirm.id);
                  setDeleteConfirm({ open: false, id: null });
                  fetchData();
                }}
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {errorPopup.open && (
        <div className="fixed inset-0 bg-main/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-black text-main mb-2">Error</h3>
            <p className="text-gray-500 text-sm mb-8">{errorPopup.message}</p>
            <button
              onClick={() => setErrorPopup({ open: false, message: "" })}
              className="w-full py-4 bg-main text-sub font-bold rounded-2xl"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
