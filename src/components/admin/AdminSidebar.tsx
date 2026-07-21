"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  BarChart3,
  Image as ImageIcon,
  Tag,
  Star,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Collections", href: "/admin/collections", icon: FolderTree },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  { name: "Discounts", href: "/admin/discounts", icon: Tag },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Profile", href: "/admin/profile", icon: User },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-100 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 shrink-0">
            <Image
              src="/logo-emblem.png"
              alt={APP_NAME}
              fill
              className="object-contain"
              sizes="24px"
            />
          </div>
          <span className="font-heading text-lg text-deep-plum tracking-wider font-semibold">
            {APP_NAME} CMS
          </span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-deep-plum">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
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

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-neutral-100 z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Brand Logo Area */}
          <div className="h-16 flex items-center gap-2 px-6 border-b border-neutral-100 hidden lg:flex">
            <div className="relative w-7 h-7 shrink-0">
              <Image
                src="/logo-emblem.png"
                alt={APP_NAME}
                fill
                className="object-contain"
                sizes="28px"
              />
            </div>
            <span className="font-heading text-lg text-deep-plum tracking-wider font-semibold">
              {APP_NAME} CMS
            </span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all",
                    isActive
                      ? "bg-rose-gold/10 text-rose-gold-dark font-semibold"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-deep-plum"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-rose-gold-dark" : "text-neutral-400"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="p-3 border-t border-neutral-100">
            <button className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-xs font-medium text-neutral-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
