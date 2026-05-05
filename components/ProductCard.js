import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <Link href={`/product/${product.id}`} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
        <Image
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl font-bold text-brand-dark">{formattedPrice}</p>
          <span className="text-sm font-medium text-brand-accent group-hover:underline">View Details</span>
        </div>
      </div>
    </Link>
  );
}
