export default function Loading() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto page-enter">
        <div className="pb-4 border-b border-[#dddddd]">
          <div className="h-8 w-64 skeleton-shimmer rounded-[8px]" />
          <div className="h-4 w-48 skeleton-shimmer rounded-[8px] mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-[14px] bg-white border border-[#dddddd] p-6 h-[140px]">
              <div className="h-4 w-24 skeleton-shimmer rounded-[8px] mb-4" />
              <div className="h-8 w-20 skeleton-shimmer rounded-[8px] mt-auto" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[460px] rounded-[14px] skeleton-shimmer" />
          <div className="lg:col-span-1 h-[460px] rounded-[14px] skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
