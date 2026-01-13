import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { Plus, Search, Edit2, Trash2, Package, X, Hash, AlignLeft, AlertCircle, ShieldAlert } from "lucide-react";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: "" });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    item_id: "",
    item_name: "",
    item_description: "",
    item_buy_price: "",
    item_sell_price: "",
    stock_quantity: "",
  });

  // Fetch items function
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data ?? []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      // Optional: show user-friendly error
      // setErrorPopup({ open: true, message: "Failed to load inventory" });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetForm = () => {
    setFormData({
      item_id: "",
      item_name: "",
      item_description: "",
      item_buy_price: "",
      item_sell_price: "",
      stock_quantity: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from("items")
          .update({
            item_name: formData.item_name,
            item_description: formData.item_description,
            item_buy_price: formData.item_buy_price,
            item_sell_price: formData.item_sell_price,
            stock_quantity: formData.stock_quantity,
          })
          .eq("item_id", editingId);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from("items")
          .insert([formData]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      resetForm();
      await fetchItems(); // Refresh list
    } catch (error) {
      let message = error.message;
      if (error.code === "23505") {
        message = "This Item ID already exists. Please use a unique ID.";
      }
      setErrorPopup({ open: true, message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      item_id: item.item_id,
      item_name: item.item_name,
      item_description: item.item_description || "",
      item_buy_price: item.item_buy_price,
      item_sell_price: item.item_sell_price,
      stock_quantity: item.stock_quantity,
    });
    setEditingId(item.item_id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("item_id", deleteConfirm.id);

      if (error) throw error;

      setDeleteConfirm({ open: false, id: null, name: "" });
      await fetchItems();
    } catch (error) {
      setErrorPopup({ open: true, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (i) =>
      (i.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (i.item_id?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-main">INVENTORY</h2>
          <p className="text-gray-500 text-sm font-medium">
            Tracking {items.length} items
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-sub text-main p-4 rounded-[20px] shadow-lg flex items-center gap-2 font-bold hover:scale-105 transition-all"
        >
          <Plus size={20} /> Add New
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          className="w-full pl-12 pr-4 py-4 rounded-[20px] border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-main focus:border-main bg-white transition-all"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid gap-3">
        {loading && items.length === 0 ? (
          <div className="text-center py-20 text-gray-400 animate-pulse">
            Loading items...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No items found
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.item_id}
              className="bg-gray-50/50 p-5 rounded-[24px] border border-main/10 shadow-sm flex justify-between items-center group hover:border-main hover:bg-white transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-main rounded-xl flex items-center justify-center text-sub shadow-md">
                  <Package size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-main">{item.item_name}</h3>
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">
                    {item.item_description || "No description"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-400 hover:text-main hover:bg-main/5 rounded-lg transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() =>
                    setDeleteConfirm({
                      open: true,
                      id: item.item_id,
                      name: item.item_name,
                    })
                  }
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-main/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-50 w-full max-w-lg rounded-[32px] p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200 border border-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 text-gray-300 hover:text-main transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black text-main mb-2">
              {editingId ? "Edit Item" : "New Item"}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Enter details to update your stock records.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Hash className="absolute left-4 top-4 text-gray-400" size={18} />
                <input
                  required
                  disabled={editingId !== null}
                  placeholder="Item ID (e.g. ITEM-001)"
                  className="w-full pl-11 p-4 rounded-2xl bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-main focus:border-main disabled:opacity-50 transition-all"
                  value={formData.item_id}
                  onChange={(e) =>
                    setFormData({ ...formData, item_id: e.target.value })
                  }
                />
              </div>

              <input
                required
                placeholder="Product Name"
                className="w-full p-4 rounded-2xl bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-main focus:border-main transition-all"
                value={formData.item_name}
                onChange={(e) =>
                  setFormData({ ...formData, item_name: e.target.value })
                }
              />

              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-gray-400" size={18} />
                <textarea
                  placeholder="Item Description"
                  rows="2"
                  className="w-full pl-11 p-4 rounded-2xl bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-main focus:border-main resize-none transition-all"
                  value={formData.item_description}
                  onChange={(e) =>
                    setFormData({ ...formData, item_description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  required
                  placeholder="Buy Price"
                  className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-main outline-none"
                  value={formData.item_buy_price}
                  onChange={(e) =>
                    setFormData({ ...formData, item_buy_price: e.target.value })
                  }
                />
                <input
                  type="number"
                  required
                  placeholder="Sell Price"
                  className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-main outline-none"
                  value={formData.item_sell_price}
                  onChange={(e) =>
                    setFormData({ ...formData, item_sell_price: e.target.value })
                  }
                />
              </div>

              <input
                type="number"
                required
                placeholder="Current Stock"
                className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-main outline-none"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: e.target.value })
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-main text-sub font-black rounded-2xl shadow-lg shadow-main/20 active:scale-95 transition-all mt-2 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Inventory"
                  : "Add to Inventory"}
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
            <h3 className="text-xl font-black text-main mb-2">Are you sure?</h3>
            <p className="text-gray-500 text-sm mb-8">
              You are about to delete{" "}
              <span className="font-bold text-main">"{deleteConfirm.name}"</span>.
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
                disabled={loading}
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
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
            <h3 className="text-xl font-black text-main mb-2">Action Failed</h3>
            <p className="text-gray-500 text-sm mb-8">{errorPopup.message}</p>
            <button
              onClick={() => setErrorPopup({ open: false, message: "" })}
              className="w-full py-4 bg-main text-sub font-bold rounded-2xl hover:brightness-110 transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;