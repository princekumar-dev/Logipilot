export default function SettingsLoading() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 py-12 page-enter">
        <div className="h-8 w-32 skeleton-shimmer rounded-[8px] mb-2" />
        <div className="h-4 w-64 skeleton-shimmer rounded-[8px] mb-12" />
        <div className="flex gap-2 mb-8 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-24 skeleton-shimmer rounded-full shrink-0" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-[14px] skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
