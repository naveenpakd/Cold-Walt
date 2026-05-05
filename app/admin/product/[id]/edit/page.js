"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Image from "next/image";

export default function EditProduct({ params }) {
  const router = useRouter();
  const productId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          name: data.name || "",
          price: data.price ? data.price.toString() : "",
          stock: data.stock !== undefined ? data.stock.toString() : "",
          description: data.description || "",
        });
        setExistingImages(data.images || []);
      } else {
        toast.error("Product not found");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error fetching product: ", error);
      toast.error("Failed to load product details");
    } finally {
      setFetching(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (indexToRemove) => {
    setNewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingImage = (indexToRemove) => {
    const imageUrl = existingImages[indexToRemove];
    setDeletedImages((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error("Please ensure the product has at least one image");
      return;
    }

    setLoading(true);
    
    try {
      const uploadedImageUrls = [...existingImages];
      
      // Delete removed images from Firebase Storage
      for (const url of deletedImages) {
        if (url.includes('firebasestorage.googleapis.com')) {
          try {
            const imageRef = ref(storage, url);
            await deleteObject(imageRef);
          } catch (e) {
            console.error("Failed to delete image: ", url, e);
          }
        }
      }

      // Upload new images to Firebase Storage
      for (const file of newImages) {
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const storageRef = ref(storage, `products/${filename}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedImageUrls.push(downloadURL);
      }

      // Update product document in Firestore
      const docRef = doc(db, "products", productId);
      await updateDoc(docRef, {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description,
        images: uploadedImageUrls,
      });
      
      toast.success("Product updated successfully!");
      router.push("/admin/dashboard");
      
    } catch (error) {
      console.error("Error updating product: ", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard" className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-1">Update product details</p>
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
            {/* Existing Images */}
            {existingImages.map((imgUrl, index) => (
              <div key={`existing-${index}`} className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200">
                <Image 
                  src={imgUrl} 
                  alt={`Existing ${index}`} 
                  fill 
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-2 right-2 p-1 bg-white/90 text-red-500 rounded-full hover:bg-white shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {/* New Images Preview */}
            {newImages.map((img, index) => (
              <div key={`new-${index}`} className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200">
                <Image 
                  src={URL.createObjectURL(img)} 
                  alt={`New Preview ${index}`} 
                  fill 
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
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
            <p className="font-medium text-gray-900 mb-1">Click to upload more images</p>
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
              "Update Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
