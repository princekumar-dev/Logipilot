import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#ff385c]" />
    </div>
  );
}
