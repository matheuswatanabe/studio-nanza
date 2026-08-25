import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex bg-neutral-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
