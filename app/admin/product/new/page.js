"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Add new files to the existing images state
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setLoading(true);
    
    try {
      const uploadedImageUrls = [];
      
      // Upload images to Firebase Storage
      for (const file of images) {
        // Create a unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        // Create a reference to 'products/{filename}'
        const storageRef = ref(storage, `products/${filename}`);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedImageUrls.push(downloadURL);
      }

      // Add product document to Firestore
      await addDoc(collection(db, "products"), {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description,
        images: uploadedImageUrls,
        createdAt: serverTimestamp()
      });
      
      toast.success("Product added successfully!");
      router.push("/admin/dashboard");
      
    } catch (error) {
      console.error("Error adding product: ", error);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard" className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new product listing in your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-brand-dark mb-4 border-b border-gray-100 pb-2">Basic Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-dark mb-4 border-b border-gray-100 pb-2">Product Images</h2>
          
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200">
                <Image 
                  src={URL.createObjectURL(img)} 
                  alt={`Preview ${index}`} 
                  fill 
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-white/90 text-red-500 rounded-full hover:bg-white shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-accent group-hover:text-white transition-colors text-gray-400">
              <Upload className="w-8 h-8" />
            </div>
            <p className="font-medium text-gray-900 mb-1">Click to upload images</p>
            <p className="text-sm text-gray-500 mb-4">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              id="file-upload" 
              onChange={handleImageChange}
            />
            <label htmlFor="file-upload" className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
              Select Files
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/dashboard" className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-dark text-white px-8 py-3 rounded-xl font-medium hover:bg-[#3a362f] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Save Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

