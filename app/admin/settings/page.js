"use client";

import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your store preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <Settings className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Settings Coming Soon</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          We are working on bringing you powerful configuration options for your store. Check back later!
        </p>
      </div>
    </div>
  );
}
