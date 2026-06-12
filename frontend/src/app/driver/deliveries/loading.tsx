export default function DriverDeliveriesLoading() {
  return (
    <div className="p-6 space-y-4 page-enter">
      <div className="h-6 w-32 skeleton-shimmer rounded-[8px]" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-[14px] p-5 border border-[#dddddd] h-[100px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 skeleton-shimmer rounded-full" />
            <div className="h-4 w-32 skeleton-shimmer rounded-[8px]" />
          </div>
          <div className="h-3 w-full skeleton-shimmer rounded-[8px]" />
        </div>
      ))}
    </div>
  );
}
