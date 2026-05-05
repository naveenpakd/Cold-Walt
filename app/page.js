"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/store/useStore";
import Skeletons from "@/components/Skeletons";

import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, priceRange, setPriceRange } = useStore();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.price >= priceRange.min && p.price <= priceRange.max;
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar / Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-28">
          <h2 className="font-bold text-lg mb-6 text-brand-dark">Filters</h2>
          
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Price Range</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm p-2 border"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm p-2 border"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                />
              </div>
              <input 
                type="range" 
                min="0" 
                max="100000" 
                className="w-full accent-brand-accent"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeletons.ProductCard key={n} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setPriceRange({ min: 0, max: 100000 }); useStore.getState().setSearchQuery(""); }}
              className="mt-6 px-6 py-2 bg-brand-dark text-white rounded-full hover:bg-[#3a362f] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
