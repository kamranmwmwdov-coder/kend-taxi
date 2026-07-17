import { CustomerBottomNav } from "@/components/CustomerBottomNav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <CustomerBottomNav />
    </div>
  );
}
