export default function DriverMapLoading() {
  return (
    <div className="relative w-full h-full min-h-[calc(100vh-88px-72px)] bg-[#f7f7f7] page-enter">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#dddddd] border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
}
