export default function DriverLoading() {
  return (
    <div className="p-6 space-y-6 page-enter">
      <div className="pt-2">
        <div className="h-8 w-48 skeleton-shimmer rounded-[8px]" />
        <div className="h-4 w-32 skeleton-shimmer rounded-[8px] mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[14px] border border-[#dddddd] h-[120px]">
          <div className="h-4 w-24 skeleton-shimmer rounded-[8px] mb-4" />
          <div className="h-8 w-16 skeleton-shimmer rounded-[8px]" />
        </div>
        <div className="bg-white p-5 rounded-[14px] border border-[#dddddd] h-[120px]">
          <div className="h-4 w-24 skeleton-shimmer rounded-[8px] mb-4" />
          <div className="h-8 w-16 skeleton-shimmer rounded-[8px]" />
        </div>
      </div>
      <div className="bg-white rounded-[14px] p-6 border border-[#dddddd] h-[200px]">
        <div className="h-4 w-32 skeleton-shimmer rounded-[8px] mb-4" />
        <div className="space-y-3 mt-4">
          <div className="h-10 w-full skeleton-shimmer rounded-[8px]" />
          <div className="h-10 w-full skeleton-shimmer rounded-[8px]" />
        </div>
      </div>
      <div className="bg-white rounded-[14px] p-5 border border-[#dddddd] h-[100px]">
        <div className="h-4 w-28 skeleton-shimmer rounded-[8px] mb-3" />
        <div className="h-3 w-full skeleton-shimmer rounded-[8px]" />
      </div>
    </div>
  );
}
