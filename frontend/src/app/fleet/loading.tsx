export default function FleetLoading() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto page-enter">
        <div className="pb-4 border-b border-[#dddddd]">
          <div className="h-8 w-48 skeleton-shimmer rounded-[8px]" />
          <div className="h-4 w-64 skeleton-shimmer rounded-[8px] mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-[14px] bg-white border border-[#dddddd] p-6 h-[160px]">
              <div className="h-4 w-32 skeleton-shimmer rounded-[8px] mb-8" />
              <div className="h-8 w-16 skeleton-shimmer rounded-[8px]" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <div className="lg:col-span-2 rounded-[14px] skeleton-shimmer" />
          <div className="lg:col-span-1 rounded-[14px] skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
