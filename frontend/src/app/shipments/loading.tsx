export default function ShipmentsLoading() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-6 max-w-[1440px] mx-auto page-enter">
        <div className="pb-4 border-b border-[#dddddd]">
          <div className="h-8 w-40 skeleton-shimmer rounded-[8px]" />
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-[14px] skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
