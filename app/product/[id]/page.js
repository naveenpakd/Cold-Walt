"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldCheck, Truck, RotateCcw } from "lucide-react";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
export default function ProductDetails({ params }) {
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", params.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product: ", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-2xl"></div>
          <div className="space-y-6 pt-4">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
            <div className="h-14 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleBuyNow = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${baseUrl}/product/${product.id}`;
    
    const message = `Hello Coldvault Studio! I'm interested in buying:\n\n*${product.name}*\nPrice: ${formattedPrice}\nLink: ${productUrl}\n\nPlease let me know how to proceed with the payment.`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand-dark mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 bg-white p-6 md:p-10 rounded-3xl shadow-sm">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 shrink-0 no-scrollbar">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative aspect-square w-20 md:w-full rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-accent' : 'border-transparent hover:border-gray-300'}`}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
          
          {/* Main Image */}
          <div className="relative aspect-[4/5] md:aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 flex-1">
            <Image 
              src={product.images[activeImage]} 
              alt={product.name} 
              fill 
              priority
              className="object-cover" 
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col pt-2 md:pt-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-accent uppercase tracking-wider">Premium Collection</span>
            {product.stock > 0 ? (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                In Stock ({product.stock})
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                Out of Stock
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-2xl md:text-3xl font-light text-brand-dark mb-6">{formattedPrice}</p>
          
          <div className="prose prose-sm text-gray-500 mb-8">
            <p className="leading-relaxed">{product.description}</p>
          </div>

          <div className="mt-auto pt-8 border-t border-gray-100 space-y-4">
            <button 
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-lg font-bold transition-all shadow-md hover:shadow-lg ${
                product.stock === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#25D366] text-white hover:bg-[#128C7E] hover:-translate-y-0.5'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Buy via WhatsApp'}
            </button>
            <p className="text-center text-xs text-gray-400">You will be redirected to WhatsApp to complete your purchase securely.</p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-100">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-accent">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-600">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-accent">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-600">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-accent">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-600">7 Days Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
