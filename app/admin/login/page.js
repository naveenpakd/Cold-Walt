"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Set a session cookie for the middleware to check
      document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Strict";
      toast.success("Logged in successfully");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      
      let errorMessage = "Authentication failed.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Email/Password sign-in is not enabled in Firebase Console.";
      } else {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-dark mb-2">Admin Login</h1>
          <p className="text-gray-500 text-sm">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
              placeholder="admin@coldvault.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark text-white py-3 rounded-xl font-medium hover:bg-[#3a362f] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
