import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = {
  title: "Admin CMS | Cherry Jewelry",
  description: "Luxury Jewelry E-Commerce Management System.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50/50 flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 flex flex-col min-w-0">
        <AdminHeader />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
