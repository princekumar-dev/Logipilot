export default function DriverProfileLoading() {
  return (
    <div className="flex flex-col h-full bg-slate-50 page-enter">
      <div className="bg-white px-6 py-4 border-b border-slate-100 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <div className="h-6 w-32 skeleton-shimmer rounded-[8px]" />
        <div className="w-10 h-10 skeleton-shimmer rounded-full" />
      </div>
      <div className="p-6 space-y-6 pb-32">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 h-[180px]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 skeleton-shimmer rounded-full" />
            <div>
              <div className="h-5 w-32 skeleton-shimmer rounded-[8px] mb-2" />
              <div className="h-3 w-48 skeleton-shimmer rounded-[8px]" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#f7f7f7] rounded-3xl h-[80px] skeleton-shimmer" />
          <div className="bg-[#f7f7f7] rounded-3xl h-[80px] skeleton-shimmer" />
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 h-[100px]">
          <div className="h-4 w-32 skeleton-shimmer rounded-[8px] mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-full skeleton-shimmer rounded-[8px]" />
            <div className="h-3 w-3/4 skeleton-shimmer rounded-[8px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
