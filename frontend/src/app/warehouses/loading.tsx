export default function WarehousesLoading() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-6 max-w-[1440px] mx-auto page-enter">
        <div className="pb-4 border-b border-[#dddddd]">
          <div className="h-8 w-40 skeleton-shimmer rounded-[8px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-[14px] bg-white border border-[#dddddd] p-6 h-[180px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 skeleton-shimmer rounded-[10px]" />
                <div>
                  <div className="h-4 w-32 skeleton-shimmer rounded-[8px]" />
                  <div className="h-3 w-20 skeleton-shimmer rounded-[8px] mt-1.5" />
                </div>
              </div>
              <div className="h-2 w-full skeleton-shimmer rounded-full mt-6" />
              <div className="flex justify-between mt-3">
                <div className="h-3 w-16 skeleton-shimmer rounded-[8px]" />
                <div className="h-3 w-16 skeleton-shimmer rounded-[8px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
