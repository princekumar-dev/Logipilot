import { BottomNav } from '@/components/mobile/BottomNav';
import { DriverHeader } from '@/components/mobile/DriverHeader';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-88px)] bg-white flex flex-col relative w-full h-full overflow-hidden">
      <DriverHeader />
      <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] bg-[#f7f7f7]">
        {children}
      </main>
    </div>
  );
}
