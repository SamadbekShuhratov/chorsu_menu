import React, { useState, useEffect, useCallback } from "react";
import { MenuItem, Category } from "../../types/menu";

interface MenuItemFormProps {
  item: MenuItem | null;
  categories: Category[];
  onSave: (formData: {
    name: string;
    price: number;
    categoryId: string;
    description: string;
    available: boolean;
    image?: string;
  }) => void;
  onCancel: () => void;
}

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dijjlngti/image/upload";
const UPLOAD_PRESET = "chorsu_menu";

const MenuItemForm: React.FC<MenuItemFormProps> = ({ item, categories, onSave, onCancel }) => {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState<number | "">(item?.price ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? categories[0]?.id ?? "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image preview
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(imageFile);
    } else {
      setImagePreview(item?.image ?? null);
    }
  }, [imageFile, item]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] ?? null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!name.trim() || !description.trim() || price === "" || !categoryId) {
        setError("Please fill all required fields");
        return;
      }

      setUploading(true);

      try {
        let image = item?.image ?? null;

        if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);
          formData.append("upload_preset", UPLOAD_PRESET);

          const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
          if (!res.ok) throw new Error("Cloudinary upload failed");

          const data = await res.json();
          image = data.secure_url;
          
          setImagePreview(image);
          console.log("✅ Uploaded to Cloudinary:", image);
        }

        const payload = {
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          categoryId,
          available,
          ...(image ? { image } : {}),
        };

        await onSave(payload);
      } catch (err: any) {
        setError(err?.message ?? "Something went wrong");
      } finally {
        setUploading(false);
      }
    },
    [name, description, price, categoryId, available, imageFile, item, onSave]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4">{item ? "Edit Menu Item" : "Add Menu Item"}</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
              <span>Available</span>
            </label>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1" />
            </div>
          </div>

          {imagePreview && (
            <div>
              <p className="text-sm text-gray-500">Image Preview:</p>
              <img
                key={imagePreview}
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded mt-2 border"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`px-4 py-2 rounded text-white ${
                uploading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {uploading ? "Uploading..." : item ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;
