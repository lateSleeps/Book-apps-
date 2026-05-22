export default function BookingLoading() {
  return (
    <div className="p-s24 space-y-s16 animate-pulse">
      <div className="h-8 w-40 bg-sep rounded-r12" />
      <div className="h-4 w-60 bg-sep rounded-r8" />
      <div className="grid grid-cols-2 gap-s12 mt-s24">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-sep rounded-r16" />
        ))}
      </div>
      <div className="h-12 bg-sep rounded-r16 mt-s24" />
    </div>
  );
}
