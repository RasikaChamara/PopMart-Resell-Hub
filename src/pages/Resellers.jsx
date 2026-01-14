import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  X,
  MapPin,
  Phone,
  CreditCard,
  MessageCircle,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

const Resellers = () => {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  //   const toggleExpand = (id) => {
  //     setExpandedId(expandedId === id ? null : id);
  //   };

  // Form State (Flattened for UI ease)
  const [formData, setFormData] = useState({
    reseller_id: "",
    reseller_name: "",
    reseller_address: "",
    contact_no: "",
    whatsapp_no: "",
    // Bank details (UI fields)
    acc_no: "",
    bank: "",
    branch: "",
    card_holder: "",
  });

  const fetchResellers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("resellers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setResellers(data ?? []);
    } catch (error) {
      console.error("Failed to fetch resellers:", error);
      // Optional: Add your error notification logic here
    } finally {
      setLoading(false);
    }
  }, []);

  // Load resellers on mount
  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  const resetForm = () => {
    setFormData({
      reseller_id: "",
      reseller_name: "",
      reseller_address: "",
      contact_no: "",
      whatsapp_no: "",
      acc_no: "",
      bank: "",
      branch: "",
      card_holder: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data: Bundle bank fields into JSONB format
    const submitData = {
      reseller_id: formData.reseller_id,
      reseller_name: formData.reseller_name,
      reseller_address: formData.reseller_address,
      contact_no: formData.contact_no,
      whatsapp_no: formData.whatsapp_no,
      bank_details: {
        acc_no: formData.acc_no,
        bank: formData.bank,
        branch: formData.branch,
        card_holder: formData.card_holder,
      },
    };

    if (editingId) {
      const { error } = await supabase
        .from("resellers")
        .update(submitData)
        .eq("reseller_id", editingId);
      if (error) {
        setLoading(false);
        setErrorPopup({ open: true, message: error.message });
        return;
      }
    } else {
      const { error } = await supabase.from("resellers").insert([submitData]);
      if (error) {
        setLoading(false);
        const msg =
          error.code === "23505"
            ? "This Reseller ID already exists."
            : error.message;
        setErrorPopup({ open: true, message: msg });
        return;
      }
    }

    setIsModalOpen(false);
    resetForm();
    fetchResellers(true);
  };

  const handleEdit = (reseller) => {
    const bank = reseller.bank_details || {};
    setFormData({
      reseller_id: reseller.reseller_id,
      reseller_name: reseller.reseller_name,
      reseller_address: reseller.reseller_address || "",
      contact_no: reseller.contact_no || "",
      whatsapp_no: reseller.whatsapp_no || "",
      acc_no: bank.acc_no || "",
      bank: bank.bank || "",
      branch: bank.branch || "",
      card_holder: bank.card_holder || "",
    });
    setEditingId(reseller.reseller_id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("resellers")
      .delete()
      .eq("reseller_id", deleteConfirm.id);
    if (error) setErrorPopup({ open: true, message: error.message });
    setDeleteConfirm({ open: false, id: null, name: "" });
    fetchResellers(true);
  };

  const filteredResellers = resellers.filter(
    (r) =>
      (r.reseller_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (r.reseller_id?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        {" "}
        {/* Changed items-end to items-center */}
        <div>
          <h2 className="text-2xl font-black text-main uppercase tracking-tight">
            Resellers
          </h2>
          <p className="text-gray-500 text-xs font-medium">
            Managing {resellers.length} partners
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          // Changed p-4 to px-5 py-3 for a sleeker, professional look
          className="bg-sub text-main px-5 py-3 rounded-[18px] shadow-lg flex items-center gap-2 font-bold hover:scale-105 transition-all text-sm"
        >
          <Plus size={18} /> Add Reseller
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          className="w-full pl-12 pr-4 py-4 rounded-[20px] border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-main focus:border-main bg-white transition-all"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid gap-3">
        {loading && resellers.length === 0 ? (
          <div className="text-center py-20 text-gray-400 animate-pulse">
            Loading partners...
          </div>
        ) : (
          filteredResellers.map((reseller) => {
            const isExpanded = expandedId === reseller.reseller_id;
            return (
              <div
                key={reseller.reseller_id}
                className={`bg-gray-50/50 rounded-[24px] border border-main/10 shadow-sm transition-all duration-300 flex flex-col overflow-hidden ${
                  isExpanded
                    ? "ring-2 ring-main bg-white shadow-md"
                    : "hover:border-main"
                }`}
              >
                {/* 1. TOP SECTION - Simplified click to toggle */}
                <div
                  className="p-5 flex justify-between items-center cursor-pointer"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : reseller.reseller_id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-main rounded-xl flex items-center justify-center text-sub shadow-md shrink-0">
                      <Users size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-main leading-tight">
                        {reseller.reseller_name}
                      </h3>
                      <div className="flex gap-3 text-[11px] text-gray-400 mt-1">
                        <span className="font-mono bg-gray-200 px-2 rounded uppercase text-main/70">
                          {reseller.reseller_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Indicator */}
                  <div
                    className={`text-gray-300 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {/* 2. EXPANDABLE AREA */}
                {isExpanded && (
                  <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      {/* Left Column: Contact & Address */}
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-2xl">
                          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                            Full Address
                          </p>
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-main mt-0.5" />
                            <p className="text-sm text-gray-600 leading-tight">
                              {reseller.reseller_address ||
                                "No address provided"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-2 text-main font-bold text-xs">
                            <Phone size={14} /> {reseller.contact_no || "N/A"}
                          </div>
                          <div className="bg-green-50 p-3 rounded-2xl flex items-center gap-2 text-green-600 font-bold text-xs">
                            <MessageCircle size={14} />{" "}
                            {reseller.whatsapp_no || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Bank Details */}
                      <div className="bg-main text-sub p-4 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold opacity-70 mb-3 flex items-center gap-2">
                          <CreditCard size={14} /> Bank Details
                        </p>
                        <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                          <span className="opacity-70">Bank:</span>{" "}
                          <span className="font-bold text-right">
                            {reseller.bank_details?.bank || "—"}
                          </span>
                          <span className="opacity-70">Branch:</span>{" "}
                          <span className="font-bold text-right truncate pl-2">
                            {reseller.bank_details?.branch || "—"}
                          </span>
                          <span className="opacity-70">Acc No:</span>{" "}
                          <span className="font-bold text-right">
                            {reseller.bank_details?.acc_no || "—"}
                          </span>
                          <span className="opacity-70">Card Holder:</span>{" "}
                          <span className="font-bold text-right truncate pl-2">
                            {reseller.bank_details?.card_holder || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. ACTIONS AREA - Moved here */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Stop expansion toggle
                          handleEdit(reseller);
                        }}
                        className="flex-1 py-3 bg-main/5 text-main hover:bg-main hover:text-sub rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Edit2 size={16} /> Edit Reseller
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Stop expansion toggle
                          setDeleteConfirm({
                            open: true,
                            id: reseller.reseller_id,
                            name: reseller.reseller_name,
                          });
                        }}
                        className="px-5 py-3 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-main/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-50 w-full max-w-2xl rounded-[32px] p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200 border border-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 text-gray-300 hover:text-main transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black text-main mb-6">
              {editingId ? "Edit Reseller" : "New Reseller"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-main uppercase tracking-wider">
                    General Information
                  </p>
                  <input
                    required
                    disabled={editingId}
                    placeholder="Reseller ID"
                    className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-main outline-none disabled:opacity-50"
                    value={formData.reseller_id}
                    onChange={(e) =>
                      setFormData({ ...formData, reseller_id: e.target.value })
                    }
                  />
                  <input
                    required
                    placeholder="Reseller Name"
                    className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-main outline-none"
                    value={formData.reseller_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reseller_name: e.target.value,
                      })
                    }
                  />
                  <textarea
                    placeholder="Full Address"
                    rows="2"
                    className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-main outline-none resize-none"
                    value={formData.reseller_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reseller_address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-main uppercase tracking-wider">
                    Contact Details
                  </p>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-4 text-gray-400"
                      size={18}
                    />
                    <input
                      required
                      placeholder="Contact Number"
                      className="w-full pl-11 p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-main outline-none"
                      value={formData.contact_no}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_no: e.target.value })
                      }
                    />
                  </div>
                  <div className="relative">
                    <MessageCircle
                      className="absolute left-4 top-4 text-gray-400"
                      size={18}
                    />
                    <input
                      placeholder="WhatsApp Number"
                      className="w-full pl-11 p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-main outline-none"
                      value={formData.whatsapp_no}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsapp_no: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="bg-white p-6 rounded-[24px] border border-gray-100 space-y-4 shadow-inner">
                <p className="text-xs font-bold text-main uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={14} /> Bank Account Details (JSON)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Account Number"
                    className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-main outline-none"
                    value={formData.acc_no}
                    onChange={(e) =>
                      setFormData({ ...formData, acc_no: e.target.value })
                    }
                  />
                  <input
                    placeholder="Bank Name"
                    className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-main outline-none"
                    value={formData.bank}
                    onChange={(e) =>
                      setFormData({ ...formData, bank: e.target.value })
                    }
                  />
                  <input
                    placeholder="Branch"
                    className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-main outline-none"
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                  />
                  <input
                    placeholder="Card Holder Name"
                    className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-main outline-none"
                    value={formData.card_holder}
                    onChange={(e) =>
                      setFormData({ ...formData, card_holder: e.target.value })
                    }
                  />
                </div>
              </div>

              <button className="w-full py-5 bg-main text-sub font-black rounded-2xl shadow-lg shadow-main/20 active:scale-95 transition-all mt-2">
                {editingId ? "Update Reseller Info" : "Register Reseller"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-main/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-main mb-2">
              Delete Reseller?
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Confirming will remove{" "}
              <span className="font-bold text-main">
                "{deleteConfirm.name}"
              </span>{" "}
              from the system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteConfirm({ open: false, id: null, name: "" })
                }
                className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR POPUP */}
      {errorPopup.open && (
        <div className="fixed inset-0 bg-main/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl animate-in fade-in zoom-in">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-black text-main mb-2">
              Registration Error
            </h3>
            <p className="text-gray-500 text-sm mb-8">{errorPopup.message}</p>
            <button
              onClick={() => setErrorPopup({ open: false, message: "" })}
              className="w-full py-4 bg-main text-sub font-bold rounded-2xl hover:brightness-110 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resellers;
