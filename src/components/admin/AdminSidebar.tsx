"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Gem
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-100 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-gold" />
          <span className="font-heading text-lg text-obsidian tracking-wider">{APP_NAME} Admin</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <div className={cn(
        "fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-neutral-100 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="h-16 flex items-center gap-2 px-6 border-b border-neutral-100 hidden lg:flex">
            <Gem className="w-6 h-6 text-gold" />
            <span className="font-heading text-xl text-obsidian tracking-wider">{APP_NAME} Admin</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-gold/10 text-gold-dark" 
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-obsidian"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-gold-dark" : "text-neutral-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Area */}
          <div className="p-4 border-t border-neutral-100">
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-neutral-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
