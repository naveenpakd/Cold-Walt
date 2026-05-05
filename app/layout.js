import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Coldvault Studio",
  description: "Premium eCommerce Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#f7f6f4]`}>
        <ToastProvider />
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
