import React, { useState, useEffect, useCallback, useMemo } from "react";
import { LogOut, Plus, Search, Edit, Trash2 } from "lucide-react";
import { MenuItem, Category } from "../../types/menu";
import ApiService from "../../services/apiService";
import MenuItemForm from "./MenuItemForm";
import CategoryForm from "./CategoryForm";

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<"menu" | "categories">("menu");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // ==================== LOAD DATA =============  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [items, cats] = await Promise.all([
        ApiService.getMenuItems(),
        ApiService.getCategories(),
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (err) {
      console.error("❌ Error loading data:", err);
      alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==================== HELPERS =============  const getCategoryName = useCallback(
    (categoryId: string) => categories.find((c) => c.id === categoryId)?.name || "No category",
    [categories]
  );

  const formatPrice = useCallback(
    (price: number) => `${Math.round(price).toLocaleString("uz-UZ")} so'm`,
    []
  );

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return menuItems.filter((item) => {
      const catName = getCategoryName(item.categoryId).toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        catName.includes(term)
      );
    });
  }, [menuItems, searchTerm, getCategoryName]);

  // ==================== CRUD HANDLERS =============  const handleDelete = useCallback(
    async (id: string, type: "item" | "category") => {
      if (!window.confirm("Are you sure you want to delete this?")) return;
      try {
        if (type === "item") {
          await ApiService.deleteMenuItem(id);
          setMenuItems((prev) => prev.filter((i) => i.id !== id));
        } else {
          await ApiService.deleteCategory(id);
          setCategories((prev) => prev.filter((c) => c.id !== id));
        }
      } catch (err) {
        console.error(`❌ Error deleting ${type}:`, err);
        alert(`Failed to delete ${type}.`);
      }
    },
    []
  );

  const handleSaveMenuItem = useCallback(
    async (itemData: Omit<MenuItem, "id">) => {
      try {
        if (editingItem) await ApiService.updateMenuItem(editingItem.id, itemData);
        else await ApiService.createMenuItem(itemData);
        setShowItemForm(false);
        await loadData();
      } catch (err: any) {
        console.error("❌ Error saving item:", err);
        alert(err?.message ?? "Failed to save item");
      }
    },
    [editingItem, loadData]
  );

  const handleSaveCategory = useCallback(
    async (data: Omit<Category, "id">) => {
      try {
        if (editingCategory) await ApiService.updateCategory(editingCategory.id, data);
        else await ApiService.createCategory(data);
        setShowCategoryForm(false);
        await loadData();
      } catch (err: any) {
        console.error("❌ Error saving category:", err);
        alert(err?.message ?? "Failed to save category");
      }
    },
    [editingCategory, loadData]
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restaurant Admin</h1>
            <p className="text-gray-600">Manage your menu and categories</p>
          </div>
          <button onClick={onLogout} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {["menu", "categories"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "menu" | "categories")}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "menu" ? "Menu Items" : "Categories"}
            </button>
          ))}
        </div>

        {/* === MENU TAB === */}
        {activeTab === "menu" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => { setEditingItem(null); setShowItemForm(true); }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap flex items-center">
                          <img
                            src={item.image || "/placeholder-image.png"}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{item.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {getCategoryName(item.categoryId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(item.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {item.available ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                          <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} className="text-orange-600 hover:text-orange-900"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(item.id, "item")} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === CATEGORIES TAB === */}
        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Categories</h2>
              <button
                onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cat.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                        <button onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }} className="text-orange-600 hover:text-orange-900"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(cat.id, "category")} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Forms */}
        {showItemForm && (
          <MenuItemForm
            item={editingItem}
            categories={categories}
            onSave={handleSaveMenuItem}
            onCancel={() => setShowItemForm(false)}
          />
        )}

        {showCategoryForm && (
          <CategoryForm
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => setShowCategoryForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
