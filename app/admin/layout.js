"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Settings, LogOut, Loader2 } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (!currentUser && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (currentUser && pathname === "/admin/login") {
        router.push("/admin/dashboard");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const isLoginPage = pathname === "/admin/login";

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
        </div>
      )}
      
      {/* We always render the same tree structure to prevent Next.js Router hook errors */}
      <div className={isLoginPage ? "min-h-screen" : "flex min-h-[calc(100vh-80px)] bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100"}>
        {/* Sidebar */}
        {!isLoginPage && (
          <aside className="w-64 bg-white border-r border-gray-100 hidden md:block shrink-0">
            <div className="p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Admin Panel</h2>
              <nav className="space-y-2">
                <Link 
                  href="/admin/dashboard" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/admin/dashboard' || pathname?.startsWith('/admin/product') ? 'bg-brand-dark text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard / Products</span>
                </Link>
                <Link 
                  href="/admin/settings" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/admin/settings' ? 'bg-brand-dark text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
              </nav>
            </div>
            <div className="absolute bottom-0 w-64 p-6 border-t border-gray-100">
              <button 
                onClick={async () => {
                  await signOut(auth);
                  document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={isLoginPage ? "w-full" : "flex-1 p-8 overflow-y-auto"}>
          {children}
        </main>
      </div>
    </>
  );
}
