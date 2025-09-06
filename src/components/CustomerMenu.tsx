import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { MenuItem as MenuItemType, Category } from '../types/menu';
import ApiService from '../services/apiService';
import backgroundImage from '../assets/chorsu_fasad.jpg';
import logoImage from '../assets/chorsulogo.jpg';

interface CustomerMenuProps {
  menuItems: MenuItemType[];
}

const CustomerMenu: React.FC<CustomerMenuProps> = ({ menuItems }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ Cloudinary yoki to‘liq linkdan rasmni ishlatadi
  const getImage = (path: string | undefined) => {
  return path || ''; // Cloudinary URL bo‘lsa shuni ishlatadi, yo‘q bo‘lsa bo‘sh
};


  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await ApiService.getCategories();
        setCategories(cats.filter((cat) => cat.active));
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const categoryName = categories.find((cat) => cat.id === item.categoryId)?.name;
    const matchesCategory = selectedCategory === 'all' || categoryName === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: number) => `${price.toLocaleString('uz-UZ')} so'm`;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="text-2xl text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          Loading menu...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Header */}
      <header className="bg-white bg-opacity-70 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={logoImage}
              alt="Logo"
              className="w-12 h-15 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chorsu Restaurant</h1>
              <p className="text-gray-600">Biz bilan - qulaylik va shinam muhit!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 bg-white bg-opacity-80 rounded-lg mt-6">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-100'
              }`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const categoryName =
              categories.find((cat) => cat.id === item.categoryId)?.name || 'Unknown';
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9">
                  {item.image && (
                    <img
                      src={getImage(item.image)}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-xl font-bold text-orange-600">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                      {categoryName}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMenu;
