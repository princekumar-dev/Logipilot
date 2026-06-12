export default function SignupLoading() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4 page-enter">
      <div className="w-full max-w-[400px] bg-white rounded-[20px] p-8 border border-[#dddddd] shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="h-8 w-32 skeleton-shimmer rounded-[8px]" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="h-3 w-20 skeleton-shimmer rounded-[8px] mb-2" />
            <div className="h-12 w-full skeleton-shimmer rounded-[8px]" />
          </div>
          <div>
            <div className="h-3 w-20 skeleton-shimmer rounded-[8px] mb-2" />
            <div className="h-12 w-full skeleton-shimmer rounded-[8px]" />
          </div>
          <div>
            <div className="h-3 w-20 skeleton-shimmer rounded-[8px] mb-2" />
            <div className="h-12 w-full skeleton-shimmer rounded-[8px]" />
          </div>
          <div>
            <div className="h-3 w-24 skeleton-shimmer rounded-[8px] mb-2" />
            <div className="h-12 w-full skeleton-shimmer rounded-[8px]" />
          </div>
          <div className="h-12 w-full skeleton-shimmer rounded-[8px] mt-6" />
        </div>
      </div>
    </div>
  );
}
