export default function DriverAlertsLoading() {
  return (
    <div className="p-6 space-y-4 page-enter">
      <div className="h-6 w-24 skeleton-shimmer rounded-[8px]" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-[14px] p-5 border border-[#dddddd] h-[80px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 skeleton-shimmer rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-40 skeleton-shimmer rounded-[8px] mb-2" />
              <div className="h-3 w-24 skeleton-shimmer rounded-[8px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
