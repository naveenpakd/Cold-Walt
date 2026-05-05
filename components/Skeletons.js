export default function Skeletons() {
  return null;
}

Skeletons.ProductCard = function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm animate-pulse">
      <div className="aspect-[4/5] bg-gray-200" />
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};
