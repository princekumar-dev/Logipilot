export default function CopilotLoading() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="flex h-[calc(100vh-80px)] page-enter">
        {/* Sidebar */}
        <div className="hidden md:flex w-[280px] border-r border-[#dddddd] flex-col p-4 gap-3">
          <div className="h-10 w-full skeleton-shimmer rounded-[8px]" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 w-full skeleton-shimmer rounded-[14px]" />
          ))}
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col p-6 gap-4">
          <div className="h-8 w-48 skeleton-shimmer rounded-[8px]" />
          <div className="flex-1 flex flex-col gap-4 justify-end">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`h-16 ${i % 2 === 0 ? 'w-[70%]' : 'w-[50%]'} skeleton-shimmer rounded-[14px]`} />
              </div>
            ))}
          </div>
          <div className="h-14 w-full skeleton-shimmer rounded-full" />
        </div>
      </div>
    </div>
  );
}
