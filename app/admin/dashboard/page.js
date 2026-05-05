"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedProducts = [];
      querySnapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() });
      });
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products: ", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, imageUrls) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, "products", productId));

      // 2. Delete images from Firebase Storage
      if (imageUrls && imageUrls.length > 0) {
        for (const url of imageUrls) {
          if (url.includes('firebasestorage.googleapis.com')) {
            try {
              const imageRef = ref(storage, url);
              await deleteObject(imageRef);
            } catch (e) {
              console.error("Failed to delete image: ", url, e);
            }
          }
        }
      }

      // Update UI
      setProducts(products.filter(p => p.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Overview</h1>
          <p className="text-gray-500 mt-1">Manage your store inventory</p>
        </div>
        <Link href="/admin/product/new" className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-[#867862] transition-colors">
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Img</div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">₹{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/product/${product.id}/edit`} className="p-2 text-gray-400 hover:text-brand-accent transition-colors rounded-lg hover:bg-gray-100">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id, product.images)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
