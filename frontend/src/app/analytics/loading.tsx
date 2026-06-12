export default function AnalyticsLoading() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-6 max-w-[1440px] mx-auto page-enter">
        <div className="pb-4 border-b border-[#dddddd]">
          <div className="h-8 w-36 skeleton-shimmer rounded-[8px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[300px] rounded-[14px] skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
